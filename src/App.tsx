import { GeneralTasks, TasksPageShell } from "src/components";
import { GeneralTasksContextProvider } from "src/contexts";

export default function App() {
  return (
    <GeneralTasksContextProvider>
      <TasksPageShell>
        <GeneralTasks />
      </TasksPageShell>
    </GeneralTasksContextProvider>
  );
}
