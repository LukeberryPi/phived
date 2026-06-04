import type { KeyboardEvent, PropsWithChildren } from "react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Footer, Header, Message, Head } from "src/components";

type TasksPageShellProps = PropsWithChildren<{
  navigateToOnDoubleG: string;
}>;

export function TasksPageShell({
  children,
  navigateToOnDoubleG,
}: TasksPageShellProps) {
  const navigate = useNavigate();
  const pressedKeys = useRef("");

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(document.activeElement instanceof HTMLElement)) {
      return;
    }

    if (event.key === "Escape") {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: globalThis.KeyboardEvent) => {
      const inputIsFocused = document.activeElement instanceof HTMLInputElement;

      if (event.key !== "g" || inputIsFocused) {
        return;
      }

      pressedKeys.current += "g";

      if (pressedKeys.current === "gg") {
        navigate(navigateToOnDoubleG);
        pressedKeys.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [navigate, navigateToOnDoubleG]);

  return (
    <div
      onKeyDown={handleKeyDown}
      className="flex h-full w-full flex-col items-center justify-center bg-gray-50 dark:bg-black"
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
