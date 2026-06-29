# Plan 012: Decouple the Postgres pool from full API-env validation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**: The code this plan changes is part of the
> in-progress "backend foundation" work and is currently **uncommitted** on the
> `sync/backend-foundation` branch (it does not exist on `main`), so
> `git diff <SHA>..HEAD` shows nothing. Instead:
>
> 1. Run `ls apps/server/src/db.ts`. If it's missing, **STOP** — wrong branch.
> 2. Open `apps/server/src/db.ts` and confirm it matches the "Current state"
>    excerpt below. On any mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (recommended after 011 so the env boundary has test coverage)
- **Category**: tech-debt
- **Planned at**: commit `26c4a98`, 2026-06-29 (server code is uncommitted working-tree on `sync/backend-foundation`)

## Why this matters

`getPool()` opens the shared Postgres connection. It only needs one value:
`DATABASE_URL`. But it currently builds the connection string from
`getApiEnv().databaseUrl`, and `getApiEnv()` validates the **entire** API
environment (Better Auth secret + Google + Resend + every Polar variable),
throwing if any is missing. Today this is harmless because the only caller path
validates the full env at startup first — but it's a latent footgun: any future
DB-only entrypoint (a migration runner, a health probe, a one-off script) that
sets just `DATABASE_URL` would crash on missing Polar config it never uses. It
also re-runs full validation every time the pool is lazily created. The module
already computes a validated `databaseUrl` at the top of the file; `getPool()`
should use that and drop its dependency on `env.ts` entirely. This is a small,
behavior-preserving decoupling.

## Current state

Relevant file:

- `apps/server/src/db.ts` — owns the shared `pg` Pool and the migration runner.
  It imports `getApiEnv` from `./env` solely to read `databaseUrl` inside
  `getPool()`.

Current code (confirm it matches before editing):

```7:38:apps/server/src/db.ts
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { getApiEnv } from "./env";

export const databaseUrl: string = process.env.DATABASE_URL?.trim() ?? "";
export const isDatabaseConfigured: boolean = databaseUrl.length > 0;

const MIGRATION_LOCK_ID = 724_830_008;

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations"
);

let pool: Pool | null = null;

/** Lazily create the shared connection pool. */
export function getPool(): Pool {
  if (!isDatabaseConfigured) {
    throw new Error(
      "DATABASE_URL is required before opening the Postgres pool"
    );
  }

  if (!pool) {
    pool = new Pool({ connectionString: getApiEnv().databaseUrl });
  }
  return pool;
}
```

Why this is safe to change:

- `databaseUrl` (line 13) is the trimmed `DATABASE_URL`; `getPool()` already
  guards with `isDatabaseConfigured` (line 28), so when it reaches the `new Pool`
  call, `databaseUrl` is guaranteed non-empty. It is the same value
  `getApiEnv().databaseUrl` returns (`getApiEnv` derives it via
  `requireValue("DATABASE_URL")`).
- Startup validation of the full API env is **not** removed by this change: in
  API mode, `index.ts` calls `getServerMode()` (which calls `getApiEnv()`), and
  `auth.ts` calls `getApiEnv()` at module load — both run before any
  `getPool()` use. This plan only removes the _redundant, over-coupled_
  re-validation inside `getPool()`.

Confirm `getApiEnv` is used **only** on the `new Pool` line within `db.ts`
(it is, as of this writing) — Step 1 has you verify this.

Repo conventions: ESLint enforces `consistent-type-imports` and
`no-unused-vars`; an unused import will fail `lint:server`. Prettier formatting
is enforced repo-wide.

## Commands you will need

| Purpose          | Command                                   | Expected on success |
| ---------------- | ----------------------------------------- | ------------------- |
| Find usages      | `rg -n "getApiEnv" apps/server/src/db.ts` | see Step 1          |
| Typecheck server | `bun run typecheck:server`                | exit 0, no errors   |
| Test server      | `bun --cwd apps/server test`              | all pass            |
| Lint server      | `bun run lint:server`                     | exit 0              |
| Format check     | `bun run format:check`                    | exit 0              |
| Full gate        | `bun run check`                           | exit 0              |

Run from the repo root (`/Users/lukeberry/www/phived`).

## Scope

**In scope** (the only file you should modify):

- `apps/server/src/db.ts`

**Out of scope** (do NOT touch):

