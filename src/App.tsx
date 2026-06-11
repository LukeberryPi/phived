import { CanvasBoard, TasksPageShell, Toaster } from "src/components";
import { CanvasTasksContextProvider, ThemeProvider } from "src/contexts";

export default function App() {
  return (
    <ThemeProvider>
      <CanvasTasksContextProvider>
        <TasksPageShell>
          <CanvasBoard />
        </TasksPageShell>
        <Toaster />
      </CanvasTasksContextProvider>
    </ThemeProvider>
  );
}
