// Single implementation of the assembled-site routing/header contract. The
// Bun/Hono server (via apps/server/src/static-handler.ts) calls this Web
// Request/Response handler so /sw.js, security headers, and the /app/*
// fallback are defined in exactly one place.
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  appMountDir,
  isAppPath,
  paths,
  serviceWorker,
} from "./site-contract.mjs";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
]);

export const distRoot = paths.dist;

export async function handleSiteRequest(req, root = distRoot) {
  const headers = new Headers();

  if (req.method !== "GET" && req.method !== "HEAD") {
    headers.set("Allow", "GET, HEAD");
    return new Response(null, { status: 405, headers });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url).pathname);
  } catch {
    headers.set("Content-Type", "text/plain; charset=utf-8");
    return new Response("bad request\n", { status: 400, headers });
  }

  if (pathname === serviceWorker.path) {
    return sendFile(req, path.join(root, "sw.js"), headers, {
      "Cache-Control": serviceWorker.cacheControl,
    });
  }

  if (isAppPath(pathname)) {
    const appFile = await resolveStatic(root, pathname);
    return sendFile(
      req,
      appFile ?? path.join(root, appMountDir, "index.html"),
      headers
    );
  }

  const file = await resolveStatic(root, pathname);
  if (file) {
    return sendFile(req, file, headers);
  }

  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response("not found\n", { status: 404, headers });
}

async function resolveStatic(root, pathname) {
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

function safeResolve(root, pathname) {
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath === root || filePath.startsWith(`${root}${path.sep}`)) {
    return filePath;
  }

  return null;
}

async function sendFile(req, filePath, baseHeaders, extraHeaders = {}) {
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) {
    const headers = new Headers(baseHeaders);
    headers.set("Content-Type", "text/plain; charset=utf-8");
    return new Response("not found\n", { status: 404, headers });
  }

  const headers = new Headers(baseHeaders);
  headers.set(
    "Content-Type",
    contentTypes.get(path.extname(filePath)) ?? "application/octet-stream"
  );
  headers.set("Content-Length", String(fileStat.size));
  for (const [name, value] of Object.entries(extraHeaders)) {
    headers.set(name, value);
  }

  if (req.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(await readFile(filePath), { status: 200, headers });
}
