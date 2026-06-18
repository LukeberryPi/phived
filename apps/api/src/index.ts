// The Railway entrypoint (ADR 0004): one Bun + Hono process that serves the
// assembled dist/ and mounts the Pro /api/* surface on the same origin. The
// static routing/security contract is carved out so /api/* can accept writes
// while everything else stays "reads only". Pro routes only mount when the
// backend is configured, so a static-only deploy still boots.
import { Hono } from "hono";
import { paths } from "../../../scripts/site-contract.mjs";
import { getAuth } from "./auth.ts";
import { env, isProConfigured } from "./env.ts";
import { accountRoutes } from "./routes/account.ts";
import { sessionRoutes } from "./routes/session.ts";
import { tasksRoutes } from "./routes/tasks.ts";
import { createStaticApp, securityHeadersMiddleware } from "./site-static.ts";

export function createApp(staticRoot: string = paths.dist): Hono {
  const app = new Hono();

  app.use("*", securityHeadersMiddleware());

  if (isProConfigured()) {
    const auth = getAuth();
    // Better Auth's Web-standard handler owns /api/auth/* (Google + Polar).
    app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
    app.route("/api", sessionRoutes);
    app.route("/api/tasks", tasksRoutes);
    app.route("/api/account", accountRoutes);
  } else {
    app.all("/api/*", (c) => c.json({ error: "pro_not_configured" }, 503));
  }

  // Static fallback carries the ADR 0003 contract; /api/* is already handled.
  app.route("/", createStaticApp(staticRoot, { apiMounted: true }));

  return app;
}

if (import.meta.main) {
  const app = createApp();
  const server = Bun.serve({
    port: env.port,
    hostname: env.bindHost,
    fetch: app.fetch,
  });
  console.log(
    `phived api: http://${server.hostname}:${server.port} ` +
      `(pro ${isProConfigured() ? "enabled" : "disabled"})`
  );
}
