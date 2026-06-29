// Hono middleware that resolves the Better Auth session from the request
// cookies into `c.var.user` / `c.var.session`, so downstream routes can gate on
// the authenticated user. Today only /api/me reads it; the write/sync routes in
// [009]/[010] will build on the same variables.
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
