import { useEffect, useState } from "react";
import { getRandomElement } from "src/utils";
import { placeholders } from "src/content";
import { TaskListProps } from "./Tasks.types";

export function Tasks({ taskList, setTaskList }: TaskListProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState<string>();

  useEffect(() => {
    setCurrentPlaceholder(getRandomElement(placeholders));
  }, []);

  useEffect(() => {
    localStorage.setItem("persistentTasks", JSON.stringify(taskList));
  }, [taskList]);

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>, i: number) => {
    const currentTask = event.currentTarget.value;

    setTaskList(
      taskList.map((item, idx) => {
        if (idx === i) {
          return currentTask;
        }
        return item;
      })
    );
  };

  const handleDone = (i: number) => {
    const updatedArray = taskList.filter((_, idx) => idx !== i);
    setTaskList([...updatedArray, ""]);
  };

  const taskListMap = taskList.map((task, idx) => {
    const isFirstTask = idx === 0;
    const isLastTask = idx === taskList.length - 1;

    return (
      <div key={idx} className="group flex w-full">
        <input
          type="text"
          value={task}
          onChange={(e) => handleInputChange(e, idx)}
          autoFocus={isFirstTask}
          placeholder={`${isFirstTask ? currentPlaceholder : ""}`}
          className={`w-full ${isFirstTask ? "rounded-t-2xl" : ""} ${
            isLastTask ? "rounded-b-2xl" : ""
          } ${
            !isLastTask ? "border-b" : ""
          } bg-snowWhite py-4 px-5 text-base text-blackDawn focus:outline-none dark:bg-blackNight dark:text-snowWhite xs:text-lg`}
        />
        <span
          onClick={() => handleDone(idx)}
          className={`${isFirstTask ? "rounded-tr-2xl" : ""} ${
            isLastTask ? "rounded-br-2xl" : ""
          } hidden w-36 cursor-pointer items-center justify-center border-l border-b bg-berryBlue text-base group-hover:flex dark:bg-petrolBlue dark:text-snowWhite xs:text-lg`}
        >
          done?
        </span>
      </div>
    );
  });

  return (
    <main className="box-shadow-dark dark:box-shadow-light w-72 rounded-2xl border dark:border-snowWhite xs:w-[360px]">
      {taskListMap}
    </main>
  );
}
