import { createContext, useContext } from "react";
import type { GeneralTaskContextType } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";
import { createEmptyTasks } from "src/utils/taskList";

export const initialState = {
  generalTasks: createEmptyTasks(),
} as GeneralTaskContextType;

export const GeneralTasksContext = createContext(initialState);

export const useGeneralTasksContext = () => useContext(GeneralTasksContext);
