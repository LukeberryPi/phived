import type { Dispatch, SetStateAction } from "react";

export type GeneralTask = string;

export type GeneralTasks = GeneralTask[];

export type GeneralTaskContextType = {
  changeGeneralTask: (taskIndex: number, newValue: string) => void;
  clearGeneralTasks: () => void;
  completeGeneralTask: (taskIndex: number) => void;
  displayGeneralMessage: (incentive: string) => void;
  generalTasks: GeneralTasks;
  generalMessage: string;
  setGeneralTasks: Dispatch<
    SetStateAction<GeneralTaskContextType["generalTasks"]>
  >;
  setGeneralMessage: Dispatch<
    SetStateAction<GeneralTaskContextType["generalMessage"]>
  >;
};
