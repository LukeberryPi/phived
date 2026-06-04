import type { Dispatch, SetStateAction } from "react";
import type { TaskHistory } from "src/types/taskHistory";

export type GeneralTask = string;

export type GeneralTasks = GeneralTask[];

export type GeneralTaskContextType = {
  changeGeneralTask: (taskIndex: number, newValue: string) => void;
  clearGeneralTasks: () => void;
  completeGeneralTask: (taskIndex: number) => void;
  moveTaskUp: (taskIndex: number) => void;
  moveTaskDown: (taskIndex: number) => void;
  restoreTaskFromHistory: (entryId: string) => void;
  generalTasks: GeneralTasks;
  taskHistory: TaskHistory;
  setGeneralTasks: Dispatch<
    SetStateAction<GeneralTaskContextType["generalTasks"]>
  >;
};
