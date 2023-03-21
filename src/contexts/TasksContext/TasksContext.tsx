import { createContext, useContext } from "react";
import { TaskContextType } from "./TasksContext.types";

export const initialState = {
  tasks: Array<string>(5).fill("")
} as TaskContextType;

export const TasksContext = createContext(initialState);

export const useTasksContext = () => useContext(TasksContext);