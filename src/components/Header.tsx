import { useEffect, useState } from "react";
import { useDailyTasksContext, useGeneralTasksContext } from "src/contexts";
import { HelpMenu, ModeSelector } from "src/components";
import { handleSetTheme, isDailyPage, isThemeSetToDark } from "src/utils";
import { Trash, Moon, CaretUp, Sun, Switch } from "src/icons";
import { useLocalStorage } from "src/hooks";
import { Link } from "react-router-dom";

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
      <div className="hidden items-center gap-6 text-black sm:flex">
        <a
          href="/"
          className={`hidden text-4xl font-bold text-black underline underline-offset-4 ${
            isDailyPage()
              ? "decoration-teal-300 dark:decoration-dailyPurple"
              : "decoration-sky-300 dark:decoration-purpleRain"
          } transition-transform active:scale-95 dark:text-trueWhite md:flex`}
        >
          phived
        </a>
        <ModeSelector />
      </div>
      <nav className="flex h-full items-center justify-between gap-4 tiny:gap-10 sm:gap-6">
        {/* <button>
          <Compass size={24} className="text-black dark:text-trueWhite" />
        </button> */}
        <button
          onClick={toggleDarkMode}
          role="switch"
          className="flex select-none flex-col items-center gap-1 rounded-2xl p-2 text-base text-black transition-transform active:scale-95 dark:text-trueWhite sm:flex-row sm:gap-3 sm:px-4 sm:py-2 sm:hover:ring-2 sm:hover:ring-black dark:sm:hover:ring-trueWhite"
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
              ? "cursor-not-allowed sm:hover:ring-zinc-200 dark:sm:hover:ring-zinc-800"
              : "sm:hover:ring-red-500"
          } group flex select-none flex-col items-center gap-1 rounded-2xl p-2 transition-transform active:scale-95 sm:flex-row sm:gap-3 sm:px-4 sm:py-2 sm:hover:ring-2`}
          disabled={
            (!isDailyPage() && noGeneralTasks) ||
            (isDailyPage() && noDailyTasks)
          }
        >
          <Trash
            className={`fill-black dark:fill-trueWhite ${
              noGeneralTasks && noDailyTasks
                ? "fill-black/30 dark:fill-trueWhite/30"
                : "sm:group-hover:fill-red-500"
            } `}
          />
          <span
            className={`${
              noGeneralTasks && noDailyTasks
                ? "text-black/40 dark:text-trueWhite/30"
                : "dark:text-trueWhite sm:group-hover:text-red-500"
            } text-base`}
          >
            clear tasks
          </span>
        </button>
        <Link
          to={isDailyPage() ? "/" : "/daily"}
          aria-label={isDailyPage() ? "go to general" : "go to daily"}
          className="flex select-none flex-col items-center gap-1 rounded-2xl p-2 text-base text-black transition-transform active:scale-95 dark:text-trueWhite sm:hidden"
        >
          <Switch />
          {isDailyPage() ? (
            <span>
              <span className="underline decoration-sky-300 decoration-2 underline-offset-2">
                general
              </span>{" "}
              tasks
            </span>
          ) : (
            <span>
              <span className="underline decoration-teal-300 decoration-2 underline-offset-2 dark:decoration-dailyPurple">
                daily
              </span>{" "}
              tasks
            </span>
          )}
        </Link>
        <button
          aria-expanded={showHelpMenu}
          onClick={showHelpMenu ? closeHelpMenu : openHelpMenu}
          className="relative hidden select-none flex-col items-center rounded-2xl p-2 hover:ring-2 hover:ring-black active:scale-95 dark:hover:ring-trueWhite sm:flex-row sm:gap-3 sm:px-3 lg:flex"
        >
          <span
            className={`h-fit w-fit ${
              showHelpMenu ? "rotate-0" : "rotate-180"
            }`}
          >
            <CaretUp className="fill-black dark:fill-trueWhite" />
          </span>
          <p className="dark:text-trueWhite xs:text-base">help</p>
        </button>
        {showHelpMenu && <HelpMenu closeHelpMenu={closeHelpMenu} />}
      </nav>
    </header>
  );
}
