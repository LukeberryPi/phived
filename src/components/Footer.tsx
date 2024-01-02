import { Github, Instagram, Twitter } from "src/icons";
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
            github
          </p>
        </a>
        <a
          className="group flex select-none items-center gap-3 rounded-2xl py-2 px-3 transition-all hover:bg-twitterBlue hover:ease-in-out"
          target="_blank"
          href="https://twitter.com/phivedphived"
          rel="noreferrer"
        >
          <Twitter className="fill-trueBlack group-hover:fill-trueWhite dark:fill-trueWhite" />
          <p className="text-trueBlack group-hover:text-trueWhite dark:text-trueWhite sm:text-lg">
            twitter
          </p>
        </a>
        <a
          className="group flex select-none items-center gap-3 rounded-2xl from-instagramPink via-instagramOrange to-instagramPurple py-2 px-3 transition-all hover:bg-gradient-to-r hover:ease-in-out"
          target="_blank"
          href="https://www.instagram.com/phivedphived/"
          rel="noreferrer"
        >
          <Instagram className="fill-trueBlack group-hover:fill-trueWhite dark:fill-trueWhite" />
          <p className="text-trueBlack group-hover:text-trueWhite dark:text-trueWhite sm:text-lg">
            instagram
          </p>
        </a>
      </div>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://twitter.com/LukeberryPi"
        className="hidden text-lg text-trueBlack decoration-trueBlack underline-offset-4 hover:underline dark:text-trueWhite dark:decoration-trueWhite md:block"
      >
        ©2024 LukeberryPi
      </a>
    </footer>
  );
}
