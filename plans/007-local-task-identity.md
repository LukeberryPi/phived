# 007 — Local task identity

## Goal

Give every task a stable identity so future sync can merge row-by-row, **without
changing any user-visible behaviour**. Today a task is a positional `string`
inside `TaskList.tasks: string[]`, and empty padding rows (`MIN_TASK_ROWS`,
`withTrailingEmptyRow`) are stored as empty strings. After this plan a task is
`{ id, text }`; padding rows are still present in memory (each with an id) but
carry empty `text`. Identity must be **preserved across text edits** — that is
the whole point.

`apps/app` only. No backend, no network, no new dependencies.

## Background (read before editing)

- Data shape: `apps/app/src/types/canvas.ts`.
- Pure task reducers (all index-based): `apps/app/src/utils/taskList.ts`.
- List/canvas helpers + the v1 legacy migration model:
  `apps/app/src/utils/canvas.ts`.
- localStorage parse/validate (this is the on-load migration boundary every
  existing user hits): `apps/app/src/utils/persistence.ts`.
- Consumers: `CanvasTasksContextProvider.tsx`, `TaskListCard.tsx`,
  `useTaskKeyboardNavigation.ts`, `countFilledTasks.ts`, `export.ts`,
  `Head.tsx`.

## Design decisions (do not deviate)

- **Target type:** `export type Task = { id: string; text: string };` and
  `TaskList.tasks: Task[]`.
- **Ids:** `crypto.randomUUID()` (already used in `canvas.ts` and the provider).
- **Padding stays in memory.** Empty rows remain `Task` objects with empty
  `text`; all index-based reducers keep working on `Task[]`. Do **not** strip
  empties — that belongs to the sync boundary in a later plan.
- **Identity is preserved on edit.** `changeTaskAt` must keep the same `id` and
  only change `text`. Reorders keep the same `Task` objects.
- **localStorage migration on load.** `parseTaskList` must accept BOTH the
  legacy `tasks: string[]` (wrap each into `{ id: crypto.randomUUID(), text }`)
  AND the new `tasks: { id, text }[]` (validate). This is what migrates existing
  users. localStorage continues to store `Task[]` (padding included).
- **No `order`/fractional index field yet.** Array position remains the order.
  Fractional ordering is introduced in [009]/[010] at the sync boundary. If
  this plan seems to need an order key, STOP.
- **Keep action callbacks index-based.** Do not switch to id-addressed
  mutations; that is a later, sync-driven change. The only id usage added now is
  the React `key`.

## Scope (touch only these)

Production:

- `apps/app/src/types/canvas.ts`
- `apps/app/src/utils/taskList.ts`
- `apps/app/src/utils/canvas.ts`
- `apps/app/src/utils/persistence.ts`
- `apps/app/src/utils/countFilledTasks.ts`
- `apps/app/src/utils/export.ts`
- `apps/app/src/contexts/CanvasTasksContext/CanvasTasksContextProvider.tsx`
- `apps/app/src/components/TaskListCard.tsx`
- `apps/app/src/hooks/useTaskKeyboardNavigation.ts`

Tests:

- `apps/app/src/utils/taskList.test.ts`
- `apps/app/src/utils/persistence.test.ts`
- `apps/app/src/utils/canvas.test.ts`
- `apps/app/src/utils/export.test.ts`
- `apps/app/src/components/TaskListCard.test.tsx`

`apps/app/src/components/TaskRow.tsx` and `CanvasTasksContext.types.ts` should
**not** need changes (see steps). If you believe they do, STOP and report.

## Drift check (run first)

```bash
# Must still be on the legacy string[] model, or this plan is stale:
rg -n "tasks: string\[\]" apps/app/src/types/canvas.ts || echo "DRIFT: model already changed"
# Baseline must be green before we start:
bun --cwd apps/app test
```

If the `rg` line prints `DRIFT: ...` (no match), STOP. If the baseline test run
is not green, STOP.

## Steps (in order)

