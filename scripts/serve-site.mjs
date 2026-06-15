#!/usr/bin/env node
// Production static server for the assembled dist: serves files, falls back
// /app/* to the app shell, and serves /sw.js with its no-cache header.
// The routing contract lives in site-contract.mjs.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  appMountDir,
  host,
  isAppPath,
  paths,
  ports,
  securityHeaders,
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

export function createSiteServer(root = paths.dist) {
  return http.createServer(async (req, res) => {
    await handleRequest(req, res, root);
  });
}

async function handleRequest(req, res, root) {
  // Apply baseline security headers to every response (ADR 0003). setHeader runs
  // before any writeHead, so these survive on static files, the SPA fallback,
  // /sw.js, and error responses alike.
  for (const [name, value] of Object.entries(securityHeaders)) {
    res.setHeader(name, value);
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }

  const pathname = parsePathname(req);
  if (!pathname) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("bad request\n");
    return;
  }

  if (pathname === serviceWorker.path) {
    await sendFile(req, res, path.join(root, "sw.js"), {
      "Cache-Control": serviceWorker.cacheControl,
    });
    return;
  }

  if (isAppPath(pathname)) {
    const appFile = await resolveStatic(root, pathname);
    await sendFile(
      req,
      res,
      appFile ?? path.join(root, appMountDir, "index.html")
    );
    return;
  }

  const file = await resolveStatic(root, pathname);
  if (file) {
    await sendFile(req, res, file);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("not found\n");
}

export const server = createSiteServer();

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.once("error", (error) => {
    console.error(`site preview failed to start: ${error.message}`);
    process.exit(1);
  });

  server.listen(ports.server, host, () => {
    console.log(`site preview: http://localhost:${ports.server}`);
  });
}

function parsePathname(req) {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    return decodeURIComponent(url.pathname);
  } catch {
    return null;
  }
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

async function sendFile(req, res, filePath, headers = {}) {
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("not found\n");
    return;
  }

  res.writeHead(200, {
    "Content-Length": fileStat.size,
    "Content-Type": contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
    ...headers,
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
}
