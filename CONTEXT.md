# Context

A glossary of the language used across phived. Terms here are canonical — code,
docs, and conversation should use them consistently.

## Surfaces

- **app** — the interactive phived product: the task canvas where a person
  writes their next few steps. Lives in `apps/app`, served at `phived.com/app`.
- **web** — the public front door at `phived.com/`. Markets the app and links
  into it. Lives in `apps/web`. The web app may contain a landing page, but
  "web" is the canonical name for this surface.
- **site** — the whole `phived.com` origin: web + app + the root `/sw.js`,
  assembled into one deployment. "Build the site" means build both and combine
  them.
- **tokens** — the shared design primitives (colours, type, shadows, the dark
  variant) exposed by the `@phived/tokens` workspace package, consumed by both
  web and app so they cannot drift visually.
- **kill-switch** — the root `/sw.js` service worker whose only job is to evict
  the legacy v1 PWA worker. See `docs/adr/0001-service-worker-kill-switch.md`.

## Tasks

- **list** — a tagged collection of tasks placed at a position on the canvas. A
  canvas holds one or more lists.
- **task** — a single line item within a list.
- **task history** — the log of completed tasks a person can review and restore
  from.

## Accounts & sync

- **user** — the authenticated person (a Better Auth identity). Owns all of
  their own lists, tasks, and history. There is no team or workspace; a user
  owns their data directly. _Avoid_: account.
- **customer** — the same person as represented in Polar for billing. One-to-one
  with a user. _Avoid_: account.
- **subscription** — the paid Polar plan that entitles a user to sync.
- **sync** — mirroring a paying user's lists, tasks, and history across their
  devices through the cloud. It is additive: anonymous and non-paying use is
  unchanged and stays local-only.
- **device-local** — state that deliberately does not sync because it is a
  property of the device, not the person: the canvas viewport (pan/zoom) and the
  theme.
