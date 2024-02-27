import { useEffect, useState } from "react";
import { useDailyTasksContext, useGeneralTasksContext } from "src/contexts";
import { HelpMenu, ModeSelector } from "src/components";
import { handleSetTheme, isDailyPage, isThemeSetToDark } from "src/utils";
import { Trash, Moon, CaretUp, Sun, Compass } from "src/icons";
import { useLocalStorage } from "src/hooks";

export function Header() {
  const { clearGeneralTasks, generalTasks } = useGeneralTasksContext();
  const { clearDailyTasks, dailyTasks } = useDailyTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());
  const [showHelpMenu, setShowHelpMenu] = useLocalStorage("showHelpMenu", true);

  const noGeneralTasks = generalTasks.filter(Boolean).length === 0;
  const noDailyTasks = dailyTasks.filter(Boolean).length === 0;

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
    <header className="fixed bottom-6 flex h-16 w-full items-center justify-center sm:top-0 sm:justify-between sm:px-6">
      <div className="hidden items-center gap-6 text-trueBlack sm:flex">
        <a
          href="/"
          className={`hidden cursor-pointer text-4xl font-bold text-trueBlack underline decoration-4 underline-offset-4 ${
            isDailyPage()
              ? "decoration-dailyGreen dark:decoration-dailyPurple"
              : "decoration-berryBlue dark:decoration-purpleRain"
          } transition-transform active:scale-95 dark:text-trueWhite md:flex`}
        >
          phived
        </a>
        <ModeSelector />
      </div>
      <nav className="flex h-full items-center justify-between gap-4 tiny:gap-10 sm:gap-6">
        {/* <button>
          <Compass size={24} className="text-trueBlack dark:text-trueWhite" />
        </button> */}
        <button
          onClick={toggleDarkMode}
          role="switch"
          className="flex cursor-pointer select-none flex-col items-center gap-1 rounded-2xl p-2 text-base text-trueBlack transition-transform active:scale-95 dark:text-trueWhite sm:flex-row sm:gap-3 sm:px-4 sm:py-2 sm:hover:outline sm:hover:outline-trueBlack dark:sm:hover:outline-trueWhite"
        >
          {isDarkMode ? (
            <>
              <Sun className="fill-trueWhite" />
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
          aria-disabled={
            (!isDailyPage() && noGeneralTasks) ||
            (isDailyPage() && noDailyTasks)
          }
          onClick={isDailyPage() ? clearDailyTasks : clearGeneralTasks}
          className={`${
            noGeneralTasks && noDailyTasks
              ? "cursor-not-allowed sm:hover:outline-unavailableLight dark:sm:hover:outline-unavailableDark"
              : "cursor-pointer sm:hover:outline-alertRed"
          } group flex select-none flex-col items-center gap-1 rounded-2xl p-2 transition-transform active:scale-95 sm:flex-row sm:gap-3 sm:px-4 sm:py-2 sm:hover:outline`}
          disabled={
            (!isDailyPage() && noGeneralTasks) ||
            (isDailyPage() && noDailyTasks)
          }
        >
          <Trash
            className={`fill-trueBlack dark:fill-trueWhite ${
              noGeneralTasks && noDailyTasks
                ? "fill-trueBlack/30 dark:fill-trueWhite/30"
                : "sm:group-hover:fill-alertRed"
            } `}
          />
          <span
            className={`${
              noGeneralTasks && noDailyTasks
                ? "text-trueBlack/40 dark:text-trueWhite/30"
                : "dark:text-trueWhite sm:group-hover:text-alertRed"
            } text-base`}
          >
            clear tasks
          </span>
        </button>
        <button
          aria-expanded={showHelpMenu}
          onClick={showHelpMenu ? closeHelpMenu : openHelpMenu}
          className="relative hidden cursor-pointer select-none flex-col items-center rounded-2xl p-2 hover:outline hover:outline-trueBlack active:scale-95 sm:flex-row sm:gap-3 sm:px-3 lg:flex"
        >
          <span
            className={`h-fit w-fit ${
              showHelpMenu ? "rotate-0" : "rotate-180"
            }`}
          >
            <CaretUp className="fill-trueBlack dark:fill-trueWhite" />
          </span>
          <p className="dark:text-trueWhite xs:text-base">help</p>
        </button>
        {showHelpMenu && <HelpMenu closeHelpMenu={closeHelpMenu} />}
      </nav>
    </header>
  );
}
