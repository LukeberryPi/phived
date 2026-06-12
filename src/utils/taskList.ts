/** A list never renders fewer than this many rows, even when empty. */
export const MIN_TASK_ROWS = 5;

export function createEmptyTasks(): string[] {
  return Array<string>(MIN_TASK_ROWS).fill("");
}

export function findFirstEmptyTaskIndex(tasks: string[]) {
  return tasks.findIndex((task) => task.trim() === "");
}

/**
 * Pads a list to MIN_TASK_ROWS and guarantees a trailing empty row whenever
 * the last row has content, so there is always room to add another task.
 */
export function withTrailingEmptyRow(tasks: string[]): string[] {
  const padded =
    tasks.length >= MIN_TASK_ROWS
      ? [...tasks]
      : [...tasks, ...Array<string>(MIN_TASK_ROWS - tasks.length).fill("")];

  if ((padded[padded.length - 1] ?? "").trim() !== "") {
    padded.push("");
  }

  return padded;
}

/** Removes a row while keeping the minimum row count and a trailing empty row. */
export function removeTaskRow(tasks: string[], index: number): string[] {
  return withTrailingEmptyRow(tasks.filter((_, idx) => idx !== index));
}

export function changeTaskAt(
  tasks: string[],
  index: number,
  value: string
): string[] {
  return tasks.map((task, taskIndex) => (taskIndex === index ? value : task));
}

export function addEmptyTaskRow(tasks: string[]): string[] {
  return [...tasks, ""];
}

export function removeEmptyExtraRow(tasks: string[], index: number): string[] {
  if (
    tasks.length <= MIN_TASK_ROWS ||
    index < 0 ||
    index >= tasks.length ||
    tasks[index].trim() !== ""
  ) {
    return tasks;
  }

  return tasks.filter((_, taskIndex) => taskIndex !== index);
}

export function reorderTaskRows(
  tasks: string[],
  fromIndex: number,
  toIndex: number
): string[] {
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

export function restoreTaskText(tasks: string[], text: string): string[] {
  const restored = [...tasks];
  const emptyIndex = findFirstEmptyTaskIndex(restored);

  if (emptyIndex === -1) {
    restored.push(text);
  } else {
    restored[emptyIndex] = text;
  }

  return withTrailingEmptyRow(restored);
}
