import { useEffect, useState } from "react";
import { useTasksContext } from "src/contexts";
import { Logo, HelpMenu } from "src/components";
import { handleSetTheme, isThemeSetToDark } from "src/utils";
import {
  ClearTasksIcon,
  DarkModeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LightModeIcon,
  InstallIcon,
  OpenNewIcon,
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

  const handleInstallClick = () => {
    console.log("installed the app!");
  };

  const handleOpenClick = () => {
    console.log("opened the app!");
  };

  // the DOWNLOAD/OPEN BUTTON logic will be implemented considering:

  // if the user is using the WEB VERSION
  const isOnWeb = false;
  // until this issue is solved https://github.com/LukeberryPi/phived/issues/58, this boolean must be hardcoded to false,
  // so that INSTALL / OPEN BUTTON doesn't show up in prod with no functionality

  // if the user has INSTALLED the PWA VERSION
  const hasInstalledPwa = false;

  // if they are using the WEB VERSION and don't have the PWA installed, show INSTALL BUTTON
  const showInstallButton = isOnWeb && !hasInstalledPwa;

  // if they are using the WEB VERSION and have the PWA installed, show OPEN BUTTON
  const showOpenButton = isOnWeb && hasInstalledPwa;

  // if they are using the PWA version, no button will be shown (neither INSTALL nor OPEN)

  return (
    <header className="fixed bottom-2 flex h-16 w-full items-center justify-center sm:top-0 sm:justify-between sm:px-6">
      <Logo />
      <nav className="flex h-full items-center justify-between space-x-4 tiny:space-x-10 sm:space-x-6">
        <button
          onClick={toggleDarkMode}
          className="group flex cursor-pointer select-none flex-col items-center rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:bg-darkBlack sm:hover:ease-in-out dark:sm:hover:bg-lightWhite"
        >
          {isDarkMode && (
            <>
              <LightModeIcon className="fill-lightWhite sm:group-hover:fill-darkBlack" />
              <p className="text-sm text-darkerBlack dark:text-lighterWhite sm:text-lg sm:group-hover:text-lighterWhite dark:sm:group-hover:text-darkBlack">
                light mode
              </p>
            </>
          )}
          {!isDarkMode && (
            <>
              <DarkModeIcon className="fill-lightBlack sm:group-hover:fill-lightWhite" />
              <p className="text-sm text-darkBlack dark:text-lighterWhite sm:text-lg sm:group-hover:text-lightWhite dark:sm:group-hover:text-darkBlack">
                dark mode
              </p>
            </>
          )}
        </button>
        <button
          onClick={clearTasks}
          className={`${
            noTasks
              ? "cursor-not-allowed sm:hover:bg-unavailableLight dark:sm:hover:bg-unavailableDark"
              : "cursor-pointer sm:hover:bg-alertRed sm:hover:text-lighterWhite"
          } group flex select-none flex-col items-center rounded-2xl p-2 text-sm transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out`}
          disabled={noTasks}
        >
          <ClearTasksIcon
            className={`fill-darkBlack dark:fill-lightWhite ${
              noTasks
                ? "fill-darkBlack/30 dark:fill-lightWhite/30"
                : "sm:group-hover:fill-lightWhite"
            } `}
          />
          <p
            className={`text-sm ${
              noTasks
                ? "text-darkBlack/40 dark:text-lightWhite/30"
                : "text-darkBlack group-hover:text-lightWhite dark:text-lightWhite"
            } sm:text-lg`}
          >
            clear tasks
          </p>
        </button>
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="group flex select-none flex-col items-center gap-1 rounded-2xl p-2 text-xs transition-all sm:hidden sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out"
          >
            <InstallIcon className="fill-darkBlack dark:fill-lightWhite" />
            <p className="text-sm dark:text-lightWhite sm:text-lg">install app</p>
          </button>
        )}
        {showOpenButton && (
          <button
            onClick={handleOpenClick}
            className="group flex select-none flex-col items-center rounded-2xl p-2 text-xs transition-all sm:hidden sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out"
          >
            <OpenNewIcon className=" fill-darkBlack dark:fill-lightWhite" />
            <p className="text-sm dark:text-lightWhite sm:text-lg">open app</p>
          </button>
        )}
        <button
          onClick={toggleHelpMenu}
          className="group hidden cursor-pointer select-none flex-col items-center rounded-2xl p-2 text-xs transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:bg-berryBlue sm:hover:ease-in-out dark:sm:hover:bg-purpleRain lg:flex"
        >
          {showHelpMenu ? (
            <ArrowUpIcon className="stroke-darkBlack dark:stroke-lightWhite" />
          ) : (
            <ArrowDownIcon className="stroke-darkBlack dark:stroke-lightWhite" />
          )}
          <p className="text-sm dark:text-lightWhite sm:text-lg">help</p>
        </button>
        {showHelpMenu && <HelpMenu />}
      </nav>
    </header>
  );
}
