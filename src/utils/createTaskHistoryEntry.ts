import type { TaskHistoryEntry } from "src/types/taskHistory";

export function createTaskHistoryEntry(text: string): TaskHistoryEntry {
  return {
    id: crypto.randomUUID(),
    text,
    completedAt: new Date().toISOString(),
  };
}
