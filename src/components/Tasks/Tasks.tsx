import { useEffect, useState } from "react";
import { getRandomElement } from "src/utils";
import { placeholders } from "src/content";
import { TasksProps } from "./Tasks.types";

export function Tasks({ tasks, setTasks }: TasksProps) {
  const [placeholder, setPlaceholder] = useState<string>("");

  useEffect(() => {
    setPlaceholder(getRandomElement(placeholders));
  }, []);

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
          placeholder={`${isFirstTask ? placeholder : ""}`}
          className={`w-full ${isFirstTask ? "rounded-t-2xl" : ""} ${
            isLastTask ? "rounded-b-2xl" : "border-b"
          } bg-snowWhite py-4 px-5 text-base text-blackDawn focus:outline-none dark:bg-blackNight dark:text-snowWhite xs:text-lg`}
        />
        <span
          onClick={() => handleDone(idx)}
          className={`${isFirstTask ? "rounded-tr-2xl" : ""} ${
            isLastTask ? "rounded-br-2xl" : ""
          } ${
            isEmptyTask ? "hidden" : "group-hover:flex"
          } hidden w-36 cursor-pointer items-center justify-center border-l border-b bg-berryBlue text-base dark:bg-petrolBlue dark:text-snowWhite xs:text-lg`}
        >
          done?
        </span>
      </div>
    );
  });

  return (
    <form name="tasks" className="box-shadow-dark dark:box-shadow-light w-72 rounded-2xl border dark:border-snowWhite xs:w-[360px]">
      {tasksMap}
    </form>
  );
}
