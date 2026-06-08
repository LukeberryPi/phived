import { toast } from "sonner";
import { useGeneralTasksContext, useDarkMode } from "src/contexts";
import {
  pressFeedbackClassName,
  pressFeedbackGroupChildClassName,
} from "src/constants/motion";
import { DRAWER_HEADER_HOVER } from "src/constants/ui";
import { Computer, Trash, Moon, Sun } from "src/icons";
import { cn, countFilledTasks } from "src/utils";

const NO_TASKS_TO_CLEAR_MESSAGE = "no tasks to clear.";
const headerActionClassName =
  "flex min-h-12 select-none items-center gap-2 rounded-2xl px-4 text-sm font-normal";
const clearTasksHoverClassName =
  "sm:hover:bg-red-100 sm:hover:text-red-600 dark:sm:hover:bg-red-950 dark:sm:hover:text-red-500";

export function Header() {
  const { clearGeneralTasks, generalTasks } = useGeneralTasksContext();
  const { themePreference, toggleDarkMode } = useDarkMode();

  const noGeneralTasks = countFilledTasks(generalTasks) === 0;
  const themeIconClassName = "fill-black dark:fill-white";
  const handleClearTasks = () => {
    if (noGeneralTasks) {
      toast(NO_TASKS_TO_CLEAR_MESSAGE);
      return;
    }

    clearGeneralTasks();
  };

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
          aria-label={`Theme: ${themePreference}`}
          className={cn(
            "group",
            headerActionClassName,
            "text-black dark:text-white",
            DRAWER_HEADER_HOVER
          )}
        >
          <span
            className={cn(
              "flex items-center gap-2",
              pressFeedbackGroupChildClassName
            )}
          >
            {themePreference === "system" ? (
              <>
                <Computer className={themeIconClassName} />
                system
              </>
            ) : themePreference === "dark" ? (
              <>
                <Moon className={themeIconClassName} />
                dark
              </>
            ) : (
              <>
                <Sun className={themeIconClassName} />
                light
              </>
            )}
          </span>
        </button>
        <button
          aria-disabled={noGeneralTasks}
          aria-label={
            noGeneralTasks
              ? "Clear tasks unavailable: no tasks to clear"
              : "clear tasks"
          }
          onClick={handleClearTasks}
          className={cn(
            "group",
            headerActionClassName,
            "text-black dark:text-white",
            noGeneralTasks ? "cursor-not-allowed" : clearTasksHoverClassName
          )}
        >
          <span
            className={cn(
              "flex items-center gap-2",
              !noGeneralTasks && pressFeedbackGroupChildClassName,
              noGeneralTasks && "text-black/40 dark:text-white/30"
            )}
          >
            <Trash
              className={cn(
                "fill-black dark:fill-white",
                noGeneralTasks
                  ? "fill-black/30 dark:fill-white/30"
                  : "sm:group-hover:fill-red-600 dark:sm:group-hover:fill-red-500"
              )}
            />
            clear tasks
          </span>
        </button>
      </nav>
    </header>
  );
}
