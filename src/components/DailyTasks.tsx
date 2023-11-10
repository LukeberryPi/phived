import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { placeholders } from "src/content";
import { useDailyTasksContext } from "src/contexts";
import { getViewportWidth } from "src/utils";
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";
import { Clock, Close, DragVertical, Open } from "src/icons";
import { useLocalStorage } from "src/hooks";
// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350

const DEFAULT_WIDTH = setDefaultWidth();
function setDefaultWidth() {
  if (getViewportWidth() < 400) {
    return 300;
  }
  if (getViewportWidth() < 500) {
    return 320;
  }
  return 384;
}

function getTimeRemainingUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeRemaining = midnight.getTime() - now.getTime();

  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
  const seconds = Math.floor((timeRemaining / 1000) % 60);

  return {
    total: timeRemaining,
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemainingUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      const time = getTimeRemainingUntilMidnight();
      setTimeLeft(time);

      if (time.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {timeLeft.total > 0 ? (
        <div className="flex items-center gap-2">
          <Clock className="text-trueBlack dark:text-trueWhite" />
          <p className="tabular-nums text-trueBlack dark:text-trueWhite">
            {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
          </p>
        </div>
      ) : null}
    </>
  );
}

export function DailyTasks() {
  const { message, dailyTasks, changeDailyTask, completeDailyTask, setDailyTasks } =
    useDailyTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
  const [tasksComponentWidth, setTasksComponentWidth] = useLocalStorage(
    "tasksComponentWidth",
    DEFAULT_WIDTH
  );
  const [showTasksAreSaved, setShowTasksAreSaved] = useLocalStorage("showTasksAreSaved", true);

  const numberOfTasks = dailyTasks.filter(Boolean).length;
  const noTasks = numberOfTasks === 0;
  const multipleTasks = numberOfTasks > 1;

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleChange = (event: React.FormEvent<HTMLInputElement>, i: number) => {
    const currentTask = event.currentTarget.value;
    changeDailyTask(i, currentTask);
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
    completeDailyTask(i);
  };

  const hideTasksSaved = () => {
    setShowTasksAreSaved(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, i: number) => {
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
      setDailyTasks((prev: string[]) => {
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

  const dailyTasksMap = dailyTasks.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === dailyTasks.length - 1;
    const isEmptyTask = task.trim() === "";

    return (
      <Draggable draggableId={idx.toString()} index={idx} key={idx}>
        {(provided, snapshot) => {
          const isBeingDragged = snapshot.isDragging;
          const anotherTaskIsBeingDragged = !isBeingDragged && someDragIsHappening;

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
                  isBeingDragged && "border-b border-trueBlack/30 dark:border-trueWhite/30"
                } ${!isEmptyTask && multipleTasks && "group-hover:pr-2"} ${
                  isFirstTask && "rounded-t-2xl border-t-0"
                } ${
                  isLastTask ? "rounded-b-2xl" : "border-b border-trueBlack dark:border-trueWhite"
                } ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-trueWhite py-4 px-5 text-trueBlack focus:outline-none dark:bg-softBlack dark:text-trueWhite sm:text-lg`}
              />
              <span
                {...provided.dragHandleProps}
                aria-label="Drag handle to reorder task"
                className={`${!isLastTask && "border-b border-trueBlack dark:border-trueWhite"} ${
                  isEmptyTask || !multipleTasks || anotherTaskIsBeingDragged
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
                className={`${isFirstTask && "rounded-tr-2xl"} ${isLastTask && "rounded-br-2xl"} ${
                  isEmptyTask || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-l border-b border-trueBlack/30 dark:border-trueWhite/30"
                    : "hidden"
                } cursor-pointer items-center justify-center border-l border-b border-trueBlack bg-dailyGreen px-4 dark:border-trueWhite dark:bg-dailyOrange dark:text-trueWhite xs:px-6 sm:text-lg`}
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
        <p className="sm:text-md mx-auto w-fit rounded-lg bg-dailyGreen px-2 py-1 text-sm dark:bg-dailyOrange dark:text-trueWhite">
          daily
        </p>
        <p className="text-lg text-trueBlack dark:text-trueWhite xs:text-xl sm:text-2xl">
          {noTasks ? "these tasks will be available again in" : "what do you want to do?"}
        </p>
        {noTasks && (
          <div className="mx-auto flex items-center gap-4">
            <CountdownTimer />
            <Link
              to="/"
              className="mx-auto flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-berryBlue dark:hover:bg-purpleRain"
            >
              <p className="text-trueBlack decoration-trueBlack dark:text-trueWhite dark:decoration-trueWhite">
                go to general
              </p>
              <Open size={22} className="fill-trueBlack dark:fill-trueWhite" />
            </Link>
          </div>
        )}
      </div>
      {!noTasks && (
        <ul
          onMouseUp={handleResize}
          style={{ width: `${tasksComponentWidth}px` }}
          className="w-[300px] resize-x overflow-hidden rounded-2xl border border-trueBlack shadow-brutalist-dark dark:border-trueWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96"
        >
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={() => setSomeDragIsHappening(true)}
          >
            <Droppable droppableId="tasksList">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {dailyTasksMap}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ul>
      )}
      <div
        onClick={hideTasksSaved}
        role="button"
        className={`${
          (message || !multipleTasks || !showTasksAreSaved) && "invisible"
        } group z-10 flex cursor-pointer flex-col items-center gap-1 rounded-2xl bg-softWhite dark:bg-trueBlack`}
      >
        <p
          className="text-sm text-trueBlack/50
          dark:text-trueWhite/50 xs:text-base"
        >
          your tasks won&apos;t be lost if you close the website
        </p>
        <button
          className="flex items-center gap-1 rounded-md border border-trueBlack/30 py-0.5 pl-2 pr-1 text-sm text-trueBlack/50
          dark:border-trueWhite/30 dark:text-trueWhite/50 xs:text-base sm:group-hover:bg-unavailableLight dark:sm:group-hover:bg-unavailableDark"
        >
          close this dialog
          <Close className="rounded-md fill-trueBlack/50 dark:fill-trueWhite/50" />
        </button>
      </div>
    </section>
  );
}
