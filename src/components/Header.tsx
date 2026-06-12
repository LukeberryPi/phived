import { useState } from "react";
import { HotkeysDialog } from "src/components/HotkeysDialog";
import { ThemeIndicator } from "src/components/ThemeIndicator";
import { useDarkMode } from "src/contexts";
import { useClearCanvasAction } from "src/hooks";
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
} from "src/constants/ui";
import { Keyboard, Trash } from "src/icons";
import { cn } from "src/utils";

const logoClassName = cn(
  "font-normal text-black underline decoration-3 underline-offset-4",
  "decoration-sky-300 dark:text-ink-dark dark:decoration-cyan-800",
  pressFeedbackClassName
);
const headerActionClassName =
  "flex min-h-12 select-none items-center gap-2 rounded-2xl bg-canvas-light px-4 text-sm font-normal dark:bg-canvas-dark";

export function Header() {
  const { themePreference, toggleDarkMode } = useDarkMode();
  const { clear: clearCanvas, unavailable: nothingToClear } =
    useClearCanvasAction();
  const [hotkeysOpen, setHotkeysOpen] = useState(false);

  const themeIconClassName = "fill-black dark:fill-ink-dark";

  return (
    <>
      <a
        href="/"
        className={cn(
          logoClassName,
          FLOATING_CHROME_Z,
          "pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 text-3xl sm:hidden"
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
              "dark:text-ink-dark text-black",
              DRAWER_HEADER_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                pressFeedbackGroupChildClassName("theme")
              )}
            >
              <ThemeIndicator
                preference={themePreference}
                className={themeIconClassName}
                showLabel
              />
            </span>
          </button>
          <button
            aria-disabled={nothingToClear}
            aria-label={
              nothingToClear
                ? "Clear canvas unavailable: nothing to clear"
                : "clear canvas"
            }
            onClick={clearCanvas}
            className={cn(
              pressFeedbackGroupClassName("clear-tasks"),
              headerActionClassName,
              "dark:text-ink-dark text-black",
              nothingToClear ? "cursor-not-allowed" : DESTRUCTIVE_ACTION_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                !nothingToClear &&
                  pressFeedbackGroupChildClassName("clear-tasks"),
                nothingToClear && "text-muted-light dark:text-muted-dark"
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
              "dark:text-ink-dark text-black",
              DRAWER_HEADER_HOVER
            )}
          >
            <span
              className={cn(
                "flex items-center gap-2",
                pressFeedbackGroupChildClassName("hotkeys")
              )}
            >
              <Keyboard size={20} className="dark:fill-ink-dark fill-black" />
              show hotkeys
            </span>
          </button>
        </nav>
      </header>
      <HotkeysDialog open={hotkeysOpen} onClose={() => setHotkeysOpen(false)} />
    </>
  );
}
