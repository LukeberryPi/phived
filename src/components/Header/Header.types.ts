import { Dispatch } from "react";

type Button = {
  info?: string;
};

export type HeaderProps = {
  content: Button[];
  clearTasks: () => void;
  darkMode: boolean;
  setDarkMode: Dispatch<boolean>;
};
