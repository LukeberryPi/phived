import { useEffect, useState } from "react";
import { HelpMenu } from "src/components";
import { useGeneralTasksContext } from "src/contexts";
import { useLocalStorage } from "src/hooks";
import { Trash, Moon, CaretUp, Sun } from "src/icons";
import { cn, handleSetTheme, isThemeSetToDark } from "src/utils";

export function Header() {
  const { clearGeneralTasks, generalTasks } = useGeneralTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());
  const [showHelpMenu, setShowHelpMenu] = useLocalStorage("showHelpMenu", true);

  const noGeneralTasks = generalTasks.filter(Boolean).length === 0;

  useEffect(() => {
    handleSetTheme(isDarkMode);
  }, [isDarkMode, noGeneralTasks]);

  const toggleDarkMode = () => {
    setIsDarkMode((currentDarkMode) => !currentDarkMode);
  };

  const openHelpMenu = () => {
    setShowHelpMenu(true);
  };

  const closeHelpMenu = () => {
    setShowHelpMenu(false);
  };

  return (
    <header
      className={cn(
        "fixed bottom-6 flex h-16 w-full items-center justify-center",
        "sm:top-0 sm:justify-between sm:px-6"
      )}
    >
      <a
        href="/"
        className={cn(
          "hidden text-4xl font-bold text-black underline underline-offset-4",
          "decoration-sky-300 transition-transform active:scale-95",
          "dark:text-white dark:decoration-cyan-800 md:flex"
        )}
      >
        phived
      </a>
      <nav
        className={cn(
          "flex h-full items-center justify-between gap-4",
          "tiny:gap-10 sm:gap-6"
        )}
      >
        <button
          onClick={toggleDarkMode}
          role="switch"
          className={cn(
            "flex select-none flex-col items-center gap-1 rounded-2xl p-2",
            "text-base text-black transition-transform active:scale-95",
            "dark:text-white sm:flex-row sm:gap-3 sm:px-4 sm:py-2",
            "sm:hover:ring-2 sm:hover:ring-black dark:sm:hover:ring-white"
          )}
        >
          {isDarkMode ? (
            <>
              <Sun className="fill-white" />
              <span>light mode</span>
            </>
          ) : (
            <>
              <Moon />
              <span>dark mode</span>
            </>
          )}
        </button>
        <button
          aria-disabled={noGeneralTasks}
          onClick={clearGeneralTasks}
          disabled={noGeneralTasks}
          className={cn(
            "group flex select-none flex-col items-center gap-1 rounded-2xl p-2",
            "transition-transform active:scale-95 sm:flex-row sm:gap-3 sm:px-4 sm:py-2",
            "sm:hover:ring-2",
            noGeneralTasks
              ? "cursor-not-allowed sm:hover:ring-zinc-200 dark:sm:hover:ring-zinc-800"
              : "sm:hover:ring-red-400"
          )}
        >
          <Trash
            className={cn(
              "fill-black dark:fill-white",
              noGeneralTasks
                ? "fill-black/30 dark:fill-white/30"
                : "sm:group-hover:fill-red-400"
            )}
          />
          <span
            className={cn(
              "text-base",
              noGeneralTasks
                ? "text-black/40 dark:text-white/30"
                : "dark:text-white sm:group-hover:text-red-400"
            )}
          >
            clear tasks
          </span>
        </button>
        <button
          aria-expanded={showHelpMenu}
          onClick={showHelpMenu ? closeHelpMenu : openHelpMenu}
          className={cn(
            "relative hidden select-none flex-col items-center rounded-2xl p-2",
            "hover:ring-2 hover:ring-black active:scale-95",
            "dark:hover:ring-white sm:flex-row sm:gap-3 sm:px-3 lg:flex"
          )}
        >
          <span
            className={cn(
              "h-fit w-fit",
              showHelpMenu ? "rotate-0" : "rotate-180"
            )}
          >
            <CaretUp className="fill-black dark:fill-white" />
          </span>
          <p className="dark:text-white xs:text-base">help</p>
        </button>
        {showHelpMenu && <HelpMenu closeHelpMenu={closeHelpMenu} />}
      </nav>
    </header>
  );
}
