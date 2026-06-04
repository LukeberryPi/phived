import { Github } from "src/icons";
import { cn } from "src/utils";

export function Footer() {
  return (
    <footer
      className={cn(
        "fixed bottom-0 hidden h-16 w-full items-center justify-between",
        "border-t-4 border-sky-300 px-6 dark:border-cyan-800 sm:flex"
      )}
    >
      <div className="flex h-full items-center justify-between sm:gap-6">
        <a
          className={cn(
            "flex select-none items-center gap-3 rounded-2xl px-4 py-2",
            "transition-transform hover:ring-2 hover:ring-black",
            "active:scale-95 dark:hover:ring-white"
          )}
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
          rel="noreferrer"
        >
          <Github className="fill-black dark:fill-white" />
          <span className="text-black dark:text-white">
            contribute on github!
          </span>
        </a>
      </div>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://twitter.com/LukeberryPi"
        className={cn(
          "select-none rounded-2xl px-4 py-2 transition-transform",
          "hover:ring-2 hover:ring-black active:scale-95",
          "dark:text-white dark:hover:ring-white"
        )}
      >
        made by lukeberrypi
      </a>
    </footer>
  );
}
