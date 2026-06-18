import { Hono } from "hono";
import type { Kysely } from "kysely";
import type { ApiEnv } from "./env";
import type { Database } from "./db/schema";
import type { PhivedAuth } from "./auth/auth";
import {
  isActiveEntitlement,
  toEntitlementState,
} from "./entitlements/service";
import {
  createPolarClient,
  reconcileEntitlementFromPolar,
} from "./entitlements/reconcile";
import { getTaskDocument, putTaskDocument } from "./tasks/service";
import { MAX_TASK_BODY_BYTES, parsePutTasksBody } from "./tasks/types";
import { parseEncryptionKey } from "./tasks/crypto";
import { securityHeadersMiddleware, serveStaticSite } from "./site/static";

type Variables = {
  userId: string;
};

export function createApp({
  db,
  auth,
  env,
}: {
  db: Kysely<Database>;
  auth: PhivedAuth;
  env: ApiEnv;
}) {
  const app = new Hono<{ Variables: Variables }>();
  const tasksKey = env.tasksEncryptionKey
    ? parseEncryptionKey(env.tasksEncryptionKey)
    : null;
  const polarClient = createPolarClient(env);
  const polarProductIds = [
    env.polarProductIdMonthly,
    env.polarProductIdAnnual,
  ].filter((value): value is string => Boolean(value));

  app.use("*", securityHeadersMiddleware());

  app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

  app.get("/api/me", async (c) => {
    const session = await getSession(auth, c.req.raw);

    if (!session) {
      return c.json({ user: null, entitlement: toEntitlementState(null) });
    }

    const entitlement = await reconcileEntitlementFromPolar({
      db,
      polarClient,
      userId: session.user.id,
      productIds: polarProductIds,
    });

    return c.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      entitlement: toEntitlementState(entitlement),
    });
  });

  app.post("/api/entitlement/confirm", async (c) => {
    const session = await getSession(auth, c.req.raw);
    if (!session) {
      return c.json({ error: "unauthorized" }, 401);
    }

    const entitlement = await reconcileEntitlementFromPolar({
      db,
      polarClient,
      userId: session.user.id,
      productIds: polarProductIds,
    });
    return c.json({ entitlement: toEntitlementState(entitlement) });
  });

  app.use("/api/tasks", async (c, next) => {
    const session = await getSession(auth, c.req.raw);
    if (!session) {
      return c.json({ error: "unauthorized" }, 401);
    }

    const entitlement = await reconcileEntitlementFromPolar({
      db,
      polarClient,
      userId: session.user.id,
      productIds: polarProductIds,
    });
    if (!isActiveEntitlement(entitlement)) {
      return c.json({ error: "pro entitlement required" }, 402);
    }

    if (!tasksKey) {
      return c.json({ error: "task encryption is not configured" }, 503);
    }

    c.set("userId", session.user.id);
    await next();
  });

  app.get("/api/tasks", async (c) => {
    const document = await getTaskDocument(
      db,
      tasksKeyOrThrow(tasksKey),
      c.get("userId")
    );
    return c.json({ document });
  });

  app.put("/api/tasks", async (c) => {
    const contentLength = Number(c.req.header("content-length") ?? 0);
    if (contentLength > MAX_TASK_BODY_BYTES) {
      return c.json({ error: "task document too large" }, 413);
    }

    const raw = await c.req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_TASK_BODY_BYTES) {
      return c.json({ error: "task document too large" }, 413);
    }

    const body = parsePutTasksBody(JSON.parse(raw));
    if (!body) {
      return c.json({ error: "invalid task document" }, 400);
    }

    const result = await putTaskDocument(
      db,
      tasksKeyOrThrow(tasksKey),
      c.get("userId"),
      body.blob,
      body.baseVersion
    );

    if (!result.ok) {
      return c.json(
        { error: "stale baseVersion", document: result.snapshot },
        409
      );
    }

    return c.json({
      document: result.snapshot,
      adopted: result.adopted,
    });
  });

  app.delete("/api/account", async (c) => {
    const session = await getSession(auth, c.req.raw);
    if (!session) {
      return c.json({ error: "unauthorized" }, 401);
    }

    await db.deleteFrom("user").where("id", "=", session.user.id).execute();
    return c.json({ ok: true });
  });

  app.all("*", (c) => serveStaticSite(c));

  return app;
}

async function getSession(auth: PhivedAuth, request: Request) {
  return await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  });
}

function tasksKeyOrThrow(key: Buffer | null) {
  if (!key) {
    throw new Error("TASKS_ENC_KEY is required");
  }

  return key;
}

export type ApiApp = ReturnType<typeof createApp>;
