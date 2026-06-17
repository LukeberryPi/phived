import type { FormEvent, MutableRefObject } from "react";
import { memo, useMemo, useRef } from "react";
import { TaskRow } from "src/components/TaskRow";
import { Tooltip } from "src/components/Tooltip";
import {
  ACTION_ACCENT_SURFACE,
  DRAWER_HEADER_HOVER,
  DRAWER_MUTED_TEXT,
} from "src/constants/ui";
import {
  pressFeedbackClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { placeholders } from "src/content";
import type { TaskListActions } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";
import {
  useMovableTaskList,
  useResizableTaskList,
  useRowDragReorder,
  useTaskKeyboardNavigation,
} from "src/hooks";
import { ArrowsMove, Focus, Plus, Trash } from "src/icons";
import type { TaskList } from "src/types/canvas";
import { cn, countFilledTasks, getRandomElement } from "src/utils";
import { LIST_WIDTH } from "src/utils/canvas";

type TaskListCardProps = {
  list: TaskList;
  stackIndex: number;
  zoomRef: MutableRefObject<number>;
  autoFocusFirstRow: boolean;
  focused: boolean;
  dimmed: boolean;
  canDeleteList: boolean;
  onToggleFocus: () => void;
  actions: TaskListActions;
};

export const TaskListCard = memo(function TaskListCard({
  list,
  stackIndex,
  zoomRef,
  autoFocusFirstRow,
  focused,
  dimmed,
  canDeleteList,
  onToggleFocus,
  actions,
}: TaskListCardProps) {
  const rowsRef = useRef<HTMLUListElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const numberOfTasks = countFilledTasks(list.tasks);
  const noTasks = numberOfTasks === 0;

  const { draggingIndex, handleDragHandlePointerDown } = useRowDragReorder({
    rowsRef,
    onReorder: (fromIndex, toIndex) =>
      actions.reorderTask(list.id, fromIndex, toIndex),
  });
  const someRowIsDragging = draggingIndex !== null;
  const { isMoving, handleMovePointerDown } = useMovableTaskList({
    list,
    zoomRef,
    onMove: actions.moveList,
  });
  const { isResizing, handleResizePointerDown } = useResizableTaskList({
    list,
    zoomRef,
    onResize: actions.resizeList,
  });
  const controlsArePinned = isMoving || isResizing || focused;
  // `inert` blocks focus, tabbing, and AT access on dimmed lists. React 18
  // only forwards the attribute when given a non-boolean value.
  const inertProps = dimmed ? { inert: "" as unknown as boolean } : {};

  const { onTaskKeyDown, onTagKeyDown } = useTaskKeyboardNavigation({
    taskListRef: rowsRef,
    tagRef,
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
    const input = event.currentTarget;
    actions.changeTask(list.id, taskIndex, input.value);

    const overflow = input.scrollWidth - input.clientWidth;
    if (overflow > 0) {
      const currentWidth = list.width ?? LIST_WIDTH;
      actions.resizeList(list.id, currentWidth + overflow + 2);
    }
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
        onKeyDown={onTaskKeyDown}
        onDragPointerDown={handleDragHandlePointerDown}
        onComplete={(index) => actions.completeTask(list.id, index)}
      />
    );
  });

  return (
    <section
      data-canvas-item
      data-canvas-focused={focused ? "" : undefined}
      onContextMenu={(event) => {
        if (!dimmed) {
          event.stopPropagation();
        }
      }}
      onPointerDown={() => {
        if (!dimmed) {
          actions.bringListToFront(list.id);
        }
      }}
      aria-label={list.tag.trim() ? `${list.tag} list` : "task list"}
      style={{
        left: list.x,
        top: list.y,
        width: list.width ?? LIST_WIDTH,
        zIndex: controlsArePinned ? 30 : stackIndex,
      }}
      className={cn(
        "group/card ease-out-strong absolute transition-opacity duration-200",
        dimmed && "opacity-10"
      )}
    >
      {/* Swallows pointer interactions while dimmed: it sits above the inert
          content but inside [data-canvas-item], so canvas pan/double-click
          spawn ignore events here instead of acting "through" the card. */}
      {dimmed && (
        <div
          aria-hidden="true"
          className="absolute -top-7 -right-2 bottom-0 left-0 z-40 cursor-default"
        />
      )}
      {/* Folder tab: flush with the panel's left edge, fits its content,
          rounded top corners, and sits directly on the panel's top border. */}
      <input
        {...inertProps}
        ref={tagRef}
        value={list.tag}
        onChange={(event) =>
          actions.setListTag(list.id, event.currentTarget.value)
        }
        onKeyDown={onTagKeyDown}
        autoCapitalize="false"
        autoComplete="off"
        spellCheck="false"
        placeholder="add a tag"
        aria-label="List tag"
        // Inline style because the unlayered iOS `input` border-radius
        // reset in index.css overrides rounded-* utilities.
        style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
        className={cn(
          "absolute -top-7 left-0 z-10 h-7 max-w-[75%]",
          "field-sizing-content min-w-[calc(1ch+1.5rem)] border-x border-t border-black px-3",
          "text-sm font-medium focus:outline-none",
          ACTION_ACCENT_SURFACE,
          "dark:border-edge-dark dark:placeholder:text-ink-dark/45 placeholder:text-black/45"
        )}
      />
      <div {...inertProps} className="relative">
        {/* Top-left corner squared so the folder tab connects seamlessly. */}
        <div className="task-panel shadow-brutalist-dark overflow-hidden rounded-tl-none dark:shadow-none">
          <ul ref={rowsRef}>{taskRows}</ul>
          <button
            type="button"
            onClick={() => actions.addTaskRow(list.id)}
            className={cn(
              "border-line-light flex min-h-10 w-full items-center justify-center gap-2 border-t",
              "dark:border-hairline-dark dark:bg-surface-dark bg-white text-sm font-medium",
              DRAWER_MUTED_TEXT,
              DRAWER_HEADER_HOVER,
              pressFeedbackGroupClassName("add-row")
            )}
          >
            <Plus size={16} className="text-current" />
            add row
          </button>
        </div>
        <Tooltip label="resize list" disabled={isResizing}>
          <button
            type="button"
            aria-label="resize list"
            onPointerDown={handleResizePointerDown}
            className={cn(
              "absolute top-1/2 right-0 h-10 w-4 translate-x-[56%] -translate-y-1/2 dark:translate-x-1/2",
              "flex cursor-ew-resize touch-none items-center justify-center gap-2",
              HOVER_REVEAL_CONTROLS,
              "focus-visible:opacity-100",
              isResizing && "opacity-100"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-9 w-2 rounded-full border border-black bg-white",
                "dark:border-edge-dark dark:bg-surface-hover-dark"
              )}
            />
          </button>
        </Tooltip>
      </div>
      <div
        {...inertProps}
        className={cn(
          "flex items-center justify-center gap-1 pt-1.5",
          HOVER_REVEAL_CONTROLS,
          "focus-within:opacity-100",
          controlsArePinned && "opacity-100"
        )}
      >
        <Tooltip label="move list" disabled={isMoving}>
          <button
            type="button"
            aria-label="move list"
            onPointerDown={handleMovePointerDown}
            className={cn(
              pressFeedbackClassName,
              LIST_ACTION_BUTTON,
              "group/move-list touch-none",
              isMoving ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                CIRCLE_BACKDROP,
                "bg-surface-hover-light dark:bg-surface-hover-dark",
                HOVER_CIRCLE_IN("move-list"),
                isMoving && "scale-100 opacity-100"
              )}
            />
            <ArrowsMove
              size={18}
              className="text-muted-light dark:text-muted-dark relative"
            />
          </button>
        </Tooltip>
        <Tooltip label={focused ? "unfocus list" : "focus list"}>
          <button
            type="button"
            aria-label={focused ? "unfocus list" : "focus list"}
            aria-pressed={focused}
            onClick={onToggleFocus}
            className={cn(
              pressFeedbackClassName,
              LIST_ACTION_BUTTON,
              "group/focus-list"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                CIRCLE_BACKDROP,
                ACTION_ACCENT_SURFACE,
                HOVER_CIRCLE_IN("focus-list"),
                focused && "scale-100 opacity-100"
              )}
            />
            <Focus
              size={18}
              className={cn(
                "relative transition-colors duration-150",
                focused
                  ? "dark:text-ink-dark text-black"
                  : "text-muted-light dark:text-muted-dark"
              )}
            />
          </button>
        </Tooltip>
        <Tooltip
          label={canDeleteList ? "delete list" : "can't delete the last list"}
        >
          {/* `aria-disabled` rather than the native `disabled` attribute keeps
           * the button focusable so keyboard/screen-reader users can reach it
           * and hear why it's unavailable; activation is blocked in the
           * handler since `aria-disabled` is advisory only. */}
          <button
            type="button"
            aria-label={
              canDeleteList ? "delete list" : "can't delete the last list"
            }
            aria-disabled={!canDeleteList}
            onClick={() => {
              if (!canDeleteList) {
                return;
              }
              actions.requestDeleteList(list.id);
            }}
            className={cn(
              canDeleteList && pressFeedbackClassName,
              LIST_ACTION_BUTTON,
              "group/delete-list",
              "aria-disabled:cursor-not-allowed aria-disabled:opacity-45"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                CIRCLE_BACKDROP,
                "bg-red-100 dark:bg-red-950",
                canDeleteList && HOVER_CIRCLE_IN("delete-list")
              )}
            />
            <Trash
              size={16}
              className="relative text-red-600 dark:text-red-400"
            />
          </button>
        </Tooltip>
      </div>
    </section>
  );
});

