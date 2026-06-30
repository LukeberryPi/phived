# Plan 011: Add unit tests for the server env boundary and entitlement predicate

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**: The code this plan covers is part of the
> in-progress "backend foundation" work and is currently **uncommitted** on the
> `sync/backend-foundation` branch (it does not exist on `main`). A normal
> `git diff <SHA>..HEAD` will therefore show nothing. Instead:
>
> 1. Confirm you are on the branch that contains the server: run
>    `ls apps/server/src/env.ts apps/server/src/entitlement.ts`. If either file
>    is missing, **STOP** — you are on the wrong branch/working tree.
> 2. Open `apps/server/src/env.ts` and `apps/server/src/entitlement.ts` and
>    confirm they match the "Current state" excerpts below. On any mismatch,
>    treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `26c4a98`, 2026-06-29 (server code is uncommitted working-tree on `sync/backend-foundation`)

## Why this matters

`apps/server/src/env.ts` is the server's startup safety gate: it decides
static-only vs. API mode and refuses to boot the API surface with missing or
too-short secrets (instead of silently substituting empty strings, which was a
prior footgun). `apps/server/src/entitlement.ts` defines `isEntitled`, the
single predicate that decides whether a user may sync. Both are pure, easily
testable functions with zero current coverage — the only server test
(`site.test.ts`) exercises static file serving. A regression that re-introduces
empty-string fallbacks, breaks the `production`/`sandbox` selection, or flips
the entitlement window would pass CI today. This plan locks in that behavior
with fast unit tests.

## Current state

Relevant files:

- `apps/server/src/env.ts` — environment boundary. Exports `getServerMode()`,
  `getApiEnv()`, types `ApiEnv` / `ServerMode` / `PolarServer`. Pure (no
  side effects at import; functions read `process.env` when called).
- `apps/server/src/entitlement.ts` — exports `isEntitled(status)` (pure),
  plus DB-backed `upsertEntitlement` / `getEntitlement` (NOT tested here — they
  need Postgres). Importing this module does **not** open a DB connection;
  `getPool()` is only called inside the DB-backed functions, which these tests
  never call.
