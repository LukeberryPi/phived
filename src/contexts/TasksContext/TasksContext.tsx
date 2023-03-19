import { createContext } from "react";
import { TasksContextTypes } from "./TasksContext.types";

export const initialState = {
  tasks: Array(5).fill("")
} as TasksContextTypes;

export const TasksContext = createContext(initialState);
