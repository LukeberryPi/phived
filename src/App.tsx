import { useState, useEffect } from "react";
import { Footer, Header, Logo } from "src/components";
import {
  getRandomElement,
  clearInputs,
  reloadPage,
  placeholders,
} from "src/utils";
import { footerContent, headerContent, logoContent } from "src/content";

export default function App() {
  const [tasks, setTasks] = useState(Array(5).fill(""));
  const [darkMode, setDarkMode] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

  useEffect(() => {
    setCurrentPlaceholder(getRandomElement(placeholders));
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  function toggleLightMode() {
    setDarkMode(!darkMode);
  }

  const tasksMap = tasks.map((task, i) => {
    const isFirstTask = i === 0;
    const isLastTask = i === tasks.length - 1;

    return (
      <div
        className={`group flex w-full rounded-t-2xl rounded-b-2xl dark:border-snowWhite`}
      >
        <input
          key={i}
          type="text"
          defaultValue={task}
          autoFocus={isFirstTask}
          placeholder={`${isFirstTask ? currentPlaceholder : ""}`}
          className={`w-full ${isFirstTask ? "rounded-t-2xl" : ""} ${
            isLastTask ? "rounded-b-2xl" : ""
          } border-b bg-snowWhite py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite`}
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
    <main className="flex h-screen flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue dark:bg-blackDawn dark:selection:bg-channelOrange">
      <Header content={headerContent} />
      <div className="border-black box-shadow-dark dark:box-shadow-light w-[360px] rounded-2xl border border-solid dark:border-snowWhite">
        {tasksMap}
      </div>
      <Logo content={logoContent} onClick={reloadPage} />
      <Footer content={footerContent} />
    </main>
  );
}
