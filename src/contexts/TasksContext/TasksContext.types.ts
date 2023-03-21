import type { Dispatch, SetStateAction } from "react";

export type Task = string;

export type Tasks = Task[];

export type TaskContextType = {
  tasks: Tasks;
  setTasks: Dispatch<SetStateAction<TaskContextType["tasks"]>>;
  completeTask: (index: number) => void;
  clearTasks: () => void;
  changeTask: (taskIndex: number, newValue: Task) => void;
};