- `apps/server/src/site.test.ts` — the existing test, the structural pattern to
  follow (Bun's test runner, colocated `*.test.ts`).

Key excerpts (confirm these match before writing tests):

```24:53:apps/server/src/env.ts
const AUTH_GENERATE_PLACEHOLDER = "placeholder-for-better-auth-schema";
const MIN_SECRET_LENGTH = 32;

export function getServerMode(): ServerMode {
  if (!read("DATABASE_URL")) {
    return { mode: "static-only" };
  }

  return { mode: "api", apiEnv: getApiEnv() };
}

export function getApiEnv(): ApiEnv {
  const allowPlaceholders = process.env.BETTER_AUTH_SCHEMA_GENERATE === "true";
  const databaseUrl = requireValue("DATABASE_URL");
  const betterAuthSecret = allowPlaceholders
    ? (read("BETTER_AUTH_SECRET") ?? AUTH_GENERATE_PLACEHOLDER)
    : requireValue("BETTER_AUTH_SECRET");

  if (!allowPlaceholders && betterAuthSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `BETTER_AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters`
    );
  }

  const polarServer =
    read("POLAR_SERVER") === "production" ? "production" : "sandbox";
```

```94:106:apps/server/src/env.ts
function requireValue(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function read(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}
```

```23:26:apps/server/src/entitlement.ts
/** A user may sync while their subscription is active or in the dunning window. */
export function isEntitled(status: string | null | undefined): boolean {
  return status === "active" || status === "past_due";
}
```

Repo conventions to match (see `apps/server/src/site.test.ts`):

- Test runner is Bun's built-in: `import { describe, expect, test } from "bun:test"`.
- Tests are colocated next to the module as `<name>.test.ts`.
- Comments explain intent, not mechanics; keep them short. Use `import type`
  for type-only imports (ESLint `consistent-type-imports` is enforced).
- The server lints with the root config: `no-unused-vars` (ignore `^_`),
  `eqeqeq: always`. Prettier formatting is enforced repo-wide.

## Commands you will need

| Purpose          | Command                      | Expected on success         |
| ---------------- | ---------------------------- | --------------------------- |
| Typecheck server | `bun run typecheck:server`   | exit 0, no errors           |
| Test server      | `bun --cwd apps/server test` | all pass (3 existing + new) |
| Lint server      | `bun run lint:server`        | exit 0                      |
| Format check     | `bun run format:check`       | exit 0                      |
| Full gate        | `bun run check`              | exit 0                      |

Run all commands from the repo root (`/Users/lukeberry/www/phived`).

## Scope

**In scope** (the only files you should create/modify):

- `apps/server/src/env.test.ts` (create)
- `apps/server/src/entitlement.test.ts` (create)

**Out of scope** (do NOT touch):

- `apps/server/src/env.ts`, `apps/server/src/entitlement.ts` — this plan only
  adds tests; it must not change behavior. If a test reveals a real bug, record
  it and STOP rather than editing source.
- The DB-backed functions `upsertEntitlement` / `getEntitlement` — they require
  Postgres; do not attempt to test them here.
- Any other file.

## Git workflow

- These changes belong on the same working tree that contains
  `apps/server/` (the `sync/backend-foundation` branch). Do **not** branch off
  `main` — the server does not exist there.
- Commit message style is conventional (see `git log --oneline`): e.g.
  `test(server): cover env boundary and entitlement predicate`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `apps/server/src/entitlement.test.ts`

This is the simpler module — start here. Create the file with exactly this
content:

```ts
import { describe, expect, test } from "bun:test";
import { isEntitled } from "./entitlement";

describe("isEntitled", () => {
  test("entitled while active or in the dunning window", () => {
    expect(isEntitled("active")).toBe(true);
    expect(isEntitled("past_due")).toBe(true);
  });

  test("not entitled for any other status", () => {
    for (const status of ["canceled", "revoked", "incomplete", "none", ""]) {
      expect(isEntitled(status)).toBe(false);
    }
  });

  test("not entitled when status is missing", () => {
    expect(isEntitled(null)).toBe(false);
    expect(isEntitled(undefined)).toBe(false);
  });
});
```

**Verify**: `bun --cwd apps/server test` → all pass; output mentions
`entitlement.test.ts` with 3 new passing tests.

### Step 2: Create `apps/server/src/env.test.ts`

`getApiEnv()` and `getServerMode()` read `process.env` at call time. Each test
must start from a clean slate and restore the environment afterward. Create the
file with exactly this content:

```ts
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getApiEnv, getServerMode } from "./env";

// Every key getApiEnv()/getServerMode() reads. Cleared before each test so
// tests never leak into one another or pick up the developer's real shell env.
const KEYS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "MAGIC_LINK_FROM",
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_PRODUCT_ID_MONTHLY",
  "POLAR_PRODUCT_ID_ANNUAL",
  "POLAR_SERVER",
  "BETTER_AUTH_SCHEMA_GENERATE",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const key of KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved[key];
    }
  }
});

// A complete, valid API environment (dummy values — NOT real secrets). The
// secret is intentionally >= 32 chars to pass the length gate.
function setFullApiEnv(): void {
  process.env.DATABASE_URL = "postgres://localhost:5432/test";
  process.env.BETTER_AUTH_SECRET = "test-secret-please-ignore-0123456789";
  process.env.BETTER_AUTH_URL = "https://example.test";
  process.env.GOOGLE_CLIENT_ID = "google-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-secret";
  process.env.RESEND_API_KEY = "resend-key";
  process.env.POLAR_ACCESS_TOKEN = "polar-token";
  process.env.POLAR_WEBHOOK_SECRET = "polar-webhook";
  process.env.POLAR_PRODUCT_ID_MONTHLY = "prod-monthly";
  process.env.POLAR_PRODUCT_ID_ANNUAL = "prod-annual";
}

describe("getServerMode", () => {
  test("static-only when DATABASE_URL is absent", () => {
    expect(getServerMode()).toEqual({ mode: "static-only" });
  });

  test("api mode with a full environment", () => {
    setFullApiEnv();
    const mode = getServerMode();
    expect(mode.mode).toBe("api");
  });
});

describe("getApiEnv", () => {
  test("throws when DATABASE_URL is missing", () => {
    expect(() => getApiEnv()).toThrow(
      "Missing required environment variable: DATABASE_URL"
    );
  });

  test("throws when a required secret is missing", () => {
    process.env.DATABASE_URL = "postgres://localhost:5432/test";
    expect(() => getApiEnv()).toThrow(
      "Missing required environment variable: BETTER_AUTH_SECRET"
    );
  });

  test("throws when BETTER_AUTH_SECRET is too short", () => {
    setFullApiEnv();
    process.env.BETTER_AUTH_SECRET = "too-short";
    expect(() => getApiEnv()).toThrow("at least 32 characters");
  });

  test("returns a fully-populated config when everything is set", () => {
    setFullApiEnv();
    const env = getApiEnv();
    expect(env.databaseUrl).toBe("postgres://localhost:5432/test");
    expect(env.polarServer).toBe("sandbox");
    expect(env.magicLinkFrom).toBe("phived <login@phived.com>"); // default
  });

  test("selects the production Polar server only when explicitly set", () => {
    setFullApiEnv();
    process.env.POLAR_SERVER = "production";
    expect(getApiEnv().polarServer).toBe("production");
  });

  test("schema-generate mode allows placeholders for non-DB values", () => {
    process.env.DATABASE_URL = "postgres://localhost:5432/test";
    process.env.BETTER_AUTH_SCHEMA_GENERATE = "true";
    // No other vars set: must NOT throw, and fills placeholders.
    const env = getApiEnv();
    expect(env.databaseUrl).toBe("postgres://localhost:5432/test");
    expect(env.googleClientId).toBe("placeholder-for-better-auth-schema");
  });
});
```

**Verify**: `bun --cwd apps/server test` → all pass; output mentions
`env.test.ts` with 8 new passing tests and no failures.

### Step 3: Run the full server gate

**Verify (all must pass)**:

- `bun run typecheck:server` → exit 0
- `bun run lint:server` → exit 0
- `bun run format:check` → exit 0 (if it reports formatting diffs in your two
  new files, run `bunx prettier --write apps/server/src/env.test.ts apps/server/src/entitlement.test.ts` and re-run)
- `bun --cwd apps/server test` → 3 existing + 11 new tests pass

## Test plan

- New file `apps/server/src/entitlement.test.ts`: `isEntitled` happy path
  (`active`, `past_due` → true), negative statuses → false, and missing
  (`null`/`undefined`) → false.
- New file `apps/server/src/env.test.ts`: `getServerMode` static-only vs. api;
  `getApiEnv` throwing on missing `DATABASE_URL`, missing secret, and
  short secret; full-config success; `POLAR_SERVER` production selection; and
  schema-generate placeholder mode.
- Structural pattern: model after `apps/server/src/site.test.ts` (Bun runner,
  colocated, `describe`/`test`).
- Verification: `bun --cwd apps/server test` → all pass, including 11 new tests.

## Done criteria

ALL must hold:

- [ ] `apps/server/src/env.test.ts` and `apps/server/src/entitlement.test.ts` exist
- [ ] `bun --cwd apps/server test` exits 0 with the 11 new tests passing
- [ ] `bun run typecheck:server` exits 0
- [ ] `bun run lint:server` exits 0
- [ ] `bun run format:check` exits 0
- [ ] `git status` shows only the two new test files added (no source files changed)
- [ ] `plans/README.md` status row for 011 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- `apps/server/src/env.ts` or `apps/server/src/entitlement.ts` is missing (wrong
  branch) or doesn't match the "Current state" excerpts (the code drifted).
- A test you wrote per this plan **fails** against the real source — that means
  the source behaves differently than documented here. Report the discrepancy;
  do NOT edit the source to make the test pass (that would be a behavior change
  outside this plan's scope).
- Importing `entitlement.ts` in a test triggers a database connection error —
  that would mean `getPool()` is being called at import time, which it should
  not be. Report it.

## Maintenance notes

- When new required env vars are added to `getApiEnv()`, add them to the `KEYS`
  list and `setFullApiEnv()` in `env.test.ts`, or the "full environment" tests
  will start failing.
- `isEntitled`'s set of "entitled" statuses is the ADR 0005 dunning policy
  (`active` + `past_due`). If that policy changes, update both the predicate and
  its test together.
- A reviewer should confirm no source file under `apps/server/src` (other than
  the two new tests) appears in the diff.
