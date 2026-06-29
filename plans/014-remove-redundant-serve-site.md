# Plan 014: Remove the now-redundant `serve-site.mjs` Node entrypoint and its duplicate routing test

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan in
> `plans/README.md`.
>
> **Drift check (run first)**: This touches files that are partly committed
> (`scripts/serve-site.mjs`, `scripts/site-contract.test.mjs`) and partly
> uncommitted on the `sync/backend-foundation` branch
> (`scripts/static-site-handler.mjs`, `apps/server/`). Do this:
>
> 1. Run `ls apps/server/src/index.ts scripts/static-site-handler.mjs`. If
>    either is missing, **STOP** — you are on the wrong branch (this cleanup only
>    makes sense once the Bun/Hono server exists).
> 2. Open the three files in "Current state" and confirm they match the
>    excerpts. On any mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: MED
- **Depends on**: none (routing coverage already exists in `apps/server/src/site.test.ts`)
- **Category**: tech-debt
- **Planned at**: commit `26c4a98`, 2026-06-29 (server code is uncommitted working-tree on `sync/backend-foundation`)

## Why this matters

The backend-foundation work made the Bun/Hono server
(`apps/server/src/index.ts`) the single production/preview/dev entrypoint
(`package.json` `start`/`preview`, `railway.json`), and extracted the shared
routing/header logic into `scripts/static-site-handler.mjs`. As a result
`scripts/serve-site.mjs` — the old Node-`http` static server — is no longer an
entrypoint: nothing runs it. Its **only** remaining consumer is its own test,
`scripts/site-contract.test.mjs`, whose `describe("site server routing")` block
re-asserts the exact same routing/header/HEAD/405/404/400 contract that
`apps/server/src/site.test.ts` already covers against the same shared handler.
So we maintain a dead Node wrapper plus a duplicate test that exercises one code
path twice. Removing both deletes ~85 lines and the `Readable.fromWeb`
Node-version coupling, with zero loss of coverage (the Bun/Hono `site.test.ts`
keeps the routing contract under test). This commits to Bun as the serving
runtime, which is already true everywhere else.

> Note: plan 008 originally intended to _keep_ `serve-site.mjs` as the start
> command, and its drift-check still greps for it. That intent was superseded
> during 008's implementation when the entrypoint moved to the Bun/Hono server.
> This plan finishes that transition. (Updating the 008 plan text and the ADR
> references is finding #5 / a separate docs task — see Maintenance notes — and
> is **out of scope here**.)

## Current state

Relevant files:

- `scripts/serve-site.mjs` — Node-`http` wrapper around the shared handler. To
  be **deleted**. Not referenced by any npm script, `railway.json`, or CI.
- `scripts/site-contract.test.mjs` — has two kinds of tests: (a) **contract-value**
  tests for the `site-contract.mjs` exports (`isAppPath`, `appHref`,
  `serviceWorker`, `securityHeaders`, `requiredOutputs`) — KEEP these; and
  (b) a `describe("site server routing")` block that boots `serve-site.mjs` —
  REMOVE this (it duplicates `apps/server/src/site.test.ts`).
- `scripts/static-site-handler.mjs` — the shared handler. Its header comment
  mentions `serve-site.mjs`; update the comment after the deletion.
- `apps/server/src/site.test.ts` — the test that **keeps** routing coverage
  (the Bun/Hono path). Do NOT modify it; just rely on it.

`serve-site.mjs` header (confirm it's the Node wrapper, not an entrypoint used
by scripts):

```1:12:scripts/serve-site.mjs
#!/usr/bin/env node
// Node-compatible wrapper around the shared assembled-site handler. The routing
// contract itself lives in static-site-handler.mjs so this legacy entrypoint and
// the Bun/Hono server cannot drift.
import http from "node:http";
import process from "node:process";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { host, paths, ports } from "./site-contract.mjs";
import { handleSiteRequest } from "./static-site-handler.mjs";

export function createSiteServer(root = paths.dist) {
```

`site-contract.test.mjs` — the parts that reference `serve-site.mjs` (to be
removed) vs. the value tests (to be kept):

