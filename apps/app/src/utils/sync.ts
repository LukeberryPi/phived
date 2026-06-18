// Pure sync-reconciliation logic shared by the sync engine (ADR 0004). Kept
// free of React and storage side effects so it is exhaustively unit-testable.
// The synced unit is { canvasLists, taskHistory }: history is unioned by id so
// completed tasks are never lost, while the canvas is last-write-wins.
import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import type { ServerDocument, TasksGetResponse } from "src/lib/syncApi";

export type SyncDocument = ServerDocument;

export function unionTaskHistory(a: TaskHistory, b: TaskHistory): TaskHistory {
  const byId = new Map<string, TaskHistory[number]>();
  for (const entry of [...a, ...b]) {
    byId.set(entry.id, entry);
  }
  return [...byId.values()].sort((left, right) =>
    right.completedAt.localeCompare(left.completedAt)
  );
}

/**
 * Reconcile local against an authoritative server document: the server canvas
 * wins (last-write-wins), history is unioned. The caller is responsible for
 * snapshotting the prior local canvas to a backup before applying this, so a
 * clobbered local edit stays recoverable.
 */
export function reconcileWithServer(
  local: SyncDocument,
  server: SyncDocument
): SyncDocument {
  return {
    canvasLists: server.canvasLists as TaskLists,
    taskHistory: unionTaskHistory(local.taskHistory, server.taskHistory),
  };
}

export type AdoptionBranch = "seed" | "adopt-server";

export interface AdoptionResult {
  branch: AdoptionBranch;
  /** The document the client should hold after adoption. */
  next: SyncDocument;
  /** Whether the client must push `next` to the server. */
  shouldPush: boolean;
  /** The version to use as the push baseline. */
  baseVersion: number;
}

/**
 * Adoption branches on whether a server document already exists (ADR 0004):
 *  - none yet (first upgrade): push local up as the seed; the canvas is visibly
 *    unchanged because `next` is exactly the local document.
 *  - already exists (sign-in elsewhere): the server is authoritative; take the
 *    server canvas and union the histories so no completed task is dropped. We
 *    only re-push when the union added local-only history the server lacks.
 */
export function resolveAdoption(
  local: SyncDocument,
  server: TasksGetResponse
): AdoptionResult {
  if (server.document === null) {
    return { branch: "seed", next: local, shouldPush: true, baseVersion: 0 };
  }

  const next = reconcileWithServer(local, server.document);
  const serverHistoryLen = server.document.taskHistory.length;
  const shouldPush = next.taskHistory.length !== serverHistoryLen;

  return {
    branch: "adopt-server",
    next,
    shouldPush,
    baseVersion: server.version,
  };
}
