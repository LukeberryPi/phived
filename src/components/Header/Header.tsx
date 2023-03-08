import { HeaderProps } from "./Header.types";

export const Header = ({ darkMode, setDarkMode, clearTasks }: HeaderProps) => {
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className="fixed top-0 flex h-16 w-full items-center justify-center px-10 md:justify-end">
      <div className="flex h-full w-[260px] justify-between lg:w-1/4">
        <button
          onClick={toggleDarkMode}
          className="h-full text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
        >
          {darkMode ? "light" : "dark"} mode
        </button>
        <button
          onClick={clearTasks}
          className="h-full text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange"
        >
          clear tasks
        </button>
        <button className="h-full text-lg decoration-berryBlue hover:underline dark:text-snowWhite dark:decoration-channelOrange">
          help
        </button>
      </div>
    </nav>
  );
};
