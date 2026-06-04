import type { GeneralTasks } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";

export const MAX_ACTIVE_TASKS = 5;

export function countActiveTasks(tasks: GeneralTasks) {
  return tasks.filter((task) => task.trim() !== "").length;
}

export function findFirstEmptyTaskIndex(tasks: GeneralTasks) {
  return tasks.findIndex((task) => task.trim() === "");
}

export function canAddAnotherTask(tasks: GeneralTasks) {
  return countActiveTasks(tasks) < MAX_ACTIVE_TASKS;
}
