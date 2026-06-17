// Single source of truth for the phived.com routing/build contract.
//
//   /        -> apps/web (Astro) public web app
//   /app     -> apps/app (Vite) task app, built with base "/app/"
//   /sw.js   -> kill-switch service worker at the origin root (see ADR 0001)
//
// The static server (local preview and production) and the build assembler
// import from here so the contract can never drift between preview and prod.
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

export const paths = {
  root: rootDir,
  dist: path.join(rootDir, "dist"),
  webDist: path.join(rootDir, "apps", "web", "dist"),
  appDist: path.join(rootDir, "apps", "app", "dist"),
};

export const appBasePath = "/app";
export const appMountDir = "app";
export const appHref = appBasePath;

export const ports = {
  server: Number(process.env.PORT ?? 3000),
};

/**
 * Bind address for the static server. Defaults to loopback for local preview;
 * set BIND_HOST=0.0.0.0 in production (e.g. Railway) so the platform proxy can
 * reach it (see ADR 0003).
 */
export const host = process.env.BIND_HOST ?? "127.0.0.1";

/** Origin-root kill-switch contract (see ADR 0001). */
export const serviceWorker = {
  path: "/sw.js",
  cacheControl: "public, max-age=0, must-revalidate",
};

/**
 * Baseline security headers applied to every response (see ADR 0003). These
 * previously lived in vercel.json; since the site is served by our own Node
 * server on Railway, they are emitted here so dev/preview/prod cannot drift.
 * The CSP allows the inline theme-boot script, Google Fonts, and the web-only
 * Google Analytics scripts; tighten it if those dependencies change.
 */
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://www.phived.com",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
    "object-src 'none'",
  ].join("; "),
};

/** Files that must exist in the assembled dist for a deploy to be valid. */
export const requiredOutputs = [
  "index.html",
  `${appMountDir}/index.html`,
  "sw.js",
  "robots.txt",
];

export function isAppPath(pathname = "") {
  return pathname === appBasePath || pathname.startsWith(`${appBasePath}/`);
}
