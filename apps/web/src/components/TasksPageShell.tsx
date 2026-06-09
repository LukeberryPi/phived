import type { KeyboardEvent, PropsWithChildren } from "react";
import { HelmetProvider } from "react-helmet-async";
import {
  Header,
  Head,
  HelpDrawer,
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
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        "dark:bg-canvas bg-gray-50"
      )}
    >
      <HelmetProvider>
        <Head />
      </HelmetProvider>
      <Header />
      {children}
      <HelpDrawer />
      <TaskHistoryDrawer />
      <MobileActionBar />
    </div>
  );
}
