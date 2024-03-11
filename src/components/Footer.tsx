import { Github } from "src/icons";
import { Coffee } from "src/icons/Coffee";
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
          className="hover:ring-trueBlack dark:hover:ring-trueWhite flex select-none items-center gap-3 rounded-2xl px-4 py-2 transition-transform hover:ring-2 active:scale-95"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
          rel="noreferrer"
        >
          <Github className="fill-trueBlack dark:fill-trueWhite" />
          <span className="text-trueBlack dark:text-trueWhite">
            contribute on github!
          </span>
        </a>
        <a
          href="https://www.buymeacoffee.com/lukeberrypi"
          className="ring-trueBlack flex items-center gap-3 rounded-2xl px-4 py-2 transition-transform hover:ring-2 active:scale-95"
        >
          <Coffee size={24} className="fill-trueBlack dark:fill-trueWhite" />
          <span className="dark:text-trueWhite xs:text-base">
            buy me a coffee!
          </span>
        </a>
      </div>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://twitter.com/LukeberryPi"
        className="hover:ring-trueBlack dark:text-trueWhite dark:hover:ring-trueWhite select-none rounded-2xl px-4 py-2 transition-transform hover:ring-2 active:scale-95"
      >
        made by lukeberrypi
      </a>
    </footer>
  );
}