### 1. `types/canvas.ts` — introduce `Task`

Add `export type Task = { id: string; text: string };` and change
`TaskList.tasks` from `string[]` to `Task[]`. Leave `Viewport` untouched.

### 2. `utils/taskList.ts` — port every reducer to `Task[]`

Add a private helper `createEmptyTask(): Task` returning
`{ id: crypto.randomUUID(), text: "" }`, then port each function so it operates
on `Task[]` while preserving identity:

- `createEmptyTasks(): Task[]` → `Array.from({ length: MIN_TASK_ROWS }, createEmptyTask)`.
- `taskListHasTasks(tasks: Task[])` → `tasks.some((t) => t.text.trim() !== "")`.
- `findFirstEmptyTaskIndex` → test `t.text.trim() === ""`.
- `withTrailingEmptyRow(tasks: Task[]): Task[]` → pad with `createEmptyTask()`;
  the "is last row empty?" check uses `.text`.
- `removeTaskRow`, `addEmptyTaskRow`, `insertEmptyTaskRowBelow/Above`,
  `removeEmptyExtraRow`, `reorderTaskRows` → same logic, but empties are created
  via `createEmptyTask()` and the empty/length checks read `.text`. Reorders
  must move the existing `Task` objects (ids ride along).
- `changeTaskAt(tasks, index, value)` → return
  `tasks.map((t, i) => (i === index ? { ...t, text: value } : t))` — **same id**.
- `restoreTaskText(tasks, text)` → set `text` on the first empty `Task`
  (preserve its id) or push `createEmptyTask()`-style `{ id, text }`; then
  `withTrailingEmptyRow`.

Keep `MIN_TASK_ROWS` exported and unchanged.

### 3. `utils/canvas.ts` — list creation + legacy v1 migration

- `createTaskList(x, y, tag = "", tasks: Task[] = createEmptyTasks())`.
- `buildListsFromLegacyTasks(generalTasks, dailyTasks)` still takes
  `string[] | null` (those are the raw v1 values). Wrap them into `Task[]`
  before passing into list creation: map each string to
  `{ id: crypto.randomUUID(), text }`, then `withTrailingEmptyRow`. Add a small
  local helper e.g. `tasksFromStrings(strings: string[]): Task[]`.
- `createCanvasCenterList(tasks?: Task[])` signature updates accordingly.
- `listHasContent` already delegates to `taskListHasTasks` — no change beyond
  types.

### 4. `utils/persistence.ts` — accept legacy AND new task shapes (the migration)

In `parseTaskList`, replace the `isStringArray(record.tasks)` check with logic
that accepts either:

- legacy `string[]`: every element is a string → map to
  `{ id: crypto.randomUUID(), text }`.
- new `Task[]`: every element is an object with string `id` and string `text` →
  keep as-is (use the stored id).

Reject (return `null`) if `tasks` is neither. Then continue through
`withTrailingEmptyRow(...)` as today. Add an `isTaskArray` type guard alongside
the existing `isStringArray` (keep `isStringArray` if still used; remove if not).
This is the only place legacy data is upgraded; localStorage keeps storing
`Task[]` thereafter.

### 5. `utils/countFilledTasks.ts`

`export function countFilledTasks(tasks: Task[])` →
`tasks.filter((t) => t.text.trim() !== "").length`. Import `Task` from
`src/types/canvas`.

### 6. `utils/export.ts`

In `buildCanvasMarkdown`, the per-list task lines must read `.text`:
`list.tasks.map((t) => escapeMarkdownText(t.text)).filter((s) => s.length > 0)`.
`buildCanvasJson` serialises `lists` directly, so its output shape now contains
`{ id, text }` tasks — that is expected; only the test fixtures change.

### 7. `CanvasTasksContextProvider.tsx`

The provider delegates almost everything to the ported reducers, so the only
direct task-string read is in `completeTask`:

- `const completedText = list?.tasks[taskIndex]?.text.trim() ?? "";`

