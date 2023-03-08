import { Dispatch } from "react";

export type TaskListProps = {
  taskList: string[];
  setTaskList: Dispatch<string[]>;
};

