import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import type { Auth } from "./auth";
import { createRequireAuth } from "./session";

// A stub that only implements the one method createRequireAuth touches.
function fakeAuth(session: unknown): Auth {
  return {
    api: { getSession: async () => session },
  } as unknown as Auth;
}

describe("createRequireAuth", () => {
  test("responds 401 when there is no session", async () => {
    const app = new Hono();
    app.get("/protected", createRequireAuth(fakeAuth(null)), (c) =>
      c.json({ id: c.get("user").id })
    );

    const res = await app.request("/protected");

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "unauthorized" });
  });

  test("passes through and exposes the authenticated user", async () => {
    const session = {
      user: { id: "user_1", email: "user@example.test", name: "Test User" },
      session: { id: "session_1" },
    };
    const app = new Hono();
    app.get("/protected", createRequireAuth(fakeAuth(session)), (c) =>
      c.json({ id: c.get("user").id })
    );

    const res = await app.request("/protected");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ id: "user_1" });
  });
});
