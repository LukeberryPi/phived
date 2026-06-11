import type {
  FormEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
} from "react";
import { memo, useMemo, useRef, useState } from "react";
import {
  ACTION_ACCENT_SURFACE,
  DESTRUCTIVE_ACTION_HOVER,
  DESTRUCTIVE_TRASH_ICON,
  DRAWER_TEXT,
  HOVER_REVEAL,
  ROW_DIVIDER,
} from "src/constants/ui";
import {
  dragLiftClassName,
  dragScaleUpClassName,
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { placeholders } from "src/content";
import { useRowDragReorder, useTaskKeyboardNavigation } from "src/hooks";
import { ArrowsMove, DragVertical, Trash } from "src/icons";
import type { TaskList } from "src/types/canvas";
import { cn, countFilledTasks, getRandomElement } from "src/utils";
import { LIST_WIDTH } from "src/utils/canvas";

type TaskListCardProps = {
  list: TaskList;
  zoomRef: MutableRefObject<number>;
  autoFocusFirstRow: boolean;
  onMove: (listId: string, x: number, y: number) => void;
  onDelete: (listId: string) => void;
  onTagChange: (listId: string, tag: string) => void;
  onTaskChange: (listId: string, taskIndex: number, value: string) => void;
  onCompleteTask: (listId: string, taskIndex: number) => void;
  onReorderTask: (listId: string, fromIndex: number, toIndex: number) => void;
  onMoveTaskUp: (listId: string, taskIndex: number) => void;
  onMoveTaskDown: (listId: string, taskIndex: number) => void;
};

export const TaskListCard = memo(function TaskListCard({
  list,
  zoomRef,
  autoFocusFirstRow,
  onMove,
  onDelete,
  onTagChange,
  onTaskChange,
  onCompleteTask,
  onReorderTask,
  onMoveTaskUp,
  onMoveTaskDown,
}: TaskListCardProps) {
  const rowsRef = useRef<HTMLUListElement>(null);
  const [isMoving, setIsMoving] = useState(false);
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const numberOfTasks = countFilledTasks(list.tasks);
  const multipleTasks = numberOfTasks > 1;
  const noTasks = numberOfTasks === 0;

  const { draggingIndex, handleDragHandlePointerDown } = useRowDragReorder({
    rowsRef,
    onReorder: (fromIndex, toIndex) =>
      onReorderTask(list.id, fromIndex, toIndex),
  });
  const someRowIsDragging = draggingIndex !== null;

  const handleKeyDown = useTaskKeyboardNavigation({
    taskListRef: rowsRef,
    taskCount: list.tasks.length,
    onDone: (index) => onCompleteTask(list.id, index),
    moveTaskUp: (index) => onMoveTaskUp(list.id, index),
    moveTaskDown: (index) => onMoveTaskDown(list.id, index),
  });

  const handleChange = (
    event: FormEvent<HTMLInputElement>,
    taskIndex: number
  ) => {
    onTaskChange(list.id, taskIndex, event.currentTarget.value);
  };

  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target;

    if (
      !event.isPrimary ||
      (target instanceof Element &&
        (target.closest("input") || target.closest("button")))
    ) {
      return;
    }

    event.preventDefault();
    const { pointerId } = event;
    const startClient = { x: event.clientX, y: event.clientY };
    const startPosition = { x: list.x, y: list.y };
    setIsMoving(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }

      const zoom = zoomRef.current || 1;
      onMove(
        list.id,
        startPosition.x + (moveEvent.clientX - startClient.x) / zoom,
        startPosition.y + (moveEvent.clientY - startClient.y) / zoom
      );
    };

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) {
        return;
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      setIsMoving(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
  };

  const taskRows = list.tasks.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === list.tasks.length - 1;
    const isEmptyTask = task.trim() === "";
    const isDraggingRow = draggingIndex === idx;
    const anotherRowIsDragging = someRowIsDragging && !isDraggingRow;

    return (
      <li
        key={idx}
        data-task-row
        className={cn("relative", isDraggingRow && "z-10")}
      >
        <div
          className={cn(
            "group/row relative flex w-full origin-center",
            isDraggingRow && cn(dragLiftClassName, dragScaleUpClassName)
          )}
        >
          <input
            value={task}
            onChange={(event) => handleChange(event, idx)}
            autoCapitalize="false"
            autoFocus={isFirstTask && autoFocusFirstRow}
            autoComplete="off"
            spellCheck="false"
            placeholder={isFirstTask && noTasks ? `${placeholder}?` : ""}
            aria-label={`Task ${idx + 1}`}
            onKeyDown={(event) => handleKeyDown(event, idx)}
            className={cn(
              "peer w-full bg-white px-4 py-3 text-black focus:outline-none",
              "dark:bg-surface dark:text-ink",
              !isEmptyTask && multipleTasks && "group-hover/row:pr-2",
              someRowIsDragging && "cursor-grabbing",
              !isLastTask && !isDraggingRow && ROW_DIVIDER,
              isDraggingRow && "rounded-2xl"
            )}
          />
          <span
            aria-label="Drag handle to reorder task"
            tabIndex={-1}
            onPointerDown={(event) => handleDragHandlePointerDown(event, idx)}
            className={cn(
              "flex touch-none items-center justify-center bg-white pr-2",
              "text-black placeholder:select-none",
              "dark:bg-surface dark:text-ink",
              isDraggingRow ? "cursor-grabbing" : "hover:cursor-grab",
              !isLastTask && !isDraggingRow && ROW_DIVIDER,
              isEmptyTask || !multipleTasks || anotherRowIsDragging
                ? "hidden"
                : isDraggingRow
                  ? "flex"
                  : HOVER_REVEAL
            )}
          >
            <DragVertical className="origin-center fill-black dark:fill-ink" />
          </span>
          <button
            aria-label="complete task"
            aria-keyshortcuts="control+enter"
            onClick={() => onCompleteTask(list.id, idx)}
            className={cn(
              pressFeedbackGroupClassName("done"),
              "select-none items-center justify-center",
              "border-l border-line px-4 dark:border-edge",
              !isLastTask && "border-b",
              ACTION_ACCENT_SURFACE,
              isEmptyTask || someRowIsDragging ? "hidden" : HOVER_REVEAL
            )}
          >
            <span className={pressFeedbackGroupChildClassName("done")}>
              done
            </span>
          </button>
        </div>
      </li>
    );
  });

  return (
    <section
      data-canvas-item
      aria-label={list.tag.trim() ? `${list.tag} list` : "task list"}
      style={{ left: list.x, top: list.y, width: LIST_WIDTH }}
      className={cn(
        "task-panel absolute overflow-hidden shadow-brutalist-dark dark:shadow-none",
        isMoving && "z-30"
      )}
    >
      <header
        onPointerDown={handleHeaderPointerDown}
        className={cn(
          "flex min-h-11 touch-none items-stretch border-b border-line bg-white",
          "dark:border-hairline dark:bg-surface",
          isMoving ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <span aria-hidden="true" className="flex select-none items-center pl-3">
          <ArrowsMove size={18} className="fill-muted dark:fill-inkMuted" />
        </span>
        <input
          value={list.tag}
          onChange={(event) => onTagChange(list.id, event.currentTarget.value)}
          autoCapitalize="false"
          autoComplete="off"
          spellCheck="false"
          placeholder="add a tag (e.g. work)"
          aria-label="List tag"
          className={cn(
            "w-full min-w-0 bg-transparent px-2 text-sm font-medium",
            "text-black placeholder:text-muted focus:outline-none",
            "dark:text-ink dark:placeholder:text-inkMuted"
          )}
        />
        <button
          aria-label="delete list"
          onClick={() => onDelete(list.id)}
          className={cn(
            pressFeedbackGroupClassName("clear-history"),
            "flex w-10 shrink-0 items-center justify-center border-l border-line",
            "dark:border-hairline",
            DRAWER_TEXT,
            DESTRUCTIVE_ACTION_HOVER
          )}
        >
          <span
            aria-hidden="true"
            className={pressFeedbackGroupChildClassName("clear-history")}
          >
            <Trash size={16} className={DESTRUCTIVE_TRASH_ICON} />
          </span>
        </button>
      </header>
      <ul ref={rowsRef}>{taskRows}</ul>
    </section>
  );
});
