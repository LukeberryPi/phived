import { GithubIcon, InstagramIcon, TwitterIcon } from "src/icons";

export function Footer() {
  return (
    <footer className="fixed bottom-0 hidden h-16 w-full items-center justify-center sm:flex sm:justify-start sm:px-6">
      <div className="flex h-full items-center justify-between space-x-8">
        <a
          className="group flex select-none items-center gap-3 rounded-2xl py-2 px-3 transition-all hover:bg-darkBlack hover:ease-in-out dark:hover:bg-lightWhite"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
          rel="noreferrer"
        >
          <GithubIcon className="fill-darkBlack group-hover:fill-lightWhite dark:fill-lightWhite dark:group-hover:fill-darkBlack" />
          <p className="text-darkerBlack group-hover:text-lightWhite dark:text-lighterWhite dark:group-hover:text-darkBlack sm:text-lg">
            github
          </p>
        </a>
        <a
          className="group flex select-none items-center gap-3 rounded-2xl py-2 px-3 transition-all hover:bg-twitterBlue hover:ease-in-out"
          target="_blank"
          href="https://twitter.com/phivedphived"
          rel="noreferrer"
        >
          <TwitterIcon className="fill-darkBlack group-hover:fill-lightWhite dark:fill-lightWhite" />
          <p className="text-darkerBlack group-hover:text-lightWhite dark:text-lighterWhite sm:text-lg">
            twitter
          </p>
        </a>
        <a
          className="group flex select-none items-center gap-3 rounded-2xl from-instagramPink via-instagramOrange to-instagramPurple py-2 px-3 transition-all hover:bg-gradient-to-r hover:ease-in-out"
          target="_blank"
          href="https://www.instagram.com/phivedphived/"
          rel="noreferrer"
        >
          <InstagramIcon className="fill-darkBlack group-hover:fill-lightWhite dark:fill-lightWhite" />
          <p className="text-darkerBlack group-hover:text-lightWhite dark:text-lighterWhite sm:text-lg">
            instagram
          </p>
        </a>
      </div>
    </footer>
  );
}
