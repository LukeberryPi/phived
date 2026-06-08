import { toast } from "sonner";
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
import { pressFeedbackGroupChildClassName } from "src/constants/motion";
import { useGeneralTasksContext } from "src/contexts";
import { Clock, Trash } from "src/icons";
import { cn, formatHistoryWhen } from "src/utils";

const NO_HISTORY_TO_CLEAR_MESSAGE = "no task history to clear.";

const sideActionColumnClassName = "flex min-h-12 items-stretch";

const sideActionButtonClassName = cn(
  "flex h-full w-full items-center justify-center whitespace-nowrap text-sm font-medium",
  SIDE_ACTION_BORDER
);

const historyClearButtonClassName = cn(
  sideActionButtonClassName,
  DRAWER_SURFACE,
  "bg-clip-padding",
  DRAWER_TEXT
);

const restoreButtonClassName = cn(
  sideActionButtonClassName,
  "select-none bg-emerald-400 text-black dark:bg-cyan-800 dark:text-ink",
  "flex [@media(hover:hover)_and_(pointer:fine)]:lg:hidden",
  "[@media(hover:hover)_and_(pointer:fine)]:lg:group-hover:flex"
);

type HistoryClearButtonProps = {
  disabled: boolean;
  onClick: () => void;
  dividerSide?: "left" | "right";
};

export function HistoryClearButton({
  disabled,
  onClick,
  dividerSide = "left",
}: HistoryClearButtonProps) {
  const handleClick = () => {
    if (disabled) {
      toast(NO_HISTORY_TO_CLEAR_MESSAGE);
      return;
    }

    onClick();
  };

  return (
    <button
      aria-disabled={disabled}
      aria-label={
        disabled
          ? "Clear history unavailable: no task history to clear"
          : "clear history"
      }
      onClick={handleClick}
      className={cn(
        "group",
        historyClearButtonClassName,
        dividerSide === "right" &&
          "border-l-0 border-r border-black dark:border-hairline",
        disabled
          ? "cursor-not-allowed text-black/40 dark:text-inkMuted"
          : "sm:hover:bg-red-100 sm:hover:text-red-600 dark:sm:hover:bg-red-950 dark:sm:hover:text-red-500"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(!disabled && pressFeedbackGroupChildClassName)}
      >
        <Trash
          size={20}
          className={cn(
            disabled ? "fill-black/30 dark:fill-inkMuted" : "fill-current"
          )}
        />
      </span>
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
                  className={cn("group", restoreButtonClassName)}
                >
                  <span className={pressFeedbackGroupChildClassName}>
                    restore
                  </span>
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
          dividerSide="right"
        />
      }
      compactHeaderTrailing
    >
      {() => <HistoryPanel />}
    </FloatingDrawer>
  );
}
