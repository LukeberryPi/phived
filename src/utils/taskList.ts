import type { GeneralTasks } from "src/contexts/GeneralTasksContext/GeneralTasksContext.types";

export const MAX_ACTIVE_TASKS = 5;

export function createEmptyTasks(): GeneralTasks {
  return Array<string>(MAX_ACTIVE_TASKS).fill("");
}

export function findFirstEmptyTaskIndex(tasks: GeneralTasks) {
  return tasks.findIndex((task) => task.trim() === "");
}

export function canAddAnotherTask(tasks: GeneralTasks) {
  return tasks.some((task) => task.trim() === "");
}
