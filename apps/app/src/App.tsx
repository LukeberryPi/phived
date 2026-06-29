import { lazy, Suspense } from "react";
import { CanvasBoard, TasksPageShell, Toaster } from "src/components";
import { CanvasTasksContextProvider, ThemeProvider } from "src/contexts";

// Flag-gated, lazily-loaded so the auth/billing client only ships (and only
// loads) when VITE_SYNC_UI is enabled. With the flag off, the dynamic import is
// never executed, so the anonymous experience is unchanged (ADR 0004/0005).
const SyncAccount = lazy(() => import("src/auth/SyncAccount"));
const syncUiEnabled = import.meta.env.VITE_SYNC_UI === "true";

export default function App() {
  return (
    <ThemeProvider>
      <CanvasTasksContextProvider>
        <TasksPageShell>
          <CanvasBoard />
        </TasksPageShell>
        {syncUiEnabled ? (
          <Suspense fallback={null}>
            <SyncAccount />
          </Suspense>
        ) : null}
        <Toaster />
      </CanvasTasksContextProvider>
    </ThemeProvider>
  );
}
