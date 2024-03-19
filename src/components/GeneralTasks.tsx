import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { placeholders } from "src/content";
import { useGeneralTasksContext } from "src/contexts";
import { isMobile, setTasksDefaultWidth } from "src/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import { Close, DragVertical, Light, Open } from "src/icons";
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
    moveTaskUp,
    moveTaskDown,
  } = useGeneralTasksContext();
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);
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

  const numberOfGeneralTasks = generalTasks.filter(Boolean).length;
  const multipleGeneralTasks = numberOfGeneralTasks > 1;
  const noGeneralTasks = numberOfGeneralTasks === 0;

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

    // move up either with Shift + Enter or ArrowUp
    if (
      (event.key === "ArrowUp" && !event.altKey) ||
      (event.key === "Enter" && event.shiftKey && !event.ctrlKey)
    ) {
      event.preventDefault();
      if (firstTask) {
        return document.querySelectorAll("input")[4]?.focus();
      }
      return document.querySelectorAll("input")[i - 1]?.focus();
    }

    // move down either with Enter or ArrowDown
    if (
      (event.key === "ArrowDown" && !event.altKey) ||
      (event.key === "Enter" && !event.ctrlKey)
    ) {
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
      setGeneralTasks((prev: string[]) => {
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

          const urlRegex =
            /\b(?:https?:\/\/)?(?:www\.)?([a-z0-9.-]+)\.([a-z0-9]{2,})(?:\/\S*)?\b/i;
          const urlMatch = task.match(urlRegex);
          const taskHasLink = urlMatch !== null;
          const taskLink = taskHasLink ? urlMatch[0] : "";

          const appendProtocol = (url: string) => {
            if (!url) {
              return;
            }

            const protocols = ["https://", "http://"];
            const startsWithProtocol = protocols.some((p) => url.startsWith(p));

            if (!startsWithProtocol) {
              return "https://" + url;
            }

            return url;
          };

          return (
            <li
              {...provided.draggableProps}
              key={idx}
              className={`group relative flex ${
                isBeingDragged &&
                "rounded-2xl border-l border-t border-black/30 dark:border-trueWhite/30"
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
                placeholder={`${
                  isFirstTask && noGeneralTasks ? `${placeholder}?` : ""
                }`}
                aria-label={`Task ${idx + 1}`}
                onKeyDown={(event) => handleKeyDown(event, idx)}
                className={`peer w-full ${
                  isBeingDragged &&
                  "border-b border-black/30 dark:border-trueWhite/30"
                } ${
                  !isEmptyTask && multipleGeneralTasks && "group-hover:pr-2"
                } ${isFirstTask && "rounded-t-2xl border-t-0"} ${
                  isLastTask && "rounded-b-2xl border-b-0"
                } ${
                  !isLastTask && "border-b border-black dark:border-trueWhite"
                } ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-trueWhite px-5 py-4 text-black focus:outline-none dark:bg-zinc-950 dark:text-trueWhite sm:text-lg`}
              />
              <a
                href={appendProtocol(taskLink)}
                rel="noreferrer"
                target="_blank"
                className={`absolute -left-14 flex size-14 flex-col items-center justify-center text-sm text-transparent transition-transform active:scale-95 ${
                  taskHasLink
                    ? "hover:text-black peer-hover:text-black dark:hover:text-trueWhite dark:peer-hover:text-trueWhite"
                    : ""
                }`}
              >
                <Open size={24} />
              </a>
              <span
                {...provided.dragHandleProps}
                aria-label="Drag handle to reorder task"
                className={`${
                  !isLastTask && "border-b border-black dark:border-trueWhite"
                } ${
                  isEmptyTask ||
                  !multipleGeneralTasks ||
                  anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-b border-black/30 dark:border-trueWhite/30"
                    : "hidden"
                } group/drag flex items-center justify-center bg-trueWhite pr-2 text-black placeholder:select-none hover:cursor-grab dark:bg-zinc-950 dark:text-trueWhite sm:text-lg`}
                tabIndex={-1}
              >
                <DragVertical className="origin-center fill-black transition-transform group-active/drag:scale-90 dark:fill-trueWhite" />
              </span>
              <button
                aria-label="complete task"
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
                    ? "border-b border-l border-black/30 dark:border-trueWhite/30"
                    : "hidden"
                } group/done select-none items-center justify-center border-b border-l border-black bg-sky-300 px-4 dark:border-trueWhite dark:bg-purpleRain dark:text-trueWhite xs:px-6 sm:text-lg`}
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
        <p className="mx-auto w-fit rounded-lg bg-sky-300 px-3 py-1 text-sm dark:bg-purpleRain dark:text-trueWhite sm:text-base">
          general
        </p>
        <p className="text-xl text-black dark:text-trueWhite sm:text-2xl">
          what do you want to do?
        </p>
      </div>
      <ul
        onMouseUp={handleResize}
        style={{
          width: `${tasksComponentWidth}px`,
        }}
        className="w-[300px] resize-x rounded-2xl border border-black shadow-brutalist-dark dark:border-trueWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96"
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
          (generalMessage ||
            !multipleGeneralTasks ||
            !showTasksWontBeLostAlert) &&
          "invisible"
        } group flex items-center gap-3 text-black dark:text-trueWhite`}
      >
        <Light size={24} />
        <p className="text-xs xs:text-sm">
          your tasks won&apos;t be lost <br />
          if you close the website
        </p>
        <button
          onClick={dismissTasksWontBeLostAlert}
          className="rounded-md p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <Close size={24} className="fill-black dark:fill-trueWhite" />
        </button>
      </div>
    </section>
  );
}
