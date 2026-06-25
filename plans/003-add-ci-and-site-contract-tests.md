# Plan 003: Add CI and executable site contract tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> anything in the "STOP conditions" section occurs, stop and report; do not
> improvise.
>
> **Drift check (run first)**: `git diff --stat 6371e75..HEAD -- package.json scripts vercel.json apps/web/public/sw.js .github`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests, dx
- **Planned at**: commit `6371e75`, 2026-06-14

## Why this matters

The repo now has a critical routing contract: `/` is Astro, `/app` is Vite, and
`/sw.js` must remain a root no-cache kill-switch. `bun run check` verifies build
success, but there is no CI and no unit/smoke coverage for the contract helpers
or kill-switch semantics. This plan makes the contract executable and enforced
on PRs.

## Current state

- `scripts/site-contract.mjs` centralizes route constants:

```1:42:scripts/site-contract.mjs
export const appBasePath = "/app";
export const serviceWorker = {
  path: "/sw.js",
  cacheControl: "public, max-age=0, must-revalidate",
};
export const requiredOutputs = ["index.html", "app/index.html", "sw.js", "robots.txt"];
export function isAppPath(pathname = "") {
  return pathname === appBasePath || pathname.startsWith(`${appBasePath}/`);
}
```

- `scripts/build-site.mjs` asserts required files and `/app/assets/`, but not
  kill-switch content.
- There is no `.github/workflows/` CI workflow.

## Commands you will need

| Purpose | Command                | Expected on success              |
| ------- | ---------------------- | -------------------------------- |
| Lint    | `bun run lint`         | exit 0                           |
| Tests   | `bun run test:scripts` | exit 0; site contract tests pass |
| Check   | `bun run check`        | exit 0                           |
| Build   | `bun run build:site`   | exit 0; assembled dist exists    |

## Scope

**In scope**:

- `.github/workflows/check.yml` (create)
- `package.json`
- `scripts/site-contract.test.mjs` (create)
- `scripts/build-site.mjs`

**Out of scope**:

- App UI code under `apps/app/src`
- Astro page copy under `apps/web/src`
- macOS build/test changes

## Steps

### Step 1: Add script tests for the site contract

Create `scripts/site-contract.test.mjs` using Bun's test API. Cover:

- `isAppPath("/app")`, `isAppPath("/app/")`, and `isAppPath("/app/deep")`
  are `true`.
- `isAppPath("/")`, `isAppPath("/sw.js")`, and `isAppPath("/application")`
  are `false`.
- `serviceWorker.path === "/sw.js"`.
- `serviceWorker.cacheControl === "public, max-age=0, must-revalidate"`.
- `requiredOutputs` includes `index.html`, `app/index.html`, `sw.js`, and
  `robots.txt`.

Add root scripts:

- `"test:scripts": "bun test scripts"`
- include `bun run test:scripts` in root `"check"` before `build:site`.

**Verify**: `bun run test:scripts` → all tests pass.

### Step 2: Assert kill-switch content in the build assembler

Extend `scripts/build-site.mjs` after required output checks to read
`dist/sw.js` and fail if it is empty, contains `<html`, or does not contain all
of:

- `skipWaiting`
- `caches.keys`
- `registration.unregister`

Keep the assertion small and direct. Reuse the existing `fail()` helper.

**Verify**: `bun run build:site` → exits 0.

### Step 3: Add GitHub Actions CI

Create `.github/workflows/check.yml`:

- Trigger on `pull_request` and pushes to `main`.
- Use `ubuntu-latest`.
- Install Bun via `oven-sh/setup-bun`.
- Run `bun install --frozen-lockfile`.
- Run `bun run check`.

Do not include macOS/XCTest in this workflow; that belongs to a separate,
slower platform-specific gate.

**Verify**: `bun run check` → exits 0 locally.

## Test plan

- New `scripts/site-contract.test.mjs` covers the route contract and SW header
  constants.
- `scripts/build-site.mjs` now catches HTML/empty/semantically wrong `sw.js`.

## Done criteria

- [ ] `bun run test:scripts` exits 0.
- [ ] `bun run check` exits 0.
- [ ] `.github/workflows/check.yml` exists and runs `bun run check`.
- [ ] `scripts/build-site.mjs` rejects invalid `dist/sw.js` content.

## STOP conditions

Stop and report if:

- Bun cannot run `*.test.mjs` files in `scripts/`.
- CI setup requires secrets or repository settings not present in code.
- Fixing tests requires touching app UI or macOS code.

## Maintenance notes

If `appBasePath` or the service worker contract changes, update
`scripts/site-contract.mjs` first, then adjust tests and ADRs together.
