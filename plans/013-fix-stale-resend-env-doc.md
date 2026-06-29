# Plan 013: Correct the stale RESEND_API_KEY documentation in the server env example

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**: The file this plan edits is part of the
> in-progress "backend foundation" work and is currently **uncommitted** on the
> `sync/backend-foundation` branch (it does not exist on `main`), so
> `git diff <SHA>..HEAD` shows nothing. Instead:
>
> 1. Run `ls apps/server/.env.example`. If missing, **STOP** — wrong branch.
> 2. Open `apps/server/.env.example` and confirm the lines below match. On any
>    mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `26c4a98`, 2026-06-29 (server code is uncommitted working-tree on `sync/backend-foundation`)

## Why this matters

`apps/server/.env.example` is the onboarding contract for running the server.
One comment is actively wrong: it promises that magic-link sign-in degrades to
logging the link when `RESEND_API_KEY` is unset ("the link is logged (dev)").
That fallback does not exist — `apps/server/src/auth.ts` constructs
`new Resend(apiEnv.resendApiKey)` unconditionally, and `apps/server/src/env.ts`
treats `RESEND_API_KEY` as **required** whenever the API is enabled (i.e.
whenever `DATABASE_URL` is set). A developer who follows the comment and omits
the key gets a hard startup crash ("Missing required environment variable:
RESEND_API_KEY"), not logged links. A second, smaller gap: `BETTER_AUTH_SECRET`
must be at least 32 characters (also enforced in `env.ts`), but the example
doesn't say so, producing another confusing startup error. This plan makes the
example match real behavior. Documentation-only — no code changes.

## Current state

Relevant files (read both to ground the fix; only the first is edited):

- `apps/server/.env.example` — the file to edit.
- `apps/server/src/env.ts` — the source of truth for what's required (do NOT
  edit). Confirms: `RESEND_API_KEY` is required in API mode, and
  `BETTER_AUTH_SECRET` must be ≥ 32 chars.

Current `.env.example` excerpt (confirm it matches):

```9:19:apps/server/.env.example
# Better Auth.
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://phived.com

# Google OAuth (redirect URI: <BETTER_AUTH_URL>/api/auth/callback/google).
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend (magic-link delivery). Without RESEND_API_KEY the link is logged (dev).
RESEND_API_KEY=
MAGIC_LINK_FROM="phived <login@phived.com>"
```

The behavior these comments must describe (from `apps/server/src/env.ts`):

```39:50:apps/server/src/env.ts
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
```

`RESEND_API_KEY` is read via `valueOrPlaceholder(...)` which calls
`requireValue` in normal (non-schema-generate) mode — i.e. it is mandatory once
`DATABASE_URL` is present.

Repo convention: `.env.example` is excluded from Prettier (`.prettierignore`
ignores `*.env*`), so formatting tooling will not touch it — keep edits clean by
hand. Comments are concise and explain intent.

## Commands you will need

| Purpose                 | Command                                               | Expected on success |
| ----------------------- | ----------------------------------------------------- | ------------------- |
| Confirm wrong text gone | `rg -n "the link is logged" apps/server/.env.example` | no matches          |
| Format check            | `bun run format:check`                                | exit 0              |
| Full gate               | `bun run check`                                       | exit 0              |

Run from the repo root (`/Users/lukeberry/www/phived`).

## Scope

**In scope** (the only file you should modify):

- `apps/server/.env.example`

**Out of scope** (do NOT touch):

- `apps/server/src/auth.ts`, `apps/server/src/env.ts` — do NOT add a
  dev-logging fallback or change validation. This plan only corrects docs to
  match current behavior. (Restoring a dev fallback is a possible future product
  choice — see Maintenance notes — but it is a behavior change and not in scope
  here.)
- Any ADR or `plans/` file.

## Git workflow

- Apply on the working tree that contains `apps/server/` (the
  `sync/backend-foundation` branch).
- Commit message (conventional style): e.g.
  `docs(server): fix RESEND/secret notes in .env.example`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Replace the misleading Resend comment

In `apps/server/.env.example`, replace this exact line:

```
# Resend (magic-link delivery). Without RESEND_API_KEY the link is logged (dev).
```

with:

```
# Resend (magic-link delivery). Required once DATABASE_URL is set; the server
# refuses to start without it (there is no console-logging fallback).
```

### Step 2: Document the BETTER_AUTH_SECRET length requirement

In `apps/server/.env.example`, replace this exact line:

```
# Better Auth.
```

with:

```
# Better Auth. BETTER_AUTH_SECRET must be at least 32 characters (e.g.
# `openssl rand -base64 32`); a shorter value fails startup.
```

### Step 3: Verify

**Verify (all must pass)**:

- `rg -n "the link is logged" apps/server/.env.example` → **no matches**
- `rg -n "at least 32 characters" apps/server/.env.example` → matches Step 2's line
- `bun run format:check` → exit 0 (the file is Prettier-ignored, so this should
  be unaffected; run it to confirm nothing else regressed)

## Test plan

No automated tests — this is a documentation comment change in a Prettier- and
test-excluded file. Verification is the two `rg` checks in Step 3 plus a manual
read-through confirming the comments now describe `env.ts`'s actual requirements
(RESEND mandatory in API mode; secret ≥ 32 chars).

## Done criteria

ALL must hold:

- [ ] The phrase "the link is logged" no longer appears in `apps/server/.env.example`
- [ ] The Resend comment states it is required and there is no logging fallback
- [ ] The `BETTER_AUTH_SECRET` comment states the 32-character minimum
- [ ] `bun run format:check` exits 0
- [ ] `git status` shows only `apps/server/.env.example` modified
- [ ] `plans/README.md` status row for 013 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- `apps/server/.env.example` is missing (wrong branch) or the exact lines to
  replace are not present (the file drifted — find the current equivalents and
  report before editing).
- You discover that `auth.ts`/`env.ts` actually _do_ log the magic link when
  `RESEND_API_KEY` is absent (i.e. the comment was correct and this plan's
  premise is wrong). In that case the docs are fine; report and do not edit.

## Maintenance notes

- Deferred product choice (not this plan): if local auth testing without a
  Resend account is desired, a maintainer could reintroduce a dev-only fallback
  in `auth.ts` (log the URL when `RESEND_API_KEY` is unset and the server is not
  in production). That is a behavior change and would then require updating this
  comment again. Decide deliberately; don't let the docs and code drift apart a
  second time.
- A reviewer should diff this against `apps/server/src/env.ts` to confirm the
  comments still match the validation rules.
