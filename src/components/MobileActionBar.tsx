import type { ReactNode } from "react";
import { useState } from "react";
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
import { pressFeedbackClassName } from "src/constants/motion";
import { useGeneralTasksContext, useDarkMode } from "src/contexts";
import { Clock, Moon, Question, Sun, Trash } from "src/icons";
import { cn, countFilledTasks } from "src/utils";

const barActionClassName = cn(
  "flex flex-1 flex-col items-center gap-1 px-2 py-3 text-sm font-medium",
  "xs:flex-row xs:justify-center xs:gap-2 xs:px-4",
  DRAWER_TEXT,
  SIDE_ACTION_BORDER,
  pressFeedbackClassName,
  DRAWER_HEADER_HOVER
);

type BarActionProps = {
  icon: ReactNode;
  label: ReactNode;
  active?: boolean;
  className?: string;
} & React.ComponentPropsWithoutRef<"button">;

function BarAction({
  icon,
  label,
  active,
  className,
  ...props
}: BarActionProps) {
  return (
    <button
      className={cn(
        barActionClassName,
        active && DRAWER_HEADER_ACTIVE,
        className
      )}
      {...props}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex items-center gap-2">{label}</span>
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
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const historyCount = taskHistory.length;
  const noGeneralTasks = countFilledTasks(generalTasks) === 0;
  const [helpOpen, setHelpOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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
            role="switch"
            aria-checked={isDarkMode}
            onClick={toggleDarkMode}
            icon={
              isDarkMode ? (
                <Sun size={20} className="fill-white" />
              ) : (
                <Moon size={20} className={DRAWER_TEXT} />
              )
            }
            label={isDarkMode ? "light" : "dark"}
          />
          <BarAction
            aria-disabled={noGeneralTasks}
            disabled={noGeneralTasks}
            onClick={clearGeneralTasks}
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
                    ? "fill-black/30 dark:fill-white/30"
                    : "fill-black dark:fill-white"
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
            <HelpPanel onHideHelp={closeHelp} />
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
