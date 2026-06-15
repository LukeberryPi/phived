import type { TaskList, TaskLists, Viewport } from "src/types/canvas";
import type { TaskHistory, TaskHistoryEntry } from "src/types/taskHistory";

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

  if (!isStringArray(record.tasks)) {
    return null;
  }

  return {
    id: record.id,
    tag: record.tag,
    x: record.x,
    y: record.y,
    ...(record.width !== undefined ? { width: record.width } : {}),
    tasks: record.tasks,
  };
}

export function parseTaskLists(value: unknown, fallback: TaskLists): TaskLists {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map(parseTaskList)
    .filter((list): list is TaskList => list !== null);
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
