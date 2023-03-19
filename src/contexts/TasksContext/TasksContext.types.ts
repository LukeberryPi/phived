import { Dispatch, SetStateAction } from "react";

export type Task = string;

export type Tasks = [Task, Task, Task, Task, Task];

export type TasksContextTypes = {
  tasks: Tasks;
  setTasks: Dispatch<SetStateAction<TasksContextTypes["tasks"]>>;
  completeTask: (index: number) => void;
  clearTasks: () => void;
  changeTask: (taskIndex: number, newValue: Task) => void;
};
