import { useState } from "react";
import { toast } from "sonner";
import { HotkeysDialog } from "src/components/HotkeysDialog";
import { useGeneralTasksContext, useDarkMode } from "src/contexts";
import {
  pressFeedbackClassName,
  pressFeedbackGroupChildClassName,
} from "src/constants/motion";
import { DRAWER_HEADER_HOVER } from "src/constants/ui";
import { Computer, Keyboard, Trash, Moon, Sun } from "src/icons";
import { cn, countFilledTasks } from "src/utils";

const NO_TASKS_TO_CLEAR_MESSAGE = "no tasks to clear.";
const logoClassName = cn(
  "font-normal text-black underline decoration-2 underline-offset-4",
  "decoration-sky-300 dark:text-ink dark:decoration-cyan-800",
  pressFeedbackClassName
);
const headerActionClassName =
  "flex min-h-12 select-none items-center gap-2 rounded-2xl px-4 text-sm font-normal";
const clearTasksHoverClassName =
  "sm:hover:bg-red-100 sm:hover:text-red-600 dark:sm:hover:bg-red-950 dark:sm:hover:text-red-500";

export function Header() {
  const { clearGeneralTasks, generalTasks } = useGeneralTasksContext();
  const { themePreference, toggleDarkMode } = useDarkMode();
  const [hotkeysOpen, setHotkeysOpen] = useState(false);

  const noGeneralTasks = countFilledTasks(generalTasks) === 0;
  const themeIconClassName = "fill-black dark:fill-ink";
  const handleClearTasks = () => {
    if (noGeneralTasks) {
      toast(NO_TASKS_TO_CLEAR_MESSAGE);
      return;
    }

    clearGeneralTasks();
  };

  return (
    <>
      <a
        href="/"
        className={cn(
          logoClassName,
          "fixed left-1/2 top-4 z-40 -translate-x-1/2 text-3xl sm:hidden"
        )}
      >
        phived
      </a>

      <header
        className={cn(
          "fixed top-0 hidden h-16 w-full items-center justify-between px-6",
          "sm:flex"
        )}
      >
        <a href="/" className={cn(logoClassName, "hidden text-4xl sm:flex")}>
          phived
        </a>
        <nav className="flex h-full items-center justify-between gap-4">
          <button
            onClick={toggleDarkMode}
            aria-label={`Theme: ${themePreference}`}
            className={cn(
              "group",
              headerActionClassName,
              "text-black dark:text-ink",
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
                  <Computer size={20} className={themeIconClassName} />
                  system
                </>
              ) : themePreference === "dark" ? (
                <>
                  <Moon size={20} className={themeIconClassName} />
                  dark
                </>
              ) : (
                <>
                  <Sun size={20} className={themeIconClassName} />
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
              "text-black dark:text-ink",
              noGeneralTasks ? "cursor-not-allowed" : clearTasksHoverClassName
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                !noGeneralTasks && pressFeedbackGroupChildClassName,
                noGeneralTasks && "text-black/40 dark:text-inkMuted"
              )}
            >
              <Trash
                size={20}
                className={cn(
                  "fill-black dark:fill-ink",
                  noGeneralTasks
                    ? "fill-black/30 dark:fill-inkMuted"
                    : "sm:group-hover:fill-red-600 dark:sm:group-hover:fill-red-500"
                )}
              />
              clear tasks
            </span>
          </button>
          <button
            aria-haspopup="dialog"
            aria-expanded={hotkeysOpen}
            aria-label="show hotkeys"
            onClick={() => setHotkeysOpen(true)}
            className={cn(
              "group",
              headerActionClassName,
              "text-black dark:text-ink",
              DRAWER_HEADER_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                pressFeedbackGroupChildClassName
              )}
            >
              <Keyboard size={20} className="fill-black dark:fill-ink" />
              show hotkeys
            </span>
          </button>
        </nav>
      </header>
      <HotkeysDialog open={hotkeysOpen} onClose={() => setHotkeysOpen(false)} />
    </>
  );
}
