export type TaskHistoryEntry = {
  id: string;
  text: string;
  completedAt: string;
  /** List the task was completed in. Absent on pre-canvas entries. */
  listId?: string;
  listTag?: string;
};

export type TaskHistory = TaskHistoryEntry[];
