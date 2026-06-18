// The static-serving + security contract from ADR 0003, ported from
// scripts/serve-site.mjs into Hono middleware (ADR 0004). The contract itself
// still lives in scripts/site-contract.mjs (single source of truth): security
// headers, the /sw.js no-cache rule, the /app SPA fallback, and the
// "reads only" 405 rule — the last now scoped to non-/api paths so /api/* can
// accept writes. Mounted both standalone (for the contract tests) and inside
// the full app.
import { Hono } from "hono";
import { stat } from "node:fs/promises";
import path from "node:path";
import {
  appMountDir,
  isAppPath,
  paths,
  securityHeaders,
  serviceWorker,
} from "../../../scripts/site-contract.mjs";

const contentTypes = new Map<string, string>([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".webmanifest", "application/manifest+json"],
]);

function safeResolve(root: string, pathname: string): string | null {
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath === root || filePath.startsWith(`${root}${path.sep}`)) {
    return filePath;
  }
  return null;
}

async function resolveStatic(
  root: string,
  pathname: string
): Promise<string | null> {
  const candidate = safeResolve(root, pathname);
  if (!candidate) {
    return null;
  }

  const candidateStat = await stat(candidate).catch(() => null);
  if (candidateStat?.isFile()) {
    return candidate;
  }

  if (candidateStat?.isDirectory()) {
    const indexFile = path.join(candidate, "index.html");
    const indexStat = await stat(indexFile).catch(() => null);
    if (indexStat?.isFile()) {
      return indexFile;
    }
  }

  return null;
}

async function sendFile(
  isHead: boolean,
  filePath: string,
  extraHeaders: Record<string, string> = {}
): Promise<Response> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return new Response("not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const headers: Record<string, string> = {
    "Content-Type":
      contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
    "Content-Length": String(file.size),
    ...extraHeaders,
  };

  if (isHead) {
    return new Response(null, { status: 200, headers });
  }
  return new Response(file, { status: 200, headers });
}

/**
 * Applies the baseline security headers to every response. Header set is the
 * single source of truth in scripts/site-contract.mjs.
 */
export function securityHeadersMiddleware(): (
  c: { res: Response },
  next: () => Promise<void>
) => Promise<void> {
  return async (c, next) => {
    await next();
    // Apply after next() so the headers land on whatever Response the handler
    // produced, including raw Responses (static files, 405, 400).
    for (const [name, value] of Object.entries(securityHeaders)) {
      c.res.headers.set(name, value as string);
    }
  };
}

/**
 * Serve the assembled dist with the routing contract. `apiMounted` controls the
 * "reads only" rule: when true the caller has already handled /api/* (which may
 * write); when false (standalone contract tests) every non-GET/HEAD request is
 * a 405, exactly like the old static server.
 */
export function createStaticApp(
  root: string = paths.dist,
  { apiMounted = false }: { apiMounted?: boolean } = {}
): Hono {
  const app = new Hono();

  app.use("*", securityHeadersMiddleware());

  app.all("*", async (c) => {
    const method = c.req.method;
    const isRead = method === "GET" || method === "HEAD";

    let pathname: string;
    try {
      pathname = decodeURIComponent(new URL(c.req.url).pathname);
    } catch {
      return c.text("bad request\n", 400);
    }

    // /api/* is exempt from the static "reads only" rule; in the full app it is
    // mounted before this catch-all, so reaching here means an unknown /api
    // route.
    if (apiMounted && pathname.startsWith("/api")) {
      return c.json({ error: "not_found" }, 404);
    }

    if (!isRead) {
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const isHead = method === "HEAD";

    if (pathname === serviceWorker.path) {
      return sendFile(isHead, path.join(root, "sw.js"), {
        "Cache-Control": serviceWorker.cacheControl as string,
      });
    }

    if (isAppPath(pathname)) {
      const appFile = await resolveStatic(root, pathname);
      return sendFile(
        isHead,
        appFile ?? path.join(root, appMountDir, "index.html")
      );
    }

    const file = await resolveStatic(root, pathname);
    if (file) {
      return sendFile(isHead, file);
    }

    return c.text("not found\n", 404);
  });

  return app;
}
