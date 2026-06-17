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
- **api** — the `/api/*` surface on the `phived.com` origin serving
  authentication and task sync. Part of the site, not a separate origin. See
  `docs/adr/0004-phived-pro-auth-sync.md`.
- **free** — the unauthenticated phived experience: tasks live only in the
  browser, with no account, no server copy, and no cross-device sync. The
  default way the app is used.
- **pro** — the paid phived experience ("Phived Pro"): a signed-in person whose
  tasks are persisted on the server and synced across their devices. Pro is a
  capability layered on the same app, not a separate product.
- **User** — the authenticated identity behind Pro, established by signing in
  with Google. Distinct from the Customer.
- **Customer** — the billing identity for a User, held by the payment provider.
  One User maps to one Customer. Distinct from the User so that "who they are"
  and "how they pay" stay separate concepts.
- **Subscription** — the recurring agreement that, while live, makes a User
  entitled to Pro. Owned by the payment provider; phived only mirrors its
  status.
- **entitlement** — the derived answer to "is this User currently Pro?".
  Computed from the Subscription status and deliberately separate from
  authentication: a signed-in User is not necessarily entitled.
- **LocalOnly** — the state of a User who is signed in but not entitled (lapsed,
  cancelled, or never subscribed). Behaves like free — tasks stay on the device
  — without discarding any local or previously synced data.
- **sync** — keeping a Pro User's tasks consistent between their device and the
  server. The synced unit is the tasks and their history; per-device view
  settings (camera, theme, open panels) are not synced.
- **task document** — the canonical server-held copy of a Pro User's tasks and
  history. Stored encrypted; one per User.
- **adoption** — the one-time moment a free User's existing local tasks become
  the seed of their server task document on first upgrade, so upgrading never
  appears to change or clear the canvas.
