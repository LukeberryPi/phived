import { useEffect } from "react";
import { placeholders } from "src/content";
import { TasksProps } from "./Tasks.types";

export function Tasks({ tasks, setTasks }: TasksProps) {

  const getRandomElement = (arr: any[]) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const placeholder = getRandomElement(placeholders)

  useEffect(() => {
    localStorage.setItem("persistentTasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleChange = (event: React.FormEvent<HTMLInputElement>, i: number) => {
    const currentTask = event.currentTarget.value;

    setTasks(
      tasks.map((task, idx) => {
        if (idx === i) {
          return currentTask;
        }
        return task;
      })
    );
  };

  const handleDone = (i: number) => {
    const ongoingTasks = tasks.filter((_, idx) => idx !== i);
    setTasks([...ongoingTasks, ""]);
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
    const isEmptyTask = task === "";

    return (
      <div key={idx} className="group flex w-full">
        <input
          type="text"
          value={task}
          onChange={(e) => handleChange(e, idx)}
          autoFocus={isFirstTask}
          autoComplete="off"
          placeholder={`${isFirstTask ? placeholder : `task-${idx + 1}`}`}
          onKeyDown={(e) => handleKeyDown(e, idx)}
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
          type="button"
          className={`${isFirstTask ? "rounded-tr-2xl" : ""} ${
            isLastTask ? "rounded-br-2xl" : ""
          } ${
            isEmptyTask ? "hidden" : "group-hover:flex group-focus-within:flex group-focus:flex"
          } hidden w-36 cursor-pointer items-center justify-center border-l border-b bg-berryBlue text-base dark:bg-purpleRain dark:text-lighterWhite xs:text-lg`}
        >
          <span className="sr-only">move task {idx+1} to</span>&nbsp;done?
        </button>
      </div>
    );
  });

  return (
    <form className="box-shadow-dark dark:box-shadow-light w-72 rounded-2xl border dark:border-lighterWhite xs:w-[360px]" title="phived tasklist">
      {tasksMap}
    </form>
  );
}
