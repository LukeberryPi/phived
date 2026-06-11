import { FloatingDrawer } from "src/components/FloatingDrawer";
import {
  ACTION_ACCENT_SURFACE,
  DESTRUCTIVE_ACTION_HOVER,
  DESTRUCTIVE_TRASH_ICON,
  DRAWER_COUNT_BADGE,
  DRAWER_HEADER_GRID,
  DRAWER_MUTED_TEXT,
  DRAWER_SURFACE,
  DRAWER_TEXT,
  ROW_DIVIDER,
  SIDE_ACTION_BORDER,
} from "src/constants/ui";
import {
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { useCanvasTasksContext } from "src/contexts";
import { Clock, Trash } from "src/icons";
import { cn, formatHistoryWhen } from "src/utils";

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
  "select-none",
  ACTION_ACCENT_SURFACE,
  "flex [@media(hover:hover)_and_(pointer:fine)]:lg:hidden",
  "[@media(hover:hover)_and_(pointer:fine)]:lg:group-hover/row:flex"
);

type HistoryClearButtonProps = {
  onClick: () => void;
  dividerSide?: "left" | "right";
};

export function HistoryClearButton({
  onClick,
  dividerSide = "left",
}: HistoryClearButtonProps) {
  return (
    <button
      aria-label="clear history"
      onClick={onClick}
      className={cn(
        pressFeedbackGroupClassName("clear-history"),
        historyClearButtonClassName,
        dividerSide === "right" &&
          "border-l-0 border-r border-line dark:border-hairline",
        DESTRUCTIVE_ACTION_HOVER
      )}
    >
      <span
        aria-hidden="true"
        className={pressFeedbackGroupChildClassName("clear-history")}
      >
        <Trash size={20} className={DESTRUCTIVE_TRASH_ICON} />
      </span>
    </button>
  );
}

export function HistoryPanel() {
  const { taskHistory, restoreTaskFromHistory } = useCanvasTasksContext();
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
                "group/row",
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
                {entry.listTag && (
                  <span
                    className={cn(
                      "max-w-24 shrink-0 truncate rounded-full border border-line px-2 py-0.5",
                      "text-xs dark:border-hairline",
                      DRAWER_MUTED_TEXT
                    )}
                    title={entry.listTag}
                  >
                    {entry.listTag}
                  </span>
                )}
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
                  className={cn(
                    pressFeedbackGroupClassName("restore"),
                    restoreButtonClassName
                  )}
                >
                  <span className={pressFeedbackGroupChildClassName("restore")}>
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
  const { taskHistory, clearTaskHistory } = useCanvasTasksContext();
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
        historyCount > 0 ? (
          <HistoryClearButton onClick={clearTaskHistory} dividerSide="right" />
        ) : undefined
      }
      compactHeaderTrailing
    >
      {() => <HistoryPanel />}
    </FloatingDrawer>
  );
}
