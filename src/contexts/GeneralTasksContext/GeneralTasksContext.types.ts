import type { Dispatch, SetStateAction } from "react";

export type GeneralTask = string;

export type GeneralTasks = GeneralTask[];

export type GeneralTaskContextType = {
  changeGeneralTask: (taskIndex: number, newValue: string) => void;
  clearGeneralTasks: () => void;
  completeGeneralTask: (taskIndex: number) => void;
  displayMessage: (incentive: string) => void;
  generalTasks: GeneralTasks;
  message: string;
  setGeneralTasks: Dispatch<SetStateAction<GeneralTaskContextType["generalTasks"]>>;
  setMessage: Dispatch<SetStateAction<GeneralTaskContextType["message"]>>;
};
