import { useState } from "react";
import { HeaderProps } from "./Header.types";

export const Header = ({ clearTasks }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "dark" ? true : false
  );

  if (darkMode) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("darkMode", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", "light");
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center sm:justify-end">
      <div className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pr-4">
        <button
          role="switch"
          aria-checked={darkMode}
          aria-label={`${darkMode == true ? "dark" : "light"} is set`}
          onClick={toggleDarkMode}
          className="h-10 select-none rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-darkBlack xs:hover:text-lighterWhite xs:dark:hover:bg-lightWhite xs:dark:hover:text-darkBlack sm:text-lg"
        >
          <span aria-hidden={darkMode == false} className="aria-hidden:hidden">
            light mode
          </span>
          <span aria-hidden={darkMode == true} className="aria-hidden:hidden">
            dark mode
          </span>
        </button>
        <button
          onClick={clearTasks}
          className="h-10 select-none rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lightWhite xs:px-4 xs:hover:bg-alertRed xs:hover:text-lighterWhite sm:text-lg"
        >
          clear tasks
        </button>
        <div className="flex flex-col items-center justify-center">
          <button
            disabled
            className="peer h-10 select-none rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-berryBlue xs:dark:hover:bg-purpleRain sm:text-lg"
          >
            help
          </button>
          <span className="absolute top-16 hidden text-sm peer-hover:block dark:text-lightWhite">
            🚧 soon 🚧
          </span>
        </div>
      </div>
    </header>
  );
};
