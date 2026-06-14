import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";

export type CanvasTasksContextType = {
  lists: TaskLists;
  taskHistory: TaskHistory;
  /** Spawns an empty list at the given canvas position and returns its id. */
  addList: (x: number, y: number) => string;
  /** Deletes immediately when the list is empty, otherwise asks to confirm. */
  requestDeleteList: (listId: string) => void;
  bringListToFront: (listId: string) => void;
  moveList: (listId: string, x: number, y: number) => void;
  /** Sets a list's width, clamped to the allowed range. */
  resizeList: (listId: string, width: number) => void;
  setListTag: (listId: string, tag: string) => void;
  changeTask: (listId: string, taskIndex: number, newValue: string) => void;
  addTaskRow: (listId: string) => void;
  /** Inserts an empty row directly below the given task index. */
  insertTaskRowBelow: (listId: string, taskIndex: number) => void;
  /** Inserts an empty row directly above the given task index. */
  insertTaskRowAbove: (listId: string, taskIndex: number) => void;
  removeEmptyTaskRow: (listId: string, taskIndex: number) => void;
  completeTask: (listId: string, taskIndex: number) => void;
  reorderTask: (listId: string, fromIndex: number, toIndex: number) => void;
  moveTaskUp: (listId: string, taskIndex: number) => void;
  moveTaskDown: (listId: string, taskIndex: number) => void;
  restoreTaskFromHistory: (entryId: string) => void;
  /** Removes a single entry from the task history. */
  deleteTaskFromHistory: (entryId: string) => void;
  clearCanvas: () => void;
  clearTaskHistory: () => void;
};

export type TaskListActions = Pick<
  CanvasTasksContextType,
  | "bringListToFront"
  | "moveList"
  | "resizeList"
  | "requestDeleteList"
  | "setListTag"
  | "changeTask"
  | "addTaskRow"
  | "insertTaskRowBelow"
  | "insertTaskRowAbove"
  | "removeEmptyTaskRow"
  | "completeTask"
  | "reorderTask"
  | "moveTaskUp"
  | "moveTaskDown"
>;
