# 0002 — Backend foundation (Postgres, server, Better Auth, Polar)

## Goal

Stand up the backend that sync will later use, with **no sync wired into the app
yet**. After this plan: Postgres exists on Railway; the public site is served by
a new Bun/Hono server that also mounts Better Auth (passwordless) and Polar
subscription/webhooks under `/api/*`; a user can sign in (magic link + Google)
and subscribe via Polar; entitlement state is persisted in Postgres. The task
app's day-to-day behaviour is unchanged — the auth/subscribe surface is additive
and flag-gated until [0003]/[0004].

> Version-sensitive: the Better Auth and Polar snippets below match docs current
> at planning time. Verify against current docs while implementing; if an API
> differs, pause and adjust (do not guess).

## Decisions (do not deviate)

- **Server: Hono on Bun**, new workspace `apps/server`. It replaces
  `scripts/serve-site.mjs` as the production start command but **keeps
  `scripts/site-contract.mjs` as the single source of truth** for the `/sw.js`
  no-cache header, the security headers, and the `/app/*` SPA fallback (ADR
  0001–0003). The contract must not weaken.
- **Single public origin**, same-origin cookies (`HttpOnly`, `Secure`,
  `SameSite=Lax`). No CORS — app and API share the origin.
- **Auth:** Better Auth with `magicLink()` + Google social provider; Postgres
  adapter via a `pg` Pool.
- **Billing:** `@polar-sh/better-auth` `polar()` plugin with `checkout`,
  `portal`, `webhooks`, `createCustomerOnSignUp: true`. Webhook path
  `/api/auth/polar/webhooks`.
- **Entitlement:** a Postgres `entitlement` row per user, written by Polar
  webhook handlers; `isEntitled = status in ('active','past_due')` (no trial,
  per ADR 0005; `past_due` honoured during dunning).
- **Email:** Resend for magic-link delivery (swappable provider).

## External prerequisites (perform, or document for the operator)

**Railway** — logical replication is **supported and confirmed** (Railway
publishes an official "Deploy ElectricSQL with your own Postgres" template, and
there are confirmed user deployments). It is **not** a blocker; it is a known
config step:
- Provision Postgres, then enable `wal_level=logical`. **Preferred method:** add
  flags to the Postgres service's **Custom Start Command** so the value survives
  the image's boot-time `postgresql.auto.conf` rewrite:
  `-c wal_level=logical -c max_wal_senders=10 -c max_replication_slots=10`, then
  redeploy. **Simpler alternative:** `ALTER SYSTEM SET wal_level='logical';
  SELECT pg_reload_conf();` then restart the deployment — but on some Railway
  Postgres images this reverts to `replica` after restart, so verify with
  `SHOW wal_level;` and fall back to the start-command flags (or fork
  `railwayapp-templates/postgres`) if it does.
- Electric needs a role with the `REPLICATION` attribute (Railway's default
  superuser has it) and a **direct** (non-pooled) connection (Railway's default
  Postgres connection is direct). Capture the direct URL for Electric in [0003].
- Electric also needs a **persistent volume** for shape storage
  (`ELECTRIC_STORAGE_DIR`, e.g. `/var/lib/electric/persistent`) — provisioned
  with the Electric service in [0003].
- Electric and Postgres remain **private** (no public domain). Only the server
  service is public.

**Polar** (use **sandbox** first)
- Organization + a **subscription product** with monthly and annual prices;
  capture product IDs.
- `POLAR_ACCESS_TOKEN`; a webhook endpoint at
  `https://phived.com/api/auth/polar/webhooks`; capture `POLAR_WEBHOOK_SECRET`.

**Google**
- OAuth client; redirect URI `https://phived.com/api/auth/callback/google`
  (+ `http://localhost:<port>/...` for dev). Capture id/secret.

**Resend** (or chosen provider)
- API key + verified sender domain.

## Env vars (server service)

| var | purpose |
|---|---|
| `DATABASE_URL` | app Postgres connection (pooled OK) |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `BETTER_AUTH_URL` | `https://phived.com` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `RESEND_API_KEY` | magic-link email |
| `POLAR_ACCESS_TOKEN` | Polar SDK |
| `POLAR_WEBHOOK_SECRET` | webhook signature verification |
| `POLAR_PRODUCT_ID_MONTHLY` / `_ANNUAL` | checkout products |
| `POLAR_SERVER` | `sandbox` or `production` |
| `PORT`, `BIND_HOST=0.0.0.0` | from ADR 0003 |

Never commit secrets; use Railway service variables and git-ignored `.env`.

## Scope (touch only these)

