import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { HOVER_REVEAL, ROW_DIVIDER, TASK_PANEL_WIDTH } from "src/constants/ui";
import {
  dragLiftClassName,
  dragScaleDownClassName,
  dragScaleUpClassName,
  pressFeedbackGroupChildClassName,
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
                  "group relative flex w-full origin-center",
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
                    "dark:bg-zinc-950 dark:text-white sm:text-lg",
                    !isEmptyTask && multipleGeneralTasks && "group-hover:pr-2",
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
                    "dark:bg-zinc-950 dark:text-white sm:text-lg",
                    !isLastTask && !isDragActive && ROW_DIVIDER,
                    isEmptyTask ||
                      !multipleGeneralTasks ||
                      anotherTaskIsBeingDragged ||
                      isDragActive
                      ? "hidden"
                      : HOVER_REVEAL
                  )}
                >
                  <DragVertical className="origin-center fill-black dark:fill-white" />
                </span>
                <button
                  aria-label="complete task"
                  aria-keyshortcuts="control+enter"
                  onClick={() => completeGeneralTask(idx)}
                  className={cn(
                    "group",
                    "select-none items-center justify-center",
                    "border-b border-l border-black bg-sky-300 px-4",
                    "dark:border-white dark:bg-cyan-800 dark:text-white xs:px-6 sm:text-lg",
                    !isDragActive && isFirstTask && "rounded-tr-2xl",
                    !isDragActive && isLastTask && "rounded-br-2xl",
                    isEmptyTask || anotherTaskIsBeingDragged || isDragActive
                      ? "hidden"
                      : HOVER_REVEAL
                  )}
                >
                  <span className={pressFeedbackGroupChildClassName}>done</span>
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
      <p className="text-xl text-black dark:text-white sm:text-2xl">
        what do you want to do?
      </p>
      <ul
        ref={tasksListRef}
        onPointerDown={isResizable ? handlePointerDown : undefined}
        style={isResizable ? { width: `${width}px` } : undefined}
        className={cn(
          "task-panel overflow-hidden shadow-brutalist-dark dark:shadow-brutalist-light",
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
