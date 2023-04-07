import type { Dispatch, SetStateAction } from "react";

export type Task = string;

export type Tasks = Task[];

export type TaskContextType = {
  tasks: Tasks;
  incentiveMessage: string;
  setTasks: Dispatch<SetStateAction<TaskContextType["tasks"]>>;
  setIncentiveMessage: Dispatch<SetStateAction<TaskContextType["incentiveMessage"]>>;
  displayIncentiveMessage: (incentive: string) => void;
  completeTask: (index: number) => void;
  clearTasks: () => void;
  changeTask: (taskIndex: number, newValue: Task) => void;
};
