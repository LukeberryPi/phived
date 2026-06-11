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
