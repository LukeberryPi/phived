// Hono app composition: cross-cutting response policy, optional API routes, and
// the static-site fallback. `index.ts` only binds this app to Bun.
import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Pool } from "pg";
import type { ApiEnv, ServerMode } from "./env";
import type { Auth } from "./auth";
import type { Entitlement } from "./entitlement";
import type { SessionVariables } from "./session";
import { applySecurityHeaders } from "./security-headers";
import { handleSiteRequest } from "./static-handler";

interface ApiDependencies {
  auth: Auth;
  runMigrations: () => Promise<string[]>;
  getEntitlement: (userId: string) => Promise<Entitlement | null>;
  createSessionMiddleware: (
    auth: Auth
  ) => MiddlewareHandler<{ Variables: SessionVariables }>;
}

interface ServerAppOptions {
  root?: string;
  apiDependencies?: ApiDependencies;
}

export async function createServerApp(
  serverMode: ServerMode,
  options: ServerAppOptions = {}
): Promise<Hono<{ Variables: SessionVariables }>> {
  const app = new Hono<{ Variables: SessionVariables }>();

  app.use("*", async (c, next) => {
    await next();
    applySecurityHeaders(c.res.headers);
  });

  if (serverMode.mode === "api") {
    const api =
      options.apiDependencies ?? (await loadApiDependencies(serverMode.apiEnv));
    const applied = await api.runMigrations();
    if (applied.length > 0) {
      console.log(`[db] applied migrations: ${applied.join(", ")}`);
    }

    // Better Auth handles sign-in (magic link + Google) and, via the Polar
    // plugin, checkout/portal/webhooks — all under /api/auth/* (single `*`
    // wildcard, per the Hono integration docs).
    app.on(["GET", "POST"], "/api/auth/*", (c) => api.auth.handler(c.req.raw));

    app.get("/api/me", api.createSessionMiddleware(api.auth), async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ user: null, entitlement: null });
      }

      const entitlement = await api.getEntitlement(user.id);
      return c.json({
        user: { id: user.id, email: user.email, name: user.name },
        entitlement: entitlement ?? {
          status: "none",
          isEntitled: false,
          currentPeriodEnd: null,
        },
      });
    });
  } else {
    console.warn(
      "[server] DATABASE_URL not set; serving the static site only (auth/billing disabled)."
    );
    app.all("/api/*", (c) => c.json({ error: "auth not configured" }, 503));
  }

  // Everything else is the static site contract (kept as the final catch-all so
  // the /api routes above take precedence).
  app.all("*", (c) => handleSiteRequest(c.req.raw, options.root));

  return app;
}

async function loadApiDependencies(apiEnv: ApiEnv): Promise<ApiDependencies> {
  const [
    { createAuth },
    { getPool, runMigrations },
    { getEntitlement },
    { createSessionMiddleware },
  ] = await Promise.all([
    import("./auth"),
    import("./db"),
    import("./entitlement"),
    import("./session"),
  ]);

  const pool: Pool = getPool();
  return {
    auth: createAuth(apiEnv, pool),
    runMigrations: () => runMigrations(pool),
    getEntitlement,
    createSessionMiddleware,
  };
}
