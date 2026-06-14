# Plan 004: Harden security headers, dependency audit, and local server binding

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report.
>
> **Drift check (run first)**: `git diff --stat 6371e75..HEAD -- package.json bun.lock vercel.json scripts apps/app/index.html apps/web/src/layouts/Base.astro`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/003-add-ci-and-site-contract-tests.md
- **Category**: security, migration
- **Planned at**: commit `6371e75`, 2026-06-14

## Why this matters

`bun audit --audit-level high` reports a high-severity `esbuild` advisory
through the frontend build toolchain. The site also stores task data in
`localStorage` on a shared origin, but production currently only configures a
cache header for `/sw.js`; there are no baseline browser security headers.
Finally, the local dev/preview front server should bind to localhost explicitly,
matching the child dev servers.

## Current state

- `vercel.json` only sets a header for `/sw.js`.
- `apps/app/index.html` and `apps/web/src/layouts/Base.astro` both load Google
  Analytics.
- `scripts/dev-site.mjs` and `scripts/preview-site.mjs` call `server.listen`
  with a port only.
- `bun audit --audit-level high` reports an `esbuild` advisory.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Audit | `bun audit --audit-level high` | no high vulnerabilities, or documented upstream blocker |
| Lint | `bun run lint` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0 |
| Check | `bun run check` | exit 0 |
| Preview smoke | `bun run build:site` then `bun scripts/preview-site.mjs` | `/sw.js` has no-cache header |

## Scope

**In scope**:
- `package.json`
- `bun.lock`
- `vercel.json`
- `scripts/site-contract.mjs`
- `scripts/dev-site.mjs`
- `scripts/preview-site.mjs`
- `apps/app/index.html`
- `apps/web/src/layouts/Base.astro`

**Out of scope**:
- Replacing analytics product/vendor choice beyond `/app` removal.
- App runtime state/persistence changes.
- macOS code.

## Steps

### Step 1: Remediate or document the `esbuild` advisory

Run `bun audit --audit-level high`. Try the smallest safe dependency update
that resolves it, starting with compatible updates for Vite/Astro-related
packages:

- `bun update vite astro @vitejs/plugin-react @tailwindcss/vite`

Then rerun `bun run check` and `bun audit --audit-level high`.

If the advisory cannot be resolved because the latest compatible Astro/Vite
still depend on vulnerable `esbuild`, STOP and report the exact package chain
and latest versions observed. Do not force an override to an incompatible major
without proving `bun run check` still passes.

**Verify**: `bun audit --audit-level high` → no high vulnerabilities, or STOP.

### Step 2: Remove third-party analytics from `/app`

Remove the Google Analytics script tags from `apps/app/index.html`. Keep
analytics on the public web app only (`apps/web/src/layouts/Base.astro`).

**Verify**: `bun run build:site` and confirm `dist/app/index.html` has no
`G-NC0FFZ2WB2`, while `dist/index.html` still has it.

### Step 3: Add production security headers

In `vercel.json`, add a global header rule for `/(.*)` with:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Add a conservative CSP if it passes `bun run build:site` and does not block the
required inline theme boot, Google Fonts, and web-only analytics. If a strict
CSP needs hashes/nonces that are larger than this plan, STOP and report a
separate CSP plan instead of adding a misleading weak policy.

Preserve the existing `/sw.js` cache header.

**Verify**: `bun run check` → exits 0.

### Step 4: Bind local servers explicitly to localhost

Add `host: "127.0.0.1"` (or import one from `site-contract.mjs`) and call:

- `server.listen(ports.proxy, host, ...)` in `scripts/dev-site.mjs`
- `server.listen(ports.proxy, host, ...)` in `scripts/preview-site.mjs`

If LAN access is needed, make it opt-in with an env var, not the default.

**Verify**: start each server and confirm it logs `http://localhost:3000`; route
smokes for `/`, `/app`, and `/sw.js` still pass.

## Done criteria

- [ ] `bun run check` exits 0.
- [ ] `bun audit --audit-level high` exits 0, or the plan is STOPPED with an
      upstream-blocker report.
- [ ] `/app` built HTML no longer loads Google Analytics.
- [ ] `vercel.json` contains baseline global security headers and preserves the
      `/sw.js` no-cache header.
- [ ] dev and preview servers bind to localhost explicitly.

## STOP conditions

Stop and report if:

- Dependency remediation requires an unsafe override or major migration.
- CSP cannot be made correct without a larger nonce/hash design.
- Removing `/app` analytics is rejected by the operator.

## Maintenance notes

If analytics returns to `/app`, revisit CSP and privacy risk together; do not
silently add third-party scripts to the task surface.
