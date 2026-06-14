import type { TaskList, TaskLists, Viewport } from "src/types/canvas";
import type { TaskHistory, TaskHistoryEntry } from "src/types/taskHistory";

export const TASK_HISTORY_LIMIT = 200;

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

  const lists: TaskList[] = [];

  for (const item of value) {
    const list = parseTaskList(item);

    if (!list) {
      return fallback;
    }

    lists.push(list);
  }

  return lists;
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

  const entries: TaskHistoryEntry[] = [];

  for (const item of value) {
    const entry = parseTaskHistoryEntry(item);

    if (!entry) {
      return fallback;
    }

    entries.push(entry);
  }

  return entries;
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

export function prependCappedTaskHistory(
  prev: TaskHistory,
  entry: TaskHistoryEntry
): TaskHistory {
  return [entry, ...prev].slice(0, TASK_HISTORY_LIMIT);
}
