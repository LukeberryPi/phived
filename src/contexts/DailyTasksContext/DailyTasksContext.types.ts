import type { Dispatch, SetStateAction } from "react";

export type DailyTask = string;

export type DailyTasks = DailyTask[];

export type DailyTaskContextType = {
  dailyTasks: DailyTasks;
  message: string;
  setDailyTasks: Dispatch<SetStateAction<DailyTaskContextType["dailyTasks"]>>;
  setMessage: Dispatch<SetStateAction<DailyTaskContextType["message"]>>;
  displayMessage: (incentive: string) => void;
  completeDailyTask: (index: number) => void;
  clearDailyTasks: () => void;
  changeDailyTask: (taskIndex: number, newValue: string) => void;
};
