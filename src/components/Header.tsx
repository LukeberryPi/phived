import { useEffect, useState } from "react";
import { useGeneralTasksContext } from "src/contexts";
import { Logo, HelpMenu, ModeSelector } from "src/components";
import { handleSetTheme, isThemeSetToDark } from "src/utils";
import { Trash, Moon, ArrowUp, Sun } from "src/icons";
import { useLocalStorage } from "src/hooks";

export function Header() {
  const { clearGeneralTasks, generalTasks } = useGeneralTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());
  const [showHelpMenu, setShowHelpMenu] = useLocalStorage("showHelpMenu", true);

  const noTasks = generalTasks.filter(Boolean).length === 0;

  useEffect(() => {
    handleSetTheme(isDarkMode);
  }, [isDarkMode]);

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
      <div className="hidden items-center gap-8 text-softBlack sm:flex">
        <Logo />
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
              <Sun className="fill-softWhite sm:group-hover:fill-softBlack" />
              <p className="text-sm text-softBlack dark:text-softWhite xs:text-lg sm:group-hover:text-softWhite dark:sm:group-hover:text-softBlack">
                light mode
              </p>
            </>
          )}
          {!isDarkMode && (
            <>
              <Moon className="fill-lightBlack sm:group-hover:fill-softWhite" />
              <p className="text-sm text-softBlack dark:text-softWhite xs:text-lg sm:group-hover:text-softWhite dark:sm:group-hover:text-softBlack">
                dark mode
              </p>
            </>
          )}
        </button>
        <button
          onClick={clearGeneralTasks}
          className={`${
            noTasks
              ? "cursor-not-allowed sm:hover:bg-unavailableLight dark:sm:hover:bg-unavailableDark"
              : "cursor-pointer sm:hover:bg-alertRed"
          } group flex select-none flex-col items-center gap-1 rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out`}
          disabled={noTasks}
        >
          <Trash
            className={`fill-softBlack dark:fill-softWhite ${
              noTasks ? "fill-softBlack/30 dark:fill-softWhite/30" : "sm:group-hover:fill-softWhite"
            } `}
          />
          <p
            className={`${
              noTasks
                ? "text-softBlack/40 dark:text-softWhite/30"
                : "text-softBlack dark:text-softWhite sm:group-hover:text-softWhite"
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
            className={`h-fit w-fit ${showHelpMenu ? "rotate-0" : "rotate-180"} transition-all`}
          >
            <ArrowUp className="fill-softBlack dark:fill-softWhite" />
          </span>
          <p className="dark:text-softWhite xs:text-lg">help</p>
        </button>
        {showHelpMenu && <HelpMenu closeHelpMenu={closeHelpMenu} />}
      </nav>
    </header>
  );
}
