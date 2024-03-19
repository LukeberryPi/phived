import { useEffect, useRef } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Footer, Header, Message, DailyTasks, Head } from "src/components";
import { DailyTasksContextProvider } from "src/contexts";

export function Daily() {
  const pressedKeys = useRef("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(document.activeElement instanceof HTMLElement)) {
      return;
    }

    if (e.key === "Escape") {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const inputIsFocused = document.activeElement instanceof HTMLInputElement;

      if (event.key !== "g" || inputIsFocused) {
        return;
      }

      pressedKeys.current += "g";

      if (pressedKeys.current === "gg") {
        window.location.href = "/";
        pressedKeys.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <DailyTasksContextProvider>
      <div
        onKeyDown={handleKeyDown}
        className="flex h-full w-full flex-col items-center justify-center bg-softWhite dark:bg-black"
      >
        <HelmetProvider>
          <Head />
        </HelmetProvider>
        <Header />
        <DailyTasks />
        <Message />
        <Footer />
      </div>
    </DailyTasksContextProvider>
  );
}
