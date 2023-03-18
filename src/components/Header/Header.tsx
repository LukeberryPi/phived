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
      <nav className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pr-4">
        <button
          role="switch"
          aria-checked={darkMode}
          aria-describedby={`${darkMode == true ? "dark" : "light"} is set`}
          onClick={toggleDarkMode}
          className="h-10 select-none rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-darkBlack hover:text-lighterWhite hover:ease-in dark:text-lighterWhite dark:hover:bg-lightWhite dark:hover:text-darkBlack xs:text-lg sm:px-4"
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
          className="h-10 select-none rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-alertRed hover:text-lighterWhite hover:ease-in dark:text-lightWhite xs:text-lg sm:px-4"
        >
          clear tasks
        </button>
        <div className="flex justify-center">
          <button
            disabled
            className="peer h-10 select-none rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-berryBlue hover:ease-in dark:text-lighterWhite dark:hover:bg-purpleRain xs:text-lg sm:px-4"
          >
            help
          </button>
          <span className="absolute top-14 hidden translate-x-1 text-sm peer-hover:block dark:text-lightWhite">
            coming
            <br />
            soon 🚧
          </span>
        </div>
      </nav>
    </header>
  );
};
