import {
  changeTaskAt,
  createTask,
  removeTaskRow,
  reorderTaskRows,
  withTrailingEmptyRow,
  type Task,
} from "@phived/tasks";

const INITIAL_TASK_TEXTS = [
  "Ship the iOS MVP",
  "Match the web task card",
  "Tune dark mode colors",
  "Drag rows into order",
  "Swipe right to delete",
];

export function createInitialTasks(): Task[] {
  return withTrailingEmptyRow(
    INITIAL_TASK_TEXTS.map((text) => createTask(text))
  );
}

/** Edits one task and keeps a trailing empty row so the list can always grow. */
export function editTask(tasks: Task[], taskId: string, text: string): Task[] {
  const index = tasks.findIndex((task) => task.id === taskId);

  if (index === -1) {
    return tasks;
  }

  return withTrailingEmptyRow(changeTaskAt(tasks, index, text));
}

export function deleteTask(tasks: Task[], taskId: string): Task[] {
  const index = tasks.findIndex((task) => task.id === taskId);

  if (index === -1) {
    return tasks;
  }

  return removeTaskRow(tasks, index);
}

/**
 * Moves a task one slot up or down. Refuses to swap into a trailing empty row
 * so filled tasks stay grouped at the top of the list.
 */
export function reorderByDirection(
  tasks: Task[],
  taskId: string,
  direction: -1 | 1
): Task[] {
  const fromIndex = tasks.findIndex((task) => task.id === taskId);

  if (fromIndex === -1) {
    return tasks;
  }

  const toIndex = fromIndex + direction;

  if (
    toIndex < 0 ||
    toIndex >= tasks.length ||
    tasks[toIndex].text.trim() === ""
  ) {
    return tasks;
  }

  return reorderTaskRows(tasks, fromIndex, toIndex);
}