/** List action icon buttons (move, focus, delete). An opaque canvas-light base
 * keeps the dotted canvas from showing through the icon glyphs at rest. */
const LIST_ACTION_BUTTON = cn(
  "relative flex size-9 items-center justify-center rounded-full",
  "bg-canvas-light dark:bg-canvas-dark"
);

/** Controls fade in on card hover (pointer devices); always visible on touch. */
const HOVER_REVEAL_CONTROLS = cn(
  "transition-opacity duration-150",
  "pointer-fine:opacity-0 pointer-fine:group-hover/card:opacity-100"
);

/** Circular backdrop behind icon buttons; grows in on per-button hover. */
const CIRCLE_BACKDROP = cn(
  "ease-out-strong absolute inset-0 rounded-full",
  "scale-75 opacity-0 transition-[transform,opacity] duration-150",
  "motion-reduce:scale-100 motion-reduce:transition-[opacity]"
);

const HOVER_CIRCLE_IN_CLASSES = {
  "move-list":
    "pointer-fine:group-hover/move-list:scale-100 pointer-fine:group-hover/move-list:opacity-100",
  "focus-list":
    "pointer-fine:group-hover/focus-list:scale-100 pointer-fine:group-hover/focus-list:opacity-100",
  "delete-list":
    "pointer-fine:group-hover/delete-list:scale-100 pointer-fine:group-hover/delete-list:opacity-100",
} as const;

function HOVER_CIRCLE_IN(group: keyof typeof HOVER_CIRCLE_IN_CLASSES) {
  return HOVER_CIRCLE_IN_CLASSES[group];
}
