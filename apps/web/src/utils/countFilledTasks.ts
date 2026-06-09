import type { GeneralTasks } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";

export function countFilledTasks(tasks: GeneralTasks) {
  return tasks.filter((task) => task.trim() !== "").length;
}
