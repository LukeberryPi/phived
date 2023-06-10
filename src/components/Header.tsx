import { useEffect, useState } from "react";
import { useTasksContext } from "src/contexts";
import { Logo, HelpMenu } from "src/components";
import { handleSetTheme, isThemeSetToDark, takeScreenshot } from "src/utils";
import {
  ClearTasksIcon,
  DarkModeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LightModeIcon,
  ScreenshotIcon,
} from "src/icons";

export function Header() {
  const { clearTasks, tasks } = useTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const noTasks = tasks.filter(Boolean).length === 0;

  useEffect(() => {
    handleSetTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((currentDarkMode) => !currentDarkMode);
  };

  const toggleHelpMenu = () => {
    setShowHelpMenu((currentMenuState) => !currentMenuState);
  };

  const handleTakeScreenshot = async () => {
    const element = document.getElementById("tasks-list");
    if (!element) return;
    takeScreenshot(element);
  };

  return (
    <header className="fixed bottom-4 flex h-16 w-full items-center justify-center sm:top-0 sm:justify-between sm:px-6">
      <Logo />
      <nav className="flex h-full items-center justify-between space-x-2 xs:space-x-10 sm:space-x-6">
        <button
          onClick={handleTakeScreenshot}
          className="group hidden cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-twitterBlue hover:ease-in-out dark:hover:bg-twitterBlue lg:flex"
        >
          <ScreenshotIcon className="fill-darkBlack dark:fill-lightWhite" />
          <p className="text-base font-medium text-darkBlack group-hover:text-darkBlack dark:text-lightWhite dark:group-hover:text-lightWhite xs:text-lg">
            screenshot
          </p>
        </button>
        <button
          onClick={toggleDarkMode}
          className="group flex cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-darkBlack hover:ease-in-out dark:hover:bg-lightWhite"
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
              ? "cursor-not-allowed hover:bg-unavailableLight dark:hover:bg-unavailableDark"
              : "cursor-pointer hover:bg-alertRed hover:text-lighterWhite"
          } group flex select-none items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:ease-in-out`}
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
          className="group hidden cursor-pointer select-none items-center gap-3 rounded-2xl px-3 py-2 transition-all hover:bg-berryBlue hover:ease-in-out dark:hover:bg-purpleRain lg:flex"
        >
          {showHelpMenu ? (
            <ArrowUpIcon className="fill-darkBlack dark:fill-lightWhite" />
          ) : (
            <ArrowDownIcon className="fill-darkBlack dark:fill-lightWhite" />
          )}
          <p className="text-base font-medium dark:text-lightWhite xs:text-lg">help</p>
        </button>
        {showHelpMenu && <HelpMenu />}
      </nav>
    </header>
  );
}
