import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { placeholders } from "src/content";
import { useDailyTasksContext } from "src/contexts";
import { isMobile, setTasksDefaultWidth } from "src/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import { Close, CounterClockWise, DragVertical, Light } from "src/icons";
import { useLocalStorage } from "src/hooks";
import { Link } from "react-router-dom";
// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350

const DEFAULT_WIDTH = setTasksDefaultWidth();

function isPosteriorDay(date: Date) {
  const now = new Date();
  const target = new Date(date);

  const sameDayDifferentMonth =
    now.getDay() === target.getDay() && now.getMonth() !== target.getMonth();
  const sameDayDifferentYear =
    now.getDay() === target.getDay() &&
    now.getFullYear() !== target.getFullYear();

  if (sameDayDifferentMonth || sameDayDifferentYear) {
    return true;
  }

  return now.getDay() !== target.getDay();
}

export function DailyTasks() {
  const {
    dailyMessage,
    dailyTasks,
    changeDailyTask,
    moveTaskDown,
    moveTaskUp,
    completeDailyTask,
    setDailyTasks,
    dailyTasksLastDoneAt,
    setDailyTasksLastDoneAt,
  } = useDailyTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
  const [showImpossibleToRegenerateTasks, setShowImpossibleToRegenerateTasks] =
    useState(false);
  const [tasksComponentWidth, setTasksComponentWidth] = useLocalStorage(
    "tasksComponentWidth",
    DEFAULT_WIDTH
  );
  const [showTasksWontBeLostAlert, setShowTasksWontBeLost] = useLocalStorage(
    "showTasksWontBeLostAlert",
    true
  );
  // const [showPrivacyAlert, setShowPrivacyAlert] = useLocalStorage(
  //   "showPrivacyAlert",
  //   true
  // );

  const numberOfDailyTasks = dailyTasks.filter(Boolean).length;
  const multipleDailyTasks = numberOfDailyTasks > 1;
  const noDailyTasks = dailyTasks.length === 0;

  const getRandomElement = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleChange = (
    event: React.FormEvent<HTMLInputElement>,
    i: number
  ) => {
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

  // const dismissPrivacyAlert = () => {
  //   setShowPrivacyAlert(false);
  // };

  const dismissTasksWontBeLostAlert = () => {
    setShowTasksWontBeLost(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    i: number
  ) => {
    const firstTask = i === 0;
    const lastTask = i === 4;

    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      if (firstTask) {
        return;
      }
      moveTaskUp(i);
      return document.querySelectorAll("input")[i - 1]?.focus();
    }

    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      if (lastTask) {
        return;
      }
      moveTaskDown(i);
      return document.querySelectorAll("input")[i + 1]?.focus();
    }

    // event.metaKey is macOS command key
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      return handleDone(i);
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      if (firstTask) {
        return document.querySelectorAll("input")[4]?.focus();
      }
      return document.querySelectorAll("input")[i - 1]?.focus();
    }

    if (event.key === "Enter" && !event.ctrlKey) {
      event.preventDefault();
      if (lastTask) {
        document.querySelectorAll("input")[0]?.focus();
        return;
      }
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

        return actualTasks;
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
                autoFocus={isFirstTask && !isMobile()}
                autoComplete="off"
                spellCheck="false"
                aria-label={`Task ${idx + 1}`}
                onKeyDown={(event) => handleKeyDown(event, idx)}
                className={`peer w-full ${
                  isBeingDragged &&
                  "border-b border-trueBlack/30 dark:border-trueWhite/30"
                } ${!isEmptyTask && multipleDailyTasks && "group-hover:pr-2"} ${
                  isFirstTask && "border-t-0"
                } ${
                  !isLastTask &&
                  "border-b border-trueBlack dark:border-trueWhite"
                } ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-trueWhite px-5 py-4 text-trueBlack focus:outline-none dark:bg-softBlack dark:text-trueWhite sm:text-lg`}
              />
              <span
                {...provided.dragHandleProps}
                tabIndex={-1}
                aria-label="Drag handle to reorder task"
                className={`${
                  !isLastTask &&
                  "border-b border-trueBlack dark:border-trueWhite"
                } ${
                  isEmptyTask ||
                  !multipleDailyTasks ||
                  anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-b border-trueBlack/30 dark:border-trueWhite/30"
                    : "hidden"
                } group/drag flex items-center justify-center bg-trueWhite pr-2 text-trueBlack placeholder:select-none
                hover:cursor-grab dark:bg-softBlack dark:text-trueWhite sm:text-lg`}
              >
                <DragVertical className="origin-center fill-trueBlack transition-transform group-active/drag:scale-90 dark:fill-trueWhite" />
              </span>
              <button
                aria-label="complete daily task"
                aria-keyshortcuts="control+enter"
                onClick={() => handleDone(idx)}
                className={`${isFirstTask && "rounded-tr-2xl"} ${
                  isLastTask && "rounded-br-2xl"
                } ${
                  isEmptyTask || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-b border-l border-trueBlack/30 dark:border-trueWhite/30"
                    : "hidden"
                } group/done select-none items-center justify-center border-b border-l border-trueBlack bg-dailyGreen px-4 dark:border-trueWhite dark:bg-dailyPurple dark:text-trueWhite xs:px-6 sm:text-lg`}
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
      <div className="flex flex-col gap-2 text-center">
        <p className="mx-auto w-fit rounded-lg bg-dailyGreen px-3 py-1 text-sm dark:bg-dailyPurple dark:text-trueWhite sm:text-base">
          daily
        </p>
        <p className="text-xl text-trueBlack dark:text-trueWhite sm:text-2xl">
          what do you want to do every day?
        </p>
      </div>
      {!noDailyTasks && (
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
                  {dailyTasksMap}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ul>
      )}
      {!!showImpossibleToRegenerateTasks && (
        <div className="group flex items-center gap-3 text-trueBlack dark:text-trueWhite">
          <Light size={24} />
          <p className="text-center text-xs xs:text-sm">
            you can only restore daily
            <br /> tasks tomorrow.{" "}
            <Link to="/" className="underline underline-offset-4">
              go to general
            </Link>
          </p>
          <button
            onClick={() => setShowImpossibleToRegenerateTasks(false)}
            className="rounded-md p-1 hover:bg-unavailableLight dark:hover:bg-unavailableDark"
          >
            <Close size={24} className="fill-trueBlack dark:fill-trueWhite" />
          </button>
        </div>
      )}
      {dailyTasksLastDoneAt.length > 0 &&
        !showImpossibleToRegenerateTasks &&
        !dailyMessage && (
          <button
            className="mx-auto flex items-center gap-2"
            onClick={() => {
              const tasksToRepopulate = dailyTasksLastDoneAt.map(
                (item) => item.dailyTask
              );
              if (!tasksToRepopulate) return;
              if (!isPosteriorDay(dailyTasksLastDoneAt[0].dateCompleted)) {
                setShowImpossibleToRegenerateTasks(true);
                return;
              }
              setDailyTasks([...tasksToRepopulate, ...dailyTasks]);
              setDailyTasksLastDoneAt([]);
            }}
          >
            <CounterClockWise className="text-trueBlack dark:text-trueWhite" />
            <span className="text-trueBlack dark:text-trueWhite">{`restore ${
              dailyTasksLastDoneAt.length
            } daily task${dailyTasksLastDoneAt.length === 1 ? "" : "s"}`}</span>
          </button>
        )}
      <div
        className={`${
          (dailyMessage || !multipleDailyTasks || !showTasksWontBeLostAlert) &&
          "invisible"
        } group flex items-center gap-3 text-trueBlack dark:text-trueWhite`}
      >
        <Light size={24} />
        <p className="text-xs xs:text-sm">
          your tasks won&apos;t be lost <br />
          if you close the website
        </p>
        <button
          onClick={dismissTasksWontBeLostAlert}
          className="rounded-md p-1 hover:bg-unavailableLight dark:hover:bg-unavailableDark"
        >
          <Close size={24} className="fill-trueBlack dark:fill-trueWhite" />
        </button>
      </div>
    </section>
  );
}
