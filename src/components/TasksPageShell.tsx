import type { KeyboardEvent, PropsWithChildren } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Footer, Header, Message, Head } from "src/components";
import { cn } from "src/utils";

type TasksPageShellProps = PropsWithChildren;

export function TasksPageShell({ children }: TasksPageShellProps) {
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
        "bg-gray-50 dark:bg-black"
      )}
    >
      <HelmetProvider>
        <Head />
      </HelmetProvider>
      <Header />
      {children}
      <Message />
      <Footer />
    </div>
  );
}
