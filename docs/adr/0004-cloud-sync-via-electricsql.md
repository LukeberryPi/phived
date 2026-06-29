# 4. Cloud sync for paying users via ElectricSQL

Date: 2026-06-25

## Status

Accepted. Depends on the single-origin invariant from
[ADR 0001](0001-service-worker-kill-switch.md),
[ADR 0002](0002-path-based-landing-and-app-split.md), and
[ADR 0003](0003-host-combined-site-on-railway.md). The auth and billing half of
this feature is recorded in [ADR 0005](0005-auth-and-billing-for-sync.md).

## Context

phived has always been a local-only app: tasks live in `localStorage`
(`canvasLists`, `taskHistory`) on a single origin, with no backend beyond the
static file server (`scripts/serve-site.mjs`). We want cross-device sync, sold
as a paid feature, without regressing the anonymous experience.

Two properties of the current model shape every option:

- **Tasks have no identity.** A `TaskList` has a stable `id`, but its `tasks`
  are a positional `string[]` (`apps/app/src/types/canvas.ts`). Two devices
  editing the same list offline cannot be merged row-by-row, because there is
  nothing to match rows on — only whole arrays can be compared, so one device's
  version of the list necessarily overwrites the other's.
- **One origin, one service worker.** The `/sw.js` kill-switch (ADR 0001) and
  the shared-`localStorage` assumptions depend on everything living on the
  single `phived.com` origin. Anything we add must not split the origin or turn
  `/sw.js` into anything other than a real root file.

## Decision

Add an **additive, local-first sync layer**. The on-device store stays the
source of truth for every user; for paying users it is mirrored to the cloud and
reconciled across their devices. A logged-out or non-paying user runs exactly
today's app.

**What syncs.** The "task document": lists (`tag`, `tasks`, and canvas
`x/y/width`) and `taskHistory`. Deliberately **device-local** (never synced):
the canvas `viewport` (pan/zoom) and the theme — both are properties of the
device, not the person.

**Data model: tasks become identified entities.** `tasks: string[]` becomes a
list of identified tasks (`{ id, text, ... }`) ordered by an explicit order key
(fractional index) instead of array position. Merge is **row-level**: concurrent
edits to different tasks or lists all survive; a single task's text is
last-write-wins, and a list's `tag`/`x`/`y`/`width` are per-field
last-write-wins. The product must never silently drop a whole task because
another device touched the same list. A one-time, idempotent local migration
(modeled on the existing v1 migration in `apps/app/src/utils/canvas.ts`) runs on
boot for **all** users — including anonymous ones — so the local model is always
sync-ready.

**Engine: ElectricSQL, with Postgres as the source of truth.** Electric streams
read changes from Postgres to each device; the client writes through our own HTTP
write API (optimistic/offline writes handled via TanStack DB), which is the
single place server-side rules — including the entitlement check in ADR 0005 —
are applied. Postgres being the plain source of truth keeps the system easy to
reason about and to walk away from: remove Electric and the data is still just
rows in our database.

**Topology: one public origin; Electric is never public.** The site server is
extended to also serve `/api/*` (the write API, plus the auth and billing
surfaces from ADR 0005) and to reverse-proxy `/sync/*` to a **private** Electric
service over Railway's internal network. Postgres and Electric have no public
ingress. Electric has no auth of its own, so all read traffic passes through our
gatekeeper, which authenticates the request and scopes every shape to the
requesting user's own rows. Sessions are same-origin cookies, so there is no CORS
and no cross-site cookie handling.

Railway services after this change:

- **site + API (public)** — serves `dist/`, `/api/*`, and proxies `/sync/*`.
- **Electric (private)** — `electric-sql/electric`, reachable only from the
  site + API service over private networking.
- **Postgres (private/managed)** — the source of truth.

## Consequences

- The task data model changes shape; the reducers in
  `apps/app/src/utils/taskList.ts` and the parsers in
  `apps/app/src/utils/persistence.ts` move from array-position to id + order key.
  Task order now needs fractional indexing so concurrent inserts don't collide.
- The static `serve-site.mjs` grows into an application server (it must mount
  routes and proxy `/sync/*`). The routing/header contract in
  `scripts/site-contract.mjs` (including the `/sw.js` no-cache header and the
  `/app/*` SPA fallback) must be preserved; the exact server framework is an
  implementation detail left open.
- The single-origin guarantee (ADR 0001–0003) is preserved: still one public
  origin, `/sw.js` still a real root file.
- Electric must never be given public ingress; if it were, read-gating and
  per-user scoping would be bypassed.
- Sync is near-real-time. The dataset is one person's todo lists, so volume is
  not a concern; the engine is chosen for DX and correctness, not scale.

## Alternatives considered

- **Coarser conflict resolution (list-level or whole-canvas last-write-wins).**
  Avoids giving tasks identity, but silently loses concurrent edits — the worst
  failure mode for a "trust me with your tasks" product. Rejected.
- **Zero (Rocicorp).** Bundles the optimistic/offline write path that we
  assemble ourselves with Electric, and is an excellent local-first fit. Passed
  over because owning the write API gives the cleanest place to enforce the
  paying-user entitlement (the entire point of the feature), and because
  Electric's "Postgres is the truth, Electric only mirrors it" model is the
  lowest-risk thing to operate and to abandon. The closest call in the design.
- **Triplit.** Simplest all-in-one DX, but its own storage engine is mild
  lock-in versus plain Postgres.
- **No engine (hand-rolled versioned push/pull).** Viable given the tiny data,
  but we would rebuild offline queues and row merge ourselves. Chose an engine
  for DX and future-proofing.
- **Subdomain split (`api.`/`sync.`).** Cleaner service isolation but
  reintroduces CORS, cross-subdomain cookies, and CSRF surface, and walks away
  from the single-origin philosophy. Rejected in favor of one origin.
