export type TaskList = {
  id: string;
  tag: string;
  x: number;
  y: number;
  tasks: string[];
};

export type TaskLists = TaskList[];

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};
