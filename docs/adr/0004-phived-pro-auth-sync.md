# 4. Phived Pro: same-origin auth, entitlement, and encrypted task sync

Date: 2026-06-17

## Status

Accepted. Builds on [ADR 0002](0002-path-based-landing-and-app-split.md)
(single-origin web + app split) and [ADR 0003](0003-host-combined-site-on-railway.md)
(one Railway service serving the assembled `dist/`).

## Context

phived has been a purely local product: tasks live in `localStorage`, there is
no account, and the marketing surface advertises "no cookies, no images, no
ads." We are adding **Phived Pro**, a paid tier where a signed-in User's tasks
persist on the server and sync across their devices, while the **free**
experience stays exactly as it is — local-only, anonymous, and instant.

Several constraints shaped the decision and are easy to get wrong:

- The free experience is local-first and every action is instant. Pro must feel
  just as snappy; a network round trip must never sit on the interaction path.
- Upgrading from free to Pro must be seamless: the canvas must not appear to
  change when a person pays.
- A signed-in User who is not paying must not end up in a "bad state" that
  corrupts or discards tasks.
- The brand promises no cookies and no consent banner. Pro needs a session.
- We deploy as a single service on a single origin (ADR 0002/0003), and we want
  to keep it that way.
- There is a native macOS app under a parity contract. It is explicitly **out
  of scope** for this iteration; Pro is web-only for v1.

The cross-cutting question is how to add authentication, billing entitlement,
and server persistence without compromising the local-first feel, the
single-origin guarantee, or the no-banner promise.

## Decision

### One origin, one service

The Pro backend is an `/api/*` surface on the **same** `phived.com` origin and
the **same** Railway service, not a separate API host. A single Bun process
(`apps/api`, built on Hono) serves the assembled `dist/` and mounts `/api/*`.
The routing and security contract stays sourced from
`scripts/site-contract.mjs` (security headers, the `/sw.js` no-cache rule, the
`/app` SPA fallback, and the "reads only" rule for static paths), now applied as
middleware with `/api/*` carved out so it can accept writes.

Same-origin is load-bearing: it makes the session cookie **first-party**,
removes CORS, and is already permitted by the existing `connect-src 'self'`
CSP. A separate `api.phived.com` would force a cross-site cookie
(`SameSite=None`), which is the third-party-cookie behaviour the brand rejects.

### One essential cookie, and no other

Authentication uses a single first-party, `HttpOnly`, `SameSite=Lax` session
cookie. It is strictly necessary, so it needs no consent banner. To keep the
"no cookies" promise honest rather than narrowly true, web analytics is moved to
a cookieless approach so that this session cookie is the **only** cookie the
product sets, and the copy becomes "no tracking cookies." Free users, who never
sign in, remain entirely cookieless.

### Entitlement is separate from authentication

"Signed in" and "is Pro" are distinct. Entitlement is derived from the
Subscription status, mirrored locally, and enforced **server-side** on every
task-sync request. A signed-in but unentitled User is a legitimate state
(LocalOnly), not an error: the app degrades to local-only behaviour with all
local and previously synced data intact. Entitlement is generous — a lapsed
payment keeps Pro through the provider's grace and cancel-at-period-end windows,
and is revoked only when the provider definitively ends it. The mirror is the
runtime source of truth, reconciled by a one-shot authoritative check on the
post-checkout return and a lazy self-heal on session refresh so that a delayed
or dropped billing webhook cannot strand a User in the wrong state.

### Tasks are one encrypted document per User

The server stores a single **task document** per User: the tasks and their
history as one blob, encrypted at rest with AES-256-GCM under a server-held key
that carries a version so it can be rotated. This mirrors the local shape
one-to-one, which is what makes adoption and hydration trivial. It is encryption
**at rest**, not end-to-end: it defends a leaked database dump or stolen backup,
not a fully compromised server. We accept that trade-off for a to-do app in
exchange for normal account recovery and supportability; the key-version column
leaves room to harden later.

Because the document is opaque to the server, this deliberately forecloses
server-side features over task *content* (search, link-sharing a single list,
partial/delta sync) until the model is reshaped.

### Local-first stays the write path; sync is background

The local store remains the in-session source of truth and the UI never awaits
the network, so Pro is as instant as free. Sync runs in the background:
debounced pushes with a best-effort flush when the tab is hidden, and pulls on
load, focus, and reconnect — no live connection in v1. Conflicts between devices
are resolved per data kind: completed-task **history is unioned** so records are
never lost, while the **canvas is last-write-wins** with the prior local state
snapshotted to a backup first. **Adoption** branches on whether a server
document already exists: first upgrade pushes the local tasks up as the seed
(canvas visibly unchanged); signing in where a document already exists treats
the server as authoritative after backing up local. Explicit sign-out clears the
local copy and restores the pre-sign-in backup (safe on borrowed browsers); a
silent session expiry keeps local data and only pauses sync.

## Consequences

- The static-serving contract from ADR 0003 is preserved but now lives in
  `apps/api` middleware rather than `scripts/serve-site.mjs`; its contract tests
  must be carried forward, and `/api/*` is exempt from the static "reads only"
  rule.
- Railway gains a Postgres dependency and Pro-related secrets; the start command
  runs migrations before booting. This is sound at single-instance scale; a
  dedicated migration step would be needed before scaling horizontally.
- The "no cookies" claim becomes "no tracking cookies," backed by a single
  essential cookie and cookieless analytics. This is a deliberate, visible brand
  copy change.
- Losing a subscription is non-destructive by design: data is retained and sync
  resumes on resubscribe. There is no state in which non-payment corrupts tasks.
- The single-blob, encryption-at-rest choice keeps the server content-blind and
  the model simple, at the cost of server-side content features and of true
  end-to-end privacy. Both are revisitable but not for free.
- The native macOS app does not participate in Pro sync yet; bringing it in is a
  separate effort (auth + sync client in Swift) under its parity contract.

## Alternatives considered

- **Separate API origin (`api.phived.com`).** Cleaner deploy isolation, but
  forces a cross-site cookie and CORS, undermining both the no-tracking-cookie
  posture and the single-origin guarantee from ADR 0002/0003. Rejected.
- **Bearer token in `localStorage` instead of a cookie.** Achieves literal
  zero-cookies, but stores a long-lived credential where any XSS can read it,
  and adds manual token lifecycle. The essential first-party cookie is both
  safer and banner-free. Rejected.
- **Normalized lists/tasks tables instead of one blob.** Would enable
  server-side content features and finer sync, but the server cannot index
  encrypted content anyway, and it adds substantial sync machinery. Rejected for
  v1; the blob can be reshaped if a content feature ever justifies dropping
  encryption-at-rest.
- **End-to-end encryption.** Strongest privacy, but makes forgotten-password
  equal permanent data loss and blocks all server-side help. Out of step with a
  to-do app's support expectations; the key-version field keeps the door open.
- **Realtime sync (WebSocket/SSE) or interval polling.** Live multi-device
  updates, but a persistent connection / push infrastructure is unjustified for
  a quiet single-user focus app. Event-driven push-on-change with pull-on-focus
  is sufficient. Rejected for v1.
- **Querying the billing provider on every entitlement check.** Always correct,
  but adds latency and a third-party dependency to every gated request. The
  webhook-updated mirror with post-checkout confirmation and lazy self-heal
  gives correctness without the per-request cost. Rejected.
