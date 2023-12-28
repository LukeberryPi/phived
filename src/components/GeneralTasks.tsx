import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { placeholders } from "src/content";
import { useGeneralTasksContext } from "src/contexts";
import { setTasksDefaultWidth } from "src/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import { Close, DragVertical, Light } from "src/icons";
import { useLocalStorage } from "src/hooks";
// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350

const DEFAULT_WIDTH = setTasksDefaultWidth();

export function GeneralTasks() {
  const {
    generalMessage,
    generalTasks,
    changeGeneralTask,
    completeGeneralTask,
    setGeneralTasks,
  } = useGeneralTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
  const [tasksComponentWidth, setTasksComponentWidth] = useLocalStorage(
    "tasksComponentWidth",
    DEFAULT_WIDTH
  );
  const [showTasksWontBeLost, setShowTasksWontBeLost] = useLocalStorage(
    "showTasksWontBeLost",
    true
  );

  const numberOfTasks = generalTasks.filter(Boolean).length;
  const multipleGeneralTasks = numberOfTasks > 1;

  const getRandomElement = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleChange = (
    event: React.FormEvent<HTMLInputElement>,
    i: number
  ) => {
    const currentTask = event.currentTarget.value;
    changeGeneralTask(i, currentTask);
  };

  const handleResize = (e: MouseEvent<HTMLUListElement>) => {
    const newWidth = e.currentTarget.offsetWidth;

    if (newWidth !== tasksComponentWidth) {
      setTasksComponentWidth(newWidth);
    }
  };

  useEffect(() => {
    setTasksComponentWidth(tasksComponentWidth);
  }, [setTasksComponentWidth, tasksComponentWidth]);

  const handleDone = (i: number) => {
    completeGeneralTask(i);
  };

  const hideTasksSaved = () => {
    setShowTasksWontBeLost(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    i: number
  ) => {
    // event.metaKey is macOS command key
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      return handleDone(i);
    }
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      return document.querySelectorAll("input")[i - 1]?.focus();
    }
    if (event.key === "Enter" && !event.ctrlKey) {
      event.preventDefault();
      return document.querySelectorAll("input")[i + 1]?.focus();
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const destinationIndex = result.destination?.index;

    if (destinationIndex || destinationIndex === 0) {
      setGeneralTasks((prev: string[]) => {
        const actualTasks = [...prev];
        const draggedTask = actualTasks.splice(result.source.index, 1)[0];
        actualTasks.splice(destinationIndex, 0, draggedTask);

        const filledTasks = actualTasks.filter((t) => t !== "");
        const newTasksArray = Array(5).fill("");
        newTasksArray.splice(0, filledTasks.length, ...filledTasks);

        return newTasksArray;
      });
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
          const isBeingDragged = snapshot.isDragging;
          const anotherTaskIsBeingDragged =
            !isBeingDragged && someDragIsHappening;

          return (
            <li
              {...provided.draggableProps}
              key={idx}
              className={`group flex ${
                isBeingDragged &&
                "overflow-hidden rounded-2xl border-l border-t border-trueBlack/30 dark:border-trueWhite/30"
              }`}
              ref={provided.innerRef}
            >
              <input
                value={task}
                onChange={(event) => handleChange(event, idx)}
                autoCapitalize="false"
                autoFocus={isFirstTask}
                autoComplete="off"
                spellCheck="false"
                placeholder={`${isFirstTask ? `${placeholder}?` : ""}`}
                aria-label={`Task ${idx + 1}`}
                onKeyDown={(event) => handleKeyDown(event, idx)}
                className={`peer w-full ${
                  isBeingDragged &&
                  "border-b border-trueBlack/30 dark:border-trueWhite/30"
                } ${
                  !isEmptyTask && multipleGeneralTasks && "group-hover:pr-2"
                } ${isFirstTask && "rounded-t-2xl border-t-0"} ${
                  isLastTask
                    ? "rounded-b-2xl"
                    : "border-b border-trueBlack dark:border-trueWhite"
                } ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-trueWhite py-4 px-5 text-trueBlack focus:outline-none dark:bg-softBlack dark:text-trueWhite sm:text-lg`}
              />
              <span
                {...provided.dragHandleProps}
                aria-label="Drag handle to reorder task"
                className={`${
                  !isLastTask &&
                  "border-b border-trueBlack dark:border-trueWhite"
                } ${
                  isEmptyTask ||
                  !multipleGeneralTasks ||
                  anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-b border-trueBlack/30 dark:border-trueWhite/30"
                    : "hidden"
                } flex items-center justify-center bg-trueWhite pr-2 text-trueBlack placeholder:select-none hover:cursor-grab dark:bg-softBlack dark:text-trueWhite sm:text-lg`}
                tabIndex={-1}
              >
                <DragVertical className="fill-trueBlack dark:fill-trueWhite" />
              </span>
              <button
                onClick={() => handleDone(idx)}
                className={`${isFirstTask && "rounded-tr-2xl"} ${
                  isLastTask && "rounded-br-2xl"
                } ${
                  isEmptyTask || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-l border-b border-trueBlack/30 dark:border-trueWhite/30"
                    : "hidden"
                } cursor-pointer items-center justify-center border-l border-b border-trueBlack bg-berryBlue px-4 dark:border-trueWhite dark:bg-purpleRain dark:text-trueWhite xs:px-6 sm:text-lg`}
              >
                done?
              </button>
            </li>
          );
        }}
      </Draggable>
    );
  });

  return (
    <section className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-2 text-center">
        <p className="mx-auto w-fit rounded-lg bg-berryBlue px-2 py-1 text-sm dark:bg-purpleRain dark:text-trueWhite sm:text-base">
          general
        </p>
        <p className="text-lg text-trueBlack dark:text-trueWhite xs:text-xl sm:text-2xl">
          what do you want to do?
        </p>
      </div>
      <ul
        onMouseUp={handleResize}
        style={{
          width: `${tasksComponentWidth}px`,
        }}
        className="w-[300px] resize-x overflow-hidden rounded-2xl border border-trueBlack shadow-brutalist-dark dark:border-trueWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96"
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
        className={`${
          (generalMessage || !multipleGeneralTasks || !showTasksWontBeLost) &&
          "invisible"
        } group flex items-center gap-3 text-trueBlack dark:text-trueWhite`}
      >
        <Light size={24} />
        <p className="text-xs xs:text-sm">
          your tasks won&apos;t be lost <br />
          if you close the website
        </p>
        <button
          onClick={hideTasksSaved}
          className="rounded-md p-1 hover:bg-unavailableLight dark:hover:bg-unavailableDark"
        >
          <Close size={24} className="fill-trueBlack dark:fill-trueWhite" />
        </button>
      </div>
    </section>
  );
}
