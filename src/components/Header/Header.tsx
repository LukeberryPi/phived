import { useEffect, useState } from "react";
import { HeaderProps } from "./Header.types";

export const Header = ({ clearTasks }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "dark" ? true : false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "light");
    }
    document.querySelector("input")?.focus();
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center sm:justify-end">
      <div className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pr-8">
        <button
          onClick={toggleDarkMode}
          className="h-full text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:pl-4 sm:text-lg"
        >
          {darkMode ? "light" : "dark"} mode
        </button>
        <button
          onClick={clearTasks}
          className="h-full sm:pl-4 text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:text-lg"
        >
          clear tasks
        </button>
        <button className="h-full sm:pl-4 text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:text-lg">
          help
        </button>
      </div>
    </header>
  );
};
