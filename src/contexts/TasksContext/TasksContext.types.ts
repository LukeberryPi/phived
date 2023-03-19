import { Dispatch, SetStateAction } from "react";

export type Task = string;

export type Tasks = [Task, Task, Task, Task, Task];

export type TasksContextTypes = {
  tasks: Tasks;
  setTasks: Dispatch<SetStateAction<TasksContextTypes['tasks']>>;
  resetTasks: (index?: number) => void;
  changeTask: (taskIndex: number, newValue: Task) => void;
}
