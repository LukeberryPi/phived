import { GeneralTasks, TasksPageShell, Toaster } from "src/components";
import { GeneralTasksContextProvider, ThemeProvider } from "src/contexts";

export default function App() {
  return (
    <ThemeProvider>
      <GeneralTasksContextProvider>
        <TasksPageShell>
          <GeneralTasks />
        </TasksPageShell>
        <Toaster />
      </GeneralTasksContextProvider>
    </ThemeProvider>
  );
}
