# Plan 001: Add behavior-preserving verification commands and utility tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise. When done, update this plan's status row in
> `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat bc8ab54..HEAD -- package.json bun.lock src/utils`
> If an in-scope file changed, compare the current code with the excerpts below
> before proceeding. Treat a material mismatch as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests, dx
- **Planned at**: commit `bc8ab54`, 2026-06-12

## Why this matters

The repository has lint and production-build gates but no automated tests.
Recent work changed row-count invariants, keyboard row creation, history time
labels, and canvas positioning without a regression harness. Bun includes a
test runner already, so focused tests can protect these pure functions without
adding a dependency or changing runtime behavior.

## Current state

- `package.json:10-15` has `dev`, `build`, `preview`, `lint`, and `lint:fix`,
  but no `test`, `typecheck`, or aggregate `check` command.
- `src/utils/taskList.ts` owns minimum-row padding, empty-row lookup, and row
  removal behavior.
- `src/utils/canvas.ts` owns zoom, viewport, and list-position clamping.
- `src/utils/formatHistoryWhen.ts` owns user-visible relative timestamps.
- There are no `*.test.ts` or `*.spec.ts` files in the repository.

Match the existing TypeScript conventions: double quotes, semicolons, path
aliases for source imports, and named exports. Use Bun's built-in
`bun:test`. Add `@types/bun` as the only new dev dependency so TypeScript can
resolve Bun's test declarations; do not add Vitest, Jest, jsdom, or another
test framework/runtime.

## Commands you will need

| Purpose   | Command                         | Expected on success         |
| --------- | ------------------------------- | --------------------------- |
| Install   | `bun install --frozen-lockfile` | exit 0, no lockfile changes |
| Typecheck | `bun run typecheck`             | exit 0, no errors           |
| Tests     | `bun test`                      | exit 0, all tests pass      |
| Lint      | `bun run lint`                  | exit 0, no errors           |
| Full gate | `bun run check`                 | exit 0                      |

## Scope

**In scope**:

- `package.json`
- `bun.lock`
- `src/utils/taskList.test.ts` (create)
- `src/utils/canvas.test.ts` (create)
- `src/utils/formatHistoryWhen.test.ts` (create)

**Out of scope**:

- Runtime source files under `src/`
- Component or browser tests
- New dependencies other than `@types/bun`
- Snapshot tests
- Changes to user-visible behavior

## Git workflow

- Use a branch named `codex/001-verification-harness` if a branch is required.
- Keep the change as one logical commit.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add explicit verification scripts

Run `bun add --dev @types/bun` so `bun:test` imports are typechecked.

Add these scripts to `package.json`:

```json
"typecheck": "tsc --noEmit",
"test": "bun test",
"check": "bun run lint && bun run typecheck && bun test && bun run build"
```

Do not alter the existing command bodies.

**Verify**: `bun install --frozen-lockfile && bun run typecheck` exits 0.

### Step 2: Cover task-list invariants

Create `src/utils/taskList.test.ts` using `describe`, `expect`, and `test` from
`bun:test`. Cover:

- `createEmptyTasks` returns exactly `MIN_TASK_ROWS` empty strings.
- `findFirstEmptyTaskIndex` ignores whitespace-only content correctly.
- `withTrailingEmptyRow` pads short arrays to five rows.
- `withTrailingEmptyRow` appends one row when the final row is populated.
- `withTrailingEmptyRow` does not append when the final row is already empty.
- `removeTaskRow` removes the requested item while retaining minimum padding.

**Verify**: `bun test src/utils/taskList.test.ts` passes.

### Step 3: Cover canvas boundaries

Create `src/utils/canvas.test.ts`. Cover:

- `clampZoom` at, below, and above both exported limits.
- `clampListPosition` for negative and over-canvas coordinates.
- `clampViewport` centers a canvas axis smaller than the viewport.
- `clampViewport` constrains a canvas axis larger than the viewport.

Do not test `createTaskList` IDs or `buildInitialLists`; those require platform
state and are outside this pure-unit scope.

**Verify**: `bun test src/utils/canvas.test.ts` passes.

### Step 4: Cover relative timestamp boundaries

Create `src/utils/formatHistoryWhen.test.ts`. Use Bun fake timers so tests do
not depend on wall-clock time. Cover:

- invalid ISO input
- under one minute
- exactly one minute
- multiple minutes under one hour
- same-day values older than an hour
- yesterday
- two to six calendar days ago
- seven or more calendar days ago

Restore real timers after each test or suite.

**Verify**: `bun test src/utils/formatHistoryWhen.test.ts` passes.

### Step 5: Run the complete gate

Run `bun run check`.

**Verify**: lint, typecheck, tests, and build all exit 0.

## Test plan

The test files created by this plan are the test plan. Assertions must check
exact returned values rather than snapshots. Date tests must use a fixed local
time away from midnight to avoid timezone-boundary ambiguity.

## Done criteria

- [ ] `@types/bun` is present in `devDependencies` and `bun.lock`
- [ ] `bun install --frozen-lockfile` exits 0 without further lockfile changes
- [ ] `bun run typecheck` exits 0
- [ ] `bun test` exits 0 with all listed cases present
- [ ] `bun run lint` exits 0
- [ ] `bun run build` exits 0
- [ ] `bun run check` exits 0
- [ ] No runtime source file was modified
- [ ] `plans/README.md` marks plan 001 DONE

## STOP conditions

- Any test requires changing production behavior to pass.
- Bun's fake-timer API is unavailable in the installed Bun version.
- A dependency other than `@types/bun` appears necessary.
- Current utility behavior materially differs from the excerpts and listed
  cases.

## Maintenance notes

Keep utility tests deterministic and small. When task row invariants or history
labels change intentionally, update the relevant tests in the same change.
