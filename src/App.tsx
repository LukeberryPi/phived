import { GeneralTasks, TasksPageShell, Toaster } from "src/components";
import { GeneralTasksContextProvider } from "src/contexts";

export default function App() {
  return (
    <GeneralTasksContextProvider>
      <TasksPageShell>
        <GeneralTasks />
      </TasksPageShell>
      <Toaster />
    </GeneralTasksContextProvider>
  );
}
