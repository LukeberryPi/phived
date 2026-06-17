import { useState } from "react";
import { Button } from "src/components/Button";
import { HotkeysDialog } from "src/components/HotkeysDialog";
import { ThemeIndicator } from "src/components/ThemeIndicator";
import { useDarkMode } from "src/contexts";
import { pressFeedbackClassName } from "src/constants/motion";
import { FLOATING_CHROME_Z } from "src/constants/ui";
import { Keyboard } from "src/icons";
import { cn } from "src/utils";

const logoClassName = cn(
  "font-normal text-black underline decoration-3 underline-offset-4",
  "decoration-sky-300 dark:text-ink-dark dark:decoration-cyan-800",
  pressFeedbackClassName
);

/** Header actions float over the dotted canvas as frosted glass (translucent
 * canvas tint + backdrop blur) and keep the calm font-normal weight; the
 * shared Button supplies the ghost hover + press. */
const headerActionClassName =
  "bg-canvas-light/80 font-normal backdrop-blur-md dark:bg-canvas-dark/80";

export function Header() {
  const { themePreference, toggleDarkMode } = useDarkMode();
  const [hotkeysOpen, setHotkeysOpen] = useState(false);

  const themeIconClassName = "text-black dark:text-ink-dark";

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
          <Button
            onClick={toggleDarkMode}
            aria-label={`Theme: ${themePreference}`}
            variant="ghost"
            className={headerActionClassName}
          >
            <ThemeIndicator
              preference={themePreference}
              className={themeIconClassName}
              showLabel
            />
          </Button>
          <Button
            aria-haspopup="dialog"
            aria-expanded={hotkeysOpen}
            aria-label="show hotkeys"
            onClick={() => setHotkeysOpen(true)}
            variant="ghost"
            className={headerActionClassName}
          >
            <Keyboard size={20} className="dark:text-ink-dark text-black" />
            show hotkeys
          </Button>
        </nav>
      </header>
      <HotkeysDialog open={hotkeysOpen} onClose={() => setHotkeysOpen(false)} />
    </>
  );
}
