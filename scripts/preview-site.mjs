#!/usr/bin/env node
// Production-shaped static preview of the assembled dist: serves files, falls
// back /app/* to the app shell, and serves /sw.js with its no-cache header.
// The routing contract lives in site-contract.mjs.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { host, isAppPath, paths, ports, securityHeaders, serviceWorker } from "./site-contract.mjs";

const root = paths.dist;

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

const server = http.createServer(async (req, res) => {
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

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === serviceWorker.path) {
    await sendFile(req, res, path.join(root, "sw.js"), {
      "Cache-Control": serviceWorker.cacheControl,
    });
    return;
  }

  if (isAppPath(pathname)) {
    const appFile = await resolveStatic(pathname);
    await sendFile(req, res, appFile ?? path.join(root, "app", "index.html"));
    return;
  }

  const file = await resolveStatic(pathname);
  if (file) {
    await sendFile(req, res, file);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("not found\n");
});

server.once("error", (error) => {
  console.error(`site preview failed to start: ${error.message}`);
  process.exit(1);
});

server.listen(ports.proxy, host, () => {
  console.log(`site preview: http://localhost:${ports.proxy}`);
});

async function resolveStatic(pathname) {
  const candidate = safeResolve(pathname);
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

function safeResolve(pathname) {
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
