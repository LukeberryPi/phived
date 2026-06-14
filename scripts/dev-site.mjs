#!/usr/bin/env node
// Single-origin dev server: one proxy fronts the Astro web dev server and the
// Vite app dev server so `/` and `/app` share an origin with working HMR. The
// routing contract lives in site-contract.mjs.
import { spawn } from "node:child_process";
import http from "node:http";
import process from "node:process";
import httpProxy from "http-proxy";
import { appBasePath, host, isAppPath, ports } from "./site-contract.mjs";

const webTarget = `http://${host}:${ports.web}`;
const appTarget = `http://${host}:${ports.app}`;

const webProxy = httpProxy.createProxyServer({ target: webTarget, ws: true });
const appProxy = httpProxy.createProxyServer({ target: appTarget, ws: true });

webProxy.on("error", handleProxyError("web"));
appProxy.on("error", handleProxyError("app"));

const server = http.createServer((req, res) => {
  routeFor(req).web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  routeFor(req).ws(req, socket, head);
});

// Vite serves the app under base "/app/", so a bare "/app" 404s there. Rewrite
// it to "/app/" before proxying so dev matches the prod fallback (where "/app"
// resolves to the app shell).
function normalizeAppRoot(req) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === appBasePath) {
    req.url = `${appBasePath}/${url.search}`;
  }
}

// Bind the proxy before spawning anything so a port clash can never leave
// orphaned dev servers behind.
server.once("error", (error) => {
  console.error(`site dev server failed to start: ${error.message}`);
  process.exit(1);
});

let children = [];

server.listen(ports.proxy, host, () => {
  console.log(`site dev server: http://localhost:${ports.proxy}`);
  console.log(`  /    -> ${webTarget}`);
  console.log(`  ${appBasePath} -> ${appTarget}`);

  children = [
    start("web", ["--cwd", "apps/web", "dev", "--", "--host", host, "--port", String(ports.web)]),
    start("app", [
      "--cwd",
      "apps/app",
      "dev",
      "--",
      "--host",
      host,
      "--port",
      String(ports.app),
      "--strictPort",
    ]),
  ];
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(signal));
}

function routeFor(req) {
  if (!isAppPath(pathnameOf(req.url))) {
    return webProxy;
  }

  normalizeAppRoot(req);
  return appProxy;
}

function pathnameOf(url = "/") {
  return new URL(url, "http://localhost").pathname;
}

function start(name, args) {
  const child = spawn("bun", args, { stdio: ["ignore", "pipe", "pipe"], env: process.env });

  child.stdout.on("data", (chunk) => prefix(name, chunk, process.stdout));
  child.stderr.on("data", (chunk) => prefix(name, chunk, process.stderr));
  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    console.error(`${name} dev server exited (${signal ?? code})`);
    shutdown("SIGTERM", code ?? 1);
  });

  return child;
}

function handleProxyError(name) {
  return (error, _req, resOrSocket) => {
    if ("writeHead" in resOrSocket) {
      resOrSocket.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
      resOrSocket.end(`${name} dev server is not ready: ${error.message}\n`);
      return;
    }

    resOrSocket.destroy();
  };
}

function prefix(name, chunk, stream) {
  for (const line of chunk.toString().split(/\r?\n/)) {
    if (line.length > 0) {
      stream.write(`[${name}] ${line}\n`);
    }
  }
}

let shuttingDown = false;

function shutdown(signal, exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  server.close();
  for (const child of children) {
    child.kill(signal);
  }
  setTimeout(() => process.exit(exitCode), 100).unref();
}
