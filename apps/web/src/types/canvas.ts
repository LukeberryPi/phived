export type TaskList = {
  id: string;
  tag: string;
  x: number;
  y: number;
  /** Custom width in canvas px; lists without one use the default width. */
  width?: number;
  tasks: string[];
};

export type TaskLists = TaskList[];

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};
