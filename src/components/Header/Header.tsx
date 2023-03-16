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
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center sm:justify-end">
      <div className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pr-8">
        <button
          onClick={toggleDarkMode}
          className="h-10 rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-darkBlack xs:hover:text-lighterWhite xs:dark:hover:bg-lightWhite xs:dark:hover:text-darkBlack sm:text-lg"
        >
          {darkMode ? "light" : "dark"} mode
        </button>
        <button
          onClick={clearTasks}
          className="h-10 rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lightWhite xs:px-4 xs:hover:bg-alertRed xs:hover:text-lighterWhite sm:text-lg"
        >
          clear tasks
        </button>
        <button
          disabled
          className="h-10 rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-berryBlue xs:dark:hover:bg-everGreen sm:text-lg"
        >
          help
        </button>
      </div>
    </header>
  );
};
