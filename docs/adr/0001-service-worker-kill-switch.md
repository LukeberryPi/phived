# 1. Permanent service worker kill-switch

Date: 2026-06-12

## Status

Accepted

## Context

phived v1 was a PWA built with `vite-plugin-pwa` (`registerType: "prompt"`).
Its workbox service worker precached `index.html`, so controlled clients were
served the app shell entirely from the service worker cache.

The PWA was removed in March 2024 (commit `bfcb791`), but removal only stopped
registering the worker. Clients that already had it kept it, and two things
prevented the browser's natural eviction path from ever firing:

1. With `registerType: "prompt"`, an updated worker waits for explicit user
   confirmation that the app never asked for, so updates never activated.
2. `vercel.json` rewrites every path to `/`, so the browser's periodic update
   check for `/sw.js` received `200` with HTML instead of the `404` that would
   have caused unregistration. The check fails silently and the zombie worker
   stays installed forever.

The visible symptom: affected users see the cached v1 on every normal load;
a hard refresh shows v2; the next normal reload regresses to v1.

## Decision

Ship a permanent kill-switch service worker at `apps/web/public/sw.js`, emitted
at the combined site's origin root `/sw.js` — the same URL the v1 worker was
registered under. Update-check fetches bypass the running worker, so stale
clients pick it up on their next navigation. It:

- calls `skipWaiting()` on install so it activates immediately,
- deletes all Cache Storage entries,
- unregisters itself,
- navigates open windows to their current URL, force-loading v2 immediately
  (tasks live in localStorage, so nothing is lost).

As a second layer, the app boot (`apps/app/src/main.tsx`) unregisters any
service worker registrations and clears Cache Storage, covering clients that
reach current app HTML through a hard refresh before the kill-switch has run.

`vercel.json` serves `/sw.js` with `Cache-Control: public, max-age=0,
must-revalidate` so the kill-switch itself can never be cached stale.

## Consequences

- `apps/web/public/sw.js` must never be deleted. If it is removed, straggler
  clients that have not yet visited since this fix keep their zombie v1 worker
  indefinitely.
- If phived ever becomes a PWA again, the new worker must be served from
  `/sw.js` (replacing the kill-switch) with `registerType: "autoUpdate"` or
  equivalent, and the boot-time unregister in `apps/app/src/main.tsx` must be
  removed.

### Host migration

Service workers are scoped to an origin, so this fix binds us to the
**domain** (`phived.com`), not to Vercel. If hosting ever moves, the new host
must:

1. Serve `apps/web/public/sw.js` as a real static file at `/sw.js` (default
   behavior for build-output files on any static host).
2. Replicate the `Cache-Control: public, max-age=0, must-revalidate` header
   for `/sw.js`. The `headers` block in `vercel.json` is the only
   Vercel-specific piece; equivalents are `_headers` on Netlify/Cloudflare
   Pages or an nginx `location` block.

Note that `phived.vercel.app` is a separate origin with its own straggler
workers. It heals itself for as long as Vercel keeps serving deployments;
real users are on `phived.com`, which is the origin that must keep the
kill-switch alive across migrations.

## Addendum (2026-06-14): `/sw.js` owner moved to the web app

[ADR 0002](0002-path-based-landing-and-app-split.md) put the Astro web app at
the origin root and moved the Vite app to `/app`. The kill-switch contract is
unchanged in spirit but the file moved:

- The authoritative kill-switch now ships from `apps/web/public/sw.js` and is
  emitted at the combined output's `dist/sw.js`, i.e. still served at the origin
  root `/sw.js` with the same `Cache-Control: public, max-age=0,
must-revalidate` header (now declared in the post-split `vercel.json`).
- The "DO NOT DELETE" rule now applies to `apps/web/public/sw.js`. The old
  `apps/app/public/sw.js` was removed so there is only one kill-switch source.
- The SPA catch-all rewrite is now scoped to `/app/*`, so the original failure
  mode (root rewrite turning `/sw.js` into 200-with-HTML) can no longer occur at
  the root regardless.

The host-migration notes below still hold: the kill-switch is bound to the
`phived.com` **origin**, and `/sw.js` must remain a real static file at the root
with the no-cache header on any host.

## Addendum (2026-06-15): host is now Railway

Hosting moved off Vercel to Railway (see
[ADR 0003](0003-host-combined-site-on-railway.md)). `vercel.json` was removed,
so the `Cache-Control: public, max-age=0, must-revalidate` header for `/sw.js`
is no longer a platform config value — it is emitted by our own Node static
server (`scripts/serve-site.mjs`) from `scripts/site-contract.mjs`.

The host-migration requirements above are unchanged: `/sw.js` must remain a real
static file at the origin root with the no-cache header. On Railway this is
satisfied by serving `dist/sw.js` through that server. The `_headers`/nginx
"equivalents" mentioned earlier are now moot because we control the serving
process directly.

## Alternatives considered

- Excluding `/sw.js` from the SPA rewrite so it 404s: relies on the browser's
  slow eviction path (only on update checks, after failures) and leaves the
  precached v1 HTML serving in the meantime. Slower and less deterministic.
- Reintroducing the PWA with `autoUpdate`: reinstates the whole maintenance
  burden the 2024 removal wanted to eliminate.
