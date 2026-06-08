import { FloatingDrawer } from "src/components/FloatingDrawer";
import {
  DRAWER_COUNT_BADGE,
  DRAWER_HEADER_GRID,
  DRAWER_MUTED_TEXT,
  DRAWER_SURFACE,
  DRAWER_TEXT,
  ROW_DIVIDER,
  SIDE_ACTION_BORDER,
} from "src/constants/ui";
import { pressFeedbackClassName } from "src/constants/motion";
import { useGeneralTasksContext } from "src/contexts";
import { Clock } from "src/icons";
import { cn, formatHistoryWhen } from "src/utils";

const sideActionColumnClassName = "flex min-h-12 items-stretch";

const sideActionButtonClassName = cn(
  "flex h-full w-full items-center justify-center whitespace-nowrap text-sm font-medium",
  SIDE_ACTION_BORDER
);

const historyClearButtonClassName = cn(
  sideActionButtonClassName,
  pressFeedbackClassName,
  DRAWER_SURFACE,
  "bg-clip-padding",
  DRAWER_TEXT,
  "disabled:cursor-not-allowed disabled:text-black/40 dark:disabled:text-white/30",
  "enabled:sm:hover:bg-red-50 enabled:sm:hover:text-red-500 dark:enabled:sm:hover:bg-red-950 dark:enabled:sm:hover:text-red-400"
);

const restoreButtonClassName = cn(
  sideActionButtonClassName,
  pressFeedbackClassName,
  "select-none bg-emerald-400 text-black dark:bg-purple-700 dark:text-white",
  "flex [@media(hover:hover)_and_(pointer:fine)]:lg:hidden",
  "[@media(hover:hover)_and_(pointer:fine)]:lg:group-hover:flex"
);

type HistoryClearButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

export function HistoryClearButton({
  disabled,
  onClick,
}: HistoryClearButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={historyClearButtonClassName}
    >
      clear
    </button>
  );
}

export function HistoryPanel() {
  const { taskHistory, restoreTaskFromHistory } = useGeneralTasksContext();
  const historyCount = taskHistory.length;

  return (
    <ul>
      {historyCount === 0 ? (
        <li
          className={cn(
            "flex min-h-12 items-center px-4 text-sm",
            DRAWER_MUTED_TEXT
          )}
        >
          nothing here yet — complete a task first.
        </li>
      ) : (
        taskHistory.map((entry, index) => {
          const isLastEntry = index === historyCount - 1;

          return (
            <li
              key={entry.id}
              className={cn(
                DRAWER_HEADER_GRID,
                "group",
                !isLastEntry && ROW_DIVIDER
              )}
            >
              <div
                className={cn(
                  "flex min-w-0 items-center gap-x-3 px-4",
                  "outline-none"
                )}
              >
                <span
                  className={cn(
                    "min-w-0 truncate text-sm font-medium",
                    DRAWER_TEXT
                  )}
                  title={entry.text}
                >
                  {entry.text}
                </span>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap text-xs",
                    DRAWER_MUTED_TEXT
                  )}
                >
                  {formatHistoryWhen(entry.completedAt)}
                </span>
              </div>

              <div className={sideActionColumnClassName}>
                <button
                  onClick={() => restoreTaskFromHistory(entry.id)}
                  className={restoreButtonClassName}
                >
                  restore
                </button>
              </div>
            </li>
          );
        })
      )}
    </ul>
  );
}

export function TaskHistoryDrawer() {
  const { taskHistory, clearTaskHistory } = useGeneralTasksContext();
  const historyCount = taskHistory.length;

  return (
    <FloatingDrawer
      side="right"
      storageKey="showTaskHistoryDrawer"
      ariaLabel="Task history"
      panelId="task-history-panel"
      renderToggle={(isOpen) => (
        <>
          <Clock size={20} className={cn("shrink-0", DRAWER_TEXT)} />
          <span className="whitespace-nowrap">
            {isOpen ? "hide history" : "show history"}
          </span>
          {historyCount > 0 && (
            <span className={DRAWER_COUNT_BADGE}>{historyCount}</span>
          )}
        </>
      )}
      headerTrailing={
        <HistoryClearButton
          disabled={historyCount === 0}
          onClick={clearTaskHistory}
        />
      }
    >
      {() => <HistoryPanel />}
    </FloatingDrawer>
  );
}
