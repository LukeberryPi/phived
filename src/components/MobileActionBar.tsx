import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { HelpPanel } from "src/components/HelpDrawer";
import {
  HistoryClearButton,
  HistoryPanel,
} from "src/components/TaskHistoryDrawer";
import {
  DRAWER_BODY,
  DRAWER_COUNT_BADGE,
  DRAWER_HEADER_ACTIVE,
  DRAWER_HEADER_GRID,
  DRAWER_HEADER_HOVER,
  DRAWER_MUTED_TEXT,
  DRAWER_SURFACE,
  DRAWER_TEXT,
  DRAWER_TOGGLE_DIVIDER,
  ROW_DIVIDER,
  SIDE_ACTION_BORDER,
} from "src/constants/ui";
import { pressFeedbackGroupChildClassName } from "src/constants/motion";
import { useGeneralTasksContext, useDarkMode } from "src/contexts";
import { Clock, Computer, Moon, Question, Sun, Trash } from "src/icons";
import { cn, countFilledTasks } from "src/utils";

const NO_TASKS_TO_CLEAR_MESSAGE = "no tasks to clear.";

const barActionClassName = cn(
  "flex flex-1 items-center justify-center px-2 py-3 text-sm font-medium",
  "xs:px-4",
  DRAWER_TEXT,
  SIDE_ACTION_BORDER
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
      className={cn(
        "group",
        barActionClassName,
        !unavailable && DRAWER_HEADER_HOVER,
        active && DRAWER_HEADER_ACTIVE,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          barActionContentClassName,
          !unavailable && pressFeedbackGroupChildClassName
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
    return <span className={DRAWER_COUNT_BADGE}>{historyCount}</span>;
  }

  return <Clock size={20} className={DRAWER_TEXT} />;
}

export function MobileActionBar() {
  const { generalTasks, taskHistory, clearGeneralTasks, clearTaskHistory } =
    useGeneralTasksContext();
  const { themePreference, toggleDarkMode } = useDarkMode();
  const historyCount = taskHistory.length;
  const noGeneralTasks = countFilledTasks(generalTasks) === 0;
  const [helpOpen, setHelpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const themeIconClassName = "fill-black dark:fill-ink";

  const closeHelp = () => setHelpOpen(false);
  const handleClearTasks = () => {
    if (noGeneralTasks) {
      toast(NO_TASKS_TO_CLEAR_MESSAGE);
      return;
    }

    clearGeneralTasks();
  };

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
      className="fixed bottom-6 left-4 right-4 z-40 sm:hidden"
      aria-label="Actions"
    >
      <div className="task-panel flex flex-col-reverse overflow-hidden">
        <div
          className={cn(
            "flex items-stretch",
            sheetOpen && DRAWER_TOGGLE_DIVIDER
          )}
          role="toolbar"
        >
          <BarAction
            aria-expanded={helpOpen}
            aria-controls="mobile-help-panel"
            onClick={toggleHelp}
            active={helpOpen}
            className="w-full border-l-0"
            icon={<Question size={20} className={DRAWER_TEXT} />}
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
              themePreference === "system" ? (
                <Computer size={20} className={themeIconClassName} />
              ) : themePreference === "dark" ? (
                <Moon size={20} className={themeIconClassName} />
              ) : (
                <Sun size={20} className={themeIconClassName} />
              )
            }
            label={themePreference}
          />
          <BarAction
            aria-disabled={noGeneralTasks}
            aria-label={
              noGeneralTasks
                ? "Clear tasks unavailable: no tasks to clear"
                : "clear tasks"
            }
            onClick={handleClearTasks}
            unavailable={noGeneralTasks}
            className={
              noGeneralTasks
                ? cn("cursor-not-allowed", DRAWER_MUTED_TEXT)
                : undefined
            }
            icon={
              <Trash
                size={20}
                className={cn(
                  noGeneralTasks
                    ? "fill-black/30 dark:fill-inkMuted"
                    : "fill-black dark:fill-ink"
                )}
              />
            }
            label="clear"
          />
        </div>

        {helpOpen && (
          <div
            id="mobile-help-panel"
            role="region"
            aria-label="Help"
            className={cn(DRAWER_BODY, "w-full")}
          >
            <HelpPanel onClose={closeHelp} />
          </div>
        )}

        {historyOpen && (
          <div
            id="mobile-history-panel"
            role="region"
            aria-label="Task history"
            className={cn(DRAWER_BODY, "w-full")}
          >
            <div
              className={cn(DRAWER_HEADER_GRID, DRAWER_SURFACE, ROW_DIVIDER)}
            >
              <div
                className={cn(
                  "flex min-h-12 items-center gap-2 px-4 text-sm font-medium",
                  DRAWER_TEXT
                )}
              >
                <HistoryToggleIcon historyCount={historyCount} />
                <span>history</span>
              </div>
              <HistoryClearButton
                disabled={historyCount === 0}
                onClick={clearTaskHistory}
              />
            </div>
            <HistoryPanel />
          </div>
        )}
      </div>
    </div>
  );
}
