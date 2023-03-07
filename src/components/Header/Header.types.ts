import { Dispatch } from "react";

type Button = {
  info?: string;
};

export type HeaderProps = {
  content: Button[];
  darkMode: boolean;
  setDarkMode: Dispatch<boolean>;
};
