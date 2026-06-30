import type { KeyboardEvent, PropsWithChildren } from "react";
import {
  Header,
  Head,
  MobileActionBar,
  TaskHistoryDrawer,
} from "src/components";
import { cn } from "src/utils";

export function TasksPageShell({ children }: PropsWithChildren) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(document.activeElement instanceof HTMLElement)) {
      return;
    }

    if (event.key === "Escape") {
      document.activeElement.blur();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className={cn("h-full w-full", "dark:bg-canvas-dark bg-canvas-light")}
    >
      <Head />
      {children}
      <Header />
      <TaskHistoryDrawer />
      <MobileActionBar />
    </div>
  );
}
