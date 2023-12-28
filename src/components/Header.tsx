import { useEffect, useState } from "react";
import { useDailyTasksContext, useGeneralTasksContext } from "src/contexts";
import { HelpMenu, ModeSelector } from "src/components";
import { handleSetTheme, isDailyPage, isThemeSetToDark } from "src/utils";
import { Trash, Moon, CaretUp, Sun } from "src/icons";
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
    <header className="fixed bottom-0 flex h-16 w-full items-center justify-center sm:top-0 sm:justify-between sm:px-6">
      <div className="hidden items-center gap-8 text-trueBlack sm:flex">
        <a
          href="/"
          className="hidden cursor-pointer text-4xl font-bold text-trueBlack transition-transform active:scale-95 dark:text-trueWhite md:flex"
        >
          phived
        </a>
        <ModeSelector />
      </div>
      <nav className="flex h-full items-center justify-between space-x-4 tiny:space-x-10 sm:space-x-6">
        <button
          onClick={toggleDarkMode}
          role="switch"
          className="group flex cursor-pointer select-none flex-col items-center gap-1 rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:bg-trueBlack sm:hover:ease-in-out dark:sm:hover:bg-trueWhite"
        >
          {isDarkMode && (
            <>
              <Sun className="fill-trueWhite sm:group-hover:fill-trueBlack" />
              <p className="text-sm text-trueBlack dark:text-trueWhite xs:text-lg sm:group-hover:text-trueWhite dark:sm:group-hover:text-trueBlack">
                light mode
              </p>
            </>
          )}
          {!isDarkMode && (
            <>
              <Moon className="fill-lightBlack sm:group-hover:fill-trueWhite" />
              <p className="text-sm text-trueBlack dark:text-trueWhite xs:text-lg sm:group-hover:text-trueWhite dark:sm:group-hover:text-trueBlack">
                dark mode
              </p>
            </>
          )}
        </button>
        <button
          onClick={isDailyPage() ? clearDailyTasks : clearGeneralTasks}
          className={`${
            noGeneralTasks && noDailyTasks
              ? "cursor-not-allowed sm:hover:bg-unavailableLight dark:sm:hover:bg-unavailableDark"
              : "cursor-pointer sm:hover:bg-alertRed"
          } group flex select-none flex-col items-center gap-1 rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out`}
          disabled={
            (!isDailyPage() && noGeneralTasks) ||
            (isDailyPage() && noDailyTasks)
          }
        >
          <Trash
            className={`fill-trueBlack dark:fill-trueWhite ${
              noGeneralTasks && noDailyTasks
                ? "fill-trueBlack/30 dark:fill-trueWhite/30"
                : "sm:group-hover:fill-trueWhite"
            } `}
          />
          <p
            className={`${
              noGeneralTasks && noDailyTasks
                ? "text-trueBlack/40 dark:text-trueWhite/30"
                : "text-trueBlack dark:text-trueWhite sm:group-hover:text-trueWhite"
            } text-sm xs:text-lg`}
          >
            clear tasks
          </p>
        </button>
        <button
          aria-expanded={showHelpMenu}
          onClick={showHelpMenu ? closeHelpMenu : openHelpMenu}
          className="group relative hidden cursor-pointer select-none flex-col items-center rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out lg:flex"
        >
          <span
            className={`h-fit w-fit ${
              showHelpMenu ? "rotate-0" : "rotate-180"
            } transition-all`}
          >
            <CaretUp className="fill-trueBlack dark:fill-trueWhite" />
          </span>
          <p className="dark:text-trueWhite xs:text-lg">help</p>
        </button>
        {showHelpMenu && <HelpMenu closeHelpMenu={closeHelpMenu} />}
      </nav>
    </header>
  );
}
