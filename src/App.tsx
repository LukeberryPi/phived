import { useState, useEffect } from "react";
import { placeholders } from "./content";
import { getRandomElement, resetAllInputs, reloadPage } from "./utils";

export function App(content: any) {
  const [darkMode, setDarkMode] = useState(true);
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

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-sushiWhite selection:bg-berryBlue dark:bg-blackDawn dark:selection:bg-channelOrange">
      <nav className="fixed top-0 flex h-16 w-full items-center justify-center px-10 md:justify-end">
        <div className="flex w-[260px] justify-between lg:w-1/4">
          <button
            onClick={toggleLightMode}
            className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
          >
            {darkMode ? "light" : "dark"} mode
          </button>
          <button
            onClick={resetAllInputs}
            className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
          >
            clear list
          </button>
          <button className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange">
            about
          </button>
        </div>
      </nav>
      <div className="border-black box-shadow-dark dark:box-shadow-light w-[360px] rounded-2xl border border-solid dark:border-snowWhite">
        <div className="group flex w-full rounded-t-2xl border-b dark:border-snowWhite">
          <input
            id="task-1"
            type="text"
            autoFocus
            placeholder="commit irrelevant github code"
            className="w-full rounded-t-2xl py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite"
          />
          <span
            onClick={resetAllInputs}
            className="hidden w-36 cursor-pointer items-center justify-center rounded-tr-2xl border-l bg-berryBlue text-lg group-hover:flex dark:bg-channelOrange dark:text-snowWhite"
          >
            done?
          </span>
        </div>
        <div className="flex w-full border-b dark:border-snowWhite">
          <input
            type="text"
            className="w-full py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite"
          />
        </div>
        <div className="flex w-full border-b dark:border-snowWhite">
          <input
            type="text"
            className="w-full py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite"
          />
        </div>
        <div className="flex w-full border-b dark:border-snowWhite">
          <input
            type="text"
            className="w-full py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite"
          />
        </div>
        <div className="flex w-full rounded-b-2xl">
          <input
            type="text"
            className="w-full rounded-b-2xl py-4 px-5 text-lg focus:outline-none dark:bg-blackNight dark:text-snowWhite"
          />
        </div>
      </div>
      <span
        onClick={reloadPage}
        className="mt-5 cursor-pointer text-5xl font-bold dark:text-snowWhite"
      >
        &#632; phived
      </span>
      <footer className=" fixed bottom-0 flex h-20 w-full justify-center px-10 md:justify-start">
        <div className="flex w-[300px] items-center justify-between lg:w-1/4">
          <a
            className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
            target="_blank"
            href="https://github.com/LukeberryPi/phived"
          >
            github
          </a>
          <a
            className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
            target="_blank"
            href="https://twitter.com/phivedphived"
          >
            twitter
          </a>
          <a
            className="text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
            target="_blank"
            href="https://twitter.com/lukeberrypi"
          >
            by @lukeberrypi
          </a>
        </div>
      </footer>
    </main>
  );
}
