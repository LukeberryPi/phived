import { HeaderProps } from "./Header.types";

export const Header = ({ darkMode, setDarkMode, clearTasks }: HeaderProps) => {
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center xs:justify-end">
      <div className="flex h-full w-64 items-center justify-between xs:w-96 xs:pr-8">
        <button
          onClick={toggleDarkMode}
          className="h-full pl-4 text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue xs:text-lg"
        >
          {darkMode ? "light" : "dark"} mode
        </button>
        <button
          onClick={clearTasks}
          className="h-full pl-4 text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue xs:text-lg"
        >
          clear tasks
        </button>
        <button className="h-full pl-4 text-base text-blackDawn decoration-petrolBlue hover:underline dark:text-snowWhite dark:decoration-berryBlue xs:text-lg">
          help
        </button>
      </div>
    </header>
  );
};
