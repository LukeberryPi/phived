# Plan 002: Finish Bun migration cleanup without changing runtime behavior

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise. When done, update this plan's status row in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat bc8ab54..HEAD -- README.md .nvmrc .gitignore eslint.config.js package.json`
> If an in-scope file changed, compare it with the current-state notes before
> proceeding. Treat a material mismatch as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plan 001
- **Category**: migration, docs, dx
- **Planned at**: commit `bc8ab54`, 2026-06-12

## Why this matters

The package manager is Bun, but Node-era metadata and stale product copy remain.
The README still requires Node and describes a hard five-task cap that the
canvas/list implementation no longer has. ESLint also ignores deleted Tailwind
v3 config files. These mismatches increase onboarding and maintenance cost even
though the application itself is healthy.

## Current state

- `package.json:6-9` declares `bun@1.3.8` and a Bun engine.
- `.nvmrc` still contains `22`.
- `README.md:7` says users can have only five tasks.
- `README.md:18` lists Node.js instead of Bun as a prerequisite.
- `eslint.config.js:15-16` ignores deleted `postcss.config.cjs` and
  `tailwind.config.cjs`.
- `.gitignore` contains npm/yarn/pnpm log patterns but no Bun-specific generated
  artifacts are currently required.

## Commands you will need

| Purpose   | Command                         | Expected on success |
| --------- | ------------------------------- | ------------------- | --- | ------------ | ----------------- | ----------------------------------------------------------------- | -------------------------- |
| Install   | `bun install --frozen-lockfile` | exit 0              |
| Search    | `rg -n "node\\.js               | npm                 | npx | package-lock | tailwind\\.config | postcss\\.config" README.md .nvmrc eslint.config.js package.json` | no stale migration matches |
| Full gate | `bun run check`                 | exit 0              |

## Scope

**In scope**:

- `README.md`
- `.nvmrc` (delete)
- `eslint.config.js`
- `.gitignore` only if a demonstrably Bun-specific stale entry needs cleanup

**Out of scope**:

- Runtime source files
- Product behavior
- Dependency upgrades
- Rewriting the README's tone or motivation
- Adding CI, hooks, or editor tooling

## Git workflow

- Use a branch named `codex/002-bun-cleanup` if a branch is required.
- Keep the change as one logical commit.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Remove Node-only version metadata

Delete `.nvmrc`. Do not replace it with another runtime-version file because
`packageManager` and `engines.bun` already provide the authoritative version.

**Verify**: `test ! -e .nvmrc` exits 0.

### Step 2: Correct README prerequisites and product description

In `README.md`:

- Replace the Node.js prerequisite with a link to Bun installation.
- Replace the hard five-task-cap claim with a concise description of the
  current canvas of tagged task lists.
- Preserve the existing lowercase voice and all unrelated copy.

**Verify**:
`rg -n "node\\.js|up to 5 tasks|five tasks" README.md` returns no matches.

### Step 3: Remove stale ESLint ignores

Remove `postcss.config.cjs` and `tailwind.config.cjs` from the `ignores` array
in `eslint.config.js`. Do not otherwise change lint rules.

**Verify**: `bun run lint` exits 0.

### Step 4: Run the complete gate

Run `bun install --frozen-lockfile`, then `bun run check`.

**Verify**: both commands exit 0 and `git diff --check` emits no output.

## Test plan

No new tests are required because this plan only changes docs and stale tooling
metadata. Plan 001's `bun run check` is the regression gate.

## Done criteria

- [ ] `.nvmrc` no longer exists
- [ ] README names Bun, not Node.js, as the runtime/package-manager prerequisite
- [ ] README describes the current multi-list canvas without a five-task cap
- [ ] ESLint has no ignores for deleted Tailwind v3 config files
- [ ] `bun install --frozen-lockfile` exits 0
- [ ] `bun run check` exits 0
- [ ] No runtime source file was modified
- [ ] `plans/README.md` marks plan 002 DONE

## STOP conditions

- Product behavior has changed again and the proposed README wording would be
  inaccurate.
- Removing an ESLint ignore causes generated files to be linted.
- Completing the cleanup requires changing runtime code.

## Maintenance notes

Keep package-manager instructions in one place and use `bun run check` as the
single contributor verification command once plan 001 lands.
