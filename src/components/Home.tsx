import { GeneralTasks } from "src/components";
import { TasksPageShell } from "src/components/TasksPageShell";
import { GeneralTasksContextProvider } from "src/contexts";

export function Home() {
  return (
    <GeneralTasksContextProvider>
      <TasksPageShell navigateToOnDoubleG="/daily">
        <GeneralTasks />
      </TasksPageShell>
    </GeneralTasksContextProvider>
  );
}
