import { DailyTasks } from "src/components";
import { TasksPageShell } from "src/components/TasksPageShell";
import { DailyTasksContextProvider } from "src/contexts";

export function Daily() {
  return (
    <DailyTasksContextProvider>
      <TasksPageShell navigateToOnDoubleG="/">
        <DailyTasks />
      </TasksPageShell>
    </DailyTasksContextProvider>
  );
}
