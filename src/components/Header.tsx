import { useEffect, useState } from "react";
import { useTasksContext } from "src/contexts";
import { Logo } from "src/components/Logo";
import { handleSetTheme, isThemeSetToDark } from "src/utils";
import { DarkModeIcon, LightModeIcon } from "src/icons";

export function Header() {
  const { clearTasks, tasks } = useTasksContext();
  const [isDarkMode, setIsDarkMode] = useState(isThemeSetToDark());

  const noTasks = tasks.filter(Boolean).length === 0;

  useEffect(() => {
    handleSetTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((currentDarkMode) => !currentDarkMode);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center sm:justify-between sm:px-6">
      <Logo />
      <nav className="flex h-full w-72 items-center justify-between xs:w-80 sm:w-96">
        <div className="group flex select-none items-center gap-2 rounded-2xl py-2 px-3 transition duration-100 hover:bg-darkBlack hover:ease-in-out dark:hover:bg-lightWhite sm:px-4">
          {isDarkMode ? <LightModeIcon className="" /> : <DarkModeIcon />}
          <button
            onClick={toggleDarkMode}
            className="xs:text-lgtext-darkerBlack text-base font-medium hover:text-lighterWhite dark:text-lighterWhite dark:hover:text-darkBlack"
          >
            {isDarkMode ? "light" : "dark"} mode
          </button>
        </div>
        <button
          onClick={clearTasks}
          className={`${
            noTasks
              ? "cursor-not-allowed"
              : "cursor-pointer hover:bg-alertRed hover:text-lighterWhite"
          }  h-10 select-none rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:ease-in-out dark:text-lightWhite xs:text-lg sm:px-4`}
          disabled={noTasks}
        >
          clear tasks
        </button>
        <div className="flex justify-center">
          <button
            disabled
            className="peer h-10 select-none rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-berryBlue hover:ease-in-out dark:text-lighterWhite dark:hover:bg-purpleRain xs:text-lg sm:px-4"
          >
            help
          </button>
          <span className="absolute top-14 hidden translate-x-1 text-sm peer-hover:block dark:text-lightWhite">
            coming
            <br />
            soon 🚧
          </span>
        </div>
      </nav>
    </header>
  );
}
