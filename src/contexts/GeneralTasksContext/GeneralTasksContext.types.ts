import type { Dispatch, SetStateAction } from "react";

export type GeneralTask = string;

export type GeneralTasks = GeneralTask[];

export type GeneralTaskContextType = {
  generalTasks: GeneralTasks;
  message: string;
  setGeneralTasks: Dispatch<SetStateAction<GeneralTaskContextType["generalTasks"]>>;
  setMessage: Dispatch<SetStateAction<GeneralTaskContextType["message"]>>;
  displayMessage: (incentive: string) => void;
  completeGeneralTask: (index: number) => void;
  clearGeneralTasks: () => void;
  changeGeneralTask: (taskIndex: number, newValue: string) => void;
};
