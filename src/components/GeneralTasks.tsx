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
                "border-trueBlack/30 dark:border-trueWhite/30 rounded-2xl border-l border-t"
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
                  "border-trueBlack/30 dark:border-trueWhite/30 border-b"
                } ${
                  !isEmptyTask && multipleGeneralTasks && "group-hover:pr-2"
                } ${isFirstTask && "rounded-t-2xl border-t-0"} ${
                  isLastTask && "rounded-b-2xl border-b-0"
                } ${
                  !isLastTask &&
                  "border-trueBlack dark:border-trueWhite border-b"
                } ${
                  someDragIsHappening && "cursor-grabbing"
                } bg-trueWhite text-trueBlack dark:bg-softBlack dark:text-trueWhite px-5 py-4 focus:outline-none sm:text-lg`}
              />
              <a
                href={appendProtocol(taskLink)}
                target="_blank"
                className={`size-14 absolute -left-14 flex flex-col items-center justify-center text-sm text-transparent transition-transform active:scale-95 ${
                  taskHasLink
                    ? "hover:text-trueBlack peer-hover:text-trueBlack"
                    : ""
                }`}
              >
                <Open size={24} className="fill-trueBlack" />
              </a>
              <span
                {...provided.dragHandleProps}
                aria-label="Drag handle to reorder task"
                className={`${
                  !isLastTask &&
                  "border-trueBlack dark:border-trueWhite border-b"
                } ${
                  isEmptyTask ||
                  !multipleGeneralTasks ||
                  anotherTaskIsBeingDragged
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  isBeingDragged
                    ? "border-trueBlack/30 dark:border-trueWhite/30 border-b"
                    : "hidden"
                } group/drag bg-trueWhite text-trueBlack dark:bg-softBlack dark:text-trueWhite flex items-center justify-center pr-2 placeholder:select-none hover:cursor-grab sm:text-lg`}
                tabIndex={-1}
              >
                <DragVertical className="fill-trueBlack dark:fill-trueWhite origin-center transition-transform group-active/drag:scale-90" />
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
                    ? "border-trueBlack/30 dark:border-trueWhite/30 border-b border-l"
                    : "hidden"
                } group/done border-trueBlack bg-berryBlue dark:border-trueWhite dark:bg-purpleRain dark:text-trueWhite xs:px-6 select-none items-center justify-center border-b border-l px-4 sm:text-lg`}
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
        <p className="bg-berryBlue dark:bg-purpleRain dark:text-trueWhite mx-auto w-fit rounded-lg px-3 py-1 text-sm sm:text-base">
          general
        </p>
        <p className="text-trueBlack dark:text-trueWhite text-xl sm:text-2xl">
          what do you want to do?
        </p>
      </div>
      <ul
        onMouseUp={handleResize}
        style={{
          width: `${tasksComponentWidth}px`,
        }}
        className="border-trueBlack shadow-brutalist-dark dark:border-trueWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96 w-[300px] resize-x rounded-2xl border"
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
        } text-trueBlack dark:text-trueWhite group flex items-center gap-3`}
      >
        <Light size={24} />
        <p className="xs:text-sm text-xs">
          your tasks won&apos;t be lost <br />
          if you close the website
        </p>
        <button
          onClick={dismissTasksWontBeLostAlert}
          className="hover:bg-unavailableLight dark:hover:bg-unavailableDark rounded-md p-1"
        >
          <Close size={24} className="fill-trueBlack dark:fill-trueWhite" />
        </button>
      </div>
    </section>
  );
}
