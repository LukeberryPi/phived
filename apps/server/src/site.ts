// The static half of the server as a standalone Hono app: every method/route
// falls through to the site contract handler. `index.ts` composes the `/api/*`
// surface in front of this; tests exercise this app directly against a fixture
// dist so the routing/header contract stays covered (ADR 0001-0003).
import { Hono } from "hono";
import { applySecurityHeaders } from "./security-headers";
import { distRoot, handleSiteRequest } from "./static-handler";

export function createSiteApp(root: string = distRoot): Hono {
  const app = new Hono();
  app.use("*", async (c, next) => {
    await next();
    applySecurityHeaders(c.res.headers);
  });
  app.all("*", (c) => handleSiteRequest(c.req.raw, root));
  return app;
}
