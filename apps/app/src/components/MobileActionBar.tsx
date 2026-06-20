import type { ReactNode } from "react";
import { useState } from "react";
import { HelpPanel } from "src/components/Help";
import { ThemeIndicator } from "src/components/ThemeIndicator";
import { HistoryList } from "src/components/TaskHistoryDrawer";
import {
  ACTIVE_SURFACE,
  COUNT_BADGE,
  FLOATING_CHROME_Z,
  FOCUS_RING,
  PANEL_BODY,
  PRIMARY_TEXT,
  ROW_DIVIDER,
  SIDE_ACTION_BORDER,
  SURFACE,
  TOP_DIVIDER,
} from "src/constants/ui";
import {
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { useCanvasTasksContext, useDarkMode } from "src/contexts";
import { Clock, Question } from "src/icons";
import { cn } from "src/utils";

// min-h-12 keeps every tap target >= 44px (WCAG 2.5.5 / Apple). Focus outline is
// inset so the bar's `overflow-hidden` doesn't clip it on edge-to-edge buttons.
const barActionClassName = cn(
  "flex min-h-12 flex-1 items-center justify-center px-2 py-3 text-sm font-medium",
  "xs:px-4",
  PRIMARY_TEXT,
  SIDE_ACTION_BORDER,
  FOCUS_RING,
  "focus-visible:outline-offset-[-2px]"
);

// Hover is gated behind pointer-fine so a tap doesn't leave a stuck hover tint
// on touch; the open ACTIVE_SURFACE state and press scale cover touch feedback.
const barActionHoverClassName = cn(
  "transition-colors duration-150 ease-out-strong",
  "pointer-fine:hover:bg-surface-hover-light dark:pointer-fine:hover:bg-surface-hover-dark"
);

const barActionContentClassName =
  "flex flex-col items-center gap-1 xs:flex-row xs:justify-center xs:gap-2 [&>*:first-child]:shrink-0";

type BarActionProps = {
  icon: ReactNode;
  label: ReactNode;
  active?: boolean;
  className?: string;
  unavailable?: boolean;
} & React.ComponentPropsWithoutRef<"button">;

function BarAction({
  icon,
  label,
  active,
  className,
  unavailable,
  ...props
}: BarActionProps) {
  return (
    <button
      type="button"
      className={cn(
        pressFeedbackGroupClassName("bar-action"),
        barActionClassName,
        !unavailable && barActionHoverClassName,
        active && ACTIVE_SURFACE,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          barActionContentClassName,
          !unavailable && pressFeedbackGroupChildClassName("bar-action")
        )}
      >
        {icon}
        {label}
      </span>
    </button>
  );
}

function HistoryToggleIcon({ historyCount }: { historyCount: number }) {
  if (historyCount > 0) {
    return <span className={COUNT_BADGE}>{historyCount}</span>;
  }

  return <Clock size={20} className={PRIMARY_TEXT} />;
}

export function MobileActionBar() {
  const { taskHistory } = useCanvasTasksContext();
  const { themePreference, toggleDarkMode } = useDarkMode();
  const historyCount = taskHistory.length;
  const [helpOpen, setHelpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const themeIconClassName = "text-black dark:text-ink-dark";

  const closeHelp = () => setHelpOpen(false);
  const toggleHelp = () => {
    setHelpOpen((open) => !open);
    setHistoryOpen(false);
  };

  const toggleHistory = () => {
    setHistoryOpen((open) => !open);
    setHelpOpen(false);
  };

  const sheetOpen = helpOpen || historyOpen;

  return (
    <div
      className={cn(
        FLOATING_CHROME_Z,
        "pointer-events-auto fixed right-4 bottom-6 left-4 sm:hidden"
      )}
      aria-label="Actions"
    >
      <div className="task-panel flex flex-col-reverse overflow-hidden">
        <div
          className={cn("flex items-stretch", sheetOpen && TOP_DIVIDER)}
          role="toolbar"
        >
          <BarAction
            aria-expanded={helpOpen}
            aria-controls="mobile-help-panel"
            onClick={toggleHelp}
            active={helpOpen}
            className="w-full border-l-0"
            icon={<Question size={20} className={PRIMARY_TEXT} />}
            label="help"
          />

          <BarAction
            aria-expanded={historyOpen}
            aria-controls="mobile-history-panel"
            onClick={toggleHistory}
            active={historyOpen}
            className="w-full"
            icon={<HistoryToggleIcon historyCount={historyCount} />}
            label="history"
          />

          <BarAction
            aria-label={`Theme: ${themePreference}`}
            onClick={toggleDarkMode}
            icon={
              <ThemeIndicator
                preference={themePreference}
                className={themeIconClassName}
              />
            }
            label={themePreference}
          />
        </div>

        {helpOpen && (
          <div
            id="mobile-help-panel"
            role="region"
            aria-label="Help"
            className={cn(PANEL_BODY, "w-full")}
          >
            <HelpPanel onClose={closeHelp} />
          </div>
        )}

        {historyOpen && (
          <div
            id="mobile-history-panel"
            role="region"
            aria-label="Task history"
            className={cn(PANEL_BODY, "w-full")}
          >
            <div
              className={cn(
                SURFACE,
                ROW_DIVIDER,
                "flex min-h-12 items-center gap-2 px-4 text-sm font-medium",
                PRIMARY_TEXT
              )}
            >
              <HistoryToggleIcon historyCount={historyCount} />
              <span>history</span>
            </div>
            <HistoryList />
          </div>
        )}
      </div>
    </div>
  );
}