```1:14:scripts/site-contract.test.mjs
import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createSiteServer } from "./serve-site.mjs";
import {
  appHref,
  appBasePath,
  appMountDir,
  isAppPath,
  requiredOutputs,
  securityHeaders,
  serviceWorker,
} from "./site-contract.mjs";
```

```130:159:scripts/site-contract.test.mjs
describe("site server routing", () => {
  test("serves root, app shell fallback, app assets, and service worker headers", async () => {
    const root = await createFixtureRoot();

    await withServer(root, async (origin) => {
      await expect((await fetch(`${origin}/`)).text()).resolves.toBe("web");
      await expect(
        (await fetch(`${origin}${appHref}/deep`)).text()
      ).resolves.toBe("app");
      await expect(
        (await fetch(`${origin}${appHref}/asset.js`)).text()
      ).resolves.toBe("asset");

      const sw = await fetch(`${origin}${serviceWorker.path}`);
      expect(sw.headers.get("cache-control")).toBe(serviceWorker.cacheControl);
      await expect(sw.text()).resolves.toBe("sw");
    });
  });

  test("handles HEAD, unsupported methods, 404s, and malformed paths", async () => {
    const root = await createFixtureRoot();

    await withServer(root, async (origin) => {
      expect((await fetch(`${origin}/`, { method: "HEAD" })).status).toBe(200);
      expect((await fetch(`${origin}/`, { method: "POST" })).status).toBe(405);
      expect((await fetch(`${origin}/missing`)).status).toBe(404);
      expect((await fetch(`${origin}/%E0%A4%A`)).status).toBe(400);
    });
  });
});
```

The equivalent routing coverage that **remains** after this plan (do not edit):

```34:74:apps/server/src/site.test.ts
describe("server site contract", () => {
  test("serves root, app shell fallback, app assets, and the service worker header", async () => {
    const app = createSiteApp(await createFixtureRoot());

    await expect((await app.request("/")).text()).resolves.toBe("web");
    await expect((await app.request("/app/deep")).text()).resolves.toBe("app");
    await expect((await app.request("/app/asset.js")).text()).resolves.toBe(
      "asset"
    );

    const sw = await app.request(serviceWorker.path);
    expect(sw.headers.get("cache-control")).toBe(serviceWorker.cacheControl);
    await expect(sw.text()).resolves.toBe("sw");
  });
  // ...security headers, HEAD/405/404/400 also covered here...
});
```

Repo conventions: `scripts/` is linted (`bun run lint:scripts`, ESLint
`no-unused-vars` + `consistent-type-imports`) and Prettier-formatted. After
trimming the test, any now-unused import will fail lint — Step 2 hands you the
complete final file so nothing is left dangling.

## Commands you will need

| Purpose              | Command                                                 | Expected on success                            |
| -------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| Confirm no consumers | `rg -n "serve-site" package.json railway.json .github/` | **no matches**                                 |
| Confirm scripts refs | `rg -n "serve-site" scripts/`                           | only `serve-site.mjs` itself (before deletion) |
| Test scripts         | `bun test scripts`                                      | all pass (value tests)                         |
| Test server          | `bun --cwd apps/server test`                            | all pass (routing coverage)                    |
| Lint scripts         | `bun run lint:scripts`                                  | exit 0                                         |
| Format check         | `bun run format:check`                                  | exit 0                                         |
| Full gate            | `bun run check`                                         | exit 0                                         |

Run from the repo root (`/Users/lukeberry/www/phived`).

## Scope

**In scope** (the only files you should modify/delete):

- `scripts/serve-site.mjs` — **delete**
- `scripts/site-contract.test.mjs` — remove the `serve-site.mjs` import, the
  fixture/`withServer` helpers, and the `site server routing` describe block
  (Step 2 gives the exact final content)
- `scripts/static-site-handler.mjs` — update the header comment only (Step 3)

**Out of scope** (do NOT touch):

- `apps/server/src/site.test.ts` — it provides the routing coverage that makes
  this deletion safe; leave it.
