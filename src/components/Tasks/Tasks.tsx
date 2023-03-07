import { useEffect, useState } from "react";
import { clearInputs, getRandomElement, placeholders } from "src/utils";

export const Tasks = () => {
  const [tasks, setTasks] = useState(["", "", "", "", ""]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

  useEffect(() => {
    setCurrentPlaceholder(getRandomElement(placeholders));
  }, []);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;

    if (tasks.some((item) => !!item)) {
      link.href = "/alert-icon.png";
    }
  }, [tasks]);

  const handleInputChange = (
    e: React.FormEvent<HTMLInputElement>,
    i: number
  ) => {
    const newValue = e.currentTarget.value;
    setTasks([...tasks, newValue]);
  };

  const tasksMap = tasks.map((task, i) => {
    const isFirstTask = i === 0;
    const isLastTask = i === tasks.length - 1;

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
          onClick={clearInputs}
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
      <p className="mt-5 bg-berryBlue">{JSON.stringify(tasks)}</p>
    </>
  );
};
