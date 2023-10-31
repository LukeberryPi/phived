import { createContext, useContext } from "react";
import type { GeneralTaskContextType } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";

export const initialState = {
  generalTasks: Array<string>(5).fill(""),
} as GeneralTaskContextType;

export const TasksContext = createContext(initialState);

export const useGeneralTasksContext = () => useContext(TasksContext);
