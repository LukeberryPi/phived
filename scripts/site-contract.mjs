// Single source of truth for the phived.com routing/build contract.
//
//   /        -> apps/web (Astro) public web app
//   /app     -> apps/app (Vite) task app, built with base "/app/"
//   /sw.js   -> kill-switch service worker at the origin root (see ADR 0001)
//
// Every local server (dev proxy, static preview) and the build assembler import
// from here so the contract can never drift between dev, preview, and prod.
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const paths = {
  root: rootDir,
  dist: path.join(rootDir, "dist"),
  webDist: path.join(rootDir, "apps", "web", "dist"),
  appDist: path.join(rootDir, "apps", "app", "dist"),
};

/** URL prefix the Vite task app is mounted under. */
export const appBasePath = "/app";

export const ports = {
  proxy: Number(process.env.PORT ?? 3000),
  web: Number(process.env.WEB_PORT ?? 4321),
  app: Number(process.env.APP_PORT ?? 5173),
};

/** Loopback bind address for local dev/preview servers (opt-in LAN via BIND_HOST). */
export const host = process.env.BIND_HOST ?? "127.0.0.1";

/** Origin-root kill-switch contract (see ADR 0001). */
export const serviceWorker = {
  path: "/sw.js",
  cacheControl: "public, max-age=0, must-revalidate",
};

/** Files that must exist in the assembled dist for a deploy to be valid. */
export const requiredOutputs = ["index.html", "app/index.html", "sw.js", "robots.txt"];

/** True when a request pathname belongs to the Vite app surface. */
export function isAppPath(pathname = "") {
  return pathname === appBasePath || pathname.startsWith(`${appBasePath}/`);
}
