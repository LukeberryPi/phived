import { Tooltip } from "src/components/Tooltip";
import {
  CONTROL_BUTTON,
  COUNT_BADGE,
  DESTRUCTIVE_ACTION,
  DESTRUCTIVE_TRASH_ICON,
  FLOATING_CHROME_Z,
  FLOATING_CONTROL_SURFACE,
  MUTED_TEXT,
  PANEL_BODY,
  PRIMARY_TEXT,
  ROW_DIVIDER,
  SURFACE,
} from "src/constants/ui";
import {
  drawerWidthTransitionClassName,
  pressFeedbackClassName,
} from "src/constants/motion";
import { useCanvasTasksContext } from "src/contexts";
import { useLocalStorage } from "src/hooks";
import { CaretDown, Clock, Restore, Trash } from "src/icons";
import { cn, formatHistoryWhen } from "src/utils";

const HISTORY_PANEL_ID = "task-history-panel";

// Always shown on touch; on desktop the cluster fades in on row hover/focus.
const historyEntryActionsClassName = cn(
  "absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-0.5 rounded-full",
  SURFACE,
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
  onClose: () => void;
};

type HistoryPanelHeaderProps = {
  historyCount: number;
  onClose: () => void;
};

function HistoryPanelHeader({
  historyCount,
  onClose,
}: HistoryPanelHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex min-h-12 items-center gap-2 px-4",
        SURFACE,
        ROW_DIVIDER
      )}
    >
      <Clock size={20} className={cn("shrink-0", PRIMARY_TEXT)} />
      <span className={cn("text-sm font-medium", PRIMARY_TEXT)}>history</span>
      {historyCount > 0 && <span className={COUNT_BADGE}>{historyCount}</span>}
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className={cn(
          "ml-auto flex size-8 shrink-0 items-center justify-center rounded-full",
          "dark:hover:bg-surface-hover-dark hover:bg-surface-hover-light",
          pressFeedbackClassName
        )}
      >
        <CaretDown size={18} className="dark:text-ink-dark text-black" />
      </button>
    </div>
  );
}

export function HistoryList() {
  const { taskHistory, restoreTaskFromHistory, deleteTaskFromHistory } =
    useCanvasTasksContext();
  const historyCount = taskHistory.length;

  return (
    <ul>
      {historyCount === 0 ? (
        <li
          className={cn("flex min-h-12 items-center px-4 text-sm", MUTED_TEXT)}
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
                    PRIMARY_TEXT
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
                        MUTED_TEXT
                      )}
                      title={entry.listTag}
                    >
                      {entry.listTag}
                    </span>
                  )}
                  <span
                    className={cn(
                      "shrink-0 text-xs whitespace-nowrap",
                      MUTED_TEXT
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
                      historyEntryActionButtonClassName,
                      "dark:hover:bg-surface-hover-dark hover:bg-surface-hover-light",
                      PRIMARY_TEXT
                    )}
                  >
                    <Restore size={18} />
                  </button>
                </Tooltip>
                <Tooltip label="delete">
                  <button
                    type="button"
                    aria-label="delete from history"
                    onClick={() => deleteTaskFromHistory(entry.id)}
                    className={cn(
                      historyEntryActionButtonClassName,
                      DESTRUCTIVE_ACTION
                    )}
                  >
                    <Trash size={18} className={DESTRUCTIVE_TRASH_ICON} />
                  </button>
                </Tooltip>
              </div>
            </li>
          );
        })
      )}
    </ul>
  );
}

export function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { taskHistory } = useCanvasTasksContext();

  return (
    <>
      <HistoryPanelHeader historyCount={taskHistory.length} onClose={onClose} />
      <HistoryList />
    </>
  );
}

export function TaskHistoryDrawer() {
  const { taskHistory } = useCanvasTasksContext();
  const historyCount = taskHistory.length;
  const [isOpen, setIsOpen] = useLocalStorage("showTaskHistoryDrawer", true);

  return (
    <aside
      className={cn(
        FLOATING_CHROME_Z,
        "pointer-events-auto fixed hidden sm:right-6 sm:bottom-6 sm:block"
      )}
      aria-label="Task history"
    >
      <div
        className={cn(
          "drawer-shell flex w-fit flex-col",
          // Open: the surface frames the panel and clips it to the rounding.
          // Collapsed: the toggle owns its own CONTROL_BUTTON surface, so the
          // wrapper stays transparent and must not clip the rounded corners.
          isOpen && cn("overflow-hidden", FLOATING_CONTROL_SURFACE),
          drawerWidthTransitionClassName
        )}
      >
        {isOpen ? (
          <div
            id={HISTORY_PANEL_ID}
            role="region"
            className={cn("w-[min(100vw-2rem,22rem)]", PANEL_BODY)}
          >
            <HistoryPanel onClose={() => setIsOpen(false)} />
          </div>
        ) : (
          <button
            type="button"
            aria-expanded={false}
            aria-controls={HISTORY_PANEL_ID}
            onClick={() => setIsOpen(true)}
            className={CONTROL_BUTTON}
          >
            <Clock size={20} className={cn("shrink-0", PRIMARY_TEXT)} />
            <span className="whitespace-nowrap">show history</span>
            {historyCount > 0 && (
              <span className={COUNT_BADGE}>{historyCount}</span>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
