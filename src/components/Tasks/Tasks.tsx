import { useMemo, useEffect } from "react";
import { placeholders } from "src/content";
import { useTasksContext } from "src/contexts";
import { useResizeDetector } from "react-resize-detector";
import { useLocalStorage } from "src/hooks";

export function Tasks() {
  const { tasks, changeTask, completeTask } = useTasksContext();
  const [storedWidth, setStoredWidth] = useLocalStorage("width", "");
  const { width, ref: resizeRef } = useResizeDetector();

  const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const placeholder = useMemo(() => getRandomElement(placeholders), []);

  useEffect(() => {
    const resizeListener = () => {
      setStoredWidth(String(width));
    };
    window.addEventListener("unload", resizeListener);

    return () => {
      window.removeEventListener("unload", resizeListener);
    };
  }, [setStoredWidth, width]);

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

  const tasksMap = tasks.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === tasks.length - 1;
    const isEmptyTask = task.trim() === "";

    return (
      <div key={idx} className="group flex w-full">
        <input
          type="text"
          value={task}
          onChange={(event) => handleChange(event, idx)}
          autoFocus={isFirstTask}
          autoComplete="off"
          placeholder={`${isFirstTask ? placeholder : `task-${idx + 1}`}`}
          onKeyDown={(event) => handleKeyDown(event, idx)}
          className={`peer w-full ${
            isFirstTask
              ? "rounded-t-2xl"
              : "placeholder:text-lighterWhite dark:placeholder:text-darkBlack"
          } ${
            isLastTask ? "rounded-b-2xl" : "border-b"
          } bg-lighterWhite py-4 px-5 text-base text-darkerBlack placeholder:select-none focus:outline-none dark:bg-darkBlack dark:text-lighterWhite xs:text-lg`}
        />
        <button
          onClick={() => handleDone(idx)}
          className={`${isFirstTask ? "rounded-tr-2xl" : ""} ${
            isLastTask ? "rounded-br-2xl" : ""
          } ${
            isEmptyTask ? "hidden" : "max-lg:active:flex max-lg:peer-focus:flex lg:group-hover:flex"
          } hidden w-36 cursor-pointer items-center justify-center border-l border-b bg-berryBlue text-base dark:bg-purpleRain dark:text-lighterWhite xs:text-lg`}
        >
          done?
        </button>
      </div>
    );
  });

  return (
    <form
      ref={resizeRef}
      /* inline style required, `w-[${width}px]` doesn't work
      +2 magically allows it to not shrink every page reload
      do not change :) */
      style={{ width: Number(storedWidth) + 2 + "px" }}
      className="min-w-[20%] max-w-[80%] rounded-2xl border shadow-brutalist-dark dark:border-lighterWhite dark:shadow-brutalist-light tiny:w-80 xs:w-96 md:cursor-e-resize md:resize-x md:overflow-hidden"
    >
      {tasksMap}
    </form>
  );
}
