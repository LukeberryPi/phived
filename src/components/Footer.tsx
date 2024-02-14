import { Github } from "src/icons";
import { isDailyPage } from "src/utils";

export function Footer() {
  return (
    <footer
      className={`${
        isDailyPage()
          ? "border-dailyGreen dark:border-dailyPurple"
          : "border-berryBlue dark:border-purpleRain"
      } fixed bottom-0 hidden h-16 w-full items-center justify-between border-t-4 px-6 sm:flex`}
    >
      <div className="flex h-full items-center justify-between gap-8">
        <a
          className="group flex select-none items-center gap-3 rounded-2xl py-2 px-3 transition-all hover:bg-trueBlack hover:ease-in-out dark:hover:bg-trueWhite"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
          rel="noreferrer"
        >
          <Github className="fill-trueBlack group-hover:fill-trueWhite dark:fill-trueWhite dark:group-hover:fill-trueBlack" />
          <p className="text-trueBlack group-hover:text-trueWhite dark:text-trueWhite dark:group-hover:text-trueBlack sm:text-lg">
            contribute on github!
          </p>
        </a>
      </div>
      <span className="hidden text-lg text-trueBlack dark:text-trueWhite dark:decoration-trueWhite md:block">
        made by{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://twitter.com/LukeberryPi"
          className=" underline decoration-trueBlack underline-offset-4"
        >
          LukeberryPi
        </a>
      </span>{" "}
    </footer>
  );
}
