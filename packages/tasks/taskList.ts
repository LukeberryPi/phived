/**
 * Shared, platform-agnostic task model for every phived surface (Vite app,
 * Expo app). Pure array transforms with no DOM or React Native dependencies, so
 * the same logic resolves cleanly from this workspace package, exactly like
 * @phived/tokens.
 */

export type Task = {
  id: string;
  text: string;
};

let fallbackIdCounter = 0;

/**
 * Web and Bun expose `crypto.randomUUID`; React Native (Hermes) does not, so we
 * fall back to a process-unique id there. The counter guarantees uniqueness
 * within a session even when ids are minted in the same millisecond.
 */
function createTaskId(): string {
  const runtimeCrypto = (
    globalThis as { crypto?: { randomUUID?: () => string } }
  ).crypto;

  if (typeof runtimeCrypto?.randomUUID === "function") {
    return runtimeCrypto.randomUUID();
  }

  fallbackIdCounter += 1;
  return `task-${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}`;
}

export function createTask(text = ""): Task {
  return { id: createTaskId(), text };
}

/** A list never renders fewer than this many rows, even when empty. */
export const MIN_TASK_ROWS = 5;

export function createEmptyTasks(): Task[] {
  return Array.from({ length: MIN_TASK_ROWS }, () => createTask());
}

export function taskListHasTasks(tasks: Task[]): boolean {
  return tasks.some((task) => task.text.trim() !== "");
}

function findFirstEmptyTaskIndex(tasks: Task[]) {
  return tasks.findIndex((task) => task.text.trim() === "");
}

/**
 * Pads a list to MIN_TASK_ROWS and guarantees a trailing empty row whenever
 * the last row has content, so there is always room to add another task.
 */
export function withTrailingEmptyRow(tasks: Task[]): Task[] {
  const padded =
    tasks.length >= MIN_TASK_ROWS
      ? [...tasks]
      : [
          ...tasks,
          ...Array.from({ length: MIN_TASK_ROWS - tasks.length }, () =>
            createTask()
          ),
        ];

  if ((padded[padded.length - 1]?.text ?? "").trim() !== "") {
    padded.push(createTask());
  }

  return padded;
}

/** Removes a row while keeping the minimum row count and a trailing empty row. */
export function removeTaskRow(tasks: Task[], index: number): Task[] {
  return withTrailingEmptyRow(tasks.filter((_, idx) => idx !== index));
}

export function changeTaskAt(
  tasks: Task[],
  index: number,
  value: string
): Task[] {
  return tasks.map((task, taskIndex) =>
    taskIndex === index ? { ...task, text: value } : task
  );
}

export function addEmptyTaskRow(tasks: Task[]): Task[] {
  return [...tasks, createTask()];
}

export function insertEmptyTaskRowBelow(tasks: Task[], index: number): Task[] {
  if (index < 0 || index >= tasks.length) {
    return tasks;
  }

  const inserted = [...tasks];
  inserted.splice(index + 1, 0, createTask());
  return inserted;
}

export function insertEmptyTaskRowAbove(tasks: Task[], index: number): Task[] {
  if (index < 0 || index >= tasks.length) {
    return tasks;
  }

  const inserted = [...tasks];
  inserted.splice(index, 0, createTask());
  return inserted;
}

export function removeEmptyExtraRow(tasks: Task[], index: number): Task[] {
  if (
    tasks.length <= MIN_TASK_ROWS ||
    index < 0 ||
    index >= tasks.length ||
    tasks[index].text.trim() !== ""
  ) {
    return tasks;
  }

  return tasks.filter((_, taskIndex) => taskIndex !== index);
}

export function reorderTaskRows(
  tasks: Task[],
  fromIndex: number,
  toIndex: number
): Task[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= tasks.length ||
    toIndex >= tasks.length
  ) {
    return tasks;
  }

  const reordered = [...tasks];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
}

export function restoreTaskText(tasks: Task[], text: string): Task[] {
  const restored = [...tasks];
  const emptyIndex = findFirstEmptyTaskIndex(restored);

  if (emptyIndex === -1) {
    restored.push(createTask(text));
  } else {
    restored[emptyIndex] = { ...restored[emptyIndex], text };
  }

  return withTrailingEmptyRow(restored);
}
