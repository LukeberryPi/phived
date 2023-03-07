import { HeaderProps } from "./Header.types";

export const Header = ({ content }: HeaderProps) => {
  const buttonMap = content.map((button, i) => {
    return (
      <button
        key={i}
        // onClick={toggleDarkMode}
        className="h-full text-lg decoration-berryBlue dark:text-snowWhite dark:decoration-channelOrange"
      >
        {button.name}
      </button>
    );
  });

  return (
    <nav className="fixed top-0 flex h-16 w-full items-center justify-center px-10 md:justify-end">
      <div className="flex h-full w-[260px] justify-between lg:w-1/4">
        {buttonMap}
      </div>
    </nav>
  );
};
