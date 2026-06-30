import { describe, expect, test } from "bun:test";
import type { MiddlewareHandler } from "hono";
import { securityHeaders } from "../../../scripts/site-contract.mjs";
import { createServerApp } from "./app";
import type { Auth } from "./auth";
import type { SessionVariables } from "./session";

function expectSecurityHeaders(res: Response): void {
  for (const [name, value] of Object.entries(securityHeaders)) {
    expect(res.headers.get(name)).toBe(value);
  }
}

describe("server app security headers", () => {
  test("applies baseline headers to static-only API responses", async () => {
    const app = await createServerApp({ mode: "static-only" });

    const res = await app.request("/api/me");

    expect(res.status).toBe(503);
    expectSecurityHeaders(res);
  });

  test("applies baseline headers to API-mode JSON responses", async () => {
    const fakeAuth = {
      handler: () => new Response("auth"),
    } as unknown as Auth;
    const createSessionMiddleware: (
      auth: Auth
    ) => MiddlewareHandler<{ Variables: SessionVariables }> = (_auth) => {
      return async (c, next) => {
        c.set("user", {
          id: "user_1",
          email: "user@example.test",
          name: "Test User",
        } as SessionVariables["user"]);
        c.set("session", null);
        await next();
      };
    };

    const app = await createServerApp(
      {
        mode: "api",
        apiEnv: {
          databaseUrl: "postgres://localhost:5432/test",
          betterAuthSecret: "test-secret-please-ignore-0123456789",
          betterAuthUrl: "https://example.test",
          googleClientId: "google-id",
          googleClientSecret: "google-secret",
          polarAccessToken: "polar-token",
          polarWebhookSecret: "polar-webhook",
          polarProductIdMonthly: "prod-monthly",
          polarProductIdAnnual: "prod-annual",
          polarServer: "sandbox",
        },
      },
      {
        apiDependencies: {
          auth: fakeAuth,
          runMigrations: async () => [],
          getEntitlement: async () => ({
            status: "active",
            isEntitled: true,
            currentPeriodEnd: null,
          }),
          createSessionMiddleware,
        },
      }
    );

    const res = await app.request("/api/me");

    expect(res.status).toBe(200);
    expectSecurityHeaders(res);
  });
});
