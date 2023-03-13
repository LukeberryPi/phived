type Button = {
  info: string;
};

export type HeaderProps = {
  content: Button[];
  clearTasks: () => void;
};
