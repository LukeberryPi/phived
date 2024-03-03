import { useEffect, useRef } from "react";
import { HelmetProvider } from "react-helmet-async";
import {
  Footer,
  Header,
  Message,
  GeneralTasks,
  Head,
  ModeSelectorMobile,
} from "src/components";
import { GeneralTasksContextProvider } from "src/contexts";

export function Home() {
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
        window.location.href = "/daily";
        pressedKeys.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <GeneralTasksContextProvider>
      <div
        onKeyDown={handleKeyDown}
        className="flex h-full w-full flex-col items-center justify-center bg-softWhite dark:bg-trueBlack"
      >
        <HelmetProvider>
          <Head />
        </HelmetProvider>
        <ModeSelectorMobile />
        <Header />
        <GeneralTasks />
        <Message />
        <Footer />
      </div>
    </GeneralTasksContextProvider>
  );
}
