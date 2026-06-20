import { useState } from "react";
import { HelpDialog } from "src/components/HelpDialog";
import { ThemeIndicator } from "src/components/ThemeIndicator";
import { useDarkMode } from "src/contexts";
import { pressFeedbackClassName } from "src/constants/motion";
import { CONTROL_BUTTON, FLOATING_CHROME_Z } from "src/constants/ui";
import { Question } from "src/icons";
import { cn } from "src/utils";

const logoClassName = cn(
  "font-normal text-black underline decoration-3 underline-offset-4",
  "decoration-sky-300 dark:text-ink-dark dark:decoration-cyan-800",
  pressFeedbackClassName
);

export function Header() {
  const { themePreference, toggleDarkMode } = useDarkMode();
  const [helpOpen, setHelpOpen] = useState(false);

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
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={`Theme: ${themePreference}`}
            className={CONTROL_BUTTON}
          >
            <ThemeIndicator
              preference={themePreference}
              className={themeIconClassName}
              showLabel
            />
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={helpOpen}
            aria-label="show help"
            onClick={() => setHelpOpen(true)}
            className={CONTROL_BUTTON}
          >
            <Question size={20} className="dark:text-ink-dark text-black" />
            show help
          </button>
        </nav>
      </header>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
