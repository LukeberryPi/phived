# Plan 006: Align cross-surface theme, docs, agent guidance, and TypeScript

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm expected results before moving on. Stop on
> any STOP condition.
>
> **Drift check (run first)**: `git diff --stat 6371e75..HEAD -- apps/app apps/web apps/macos-app docs README.md CONTEXT.md .cursor/agents package.json bun.lock`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/003-add-ci-and-site-contract-tests.md
- **Category**: docs, migration, tech-debt
- **Planned at**: commit `6371e75`, 2026-06-14

## Why this matters

The split introduced two web-facing documents on one origin. The app supports a
three-state theme preference (`system`, `dark`, `light`), while the Astro web
toggle writes only `dark`/`light`. Public copy still says "up to five tasks"
despite the multi-list canvas, GitHub links disagree, TypeScript versions differ
by workspace, and the project agent brief still describes the old app. This
plan aligns the user-facing and contributor-facing surfaces.

## Current state

- `apps/app/src/contexts/ThemeContext/ThemeContextProvider.tsx` cycles
  `system -> dark -> light`.
- `apps/web/src/pages/index.astro` writes only `"dark"` or `"light"`.
- `apps/web/src/pages/index.astro` says "drop up to five tasks" and shows
  `3 / 5`.
- `apps/web/src/pages/index.astro` links `https://github.com/yieldray/phived`,
  while app/macOS help links `https://www.github.com/lukeberrypi/phived`.
- `apps/app/package.json` uses TypeScript 5.x; `apps/web/package.json` uses
  TypeScript 6.x.
- `.cursor/agents/phived-ui.md` still says "5 tasks max", `npm run`, and old
  paths.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `bun install` | exit 0 |
| Typecheck | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| Check | `bun run check` | exit 0 |

## Scope

**In scope**:
- `apps/web/src/pages/index.astro`
- `apps/web/src/layouts/Base.astro`
- `apps/app/index.html`
- `apps/app/src/contexts/ThemeContext/ThemeContextProvider.tsx`
- `apps/app/src/utils/handleSetTheme.ts`
- `apps/app/src/utils/isThemeSetToDark.ts`
- `apps/app/src/components/HelpDrawer.tsx`
- `apps/macos-app/Sources/Phived/Drawers.swift`
- `.cursor/agents/phived-ui.md`
- `README.md`, `CONTEXT.md`, docs under `docs/`
- `package.json`, `apps/app/package.json`, `apps/web/package.json`, `bun.lock`

**Out of scope**:
- Redesigning the landing page layout.
- Adding a macOS download pipeline.
- Replacing the theme UI beyond aligning semantics.

## Steps

### Step 1: Align theme semantics

Make the web theme toggle use the same three-state cycle as the app:

- `system`
- `dark`
- `light`

Both no-flash boot scripts must interpret stored `"system"` as "follow OS",
and invalid/missing values as `"system"`. If a shared helper package is too
large for this plan, keep the inline scripts but make the semantics identical
and document that they intentionally mirror each other.

**Verify**: `bun run typecheck` and inspect web/app boot scripts for matching
stored value rules.

### Step 2: Align public product copy and GitHub links

Update landing copy/demo to describe the multi-list canvas and "next few
steps", not a hard five-task cap. Remove `3 / 5` from the demo or replace it
with list-oriented status copy.

Choose one canonical GitHub URL. Use it in:

- `apps/web/src/pages/index.astro`
- `apps/app/src/components/HelpDrawer.tsx`
- `apps/macos-app/Sources/Phived/Drawers.swift`

Prefer the URL that actually resolves for the repository.

**Verify**: grep for the old URL and five-task phrases; no stale matches.

### Step 3: Align TypeScript versions

Choose one TypeScript version for app and web. Prefer the highest version that
passes both:

- `bun run typecheck:app`
- `bun run typecheck:web`

Update package manifests and lockfile via `bun install`.

**Verify**: `bun run typecheck` exits 0.

### Step 4: Refresh docs and agent guidance

Update `.cursor/agents/phived-ui.md` to describe:

- `apps/app` for React task app code.
- `apps/web` for Astro web root.
- Bun commands, not npm.
- Multi-list canvas, not "5 tasks max".
- The service-worker/routing contract pointer to ADRs.

Update docs where stale:

- `docs/adr/0001-service-worker-kill-switch.md` current paths.
- `apps/web/public/sw.js` comment (root static kill-switch, no obsolete root
  SPA rewrite wording).
- `plans/README.md` old evidence paths or mark old findings historical.
- README links to `CONTEXT.md` and ADRs if helpful.

**Verify**: grep for `5 tasks max`, `up to five`, `3 / 5`, `apps/landing`,
`npm run`, and old repo URLs.

## Done criteria

- [ ] Web and app theme controls preserve the same `system`/`dark`/`light`
      semantics.
- [ ] Landing copy no longer advertises a five-task cap.
- [ ] GitHub URL is consistent across web, app, and macOS.
- [ ] TypeScript versions are aligned and `bun run typecheck` exits 0.
- [ ] `.cursor/agents/phived-ui.md` matches the current monorepo.
- [ ] `bun run check` exits 0.

## STOP conditions

Stop and report if:

- TypeScript alignment causes broad unrelated type failures.
- The canonical GitHub URL is ambiguous and neither URL resolves.
- Theme semantics require a broader UI decision than a three-state cycle.

## Maintenance notes

Whenever copy changes describe the product model, compare against
`apps/app/src/components/HelpDrawer.tsx` and `docs/macos-parity.md` so the web,
app, and macOS surfaces stay aligned.
