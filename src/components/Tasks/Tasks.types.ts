import { Dispatch } from "react";

export type tasksProps = {
  tasks: string[];
  setTasks: Dispatch<string[]>;
};
