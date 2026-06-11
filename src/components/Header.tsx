import { useState } from "react";
import { toast } from "sonner";
import { HotkeysDialog } from "src/components/HotkeysDialog";
import { useCanvasTasksContext, useDarkMode } from "src/contexts";
import {
  pressFeedbackClassName,
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import {
  DESTRUCTIVE_ACTION_HOVER,
  DESTRUCTIVE_TRASH_ICON,
  DRAWER_HEADER_HOVER,
  FLOATING_CHROME_Z,
  NO_TASKS_TO_CLEAR_MESSAGE,
} from "src/constants/ui";
import { Computer, Keyboard, Trash, Moon, Sun } from "src/icons";
import { cn, countFilledTasks } from "src/utils";

const logoClassName = cn(
  "font-normal text-black underline decoration-3 underline-offset-4",
  "decoration-sky-300 dark:text-ink dark:decoration-cyan-800",
  pressFeedbackClassName
);
const headerActionClassName =
  "flex min-h-12 select-none items-center gap-2 rounded-2xl px-4 text-sm font-normal";

export function Header() {
  const { clearCanvas, lists } = useCanvasTasksContext();
  const { themePreference, toggleDarkMode } = useDarkMode();
  const [hotkeysOpen, setHotkeysOpen] = useState(false);

  const nothingToClear =
    lists.length <= 1 &&
    lists.every((list) => countFilledTasks(list.tasks) === 0);
  const themeIconClassName = "fill-black dark:fill-ink";
  const handleClearCanvas = () => {
    if (nothingToClear) {
      toast(NO_TASKS_TO_CLEAR_MESSAGE);
      return;
    }

    clearCanvas();
  };

  return (
    <>
      <a
        href="/"
        className={cn(
          logoClassName,
          FLOATING_CHROME_Z,
          "pointer-events-auto fixed left-1/2 top-4 -translate-x-1/2 text-3xl sm:hidden"
        )}
      >
        phived
      </a>

      <header
        className={cn(
          FLOATING_CHROME_Z,
          "pointer-events-none fixed top-0 hidden h-16 w-full items-center justify-between px-6",
          "sm:flex"
        )}
      >
        <a
          href="/"
          className={cn(
            logoClassName,
            "pointer-events-auto hidden text-4xl sm:flex"
          )}
        >
          phived
        </a>
        <nav className="pointer-events-auto flex h-full items-center justify-between gap-4">
          <button
            onClick={toggleDarkMode}
            aria-label={`Theme: ${themePreference}`}
            className={cn(
              pressFeedbackGroupClassName("theme"),
              headerActionClassName,
              "text-black dark:text-ink",
              DRAWER_HEADER_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                pressFeedbackGroupChildClassName("theme")
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
            aria-disabled={nothingToClear}
            aria-label={
              nothingToClear
                ? "Clear canvas unavailable: nothing to clear"
                : "clear canvas"
            }
            onClick={handleClearCanvas}
            className={cn(
              pressFeedbackGroupClassName("clear-tasks"),
              headerActionClassName,
              "text-black dark:text-ink",
              nothingToClear ? "cursor-not-allowed" : DESTRUCTIVE_ACTION_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                !nothingToClear &&
                  pressFeedbackGroupChildClassName("clear-tasks"),
                nothingToClear && "text-muted dark:text-inkMuted"
              )}
            >
              <Trash size={20} className={DESTRUCTIVE_TRASH_ICON} />
              clear canvas
            </span>
          </button>
          <button
            aria-haspopup="dialog"
            aria-expanded={hotkeysOpen}
            aria-label="show hotkeys"
            onClick={() => setHotkeysOpen(true)}
            className={cn(
              pressFeedbackGroupClassName("hotkeys"),
              headerActionClassName,
              "text-black dark:text-ink",
              DRAWER_HEADER_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                pressFeedbackGroupChildClassName("hotkeys")
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
