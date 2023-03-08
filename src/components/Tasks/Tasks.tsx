import { useEffect, useState } from "react";
import { getRandomElement, placeholders } from "src/utils";
import { TaskListProps } from "./Tasks.types";

export const Tasks = ({ taskList, setTaskList }: TaskListProps) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

  useEffect(() => {
    setCurrentPlaceholder(getRandomElement(placeholders));
  }, []);

  const handleInputChange = (
    e: React.FormEvent<HTMLInputElement>,
    i: number
  ) => {
    const currentTask = e.currentTarget.value;
    
    setTaskList(taskList.map((e, idx) => {
      if (idx === i) {
        return currentTask;
      }
      return e;
    }));
  };

  const tasksMap = taskList.map((_, i) => {
    const isFirstTask = i === 0;
    const isLastTask = i === taskList.length - 1;

    return (
      <div className="group flex w-full">
        <input
          key={i}
          type="text"
          defaultValue=""
          onChange={(e) => handleInputChange(e, i)}
          autoFocus={isFirstTask}
          placeholder={`${isFirstTask ? currentPlaceholder : ""}`}
          className={`w-full ${isFirstTask ? "rounded-t-2xl" : ""} ${
            isLastTask ? "rounded-b-2xl" : ""
          } ${
            !isLastTask ? "border-b" : ""
          } bg-snowWhite py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite`}
        />
        <span
          className={`${isFirstTask ? "rounded-tr-2xl" : ""} ${
            isLastTask ? "rounded-br-2xl" : ""
          } hidden w-36 cursor-pointer items-center justify-center border-l border-b bg-berryBlue text-lg group-hover:flex dark:bg-channelOrange dark:text-snowWhite`}
        >
          done?
        </span>
      </div>
    );
  });

  return (
    <>
      <div className="border-black box-shadow-dark dark:box-shadow-light w-[360px] rounded-2xl border border-solid dark:border-snowWhite">
        {tasksMap}
      </div>
      <p className="mt-5 bg-berryBlue">{JSON.stringify(taskList)}</p>
    </>
  );
};
