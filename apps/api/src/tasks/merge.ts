import type { TaskSnapshot, VersionedTaskSnapshot } from "./types";

export function mergeTaskSnapshots(
  server: VersionedTaskSnapshot,
  client: TaskSnapshot
): TaskSnapshot {
  return {
    canvasLists: client.canvasLists,
    taskHistory: unionTaskHistory(server.taskHistory, client.taskHistory),
  };
}

function unionTaskHistory(
  server: TaskSnapshot["taskHistory"],
  client: TaskSnapshot["taskHistory"]
) {
  const entries = new Map<string, TaskSnapshot["taskHistory"][number]>();

  for (const entry of server) {
    entries.set(entry.id, entry);
  }

  for (const entry of client) {
    entries.set(entry.id, entry);
  }

  return [...entries.values()].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt)
  );
}
