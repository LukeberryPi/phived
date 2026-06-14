# 2. Path-based split: web at `/`, app at `/app`

Date: 2026-06-14

## Status

Accepted

## Context

phived.com served the Vite app directly at the origin root. We want a dedicated
Astro web app on the front door without sacrificing the app's URL or the
constraints established in
[ADR 0001](0001-service-worker-kill-switch.md).

Target URL contract:

- `phived.com/` → Astro web app (`apps/web`)
- `phived.com/app` → Vite task app (`apps/app`)

Hard constraints carried in from ADR 0001:

- The service-worker kill-switch is **origin-scoped** (`phived.com`). Stragglers
  still controlled by the v1 zombie worker heal only when the browser's update
  check for `/sw.js` returns the kill-switch script (not HTML) at the **origin
  root**. So `/sw.js` must keep being served at the root with
  `Cache-Control: public, max-age=0, must-revalidate`, no matter what now lives
  at `/`.

Options considered for the split:

1. **Single Vercel project, combined build output** — one project on
   `phived.com`. The web build owns the root; the app builds into `/app`.
2. **Two Vercel projects + rewrite proxy** (Next.js "multi-zones" style) — a
   web project owns `phived.com` and rewrites `/app/:path*` to a separate
   app deployment.
3. **Subdomain** — move the app to `app.phived.com`.

## Decision

Use **one Vercel project with a single combined build output** (option 1).

- `apps/web` is an Astro static site. It builds to `apps/web/dist` and owns the
  origin root.
- `apps/app` (Vite) is built with `base: "/app/"` so every emitted asset URL is
  prefixed with `/app/`.
- `scripts/build-site.mjs` (run via `bun run build:site`) assembles the two
  builds into a single `dist/`:
  - `apps/web/dist` → `dist/` (root)
  - `apps/app/dist` → `dist/app/`
- The routing contract (app prefix, required outputs, `/sw.js` cache header,
  dev/preview ports) is centralized in `scripts/site-contract.mjs` and shared by
  the build assembler, the dev proxy (`scripts/dev-site.mjs`), and the static
  preview (`scripts/preview-site.mjs`) so dev, preview, and prod cannot drift.
- `vercel.json` sets `outputDirectory: "dist"`, rewrites `/app/:path*` →
  `/app/index.html` (SPA fallback scoped to the app), and keeps the `/sw.js`
  no-cache header.

The kill-switch service worker now ships from `apps/web/public/sw.js`, so it
is emitted at `dist/sw.js` and served at the origin root `/sw.js` — preserving
the ADR 0001 contract under the new owner of `/`. (See the ADR 0001 addendum.)

DNS is unchanged: `phived.com` / `www.phived.com` keep pointing at the same
Vercel project. This is purely a routing change inside one origin, not a DNS
change — both paths share cookies, storage, and the service-worker scope.

## Consequences

- **Single origin preserved.** `localStorage` (where tasks live) and the
  service-worker scope are shared across `/` and `/app`. The kill-switch keeps
  working because `/sw.js` is still a real static file at the root.
- The app's canonical/OG URLs moved to `https://www.phived.com/app`.
- `bun run build:site` is the deployment entry point. The old single-app
  `buildCommand`/SPA-rewrite-to-`/` is gone; the catch-all rewrite is now scoped
  to `/app/*` so it can never again turn `/sw.js` (or the web routes) into a
  200-with-HTML response.
- Both apps share design tokens via the `@phived/tokens` workspace package, so
  the web and app cannot drift visually.
- Any future static asset that must live at the **root** (e.g. `robots.txt`,
  `/sw.js`, verification files) belongs in `apps/web/public`, not
  `apps/app/public` — the latter now lands under `/app/`.
- `apps/app/public/sw.js` was removed. The authoritative and only kill-switch
  source is `apps/web/public/sw.js`, which emits to the root `/sw.js`.

## Alternatives considered

- **Two Vercel projects + rewrite proxy.** Cleaner build isolation, but adds a
  cross-deployment proxy hop and muddies the single-origin guarantee that ADR
  0001 depends on (the rewrite target is a different deployment with its own
  `/sw.js` and its own straggler workers). More moving parts for no real gain at
  this scale.
- **Subdomain (`app.phived.com`).** Simplest routing, but it changes the
  requested URL contract and, worse, splits the service-worker origin — v1
  stragglers on `phived.com` would never reach a healing `/sw.js` tied to the
  app again. Rejected on the strength of ADR 0001.