New:
- `apps/server/**` — the Bun/Hono server (static via `site-contract.mjs`,
  `/api/*`, health), with `src/auth.ts`, `src/db.ts` (pool + migration runner),
  `src/entitlement.ts`, `src/session.ts`.
- DB migrations: Better Auth tables (via its CLI) + `entitlement`.
- `apps/app/src/auth/**` — auth client + minimal flag-gated sign-in/subscription
  UI.

Edited:
- root `package.json` (workspaces += `apps/server`; `start`/`build`/`dev`
  scripts target the new server).
- `railway.json` (`startCommand` → the new server).
- `scripts/site-contract.mjs` only if a shared value must be exported; behaviour
  unchanged.

Do **not**: create `list`/`task` tables, deploy Electric, or wire any sync
(those are [0003]).

## Drift check (run first)

```bash
test -f scripts/serve-site.mjs && echo "serve-site present (expected)"
rg -n "startCommand" railway.json
bun run check
```

If `bun run check` is not green at HEAD, STOP (start from green).

## Steps (in order)

1. **Scaffold `apps/server` (Hono + Bun).** Serve `dist/` using the values in
   `scripts/site-contract.mjs`: `/sw.js` with `Cache-Control: public,
   max-age=0, must-revalidate`, the security headers, the `/app/*` SPA fallback,
   `process.env.PORT`, `BIND_HOST`. Health `GET /` → 200. Port the existing
   `scripts/*.test` coverage (or add equivalents) so the contract stays tested.
   Update root `start` + `railway.json` to launch it. Keep `bun run preview`
   exercising the same server (dev/preview/prod parity, ADR 0003).
2. **DB layer.** `pg` Pool from `DATABASE_URL`; a small SQL migration runner
   (plain `.sql` files are fine). 
3. **Better Auth.** `betterAuth({ database: pool, baseURL: BETTER_AUTH_URL,
   secret, socialProviders: { google }, plugins: [magicLink({ sendMagicLink →
   Resend }), polar({...}) ], advanced: { cookies: SameSite=Lax, secure } })`.
   Generate/apply auth tables with the Better Auth CLI. Mount
   `app.on(["GET","POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))`.
4. **Polar + entitlement.** Configure `polar({ client, createCustomerOnSignUp:
   true, use: [ checkout({ products: [monthly, annual] }), portal(), webhooks({
   secret, onSubscriptionActive, onSubscriptionUpdated, onSubscriptionCanceled,
   onSubscriptionRevoked, onCustomerStateChanged }) ] })`. In the handlers,
   upsert `entitlement(user_id, status, polar_customer_id, polar_subscription_id,
   current_period_end, updated_at)`. Add `getEntitlement(userId)` and
   `isEntitled(status)` in `src/entitlement.ts`.
5. **Client auth surface (flag-gated).** `createAuthClient({ plugins:
   [magicLinkClient(), polarClient()] })`. Minimal UI: sign in (magic link +
   Google), show subscription state, `authClient.checkout({ slug })`, portal
   link, sign out — all behind a flag (e.g. `VITE_SYNC_UI`, default off) so
   production UX is unchanged until later phases.
6. **Session helper.** Hono middleware resolving the Better Auth session into
   `c.var.user` for downstream gating.

`entitlement` DDL:

```sql
create table entitlement (
  user_id text primary key references "user"(id) on delete cascade,
  status text not null default 'none',
  polar_customer_id text,
  polar_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
```

## Verification

```bash
bun run check
```

- Header parity: `curl -I localhost:$PORT/sw.js` →
  `Cache-Control: public, max-age=0, must-revalidate`; security headers present;
  `GET /app/anything` returns the app `index.html`; `GET /` → 200.
- Auth smoke (sandbox): magic-link email arrives and signs you in (cookie set);
  Google round-trips; `authClient.checkout` opens Polar sandbox checkout;
  completing a sandbox subscription writes an `entitlement` row `status=active`;
  canceling flips the status.
- Electric/Postgres are **not** publicly reachable.

## STOP conditions

- After trying the **Custom Start Command flags**, the `ALTER SYSTEM` method,
  AND the fork-image fallback, `SHOW wal_level` still isn't `logical` → STOP and
  report. (Unexpected — logical replication is otherwise confirmed-supported on
  Railway; the start-command flags should always win.)
- The new server can't reproduce the `site-contract.mjs` `/sw.js` +
  security-header + `/app/*` contract → STOP (never weaken the kill-switch).
- Better Auth / Polar APIs differ from these notes → pause, verify docs, adjust.

## Out of scope

`list`/`task` tables, Electric, the gatekeeper proxy, any sync, account deletion
([0003]/[0004]).
