export function Footer() {
  return (
    <footer className="fixed bottom-0 flex h-16 w-full items-center justify-center sm:justify-start">
      <div className="flex h-full w-72 items-center justify-between xs:w-80 sm:w-96 sm:pl-4">
        <a
          className="flex h-10 select-none items-center rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-darkBlack hover:text-lightWhite hover:ease-in dark:text-lighterWhite dark:hover:bg-lightWhite dark:hover:text-darkBlack xs:text-lg sm:px-4"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
          rel="noreferrer"
        >
          github
        </a>
        <a
          className="flex h-10 select-none items-center rounded-2xl px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-twitterBlue hover:text-lightWhite hover:ease-in dark:text-lighterWhite xs:text-lg sm:px-4"
          target="_blank"
          href="https://twitter.com/phivedphived"
          rel="noreferrer"
        >
          twitter
        </a>
        <a
          className="flex h-10 select-none items-center rounded-2xl from-instagramPink via-instagramOrange to-instagramPurple px-3 text-base font-medium text-darkerBlack transition duration-100 hover:bg-gradient-to-r hover:text-lightWhite hover:ease-in dark:text-lighterWhite xs:text-lg sm:px-4"
          target="_blank"
          href="https://www.instagram.com/phivedphived/"
          rel="noreferrer"
        >
          instagram
        </a>
      </div>
    </footer>
  );
}