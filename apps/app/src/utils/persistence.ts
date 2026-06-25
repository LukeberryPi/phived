import type { Task, TaskList, TaskLists, Viewport } from "src/types/canvas";
import type { TaskHistory, TaskHistoryEntry } from "src/types/taskHistory";
import {
  clampListPosition,
  clampListWidth,
  LIST_WIDTH,
} from "src/utils/canvas";
import { withTrailingEmptyRow } from "src/utils/taskList";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isTaskArray(value: unknown): value is Task[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        !!item &&
        typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "string" &&
        typeof (item as { text?: unknown }).text === "string"
    )
  );
}

function parseTaskList(value: unknown): TaskList | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (!isString(record.id) || !isString(record.tag)) {
    return null;
  }

  if (!isFiniteNumber(record.x) || !isFiniteNumber(record.y)) {
    return null;
  }

  if (record.width !== undefined && !isFiniteNumber(record.width)) {
    return null;
  }

  let tasks: Task[];

  if (isTaskArray(record.tasks)) {
    tasks = record.tasks.map((task) => ({ id: task.id, text: task.text }));
  } else if (isStringArray(record.tasks)) {
    tasks = record.tasks.map((text) => ({ id: crypto.randomUUID(), text }));
  } else {
    return null;
  }

  const width =
    record.width !== undefined ? clampListWidth(record.width) : undefined;
  const position = clampListPosition(record.x, record.y, width ?? LIST_WIDTH);

  return {
    id: record.id,
    tag: record.tag,
    ...position,
    ...(width !== undefined ? { width } : {}),
    tasks: withTrailingEmptyRow(tasks),
  };
}

export function parseTaskLists(value: unknown, fallback: TaskLists): TaskLists {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const lists = value
    .map(parseTaskList)
    .filter((list): list is TaskList => list !== null);

  return lists.length > 0 ? lists : fallback;
}

function parseTaskHistoryEntry(value: unknown): TaskHistoryEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    !isString(record.id) ||
    !isString(record.text) ||
    !isString(record.completedAt)
  ) {
    return null;
  }

  if (record.listId !== undefined && !isString(record.listId)) {
    return null;
  }

  if (record.listTag !== undefined && !isString(record.listTag)) {
    return null;
  }

  return {
    id: record.id,
    text: record.text,
    completedAt: record.completedAt,
    ...(record.listId !== undefined ? { listId: record.listId } : {}),
    ...(record.listTag !== undefined ? { listTag: record.listTag } : {}),
  };
}

export function parseTaskHistory(
  value: unknown,
  fallback: TaskHistory
): TaskHistory {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map(parseTaskHistoryEntry)
    .filter((entry): entry is TaskHistoryEntry => entry !== null);
}

export function parseViewport(
  value: unknown,
  fallback: Viewport | null
): Viewport | null {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  if (
    !isFiniteNumber(record.x) ||
    !isFiniteNumber(record.y) ||
    !isFiniteNumber(record.zoom)
  ) {
    return fallback;
  }

  return {
    x: record.x,
    y: record.y,
    zoom: record.zoom,
  };
}
