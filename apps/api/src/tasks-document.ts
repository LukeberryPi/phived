// The synced unit is a single task document: { canvasLists, taskHistory }.
// canvasLists is opaque to the merge (last-write-wins as a whole), while
// taskHistory is unioned by entry id so a completed-task record is never lost
// when two devices write concurrently (ADR 0004). Validation mirrors the
// client validators in apps/app/src/utils/persistence.ts closely enough to
// reject malformed payloads before they are encrypted and stored.

export interface TaskHistoryEntry {
  id: string;
  text: string;
  completedAt: string;
  listId?: string;
  listTag?: string;
}

export interface TaskDocumentBlob {
  canvasLists: unknown[];
  taskHistory: TaskHistoryEntry[];
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parseHistoryEntry(value: unknown): TaskHistoryEntry | null {
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

/** Validate and normalise an untrusted blob, or return null if it is invalid. */
export function parseTaskDocument(value: unknown): TaskDocumentBlob | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    !Array.isArray(record.canvasLists) ||
    !Array.isArray(record.taskHistory)
  ) {
    return null;
  }

  const taskHistory: TaskHistoryEntry[] = [];
  for (const raw of record.taskHistory) {
    const entry = parseHistoryEntry(raw);
    if (!entry) {
      return null;
    }
    taskHistory.push(entry);
  }

  return { canvasLists: record.canvasLists, taskHistory };
}

/**
 * Union completed-task history by id, preferring the most recent record on a
 * collision, and order newest-first by completedAt to match the client.
 */
export function unionTaskHistory(
  a: TaskHistoryEntry[],
  b: TaskHistoryEntry[]
): TaskHistoryEntry[] {
  const byId = new Map<string, TaskHistoryEntry>();
  for (const entry of [...a, ...b]) {
    byId.set(entry.id, entry);
  }
  return [...byId.values()].sort((left, right) =>
    right.completedAt.localeCompare(left.completedAt)
  );
}

/**
 * Server-side merge of an incoming write against the stored document: the
 * canvas is last-write-wins (incoming replaces stored), while history is
 * unioned so no completed task is dropped.
 */
export function mergeDocuments(
  stored: TaskDocumentBlob | null,
  incoming: TaskDocumentBlob
): TaskDocumentBlob {
  if (!stored) {
    return incoming;
  }
  return {
    canvasLists: incoming.canvasLists,
    taskHistory: unionTaskHistory(stored.taskHistory, incoming.taskHistory),
  };
}
