# 3. Host the combined site on Railway

Date: 2026-06-15

## Status

Accepted. Supersedes the hosting choice in
[ADR 0002](0002-path-based-landing-and-app-split.md) (the single-Vercel-project
decision). The build-assembly decision in ADR 0002 is unchanged.

## Context

ADR 0002 assembles `apps/web` (Astro) and `apps/app` (Vite) into a single
`dist/` and assumed one Vercel project served it. `vercel.json` carried four
things beyond the build command:

- `outputDirectory: "dist"`,
- the `/app/:path*` → `/app/index.html` SPA fallback,
- the `/sw.js` `Cache-Control: public, max-age=0, must-revalidate` header
  (the ADR 0001 kill-switch contract),
- baseline security headers (`X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Content-Security-Policy`).

We are moving hosting to **Railway** and `vercel.json` has been removed. Railway
runs a long-lived service (a container started by a command), not a static
directory fronted by a platform-native `_headers`/`_redirects` file. So the
routing + header contract that `vercel.json` declared must now be emitted by an
HTTP server we run.

The repo already has that server: `scripts/preview-site.mjs`, a contract-driven
Node static server (used by `bun run preview`) that serves `dist/`, applies the
`/app/*` SPA fallback, and sets the `/sw.js` no-cache header — all sourced from
`scripts/site-contract.mjs`. It reads `process.env.PORT` and honours a
`BIND_HOST` override.

## Decision

Serve the assembled `dist/` on Railway with the existing Node static server
(`scripts/preview-site.mjs`), promoted from "local preview" to the production
serving path. The routing/header contract stays centralized in
`scripts/site-contract.mjs` so dev, local preview, and Railway cannot drift.

Railway service configuration:

- **Build command**: `bun run build:site` → `dist/` (unchanged from ADR 0002).
  Railway's builder detects Bun from `bun.lock`.
- **Start command**: `bun scripts/preview-site.mjs` (serves `dist/`).
- **Port**: the server already binds `process.env.PORT` (via
  `site-contract.mjs` `ports.proxy`), which Railway injects. Do not hard-code it.
- **Bind address**: set `BIND_HOST=0.0.0.0` in the Railway service variables.
  The default `127.0.0.1` is loopback-only (correct for local preview) and is
  unreachable on Railway.
- **Healthcheck**: `GET /` returns `200`.
- **Custom domain**: point `phived.com` / `www.phived.com` at the Railway
  service per Railway's custom-domain DNS instructions (CNAME to the
  Railway-provided target). DNS is the only origin-level change; the
  single-origin guarantee from ADR 0001/0002 is preserved because everything is
  still one service on one origin.

These settings are committed in `railway.json` (`buildCommand`, `startCommand`
with `BIND_HOST=0.0.0.0`, healthcheck on `/`); they can also be overridden in
the Railway dashboard.

The security headers formerly declared in `vercel.json` now live in the static
server, sourced from `scripts/site-contract.mjs` (the `securityHeaders` export)
so they remain a single source of truth alongside the routing and
service-worker contract.

## Consequences

- `vercel.json` is gone; the routing/caching/security contract is now owned by
  `scripts/preview-site.mjs` + `scripts/site-contract.mjs`, the same code path
  `bun run preview` exercises. Local preview now matches production more closely
  than it did under Vercel's platform config.
- The service-worker kill-switch (ADR 0001) is unaffected: `/sw.js` is still a
  real file at the origin root served with `public, max-age=0, must-revalidate`,
  now emitted by our server instead of by Vercel.
- Because we serve via our own process, future redirects, headers, or
  compression are added in one place (the server) with no platform-specific
  config format.
- Parity with the old `vercel.json` is implemented:
  - The four security headers are exported from `scripts/site-contract.mjs`
    (`securityHeaders`) and applied to every response by
    `scripts/preview-site.mjs`.
  - A `start` script (`bun scripts/preview-site.mjs`) exists, and `railway.json`
    runs it with `BIND_HOST=0.0.0.0`.
- Trade-off vs a static/edge CDN: a Railway service has uptime/cold-path
  considerations and is not a global edge CDN by default. Acceptable at this
  app's scale; a fronting CDN can be added later without changing the contract.

## Alternatives considered

- **Static host with `_headers`/`_redirects` (Netlify, Cloudflare Pages).**
  Would re-introduce a platform-specific config file like `vercel.json`.
  Rejected because we chose Railway.
- **nginx/Caddy in a container serving `dist/`.** Viable and gives CDN-like
  static serving, but adds a second runtime and config language when we already
  have a contract-driven Node server that guarantees parity with dev/preview.
  Revisit if we need fine-grained caching/compression tuning.
- **Stay on Vercel.** Rejected by this ADR; the project is moving to Railway.
