import { stat } from "node:fs/promises";
import path from "node:path";
import type { Context, MiddlewareHandler } from "hono";
import {
  appMountDir,
  isAppPath,
  paths,
  securityHeaders,
  serviceWorker,
} from "../../../../scripts/site-contract.mjs";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json"],
]);

export function securityHeadersMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    for (const [name, value] of Object.entries(securityHeaders)) {
      c.header(name, value);
    }

    await next();
  };
}

export async function serveStaticSite(c: Context, root = paths.dist) {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    return c.body(null, 405, { Allow: "GET, HEAD" });
  }

  const pathname = safePathname(c.req.url);
  if (!pathname) {
    return c.text("bad request\n", 400);
  }

  if (pathname === serviceWorker.path) {
    return await sendFile(c, path.join(root, "sw.js"), {
      "Cache-Control": serviceWorker.cacheControl,
    });
  }

  if (isAppPath(pathname)) {
    const appFile = await resolveStatic(root, pathname);
    return await sendFile(
      c,
      appFile ?? path.join(root, appMountDir, "index.html")
    );
  }

  const file = await resolveStatic(root, pathname);
  if (file) {
    return await sendFile(c, file);
  }

  return c.text("not found\n", 404);
}

function safePathname(rawUrl: string) {
  try {
    return decodeURIComponent(new URL(rawUrl).pathname);
  } catch {
    return null;
  }
}

async function resolveStatic(root: string, pathname: string) {
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

function safeResolve(root: string, pathname: string) {
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath === root || filePath.startsWith(`${root}${path.sep}`)) {
    return filePath;
  }

  return null;
}

async function sendFile(
  c: Context,
  filePath: string,
  headers: Record<string, string> = {}
) {
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) {
    return c.text("not found\n", 404);
  }

  const responseHeaders = {
    "Content-Length": String(fileStat.size),
    "Content-Type":
      contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
    ...headers,
  };

  if (c.req.method === "HEAD") {
    return c.body(null, 200, responseHeaders);
  }

  const file = Bun.file(filePath);
  return new Response(file.stream(), {
    status: 200,
    headers: responseHeaders,
  });
}
