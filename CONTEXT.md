# Context

A glossary of the language used across phived. Terms here are canonical — code,
docs, and conversation should use them consistently.

## Glossary

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
