import { useState } from "react";
import { useGeneralTasksContext } from "src/contexts";
import { Clock } from "src/icons";
import { cn, formatHistoryDate } from "src/utils";

export function TaskHistoryDrawer() {
  const { taskHistory, restoreTaskFromHistory } = useGeneralTasksContext();
  const [isOpen, setIsOpen] = useState(false);

  const historyCount = taskHistory.length;

  return (
    <aside
      className={cn(
        "fixed z-40 flex flex-col",
        "bottom-24 right-4 tiny:bottom-28 tiny:right-6",
        "sm:bottom-24 sm:right-8"
      )}
      aria-label="Task history"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="task-history-panel"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex items-center gap-2 rounded-2xl border-2 border-black px-4 py-3",
          "bg-white text-sm font-medium text-black shadow-brutalist-dark",
          "transition-transform active:scale-95",
          "dark:border-white dark:bg-zinc-950 dark:text-white",
          "dark:shadow-brutalist-light",
          "sm:hover:ring-2 sm:hover:ring-sky-300 dark:sm:hover:ring-cyan-800",
          isOpen && "rounded-b-none border-b-0"
        )}
      >
        <Clock size={20} className="shrink-0 text-black dark:text-white" />
        <span>history</span>
        {historyCount > 0 && (
          <span
            className={cn(
              "min-w-6 rounded-md border border-black px-1.5 py-0.5 text-xs",
              "bg-sky-300 dark:border-white dark:bg-cyan-800 dark:text-white"
            )}
          >
            {historyCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="task-history-panel"
          role="region"
          className={cn(
            "flex max-h-[min(20rem,50vh)] w-[min(100vw-2rem,20rem)] flex-col",
            "overflow-hidden rounded-2xl rounded-tr-none border-2 border-black",
            "border-t-0 bg-white shadow-brutalist-dark",
            "dark:border-white dark:bg-zinc-950 dark:shadow-brutalist-light"
          )}
        >
          <div
            className={cn("border-b border-black px-4 py-3 dark:border-white")}
          >
            <p className="text-sm font-medium text-black dark:text-white">
              completed tasks
            </p>
            <p className="text-xs text-black/60 dark:text-white/60">
              restore puts a task back in your list
            </p>
          </div>

          <ul
            className={cn(
              "flex flex-1 flex-col gap-0 overflow-y-auto",
              historyCount === 0 && "min-h-[7rem]"
            )}
          >
            {historyCount === 0 ? (
              <li
                className={cn(
                  "flex flex-1 items-center justify-center px-4 py-8",
                  "text-center text-sm text-black/50 dark:text-white/50"
                )}
              >
                nothing here yet.
                <br />
                complete a task to build history.
              </li>
            ) : (
              taskHistory.map((entry, index) => (
                <li
                  key={entry.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3",
                    index !== historyCount - 1 &&
                      "border-b border-black/15 dark:border-white/15"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium text-black",
                        "dark:text-white"
                      )}
                      title={entry.text}
                    >
                      {entry.text}
                    </p>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      {formatHistoryDate(entry.completedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreTaskFromHistory(entry.id)}
                    className={cn(
                      "shrink-0 rounded-lg border border-black px-3 py-1.5",
                      "text-xs font-medium transition-transform active:scale-95",
                      "bg-sky-300 text-black dark:border-white",
                      "dark:bg-cyan-800 dark:text-white",
                      "sm:hover:ring-2 sm:hover:ring-black dark:sm:hover:ring-white"
                    )}
                  >
                    restore
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </aside>
  );
}
