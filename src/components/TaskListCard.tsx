import type { FormEvent, MutableRefObject } from "react";
import { memo, useMemo, useRef } from "react";
import { TaskRow } from "src/components/TaskRow";
import { Tooltip } from "src/components/Tooltip";
import {
  ACTION_ACCENT_SURFACE,
  DESTRUCTIVE_ACTION_HOVER,
  DESTRUCTIVE_TRASH_ICON,
  DRAWER_TEXT,
} from "src/constants/ui";
import {
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { placeholders } from "src/content";
import type { TaskListActions } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";
import {
  useMovableTaskList,
  useRowDragReorder,
  useTaskKeyboardNavigation,
} from "src/hooks";
import { ArrowsMove, Plus, Trash } from "src/icons";
import type { TaskList } from "src/types/canvas";
import { cn, countFilledTasks, getRandomElement } from "src/utils";
import { LIST_WIDTH } from "src/utils/canvas";

type TaskListCardProps = {
  list: TaskList;
  /** Stacking order on the canvas; higher renders above. */
  stackIndex: number;
  zoomRef: MutableRefObject<number>;
  autoFocusFirstRow: boolean;
  actions: TaskListActions;
};

export const TaskListCard = memo(function TaskListCard({
  list,
  stackIndex,
  zoomRef,
  autoFocusFirstRow,
  actions,
}: TaskListCardProps) {
  const rowsRef = useRef<HTMLUListElement>(null);
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const numberOfTasks = countFilledTasks(list.tasks);
  const noTasks = numberOfTasks === 0;

  const { draggingIndex, handleDragHandlePointerDown } = useRowDragReorder({
    rowsRef,
    onReorder: (fromIndex, toIndex) =>
      actions.reorderTask(list.id, fromIndex, toIndex),
  });
  const someRowIsDragging = draggingIndex !== null;
  const { isMoving, handleHeaderPointerDown } = useMovableTaskList({
    list,
    zoomRef,
    onMove: actions.moveList,
  });

  const handleKeyDown = useTaskKeyboardNavigation({
    taskListRef: rowsRef,
    tasks: list.tasks,
    onDone: (index) => actions.completeTask(list.id, index),
    addTaskRow: () => actions.addTaskRow(list.id),
    insertTaskRowBelow: (index) => actions.insertTaskRowBelow(list.id, index),
    insertTaskRowAbove: (index) => actions.insertTaskRowAbove(list.id, index),
    removeEmptyTaskRow: (index) => actions.removeEmptyTaskRow(list.id, index),
    moveTaskUp: (index) => actions.moveTaskUp(list.id, index),
    moveTaskDown: (index) => actions.moveTaskDown(list.id, index),
  });

  const handleChange = (
    event: FormEvent<HTMLInputElement>,
    taskIndex: number
  ) => {
    actions.changeTask(list.id, taskIndex, event.currentTarget.value);
  };

  const taskRows = list.tasks.map((task, idx) => {
    const isDraggingRow = draggingIndex === idx;

    return (
      <TaskRow
        key={idx}
        index={idx}
        task={task}
        autoFocus={idx === 0 && autoFocusFirstRow}
        placeholder={idx === 0 && noTasks ? `${placeholder}?` : ""}
        isLast={idx === list.tasks.length - 1}
        isDragging={isDraggingRow}
        anotherRowIsDragging={someRowIsDragging && !isDraggingRow}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onDragPointerDown={handleDragHandlePointerDown}
        onComplete={(index) => actions.completeTask(list.id, index)}
      />
    );
  });

  return (
    <section
      data-canvas-item
      onPointerDown={() => actions.bringListToFront(list.id)}
      aria-label={list.tag.trim() ? `${list.tag} list` : "task list"}
      style={{
        left: list.x,
        top: list.y,
        width: LIST_WIDTH,
        zIndex: isMoving ? 30 : stackIndex,
      }}
      className="task-panel shadow-brutalist-dark absolute overflow-hidden dark:shadow-none"
    >
      <header
        onPointerDown={handleHeaderPointerDown}
        className={cn(
          "border-line-light flex min-h-11 touch-none items-stretch border-b bg-white",
          "dark:border-hairline-dark dark:bg-surface-dark",
          isMoving ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <span aria-hidden="true" className="flex items-center pl-3 select-none">
          <ArrowsMove
            size={18}
            className="fill-muted-light dark:fill-muted-dark"
          />
        </span>
        <input
          value={list.tag}
          onChange={(event) =>
            actions.setListTag(list.id, event.currentTarget.value)
          }
          autoCapitalize="false"
          autoComplete="off"
          spellCheck="false"
          placeholder="add a tag (e.g. work)"
          aria-label="List tag"
          className={cn(
            "w-full min-w-0 bg-transparent px-2 text-sm font-medium",
            "placeholder:text-muted-light text-black focus:outline-none",
            "dark:text-ink-dark dark:placeholder:text-muted-dark"
          )}
        />
        <Tooltip label="delete list">
          <button
            aria-label="delete list"
            onClick={() => actions.requestDeleteList(list.id)}
            className={cn(
              pressFeedbackGroupClassName("clear-history"),
              "border-line-light flex w-10 shrink-0 items-center justify-center border-l",
              "dark:border-hairline-dark",
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
        </Tooltip>
      </header>
      <ul ref={rowsRef}>{taskRows}</ul>
      <button
        type="button"
        onClick={() => actions.addTaskRow(list.id)}
        className={cn(
          "border-line-light flex min-h-10 w-full items-center justify-center gap-2 border-t",
          "dark:border-hairline-dark dark:bg-surface-dark dark:text-ink-dark bg-white text-sm font-medium text-black",
          ACTION_ACCENT_SURFACE,
          pressFeedbackGroupClassName("add-row")
        )}
      >
        <Plus size={16} className="dark:fill-ink-dark fill-black" />
        add row
      </button>
    </section>
  );
});