- `apps/server/src/env.ts` — leave `getApiEnv()` and `getServerMode()` exactly
  as they are. In particular, do **not** try to "fix" the fact that
  `getServerMode()` returns an `apiEnv` that `index.ts` ignores — that is a
  separate, deferred cleanup (see Maintenance notes), and changing the
  `ServerMode` shape risks `index.ts`.
- `apps/server/src/auth.ts`, `apps/server/src/index.ts`, `entitlement.ts` —
  their startup-time `getApiEnv()` calls are intentional and stay.
- Database migration logic in `db.ts` (the `runMigrations` function) — untouched.

## Git workflow

- Apply on the working tree that contains `apps/server/` (the
  `sync/backend-foundation` branch); the server does not exist on `main`.
- Commit message (conventional style): e.g.
  `refactor(server): build the pg pool from DATABASE_URL, not full api env`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm `getApiEnv` is used only by `getPool()` in `db.ts`

Run: `rg -n "getApiEnv" apps/server/src/db.ts`

**Expected**: exactly two lines — the `import { getApiEnv } from "./env";` line
and the `new Pool({ connectionString: getApiEnv().databaseUrl })` line. If
`getApiEnv` appears anywhere else in `db.ts`, **STOP** and report — the code has
drifted and removing the import would break something.

### Step 2: Use the local `databaseUrl` in `getPool()`

In `apps/server/src/db.ts`, change the pool construction line from:

```ts
pool = new Pool({ connectionString: getApiEnv().databaseUrl });
```

to:

```ts
pool = new Pool({ connectionString: databaseUrl });
```

### Step 3: Remove the now-unused `env` import

Delete this line from the top of `apps/server/src/db.ts`:

```ts
import { getApiEnv } from "./env";
```

**Verify**:

- `rg -n "getApiEnv|from \"./env\"" apps/server/src/db.ts` → **no matches**
  (returns nothing / non-zero exit).
- `bun run lint:server` → exit 0 (would fail if the import were left unused).

### Step 4: Run the gates

**Verify (all must pass)**:

- `bun run typecheck:server` → exit 0
- `bun --cwd apps/server test` → all pass (no test changes expected)
- `bun run lint:server` → exit 0
- `bun run format:check` → exit 0

## Test plan

No new tests are required: this is a behavior-preserving internal refactor and
the value used (`databaseUrl`) is provably identical to the prior
`getApiEnv().databaseUrl` whenever `getPool()` proceeds past its guard. The
existing `apps/server/src/site.test.ts` and (if plan 011 has landed) the env
tests must continue to pass unchanged. If plan 011 is not yet done, that's fine
— this refactor does not depend on it.

Optional sanity check (only if a local Postgres is already running and
`DATABASE_URL` is set — do NOT stand one up just for this): `bun --cwd apps/server start`
should still boot, apply migrations, and log `phived server: http://...`.

## Done criteria

ALL must hold:

- [ ] `apps/server/src/db.ts` no longer imports or calls `getApiEnv`
      (`rg -n "getApiEnv" apps/server/src/db.ts` returns nothing)
- [ ] `getPool()` constructs the pool with `connectionString: databaseUrl`
- [ ] `bun run typecheck:server` exits 0
- [ ] `bun run lint:server` exits 0
- [ ] `bun --cwd apps/server test` exits 0
- [ ] `bun run format:check` exits 0
- [ ] `git status` shows only `apps/server/src/db.ts` modified
- [ ] `plans/README.md` status row for 012 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- `apps/server/src/db.ts` is missing (wrong branch) or doesn't match the
  "Current state" excerpt.
- Step 1 finds `getApiEnv` used elsewhere in `db.ts`.
- After the change, `lint:server` or `typecheck:server` fails for a reason you
  cannot resolve by re-reading this plan (e.g. another module imports something
  from `db.ts` you weren't told about).

## Maintenance notes

- Deferred, intentionally out of this plan: `getServerMode()` in `env.ts`
  returns `{ mode: "api"; apiEnv }`, but `index.ts` discards `apiEnv` and lets
  `auth.ts` re-derive it. Collapsing that (either inject the computed `apiEnv`
  or memoize `getApiEnv()`) is a reasonable follow-up but touches `index.ts`
  startup wiring and is riskier; keep it separate.
- After this change, the DB layer has no compile-time dependency on the auth/
  billing env. If a future DB-only script is added, it can call `getPool()` with
  only `DATABASE_URL` set — which is the whole point. A reviewer should confirm
  the diff is exactly the two-line change (import removed, one line edited).
