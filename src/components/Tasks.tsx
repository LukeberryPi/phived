import { useMemo, useState } from "react";
import { placeholders } from "src/content";
import { useTasksContext } from "src/contexts";
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";
import { DragIcon } from "src/icons";
// you must remove Strict Mode for react-beautiful-dnd to work locally
// https://github.com/atlassian/react-beautiful-dnd/issues/2350

export function Tasks() {
  const { tasks, changeTask, completeTask, setTasks } = useTasksContext();
  const tasksLength = tasks.filter((t) => t.trim() !== "").length;
  const [someDragIsHappening, setSomeDragIsHappening] = useState(false);

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  const handleChange = (event: React.FormEvent<HTMLInputElement>, i: number) => {
    const currentTask = event.currentTarget.value;
    changeTask(i, currentTask);
  };

  const handleDone = (i: number) => {
    completeTask(i);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    switch (event.key) {
      case "Enter":
        if (event.ctrlKey) {
          event.preventDefault();
          return handleDone(i);
        }
        if (event.shiftKey) {
          event.preventDefault();
          return document.querySelectorAll("input")[i - 1]?.focus();
        }
        if (!event.ctrlKey) {
          event.preventDefault();
          return document.querySelectorAll("input")[i + 1]?.focus();
        }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const destinationIndex = result.destination?.index;

    if (destinationIndex || destinationIndex === 0) {
      setTasks((prev) => {
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

  const tasksMap = tasks.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === tasks.length - 1;
    const isEmptyTask = task.trim() === "";

    return (
      <Draggable draggableId={idx.toString()} index={idx} key={idx}>
        {(provided, snapshot) => {
          const isBeingDragged = snapshot.isDragging;
          return (
            <div
              key={idx}
              className={`group flex w-full ${isBeingDragged && "cursor-grabbing"}`}
              {...provided.draggableProps}
              ref={provided.innerRef}
            >
              <input
                type="text"
                value={task}
                onChange={(event) => handleChange(event, idx)}
                autoFocus={isFirstTask}
                autoComplete="off"
                placeholder={`${isFirstTask ? `${placeholder}?` : ""}`}
                aria-label={`task-${idx}`}
                onKeyDown={(event) => handleKeyDown(event, idx)}
                className={`peer w-full ${!isEmptyTask && tasksLength > 1 && "group-hover:pr-2"} ${
                  isFirstTask && "rounded-t-2xl"
                } ${
                  isLastTask ? "rounded-b-2xl" : "border-b"
                } bg-lighterWhite py-4 px-5 text-darkerBlack focus:outline-none dark:bg-darkBlack dark:text-lighterWhite sm:text-lg`}
              />
              <span
                /* rbdnd hardcodes dragHandle tabIndex to 0 by default, hence why this line doesn't work
                https://github.com/atlassian/react-beautiful-dnd/issues/1827 */
                tabIndex={-1}
                className={`${!isLastTask && "border-b"} ${
                  isEmptyTask || tasksLength <= 1 || (!isBeingDragged && someDragIsHappening)
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  !isBeingDragged && "hidden"
                } flex items-center justify-center bg-lighterWhite pr-2 text-darkerBlack placeholder:select-none hover:cursor-grab dark:bg-darkBlack dark:text-lighterWhite sm:text-lg`}
                {...provided.dragHandleProps}
              >
                <DragIcon className="fill-darkBlack dark:fill-lightWhite" />
              </span>
              <button
                onClick={() => handleDone(idx)}
                className={`${isFirstTask && "rounded-tr-2xl"} ${isLastTask && "rounded-br-2xl"} ${
                  isEmptyTask || (!isBeingDragged && someDragIsHappening)
                    ? "hidden"
                    : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
                } ${
                  !isBeingDragged && "hidden"
                } cursor-pointer items-center justify-center border-l border-b bg-berryBlue px-4 dark:bg-purpleRain dark:text-lighterWhite xs:px-6 sm:text-lg`}
              >
                done?
              </button>
            </div>
          );
        }}
      </Draggable>
    );
  });

  return (
    <main className="flex flex-col items-center gap-4">
      <p className={"text-lg text-darkBlack dark:text-lightWhite xs:text-xl sm:text-2xl"}>
        what do you want to{" "}
        <span className="inset-0 inline-block skew-y-3 rounded-md bg-berryBlue px-2 py-1 dark:bg-purpleRain">
          <span className="block -skew-y-3 font-semibold">do?</span>
        </span>
      </p>
      <section className="w-72 overflow-hidden rounded-2xl border shadow-brutalist-dark dark:border-lighterWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96">
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setSomeDragIsHappening(true)}>
          <Droppable droppableId="tasksList">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {tasksMap}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </section>
    </main>
  );
}
