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

Ship a permanent kill-switch service worker at `public/sw.js` — the same URL
the v1 worker was registered under. Update-check fetches bypass the running
worker, so stale clients pick it up on their next navigation. It:

- calls `skipWaiting()` on install so it activates immediately,
- deletes all Cache Storage entries,
- unregisters itself,
- navigates open windows to their current URL, force-loading v2 immediately
  (tasks live in localStorage, so nothing is lost).

As a second layer, v2's boot (`src/main.tsx`) unregisters any service worker
registrations and clears Cache Storage, covering clients that reach v2 HTML
through a hard refresh before the kill-switch has run.

`vercel.json` serves `/sw.js` with `Cache-Control: public, max-age=0,
must-revalidate` so the kill-switch itself can never be cached stale.

## Consequences

- `public/sw.js` must never be deleted. If it is removed, the SPA rewrite
  again turns `/sw.js` into a 200-with-HTML and any straggler client that has
  not yet visited since this fix keeps its zombie v1 worker indefinitely.
- If phived ever becomes a PWA again, the new worker must be served from
  `/sw.js` (replacing the kill-switch) with `registerType: "autoUpdate"` or
  equivalent, and the boot-time unregister in `src/main.tsx` must be removed.

### Host migration

Service workers are scoped to an origin, so this fix binds us to the
**domain** (`phived.com`), not to Vercel. If hosting ever moves, the new host
must:

1. Serve `public/sw.js` as a real static file at `/sw.js` (default behavior
   for build-output files on any static host).
2. Replicate the `Cache-Control: public, max-age=0, must-revalidate` header
   for `/sw.js`. The `headers` block in `vercel.json` is the only
   Vercel-specific piece; equivalents are `_headers` on Netlify/Cloudflare
   Pages or an nginx `location` block.

Note that `phived.vercel.app` is a separate origin with its own straggler
workers. It heals itself for as long as Vercel keeps serving deployments;
real users are on `phived.com`, which is the origin that must keep the
kill-switch alive across migrations.

## Alternatives considered

- Excluding `/sw.js` from the SPA rewrite so it 404s: relies on the browser's
  slow eviction path (only on update checks, after failures) and leaves the
  precached v1 HTML serving in the meantime. Slower and less deterministic.
- Reintroducing the PWA with `autoUpdate`: reinstates the whole maintenance
  burden the 2024 removal wanted to eliminate.
