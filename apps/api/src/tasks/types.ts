export type TaskList = {
  id: string;
  tag: string;
  x: number;
  y: number;
  width?: number;
  tasks: string[];
};

export type TaskHistoryEntry = {
  id: string;
  text: string;
  completedAt: string;
  listId?: string;
  listTag?: string;
};

export type TaskSnapshot = {
  canvasLists: TaskList[];
  taskHistory: TaskHistoryEntry[];
};

export type VersionedTaskSnapshot = TaskSnapshot & {
  version: number;
};

export type PutTasksBody = {
  blob: TaskSnapshot;
  baseVersion: number | null;
};

export const MAX_TASK_BODY_BYTES = 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseTaskList(value: unknown): TaskList | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isString(value.id) ||
    !isString(value.tag) ||
    !isFiniteNumber(value.x) ||
    !isFiniteNumber(value.y) ||
    !Array.isArray(value.tasks) ||
    !value.tasks.every(isString)
  ) {
    return null;
  }

  if (value.width !== undefined && !isFiniteNumber(value.width)) {
    return null;
  }

  return {
    id: value.id,
    tag: value.tag,
    x: value.x,
    y: value.y,
    ...(value.width !== undefined ? { width: value.width } : {}),
    tasks: value.tasks,
  };
}

function parseTaskHistoryEntry(value: unknown): TaskHistoryEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isString(value.id) ||
    !isString(value.text) ||
    !isString(value.completedAt)
  ) {
    return null;
  }

  if (value.listId !== undefined && !isString(value.listId)) {
    return null;
  }

  if (value.listTag !== undefined && !isString(value.listTag)) {
    return null;
  }

  return {
    id: value.id,
    text: value.text,
    completedAt: value.completedAt,
    ...(value.listId !== undefined ? { listId: value.listId } : {}),
    ...(value.listTag !== undefined ? { listTag: value.listTag } : {}),
  };
}

export function parseTaskSnapshot(value: unknown): TaskSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!Array.isArray(value.canvasLists) || !Array.isArray(value.taskHistory)) {
    return null;
  }

  const canvasLists = value.canvasLists.map(parseTaskList);
  const taskHistory = value.taskHistory.map(parseTaskHistoryEntry);

  if (
    canvasLists.some((item) => item === null) ||
    taskHistory.some((item) => item === null)
  ) {
    return null;
  }

  return {
    canvasLists: canvasLists as TaskList[],
    taskHistory: taskHistory as TaskHistoryEntry[],
  };
}

export function parsePutTasksBody(value: unknown): PutTasksBody | null {
  if (!isRecord(value)) {
    return null;
  }

  const blob = parseTaskSnapshot(value.blob);

  if (!blob) {
    return null;
  }

  const baseVersion = value.baseVersion;

  if (
    baseVersion !== null &&
    (!Number.isInteger(baseVersion) || Number(baseVersion) < 0)
  ) {
    return null;
  }

  return {
    blob,
    baseVersion: baseVersion as number | null,
  };
}
