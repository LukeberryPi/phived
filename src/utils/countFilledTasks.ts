export function countFilledTasks(tasks: string[]) {
  return tasks.filter((task) => task.trim() !== "").length;
}
