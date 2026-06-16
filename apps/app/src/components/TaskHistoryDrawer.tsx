import { FloatingDrawer } from "src/components/FloatingDrawer";
import { Tooltip } from "src/components/Tooltip";
import {
  DESTRUCTIVE_ACTION,
  DESTRUCTIVE_TRASH_ICON,
  DRAWER_COUNT_BADGE,
  DRAWER_MUTED_TEXT,
  DRAWER_SURFACE,
  DRAWER_TEXT,
  ROW_DIVIDER,
} from "src/constants/ui";
import {
  pressFeedbackClassName,
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { useCanvasTasksContext } from "src/contexts";
import { CaretDown, Clock, Restore, Trash } from "src/icons";
import { cn, formatHistoryWhen } from "src/utils";

// Always shown on touch; on desktop the cluster fades in on row hover/focus.
const historyEntryActionsClassName = cn(
  "absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5 rounded-full",
  DRAWER_SURFACE,
  "pointer-fine:pointer-events-none pointer-fine:opacity-0",
  "pointer-fine:transition-opacity pointer-fine:duration-150 pointer-fine:ease-out-strong",
  "pointer-fine:group-hover/row:pointer-events-auto pointer-fine:group-hover/row:opacity-100",
  "pointer-fine:group-focus-within/row:pointer-events-auto pointer-fine:group-focus-within/row:opacity-100"
);

const historyEntryActionButtonClassName = cn(
  "flex size-8 shrink-0 items-center justify-center rounded-full",
  pressFeedbackClassName
);

type HistoryPanelProps = {
  onClose?: () => void;
};

export function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { taskHistory, restoreTaskFromHistory, deleteTaskFromHistory } =
    useCanvasTasksContext();
  const historyCount = taskHistory.length;

  return (
    <>
      {onClose && (
        <div
          className={cn(
            "relative sticky top-0 z-10 flex min-h-12 items-stretch",
            DRAWER_SURFACE,
            ROW_DIVIDER
          )}
        >
          <button
            type="button"
            aria-label="Close history"
            onClick={onClose}
            className={cn(
              "absolute top-2 right-2 flex size-8 shrink-0 items-center justify-center rounded-full",
              "dark:hover:bg-surface-hover-dark hover:bg-surface-hover-light",
              pressFeedbackClassName
            )}
          >
            <CaretDown size={18} className="dark:fill-ink-dark fill-black" />
          </button>
        </div>
      )}
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
                  "group/row relative flex items-center",
                  !isLastEntry && ROW_DIVIDER
                )}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pr-20 pl-4">
                  <span
                    className={cn(
                      "min-w-0 truncate text-sm font-medium",
                      DRAWER_TEXT
                    )}
                    title={entry.text}
                  >
                    {entry.text}
                  </span>
                  <div className="flex min-w-0 items-center gap-x-2">
                    {entry.listTag && (
                      <span
                        className={cn(
                          "border-line-light max-w-24 shrink-0 truncate rounded-full border px-2 py-0.5",
                          "dark:border-hairline-dark text-xs",
                          DRAWER_MUTED_TEXT
                        )}
                        title={entry.listTag}
                      >
                        {entry.listTag}
                      </span>
                    )}
                    <span
                      className={cn(
                        "shrink-0 text-xs whitespace-nowrap",
                        DRAWER_MUTED_TEXT
                      )}
                    >
                      {formatHistoryWhen(entry.completedAt)}
                    </span>
                  </div>
                </div>

                <div className={historyEntryActionsClassName}>
                  <Tooltip label="restore">
                    <button
                      type="button"
                      aria-label="restore task"
                      onClick={() => restoreTaskFromHistory(entry.id)}
                      className={cn(
                        pressFeedbackGroupClassName("restore"),
                        historyEntryActionButtonClassName,
                        "dark:hover:bg-surface-hover-dark hover:bg-surface-hover-light",
                        DRAWER_TEXT
                      )}
                    >
                      <span
                        className={pressFeedbackGroupChildClassName("restore")}
                      >
                        <Restore size={18} />
                      </span>
                    </button>
                  </Tooltip>
                  <Tooltip label="delete">
                    <button
                      type="button"
                      aria-label="delete from history"
                      onClick={() => deleteTaskFromHistory(entry.id)}
                      className={cn(
                        pressFeedbackGroupClassName("clear-history"),
                        historyEntryActionButtonClassName,
                        DESTRUCTIVE_ACTION
                      )}
                    >
                      <span
                        className={pressFeedbackGroupChildClassName(
                          "clear-history"
                        )}
                      >
                        <Trash size={18} className={DESTRUCTIVE_TRASH_ICON} />
                      </span>
                    </button>
                  </Tooltip>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </>
  );
}

export function TaskHistoryDrawer() {
  const { taskHistory } = useCanvasTasksContext();
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
    >
      {({ close }) => <HistoryPanel onClose={close} />}
    </FloatingDrawer>
  );
}