Verify no other `list.tasks[...]` access assumes a string. `crypto.randomUUID()`
usage for history ids is unchanged.

### 8. `components/TaskListCard.tsx`

In the `list.tasks.map((task, idx) => ...)` block:

- Change the React key from `key={idx}` to `key={task.id}` (stable key so input
  focus survives reorders/remote updates later).
- Pass the text to `TaskRow`: `task={task.text}` (TaskRow keeps `task: string`).

`countFilledTasks(list.tasks)` now receives `Task[]` (handled by step 5). No
other change.

### 9. `hooks/useTaskKeyboardNavigation.ts`

- `tasks: Task[]` in the options type.
- The two lookahead reads become `.text`:
  - `const previousTask = tasks[index - 1];` → check `previousTask.text.trim() === ""`.
  - `const nextTask = tasks[index + 1];` → check `nextTask.text.trim() === ""`.
- `tasks.length` usage is unchanged.

### 10. Update tests to the `Task[]` model

These tests encode the behaviour contract; keep the behaviour, update the shape.

- Add a shared helper in each affected test (or inline) `texts(tasks) =>
tasks.map((t) => t.text)` and assert on `texts(...)` where the old test
  compared string arrays.
- `taskList.test.ts`: build inputs with `{ id, text }` (a tiny
  `task(text) => ({ id: crypto.randomUUID(), text })` factory). Assert results
  via `texts(...)`. **Add identity assertions:** `changeTaskAt` keeps the same
  `id` at the edited index; `reorderTaskRows` preserves ids (the moved object is
  the same reference/ id).
- `persistence.test.ts`: update fixtures to `Task[]`. **Add two migration
  tests:** (a) a stored list with legacy `tasks: ["one", ""]` parses into tasks
  whose `text` values are `["one", ""]` and each has a string `id`; (b) a stored
  list already in `{ id, text }[]` form keeps its ids. Update
  `tasks.at(-1)` assertions to check `.text === ""`.
- `canvas.test.ts`: `buildListsFromLegacyTasks` still takes `string[]`; update
  assertions like `tasks.every((t) => t === "")` → `t.text === ""` and
  `tasks[0]` → `tasks[0].text`.
- `export.test.ts`: update the `lists` fixture tasks to `{ id, text }`. The
  markdown expectations are unchanged (it renders text). For `buildCanvasJson`
  round-trip, compare against the same `{ id, text }` fixtures.
- `TaskListCard.test.tsx`: update the `list` fixture `tasks` to `{ id, text }[]`
  (e.g. `[task("one"), task(""), task(""), task(""), task("")]`). The
  `changeTask` assertion still expects `("list-1", 0, "do tasksssssssss")` —
  index-based, unchanged.

## Verification (run after the steps; all must pass)

```bash
bun --cwd apps/app typecheck
bun --cwd apps/app lint
bun --cwd apps/app test
bun --cwd apps/app build
```

Then the repo gate:

```bash
bun run check
```

Manual smoke (report, don't skip): `bun run dev:app`, then in the browser
confirm — typing creates/edits tasks; Enter/Shift+Enter/Alt+Arrows/Backspace
behave exactly as before; completing a task moves it to history; drag-reorder
works; reload preserves tasks; and a pre-existing localStorage value with
`tasks: ["a","b"]` (set it manually in devtools under key `canvasLists`) loads
correctly after the change.

## STOP conditions

- Drift check fails (model already migrated, or baseline not green).
- A change would alter user-visible behaviour (row padding, focus order,
  keyboard nav, completion, reorder) — the behaviour must be identical.
- You find yourself needing an `order`/fractional-index field, id-addressed
  mutations, any network/persistence-format change, or edits to files outside
  Scope. STOP and report — those belong to later plans.
- `TaskRow.tsx` or `CanvasTasksContext.types.ts` appear to need changes.

## Out of scope (later plans)

Fractional task ordering, stripping empties at the sync boundary, id-addressed
mutations, and anything touching the network, auth, billing, or Postgres.
