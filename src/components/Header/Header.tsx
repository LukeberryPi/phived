import { HeaderProps } from "./Header.types";

export const Header = ({ darkMode, setDarkMode, clearTasks }: HeaderProps) => {
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="fixed top-0 flex h-16 w-full items-center justify-center sm:justify-end">
      <div className="flex h-full w-64 items-center justify-between sm:w-96 sm:pr-8">
        <button
          onClick={toggleDarkMode}
          className="h-full text-base decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange sm:text-lg"
        >
          {darkMode ? "light" : "dark"} mode
        </button>
        <button
          onClick={clearTasks}
          className="h-full text-base decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange sm:text-lg"
        >
          clear tasks
        </button>
        <button className="h-full text-base decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange sm:text-lg">
          help
        </button>
      </div>
    </header>
  );
};
