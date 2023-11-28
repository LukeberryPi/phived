import type { Dispatch, SetStateAction } from "react";

export type DailyTask = string;

export type DailyTasks = DailyTask[];

export type DailyTaskLastDoneAt = {
  dailyTask: string;
  dateCompleted: Date;
};

export type DailyTasksLastDoneAt = DailyTaskLastDoneAt[];

export type DailyTaskContextType = {
  changeDailyTask: (taskIndex: number, newValue: string) => void;
  clearDailyTasks: () => void;
  completeDailyTask: (taskIndex: number) => void;
  dailyTasks: DailyTasks;
  dailyTasksLastDoneAt: DailyTasksLastDoneAt;
  displayMessage: (incentive: string) => void;
  message: string;
  setDailyTasks: Dispatch<SetStateAction<DailyTaskContextType["dailyTasks"]>>;
  setDailyTasksLastDoneAt: Dispatch<
    SetStateAction<DailyTaskContextType["dailyTasksLastDoneAt"]>
  >;
  setMessage: Dispatch<SetStateAction<DailyTaskContextType["message"]>>;
};
