import { CanvasBoard, TasksPageShell, Toaster } from "src/components";
import { AuthProvider } from "src/auth/AuthContext";
import { CanvasTasksContextProvider, ThemeProvider } from "src/contexts";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CanvasTasksContextProvider>
          <TasksPageShell>
            <CanvasBoard />
          </TasksPageShell>
          <Toaster />
        </CanvasTasksContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
