import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  ACTION_ACCENT_SURFACE,
  HOVER_REVEAL,
  ROW_DIVIDER,
  TASK_PANEL_WIDTH,
} from "src/constants/ui";
import {
  dragLiftClassName,
  dragScaleDownClassName,
  dragScaleUpClassName,
  pressFeedbackGroupChildClassName,
  pressFeedbackGroupClassName,
} from "src/constants/motion";
import { placeholders } from "src/content";
import { useGeneralTasksContext } from "src/contexts";
import { useTaskKeyboardNavigation, useTasksComponentWidth } from "src/hooks";
import { DragVertical } from "src/icons";
import {
  cn,
  getRandomElement,
  isMobile,
  MAX_ACTIVE_TASKS,
  reorderListFromDragResult,
  getDraggableDropStyle,
  countFilledTasks,
} from "src/utils";

export function GeneralTasks() {
  const {
    generalTasks,
    changeGeneralTask,
    completeGeneralTask,
    setGeneralTasks,
    moveTaskUp,
    moveTaskDown,
  } = useGeneralTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
  const { tasksListRef, width, isResizable, handlePointerDown } =
    useTasksComponentWidth();

  const numberOfGeneralTasks = countFilledTasks(generalTasks);
  const multipleGeneralTasks = numberOfGeneralTasks > 1;
  const noGeneralTasks = numberOfGeneralTasks === 0;
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleKeyDown = useTaskKeyboardNavigation({
    taskListRef: tasksListRef,
    taskCount: MAX_ACTIVE_TASKS,
    onDone: completeGeneralTask,
    moveTaskUp,
    moveTaskDown,
  });

  const handleChange = (event: FormEvent<HTMLInputElement>, index: number) => {
    changeGeneralTask(index, event.currentTarget.value);
  };

  const handleDragEnd = (result: DropResult) => {
    const reordered = reorderListFromDragResult(generalTasks, result);

    if (reordered) {
      setGeneralTasks(reordered);
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setSomeDragIsHappening(false);
  };

  const generalTasksMap = generalTasks.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === generalTasks.length - 1;
    const isEmptyTask = task.trim() === "";

    return (
      <Draggable draggableId={idx.toString()} index={idx} key={idx}>
        {(provided, snapshot) => {
          const isDragging = snapshot.isDragging;
          const isDropAnimating = snapshot.isDropAnimating;
          const isDragActive = isDragging || isDropAnimating;
          const anotherTaskIsBeingDragged = !isDragging && someDragIsHappening;

          return (
            <li
              {...provided.draggableProps}
              ref={provided.innerRef}
              style={getDraggableDropStyle(
                provided.draggableProps.style,
                snapshot
              )}
              className={cn("relative", isDragActive && "z-50")}
            >
              <div
                className={cn(
                  "group/row relative flex w-full origin-center",
                  isDragging && cn(dragLiftClassName, dragScaleUpClassName),
                  isDropAnimating &&
                    cn(dragLiftClassName, dragScaleDownClassName)
                )}
              >
                <input
                  value={task}
                  onChange={(event) => handleChange(event, idx)}
                  autoCapitalize="false"
                  autoFocus={isFirstTask && !isMobile()}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder={
                    isFirstTask && noGeneralTasks ? `${placeholder}?` : ""
                  }
                  aria-label={`Task ${idx + 1}`}
                  onKeyDown={(event) => handleKeyDown(event, idx)}
                  className={cn(
                    "peer w-full bg-white px-5 py-4 text-black focus:outline-none",
                    "dark:bg-surface dark:text-ink sm:text-lg",
                    !isEmptyTask &&
                      multipleGeneralTasks &&
                      "group-hover/row:pr-2",
                    someDragIsHappening && "cursor-grabbing",
                    isDragActive
                      ? "rounded-2xl border-0"
                      : cn(
                          isFirstTask && "rounded-t-2xl border-t-0",
                          isLastTask && "rounded-b-2xl border-b-0",
                          !isLastTask && ROW_DIVIDER
                        )
                  )}
                />
                <span
                  {...provided.dragHandleProps}
                  aria-label="Drag handle to reorder task"
                  tabIndex={-1}
                  className={cn(
                    "group/drag flex items-center justify-center bg-white pr-2",
                    "text-black placeholder:select-none hover:cursor-grab",
                    "dark:bg-surface dark:text-ink sm:text-lg",
                    !isLastTask && !isDragActive && ROW_DIVIDER,
                    isEmptyTask ||
                      !multipleGeneralTasks ||
                      anotherTaskIsBeingDragged ||
                      isDragActive
                      ? "hidden"
                      : HOVER_REVEAL
                  )}
                >
                  <DragVertical className="dark:fill-ink origin-center fill-black" />
                </span>
                <button
                  aria-label="complete task"
                  aria-keyshortcuts="control+enter"
                  onClick={() => completeGeneralTask(idx)}
                  className={cn(
                    pressFeedbackGroupClassName("done"),
                    "select-none items-center justify-center",
                    "border-line dark:border-edge border-b border-l px-4",
                    ACTION_ACCENT_SURFACE,
                    "xs:px-6 sm:text-lg",
                    !isDragActive && isFirstTask && "rounded-tr-2xl",
                    !isDragActive && isLastTask && "rounded-br-2xl",
                    isEmptyTask || anotherTaskIsBeingDragged || isDragActive
                      ? "hidden"
                      : HOVER_REVEAL
                  )}
                >
                  <span className={pressFeedbackGroupChildClassName("done")}>
                    done
                  </span>
                </button>
              </div>
            </li>
          );
        }}
      </Draggable>
    );
  });

  return (
    <section className="flex flex-col items-center gap-4">
      <p className="dark:text-ink text-xl text-black sm:text-2xl">
        what do you want to do?
      </p>
      <ul
        ref={tasksListRef}
        onPointerDown={isResizable ? handlePointerDown : undefined}
        style={isResizable ? { width: `${width}px` } : undefined}
        className={cn(
          "task-panel shadow-brutalist-dark overflow-hidden dark:shadow-none",
          isResizable ? "min-w-[300px] resize-x" : TASK_PANEL_WIDTH
        )}
      >
        <DragDropContext
          onDragEnd={handleDragEnd}
          onDragStart={() => setSomeDragIsHappening(true)}
        >
          <Droppable droppableId="tasksList">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {generalTasksMap}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ul>
    </section>
  );
}
