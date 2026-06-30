# 5. Auth and billing for sync (Better Auth + Polar)

Date: 2026-06-25

## Status

Accepted. The sync architecture this gates is recorded in
[ADR 0004](0004-cloud-sync-via-electricsql.md).

## Context

[ADR 0004](0004-cloud-sync-via-electricsql.md) adds cross-device sync as a paid
feature. That requires the two things phived has never had: a way to identify a
person across devices, and a way to know whether that person is paying — both
enforced on the server, because the client cannot be trusted to gate a paid
feature.

## Decision

**Identity: Better Auth, Google OAuth.** Sign-in is Google OAuth; no passwords
(no reset flows, no credential-stuffing surface, lowest friction). Magic-link
email sign-in was dropped to avoid an email-delivery dependency (Resend);
re-adding it later is additive. Anonymous use stays entirely local — there is **no** server-side user
until a person chooses to sign up — so Better Auth's anonymous-user plugin is not
used; carrying existing local tasks into an account is handled by the
first-sign-in merge below.

**One person, one user, one customer.** A user (Better Auth) owns their data
directly; there is no workspace or team. The Polar customer is one-to-one with
the user, created via the official Polar plugin for Better Auth. A Polar
**subscription** (recurring; monthly + discounted annual) is the entitlement.
There is no trial — the free, local-only app is the trial.

**Entitlement is server-enforced at both boundaries.** Polar webhooks land
subscription state in Postgres; the write API rejects mutations from
non-subscribers, and the Electric gatekeeper (ADR 0004) refuses read-shapes to
non-subscribers and scopes shapes to the user's own rows. Client-side gating is
cosmetic only. A user is entitled while the Polar subscription is `active` or
`past_due` — we honor the dunning window rather than cutting sync the instant a
card fails.

**Billing never destroys local data (invariant).** On lapse, sync turns off and
the app reverts to exactly the free local-only experience; the tasks on each
device are untouched. The cloud copy is retained until the user explicitly
deletes their account, so re-subscribing instantly resumes and re-merges. Account
deletion is therefore a required feature — it is the only path by which cloud
data leaves.

**First sign-in: silent union-merge.** When a device's local data and the cloud
both hold tasks, they are merged (a union; never destructive). Because
pre-sign-in ids were generated per-device, a merge can produce two same-named
lists; this duplicate risk is accepted (users can delete duplicates) in exchange
for never losing data and never interrupting sign-in with a prompt.

## Consequences

- Same-origin cookies (ADR 0004) mean the `/api` write routes need origin/CSRF
  protection; Better Auth handles session CSRF.
- Entitlement freshness depends on Polar webhooks; a periodic reconcile against
  Polar is advisable as a backstop for missed webhooks.
- Account deletion must hard-delete the user's cloud rows (and the Better
  Auth / Polar linkage as appropriate).
- The duplicate-list outcome of silent merge is a known, accepted UX cost; a
  reconciliation prompt can be added later without reversing this decision.

## Alternatives considered

- **One-time "lifetime" purchase.** Sync is an ongoing cost, so it needs ongoing
  revenue; lifetime pricing means hosting a user forever off a single payment.
  Rejected.
- **A trial (no-card or card-required).** Considered for conversion, but the
  generous free local tier already lets people use phived fully before paying,
  and "no trial" keeps the entitlement state machine to essentially on/off.
- **Reconciliation prompt on first sign-in.** Safer against duplicate lists, but
  adds a sign-in interruption; silent union-merge was chosen for simplicity.
- **Account/workspace model for future sharing.** Sharing a canvas is a
  different (multiplayer) product and is off-brand for "write your next few
  steps"; single-user ownership keeps the schema and entitlement check trivial.
- **Passwords / OAuth-only / passkeys-from-day-one.** Passwords add support and
  breach surface; OAuth-only excludes non-Google users; passkeys are a good later
  addition but not worth the day-one complexity.
