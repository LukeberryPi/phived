import { Github, Instagram, Twitter } from "src/icons";

export function Footer() {
  return (
    <footer className="fixed bottom-0 hidden h-16 w-full items-center justify-center sm:flex sm:justify-between sm:px-6">
      <div className="flex h-full items-center justify-between space-x-8">
        <a
          className="group flex select-none items-center gap-3 rounded-2xl py-2 px-3 transition-all hover:bg-trueBlack hover:ease-in-out dark:hover:bg-trueWhite"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
          rel="noreferrer"
        >
          <Github className="fill-softBlack group-hover:fill-softWhite dark:fill-softWhite dark:group-hover:fill-softBlack" />
          <p className="text-softBlack group-hover:text-softWhite dark:text-softWhite dark:group-hover:text-softBlack sm:text-lg">
            github
          </p>
        </a>
        <a
          className="group flex select-none items-center gap-3 rounded-2xl py-2 px-3 transition-all hover:bg-twitterBlue hover:ease-in-out"
          target="_blank"
          href="https://twitter.com/phivedphived"
          rel="noreferrer"
        >
          <Twitter className="fill-softBlack group-hover:fill-softWhite dark:fill-softWhite" />
          <p className="text-softBlack group-hover:text-softWhite dark:text-softWhite sm:text-lg">
            twitter
          </p>
        </a>
        <a
          className="group flex select-none items-center gap-3 rounded-2xl from-instagramPink via-instagramOrange to-instagramPurple py-2 px-3 transition-all hover:bg-gradient-to-r hover:ease-in-out"
          target="_blank"
          href="https://www.instagram.com/phivedphived/"
          rel="noreferrer"
        >
          <Instagram className="fill-softBlack group-hover:fill-softWhite dark:fill-softWhite" />
          <p className="text-softBlack group-hover:text-softWhite dark:text-softWhite sm:text-lg">
            instagram
          </p>
        </a>
      </div>
      <a
        target="_blank"
        rel="noreferrer"
        href="https://twitter.com/LukeberryPi"
        className="hidden rounded-2xl py-2 px-3 text-lg text-trueBlack decoration-trueBlack underline-offset-4 hover:underline dark:text-trueWhite dark:decoration-trueWhite md:block"
      >
        ©2023 LukeberryPi
      </a>
    </footer>
  );
}
