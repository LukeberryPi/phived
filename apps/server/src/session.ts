// Hono middleware that resolves the Better Auth session from the request
// cookies. `createSessionMiddleware` exposes nullable `c.var.user`/`c.var.session`
// (used by /api/me, which must also answer for anonymous callers).
// `createRequireAuth` rejects unauthenticated requests with 401 and narrows the
// same variables to non-null for the write/sync routes in [009]/[010].
import { createMiddleware } from "hono/factory";
import type { Auth } from "./auth";

type Session = Auth["$Infer"]["Session"];

export interface SessionVariables {
  user: Session["user"] | null;
  session: Session["session"] | null;
}

export function createSessionMiddleware(auth: Auth) {
  return createMiddleware<{ Variables: SessionVariables }>(async (c, next) => {
    const result = await auth.api.getSession({ headers: c.req.raw.headers });
    c.set("user", result?.user ?? null);
    c.set("session", result?.session ?? null);
    await next();
  });
}

// Non-null counterparts of SessionVariables, set by createRequireAuth so gated
// routes can read c.var.user / c.var.session without re-checking for null.
export interface AuthedVariables {
  user: Session["user"];
  session: Session["session"];
}

export function createRequireAuth(auth: Auth) {
  return createMiddleware<{ Variables: AuthedVariables }>(async (c, next) => {
    const result = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!result) {
      return c.json({ error: "unauthorized" }, 401);
    }
    c.set("user", result.user);
    c.set("session", result.session);
    await next();
  });
}
