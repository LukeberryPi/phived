import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { placeholders } from "src/content";
import { useGeneralTasksContext } from "src/contexts";
import {
  useLocalStorage,
  useTaskKeyboardNavigation,
  useTasksComponentWidth,
} from "src/hooks";
import { Close, DragVertical, Light, Open } from "src/icons";
import {
  appendProtocolToUrl,
  cn,
  extractTaskLink,
  getRandomElement,
  isMobile,
  reorderListFromDragResult,
} from "src/utils";

const TASK_COUNT = 5;

export function GeneralTasks() {
  const {
    generalMessage,
    generalTasks,
    changeGeneralTask,
    completeGeneralTask,
    setGeneralTasks,
    moveTaskUp,
    moveTaskDown,
  } = useGeneralTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
  const { tasksComponentWidth, handleResize } = useTasksComponentWidth();
  const [showTasksWontBeLostAlert, setShowTasksWontBeLost] = useLocalStorage(
    "showTasksWontBeLostAlert",
    true
  );

  const numberOfGeneralTasks = generalTasks.filter(Boolean).length;
  const multipleGeneralTasks = numberOfGeneralTasks > 1;
  const noGeneralTasks = numberOfGeneralTasks === 0;
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleKeyDown = useTaskKeyboardNavigation({
    taskCount: TASK_COUNT,
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
    const taskLink = extractTaskLink(task);

    return (
      <Draggable draggableId={idx.toString()} index={idx} key={idx}>
        {(provided, snapshot) => {
          const isBeingDragged = snapshot.isDragging;
          const anotherTaskIsBeingDragged =
            !isBeingDragged && someDragIsHappening;

          return (
            <li
              {...provided.draggableProps}
              key={idx}
              ref={provided.innerRef}
              className={cn(
                "group relative flex",
                isBeingDragged &&
                  "rounded-2xl border-l border-t border-black/30 dark:border-white/30"
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
                  isBeingDragged &&
                    "border-b border-black/30 dark:border-white/30",
                  !isEmptyTask && multipleGeneralTasks && "group-hover:pr-2",
                  isFirstTask && "rounded-t-2xl border-t-0",
                  isLastTask && "rounded-b-2xl border-b-0",
                  !isLastTask && "border-b border-black dark:border-white",
                  someDragIsHappening && "cursor-grabbing"
                )}
              />
              <a
                href={appendProtocolToUrl(taskLink ?? "")}
                rel="noreferrer"
                target="_blank"
                className={cn(
                  "absolute -left-14 flex size-14 flex-col items-center justify-center",
                  "text-sm text-transparent transition-transform active:scale-95",
                  taskLink &&
                    "hover:text-black peer-hover:text-black dark:hover:text-white dark:peer-hover:text-white"
                )}
              >
                <Open size={24} />
              </a>
              <span
                {...provided.dragHandleProps}
                aria-label="Drag handle to reorder task"
                tabIndex={-1}
                className={cn(
                  "group/drag flex items-center justify-center bg-white pr-2",
                  "text-black placeholder:select-none hover:cursor-grab",
                  "dark:bg-zinc-950 dark:text-white sm:text-lg",
                  !isLastTask && "border-b border-black dark:border-white",
                  isEmptyTask ||
                    !multipleGeneralTasks ||
                    anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex",
                  isBeingDragged
                    ? "border-b border-black/30 dark:border-white/30"
                    : "hidden"
                )}
              >
                <DragVertical
                  className={cn(
                    "origin-center fill-black transition-transform",
                    "group-active/drag:scale-90 dark:fill-white"
                  )}
                />
              </span>
              <button
                aria-label="complete task"
                aria-keyshortcuts="control+enter"
                onClick={() => completeGeneralTask(idx)}
                className={cn(
                  "group/done select-none items-center justify-center",
                  "border-b border-l border-black bg-sky-300 px-4",
                  "dark:border-white dark:bg-cyan-800 dark:text-white xs:px-6 sm:text-lg",
                  isFirstTask && "rounded-tr-2xl",
                  isLastTask && "rounded-br-2xl",
                  isEmptyTask || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex",
                  isBeingDragged
                    ? "border-b border-l border-black/30 dark:border-white/30"
                    : "hidden"
                )}
              >
                <span className="transition-transform group-active/done:scale-95">
                  done?
                </span>
              </button>
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
        onMouseUp={handleResize}
        style={{ width: `${tasksComponentWidth}px` }}
        className={cn(
          "w-[300px] resize-x overflow-hidden rounded-2xl border border-black",
          "shadow-brutalist-dark dark:border-white dark:shadow-brutalist-light",
          "tiny:w-80 xs:w-96"
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
      <div
        className={cn(
          "group flex items-center gap-3 text-black dark:text-white",
          (generalMessage ||
            !multipleGeneralTasks ||
            !showTasksWontBeLostAlert) &&
            "invisible"
        )}
      >
        <Light size={24} />
        <p className="text-xs xs:text-sm">
          your tasks won&apos;t be lost <br />
          if you close the website
        </p>
        <button
          onClick={() => setShowTasksWontBeLost(false)}
          className={cn(
            "rounded-md p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          )}
        >
          <Close size={24} className="fill-black dark:fill-white" />
        </button>
      </div>
    </section>
  );
}
