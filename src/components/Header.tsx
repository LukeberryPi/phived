import { useEffect, useState } from "react";
import { useTasksContext } from "src/contexts";
import { Logo } from "src/components/Logo";
import { handleSetTheme, isThemeSetToDark } from "src/utils";
import { ClearTasksIcon, DarkModeIcon, HelpIcon, LightModeIcon } from "src/icons";

export function Header() {
  const { clearTasks, tasks } = useTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  const noTasks = tasks.filter(Boolean).length === 0;

  useEffect(() => {
    handleSetTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((currentDarkMode) => !currentDarkMode);
  };

  const toggleHelpMenu = () => {
    setIsHelpMenuOpen((currentMenuState) => !currentMenuState);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center sm:justify-between sm:px-6">
      <Logo />
      <nav className="flex h-full items-center justify-between space-x-6">
        <button
          onClick={toggleDarkMode}
          className="group flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-2 transition duration-100 hover:bg-darkBlack hover:ease-in-out dark:hover:bg-lightWhite"
        >
          {isDarkMode ? (
            <>
              <LightModeIcon className="fill-lightWhite group-hover:fill-darkBlack" />
              <p className="text-base font-medium text-darkerBlack group-hover:text-lighterWhite dark:text-lighterWhite dark:group-hover:text-darkBlack xs:text-lg">
                light mode
              </p>
            </>
          ) : (
            <>
              <DarkModeIcon className="fill-lightBlack group-hover:fill-lightWhite" />
              <p className="text-base font-medium text-darkBlack group-hover:text-lightWhite dark:text-lighterWhite dark:group-hover:text-darkBlack xs:text-lg">
                dark mode
              </p>
            </>
          )}
        </button>
        <button
          onClick={clearTasks}
          className={`${
            noTasks
              ? "cursor-not-allowed hover:bg-greyLight/60 focus:translate-x-2 focus:outline-none dark:hover:bg-greyDark/40"
              : "cursor-pointer hover:bg-alertRed hover:text-lighterWhite"
          } group flex select-none items-center gap-3 rounded-2xl px-3 py-2 transition duration-100 hover:ease-in-out sm:px-4`}
          disabled={noTasks}
        >
          <ClearTasksIcon
            className={`fill-darkBlack dark:fill-lightWhite ${
              noTasks ? "dark:group-hover:fill-lightWhite" : "group-hover:fill-lightWhite"
            } `}
          />
          <p className="text-base font-medium dark:text-lightWhite xs:text-lg">clear tasks</p>
        </button>
        <button
          onClick={toggleHelpMenu}
          className="group flex select-none items-center gap-3 rounded-full px-3 py-2 hover:bg-berryBlue hover:ease-in-out dark:hover:bg-purpleRain"
        >
          <HelpIcon className="fill-darkBlack transition duration-100 dark:fill-lightWhite" />
          <p className="text-base font-medium dark:text-lightWhite xs:text-lg">help</p>
        </button>
      </nav>
    </header>
  );
}
