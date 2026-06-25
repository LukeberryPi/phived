# phived sync — implementation plan index

**Not an executable plan.** This is the sequencing/index for the cross-device
sync feature. Each numbered plan in this folder is self-contained and
executor-ready (Scope, Drift check, Steps, Verification, STOP conditions) per
`.cursor/agents/phived-plan-executor.md`.

Decisions behind these plans live in:

- `docs/adr/0004-cloud-sync-via-electricsql.md` — sync architecture
- `docs/adr/0005-auth-and-billing-for-sync.md` — auth + billing
- `CONTEXT.md` — glossary (`Accounts & sync`, `Tasks`)

## Phasing & dependencies

Phases are strictly sequential. Each one leaves the app shippable.

1. **[0001] Local task identity** (`apps/app` only, no backend). Give every task
   a stable `id`, separating task *identity* from view *padding*. Ships
   invisibly (no behaviour change) and is the prerequisite for any row-level
   merge. The riskiest local change because it touches the core data model and
   every existing user's stored data.
2. **[0002] Backend foundation** (Railway). Postgres, the site→app server,
   Better Auth (passwordless), Polar subscription + webhooks, and entitlement
   state. Sync is **not** wired into the app yet (flag-gated). Outcome: a user
   can sign in and subscribe; nothing syncs.
3. **[0003] Electric read sync**. Private Electric service + an authenticated
   gatekeeper; entitled users stream *their own* cloud rows into the app
   (read-path only; writes still local). Proves the pipe end-to-end.
4. **[0004] Write path + merge**. The write API + optimistic/offline writes
   (TanStack DB), first-sign-in union-merge, account deletion, and lapse
   handling. Completes the sync loop.

**Why this order.** Identity must exist before anything can merge (1).
Auth + billing must exist before sync can be gated to payers (2). Reads are the
easy half and validate the whole pipe before the harder write path (3). Writes
need identity, auth, gating, and read-sync all in place first (4).

## Invariants every phase must preserve

- **Single public origin** `phived.com`; `/sw.js` stays a real root file with
  `Cache-Control: public, max-age=0, must-revalidate`; the `/app/*` SPA
  fallback is unchanged (ADR 0001–0003, `scripts/site-contract.mjs`).
- **No regression for anonymous / non-paying use** — that path stays exactly
  today's local-only app.
- **Local data is the device's source of truth; billing state never deletes
  it.**
- **Electric is never publicly reachable.**

## Shared conventions

- Bun for everything. The full gate is `bun run check` at the repo root.
- Secrets go in Railway service variables and `apps/app` `.env` files that are
  git-ignored; never commit them. The exact backend code location is fixed in
  [0002].
- Never delete `apps/web/public/sw.js`.
- **Logical replication on Railway is supported** (confirmed: Railway's official
  "Deploy ElectricSQL" template + real deployments) — not a blocker. Enable
  `wal_level=logical` via the Postgres service's Custom Start Command flags
  (`-c wal_level=logical -c max_wal_senders=10 -c max_replication_slots=10`),
  which is robust against the image's boot-time config rewrite. Details in
  [0002]/[0003].
