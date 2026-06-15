# Plan 005: Harden local persistence against corrupt data and quota failures

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm expected results before moving on. Stop on
> any STOP condition.
>
> **Drift check (run first)**: `git diff --stat 6371e75..HEAD -- apps/app/src/hooks apps/app/src/contexts apps/app/src/utils apps/app/src/components`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/003-add-ci-and-site-contract-tests.md
- **Category**: bug, tests
- **Planned at**: commit `6371e75`, 2026-06-14

## Why this matters

phived stores the user's task lists and history in browser `localStorage`. That
keeps the product private and simple, but it means corrupt data, schema drift,
quota exhaustion, and unbounded history can break or silently lose the user's
work. This plan adds validation, write-failure visibility, and a retention rule
without changing the app's core local-first model.

## Current state

- `useLocalStorage<T>` parses JSON and returns it as `T` without validation.
- `useCanvasViewport` casts parsed viewport JSON to `Viewport`.
- `CanvasTasksContextProvider.completeTask` prepends history entries forever.
- Storage write errors are logged with `console.warn` but not surfaced in UI.

Relevant excerpt:

```1:35:apps/app/src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);
}
```

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| App tests | `bun run test:app` | all tests pass |
| Typecheck | `bun run typecheck:app` | exit 0 |
| Check | `bun run check` | exit 0 |

## Scope

**In scope**:
- `apps/app/src/hooks/useLocalStorage.ts`
- `apps/app/src/hooks/useCanvasViewport.ts`
- `apps/app/src/contexts/CanvasTasksContext/CanvasTasksContextProvider.tsx`
- `apps/app/src/utils/*` validators/tests (create as needed)
- Existing app tests under `apps/app/src/**/*.test.ts(x)`

**Out of scope**:
- Server persistence, auth, or sync.
- Cross-tab merge UI beyond a simple warning/ignore behavior.
- macOS persistence.

## Steps

### Step 1: Add validators for persisted task data

Create small type guards/parsers for:

- `TaskLists`
- `TaskHistory`
- `Viewport`

Prefer a local utility module under `apps/app/src/utils/persistence.ts` with
unit tests. Validate required fields and finite numbers. On invalid data, return
the existing safe defaults rather than throwing.

**Verify**: `bun run test:app` → new parser tests pass.

### Step 2: Use validators at load boundaries

Update `useLocalStorage` to accept an optional parser:

```ts
useLocalStorage<T>(key, initialValue, parseStoredValue?)
```

Use key-specific parsers when loading `canvasLists` and `taskHistory` in
`CanvasTasksContextProvider`. Use the viewport parser in `useCanvasViewport`.

Do not change public storage keys.

**Verify**: `bun run typecheck:app` → exits 0.

### Step 3: Surface write failures

When `localStorage.setItem` throws, surface a toast or persistent warning that
changes may not persist. Keep the UI usable, but avoid silently pretending data
was saved. Use the existing `sonner` toast pattern in the app.

**Verify**: add/adjust a test if practical; otherwise `bun run test:app` and
manual code review of the catch path.

### Step 4: Cap task history growth

Introduce a named constant, e.g. `TASK_HISTORY_LIMIT`, and cap history to a
reasonable count (start with 200 unless the operator chose otherwise). Drop
oldest entries when adding a new completion. Keep restore/delete/clear behavior
unchanged for retained entries.

**Verify**: add a unit/provider test showing history is capped after repeated
completions.

## Done criteria

- [ ] Invalid `canvasLists`, `taskHistory`, and `canvasViewport` storage values
      fall back safely and do not throw during render.
- [ ] Storage write failures are visible to users.
- [ ] Task history has an explicit retention limit and tests.
- [ ] `bun run test:app`, `bun run typecheck:app`, and `bun run check` exit 0.

## STOP conditions

Stop and report if:

- Existing localStorage migrations require preserving undocumented malformed
  shapes.
- Tests require a browser API not available in the current Bun/happy-dom setup.
- Fixing persistence requires changing storage keys or deleting user data.

## Maintenance notes

If sync or import/export is added later, reuse the validators as the boundary
for external data too; do not add a second schema.
