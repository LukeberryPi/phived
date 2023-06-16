import { useEffect, useState } from "react";
import { useTasksContext } from "src/contexts";
import { Logo, HelpMenu } from "src/components";
import { handleSetTheme, isThemeSetToDark } from "src/utils";
import { Trash, Moon, ArrowDown, Sun, Install, Open } from "src/icons";
import { useLocalStorage } from "src/hooks";

export function Header() {
  const { clearTasks, tasks } = useTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());
  const [showHelpMenu, setShowHelpMenu] = useLocalStorage("showHelpMenu", true);

  const noTasks = tasks.filter(Boolean).length === 0;

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

  const handleInstallClick = () => {
    console.log("installed the app!");
  };

  const handleOpenClick = () => {
    console.log("opened the app!");
  };

  // the DOWNLOAD/OPEN BUTTON logic will be implemented considering:

  // if the user is using the WEB VERSION
  const isOnWeb = true;
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
    <header className="fixed bottom-0 flex h-16 w-full items-center justify-center sm:top-0 sm:justify-between sm:px-6">
      <div className="hidden items-center gap-8 text-softBlack sm:flex">
        <Logo />
      </div>
      <nav className="flex h-full items-center justify-between space-x-4 tiny:space-x-10 sm:space-x-6">
        <button
          onClick={toggleDarkMode}
          role="switch"
          className="group flex cursor-pointer select-none flex-col items-center gap-1 rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:bg-softBlack sm:hover:ease-in-out dark:sm:hover:bg-trueWhite"
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
          onClick={clearTasks}
          className={`${
            noTasks
              ? "cursor-not-allowed sm:hover:bg-unavailableLight dark:sm:hover:bg-unavailableDark"
              : "cursor-pointer sm:hover:bg-alertRed sm:hover:text-softWhite"
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
                : "text-softBlack group-hover:text-softWhite dark:text-softWhite"
            } text-sm xs:text-lg`}
          >
            clear tasks
          </p>
        </button>
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="group flex select-none flex-col items-center gap-1 rounded-2xl p-2 transition-all sm:hidden sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out"
          >
            <Install className="fill-softBlack dark:fill-softWhite" />
            <p className="text-sm dark:text-softWhite xs:text-lg">install app</p>
          </button>
        )}
        {showOpenButton && (
          <button
            onClick={handleOpenClick}
            className="group flex select-none flex-col items-center gap-1 rounded-2xl p-2 transition-all sm:hidden sm:flex-row sm:gap-3 sm:px-3 sm:hover:ease-in-out"
          >
            <Open className="fill-softBlack dark:fill-softWhite" />
            <p className="text-sm text-softBlack dark:text-softWhite xs:text-lg">open app</p>
          </button>
        )}
        <button
          onClick={showHelpMenu ? closeHelpMenu : openHelpMenu}
          className={`group ${
            showHelpMenu && "bg-berryBlue dark:bg-purpleRain"
          } hidden cursor-pointer select-none flex-col items-center rounded-2xl p-2 transition-all sm:flex-row sm:gap-3 sm:px-3 sm:hover:bg-berryBlue sm:hover:ease-in-out dark:sm:hover:bg-purpleRain lg:flex`}
        >
          <span
            className={`h-fit w-fit ${showHelpMenu ? "rotate-0" : "rotate-180"} transition-all`}
          >
            <ArrowDown className="fill-softBlack dark:fill-softWhite" />
          </span>
          <p className="dark:text-softWhite xs:text-lg">help</p>
        </button>
        {showHelpMenu && <HelpMenu onCloseClick={closeHelpMenu} />}
      </nav>
    </header>
  );
}