- `apps/server/**`, `scripts/static-site-handler.mjs` logic (only the comment),
  `scripts/build-site.mjs`, `scripts/site-contract.mjs`.
- `docs/adr/*.md` and `plans/008-backend-foundation.md` — they reference
  `serve-site.mjs` in prose; updating those is a separate docs task (finding #5),
  NOT this plan. Leaving stale references there is acceptable for this change.
- `package.json`, `railway.json` — they already point at the Bun server; confirm
  (Step 1) but do not edit.

## Git workflow

- Apply on the working tree that contains `apps/server/` (the
  `sync/backend-foundation` branch).
- Commit message (conventional style): e.g.
  `refactor(site): drop unused serve-site.mjs and its duplicate routing test`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Prove `serve-site.mjs` has no runtime consumer

Run: `rg -n "serve-site" package.json railway.json .github/`

**Expected**: **no matches**. If any match appears (e.g. a `start`/`preview`
script or Railway start command still names `serve-site.mjs`), **STOP** — the
file is still an entrypoint and must not be deleted.

Then run: `rg -n "createSiteServer|serve-site" scripts/`

**Expected**: matches only in `scripts/serve-site.mjs` (self) and
`scripts/site-contract.test.mjs` (the import + usage you'll remove in Step 2),
and the comment in `scripts/static-site-handler.mjs`. If `createSiteServer` is
imported anywhere else, **STOP**.

### Step 2: Replace `scripts/site-contract.test.mjs` with the routing block removed

Overwrite `scripts/site-contract.test.mjs` with **exactly** this content (this
keeps every contract-value test and removes the `serve-site`-dependent routing
block plus its now-unused imports/helpers):

```js
import { describe, expect, test } from "bun:test";
import {
  appHref,
  appBasePath,
  appMountDir,
  isAppPath,
  requiredOutputs,
  securityHeaders,
  serviceWorker,
} from "./site-contract.mjs";

describe("isAppPath", () => {
  test.each([appBasePath, `${appBasePath}/`, `${appBasePath}/deep`])(
    "returns true for %s",
    (pathname) => {
      expect(isAppPath(pathname)).toBe(true);
    }
  );

  test.each(["/", "/sw.js", "/application"])(
    "returns false for %s",
    (pathname) => {
      expect(isAppPath(pathname)).toBe(false);
    }
  );
});

describe("app route contract", () => {
  test("exports the app href and mount directory from the shared contract", () => {
    expect(appHref).toBe("/app");
    expect(appMountDir).toBe("app");
    expect(requiredOutputs).toContain(`${appMountDir}/index.html`);
  });
});

describe("serviceWorker", () => {
  test("path is /sw.js", () => {
    expect(serviceWorker.path).toBe("/sw.js");
  });

  test("cacheControl is no-cache kill-switch header", () => {
    expect(serviceWorker.cacheControl).toBe(
      "public, max-age=0, must-revalidate"
    );
  });
});

describe("securityHeaders", () => {
  test("includes the baseline hardening headers", () => {
    for (const name of [
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Content-Security-Policy",
    ]) {
      expect(securityHeaders).toHaveProperty(name);
    }
  });

  test("X-Content-Type-Options is nosniff", () => {
    expect(securityHeaders["X-Content-Type-Options"]).toBe("nosniff");
  });

  test("CSP restricts default-src to self and disallows object-src", () => {
    expect(securityHeaders["Content-Security-Policy"]).toContain(
      "default-src 'self'"
    );
    expect(securityHeaders["Content-Security-Policy"]).toContain(
      "object-src 'none'"
    );
  });
});

describe("requiredOutputs", () => {
  test("includes assembled dist contract files", () => {
    for (const output of [
      "index.html",
      `${appMountDir}/index.html`,
      "sw.js",
      "robots.txt",
    ]) {
      expect(requiredOutputs).toContain(output);
    }
  });
});
```

**Verify**: `rg -n "serve-site|createSiteServer|withServer" scripts/site-contract.test.mjs`
→ **no matches**.

### Step 3: Update the header comment in `scripts/static-site-handler.mjs`

Replace this exact comment block at the top of the file:

```js
// Single implementation of the assembled-site routing/header contract. Both
// the Bun/Hono server and the legacy Node-style `serve-site.mjs` wrapper call
// this Web Request/Response handler so /sw.js, security headers, and /app/*
// fallback behavior cannot drift between preview/prod entrypoints.
```

with:

```js
// Single implementation of the assembled-site routing/header contract. The
// Bun/Hono server (via apps/server/src/static-handler.ts) calls this Web
// Request/Response handler so /sw.js, security headers, and the /app/*
// fallback are defined in exactly one place.
```

Do NOT change any code below the comment.

### Step 4: Delete `scripts/serve-site.mjs`

Delete the file `scripts/serve-site.mjs`.

**Verify**: `ls scripts/serve-site.mjs` → "No such file or directory"
(non-zero exit), and `rg -n "serve-site" scripts/` → **no matches**.

### Step 5: Run the gates

**Verify (all must pass)**:

- `bun test scripts` → all contract-value tests pass (no routing block now)
- `bun --cwd apps/server test` → all pass (routing contract still covered by
  `site.test.ts`)
- `bun run lint:scripts` → exit 0 (no unused imports left behind)
- `bun run format:check` → exit 0
- `bun run check` → exit 0 (the full repo gate, including `build:site`)

## Test plan

- No new tests. This plan **removes** a duplicate test and a dead module; the
  routing/header contract remains covered by `apps/server/src/site.test.ts`
  (run via `test:server`, which is part of CI's `bun run check`).
- Confirm coverage didn't regress: `bun --cwd apps/server test` must still show
  the "server site contract" tests passing (root, `/app/*` fallback, app asset,
  `/sw.js` header, security headers, HEAD/405/404/400).
- Confirm the value tests survived: `bun test scripts` must still show
  `isAppPath`, `app route contract`, `serviceWorker`, `securityHeaders`, and
  `requiredOutputs` passing.

## Done criteria

ALL must hold:

- [ ] `scripts/serve-site.mjs` no longer exists
- [ ] `rg -n "serve-site" scripts/` returns no matches
- [ ] `scripts/site-contract.test.mjs` contains only the contract-value
      describes (no `site server routing` block, no `serve-site` import)
- [ ] `scripts/static-site-handler.mjs` header comment no longer mentions
      `serve-site.mjs`
- [ ] `bun test scripts` exits 0
- [ ] `bun --cwd apps/server test` exits 0
- [ ] `bun run lint:scripts` exits 0
- [ ] `bun run check` exits 0
- [ ] `git status` shows: `scripts/serve-site.mjs` deleted, and
      `scripts/site-contract.test.mjs` + `scripts/static-site-handler.mjs`
      modified — nothing else
- [ ] `plans/README.md` status row for 014 updated to DONE

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 finds `serve-site.mjs` referenced by `package.json`, `railway.json`,
  or `.github/` — it is still an entrypoint; do NOT delete it.
- Step 1 finds `createSiteServer` imported by any file other than
  `scripts/site-contract.test.mjs`.
- `apps/server/src/site.test.ts` is missing or its "server site contract" tests
  do not pass **before** you start — without that coverage, deleting the Node
  routing test would reduce coverage; report instead of proceeding.
- After the change, `bun run check` fails for a reason not addressed above.

## Maintenance notes

- Follow-up (deferred, finding #5): `docs/adr/0003-host-combined-site-on-railway.md`
  and a few other ADRs still describe `bun scripts/serve-site.mjs` as the start
  command, and `plans/008-backend-foundation.md` greps for the file. Those prose
  references are now stale; updating them is a separate docs change. They do not
  affect runtime and are intentionally out of this plan's scope.
- After this lands, the assembled-site contract has exactly one implementation
  (`scripts/static-site-handler.mjs`) and one routing test
  (`apps/server/src/site.test.ts`). A reviewer should confirm the deletion
  removed only dead code and that both test suites still pass.
- If a non-Bun (plain Node) static entrypoint is ever needed again, reintroduce
  a thin wrapper over `handleSiteRequest` rather than re-duplicating the routing
  logic.
