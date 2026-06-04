import type { FormEvent } from "react";
import { useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { useDailyTasksContext } from "src/contexts";
import {
  useLocalStorage,
  useTaskKeyboardNavigation,
  useTasksComponentWidth,
} from "src/hooks";
import { Close, CounterClockWise, DragVertical, Light } from "src/icons";
import {
  isMobile,
  isPosteriorCalendarDay,
  reorderListFromDragResult,
} from "src/utils";

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
  const { tasksComponentWidth, handleResize } = useTasksComponentWidth();
  const [showTasksWontBeLostAlert, setShowTasksWontBeLost] = useLocalStorage(
    "showTasksWontBeLostAlert",
    true
  );

  const numberOfDailyTasks = dailyTasks.filter(Boolean).length;
  const multipleDailyTasks = numberOfDailyTasks > 1;
  const noDailyTasks = dailyTasks.length === 0;

  const handleKeyDown = useTaskKeyboardNavigation({
    taskCount: dailyTasks.length,
    onDone: completeDailyTask,
    moveTaskUp,
    moveTaskDown,
  });

  const handleChange = (event: FormEvent<HTMLInputElement>, index: number) => {
    changeDailyTask(index, event.currentTarget.value);
  };

  const handleDragEnd = (result: DropResult) => {
    const reordered = reorderListFromDragResult(dailyTasks, result);

    if (reordered) {
      setDailyTasks(reordered);
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
                "overflow-hidden rounded-2xl border-l border-t border-black/30 dark:border-white/30"
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
                  "border-b border-black/30 dark:border-white/30"
                } ${!isEmptyTask && multipleDailyTasks && "group-hover:pr-2"} ${
                  isFirstTask && "border-t-0"
                } ${!isLastTask && "border-b border-black dark:border-white"} ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-white px-5 py-4 text-black focus:outline-none dark:bg-zinc-950 dark:text-white sm:text-lg`}
              />
              <span
                {...provided.dragHandleProps}
                tabIndex={-1}
                aria-label="Drag handle to reorder task"
                className={`${
                  !isLastTask && "border-b border-black dark:border-white"
                } ${
                  isEmptyTask ||
                  !multipleDailyTasks ||
                  anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-b border-black/30 dark:border-white/30"
                    : "hidden"
                } group/drag flex items-center justify-center bg-white pr-2 text-black placeholder:select-none hover:cursor-grab dark:bg-zinc-950 dark:text-white sm:text-lg`}
              >
                <DragVertical className="origin-center fill-black transition-transform group-active/drag:scale-90 dark:fill-white" />
              </span>
              <button
                aria-label="complete daily task"
                aria-keyshortcuts="control+enter"
                onClick={() => completeDailyTask(idx)}
                className={`${isFirstTask && "rounded-tr-2xl"} ${
                  isLastTask && "rounded-br-2xl"
                } ${
                  isEmptyTask || anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-b border-l border-black/30 dark:border-white/30"
                    : "hidden"
                } group/done select-none items-center justify-center border-b border-l border-black bg-teal-300 px-4 dark:border-white dark:bg-emerald-800 dark:text-white xs:px-6 sm:text-lg`}
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
        <p className="mx-auto w-fit rounded-lg bg-teal-300 px-3 py-1 text-sm dark:bg-emerald-800 dark:text-white sm:text-base">
          daily
        </p>
        <p className="text-xl text-black dark:text-white sm:text-2xl">
          what do you want to do every day?
        </p>
      </div>
      {!noDailyTasks && (
        <ul
          onMouseUp={handleResize}
          style={{
            width: `${tasksComponentWidth}px`,
          }}
          className="w-[300px] resize-x overflow-hidden rounded-2xl border border-black shadow-brutalist-dark dark:border-white dark:shadow-brutalist-light tiny:w-80 xs:w-96"
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
      {showImpossibleToRegenerateTasks && (
        <div className="group flex items-center gap-3 text-black dark:text-white">
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
            className="rounded-md p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Close size={24} className="fill-black dark:fill-white" />
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
              if (
                !isPosteriorCalendarDay(dailyTasksLastDoneAt[0].dateCompleted)
              ) {
                setShowImpossibleToRegenerateTasks(true);
                return;
              }
              setDailyTasks([...tasksToRepopulate, ...dailyTasks]);
              setDailyTasksLastDoneAt([]);
            }}
          >
            <CounterClockWise className="text-black dark:text-white" />
            <span className="text-black dark:text-white">{`restore ${
              dailyTasksLastDoneAt.length
            } daily task${dailyTasksLastDoneAt.length === 1 ? "" : "s"}`}</span>
          </button>
        )}
      <div
        className={`${
          (dailyMessage || !multipleDailyTasks || !showTasksWontBeLostAlert) &&
          "invisible"
        } group flex items-center gap-3 text-black dark:text-white`}
      >
        <Light size={24} />
        <p className="text-xs xs:text-sm">
          your tasks won&apos;t be lost <br />
          if you close the website
        </p>
        <button
          onClick={() => setShowTasksWontBeLost(false)}
          className="rounded-md p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <Close size={24} className="fill-black dark:fill-white" />
        </button>
      </div>
    </section>
  );
}
