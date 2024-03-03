import { createContext, useContext } from "react";
import type { DailyTaskContextType } from "src/contexts/DailyTasksContext/DailyTasksContext.types";

export const initialState = {
  dailyTasks: Array<string>(5).fill(""),
} as DailyTaskContextType;

export const DailyTasksContext = createContext(initialState);

export const useDailyTasksContext = () => useContext(DailyTasksContext);
