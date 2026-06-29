import type { Task } from "src/types/canvas";

export function countFilledTasks(tasks: Task[]) {
  return tasks.filter((task) => task.text.trim() !== "").length;
}
