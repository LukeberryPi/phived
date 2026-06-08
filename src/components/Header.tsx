import { useGeneralTasksContext, useDarkMode } from "src/contexts";
import { pressFeedbackClassName } from "src/constants/motion";
import { Trash, Moon, Sun } from "src/icons";
import { cn, countFilledTasks } from "src/utils";

export function Header() {
  const { clearGeneralTasks, generalTasks } = useGeneralTasksContext();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const noGeneralTasks = countFilledTasks(generalTasks) === 0;

  return (
    <header
      className={cn(
        "fixed top-0 hidden h-16 w-full items-center justify-between px-6",
        "sm:flex"
      )}
    >
      <a
        href="/"
        className={cn(
          "hidden text-4xl font-bold text-black underline underline-offset-4",
          "decoration-sky-300 dark:text-white dark:decoration-cyan-800 md:flex",
          pressFeedbackClassName
        )}
      >
        phived
      </a>
      <nav className="flex h-full items-center justify-between gap-6">
        <button
          onClick={toggleDarkMode}
          role="switch"
          aria-checked={isDarkMode}
          className={cn(
            "flex select-none items-center gap-3 rounded-2xl px-4 py-2",
            "text-base text-black dark:text-white",
            pressFeedbackClassName,
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
            "group flex select-none items-center gap-3 rounded-2xl px-4 py-2",
            pressFeedbackClassName,
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
      </nav>
    </header>
  );
}
