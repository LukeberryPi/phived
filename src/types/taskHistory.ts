export type TaskHistoryEntry = {
  id: string;
  text: string;
  completedAt: string;
};

export type TaskHistory = TaskHistoryEntry[];
