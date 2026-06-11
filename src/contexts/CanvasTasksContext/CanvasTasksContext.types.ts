import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";

export type CanvasTasksContextType = {
  lists: TaskLists;
  taskHistory: TaskHistory;
  /** Spawns an empty list at the given canvas position and returns its id. */
  addList: (x: number, y: number) => string;
  /** Deletes immediately when the list is empty, otherwise asks to confirm. */
  requestDeleteList: (listId: string) => void;
  moveList: (listId: string, x: number, y: number) => void;
  setListTag: (listId: string, tag: string) => void;
  changeTask: (listId: string, taskIndex: number, newValue: string) => void;
  completeTask: (listId: string, taskIndex: number) => void;
  reorderTask: (listId: string, fromIndex: number, toIndex: number) => void;
  moveTaskUp: (listId: string, taskIndex: number) => void;
  moveTaskDown: (listId: string, taskIndex: number) => void;
  restoreTaskFromHistory: (entryId: string) => void;
  clearCanvas: () => void;
  clearTaskHistory: () => void;
};
