export function Footer() {
  return (
    <footer className="fixed bottom-0 flex h-16 w-full items-center justify-center sm:justify-start">
      <div className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pl-10">
        <a
          className="flex h-10 items-center rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-darkBlack xs:hover:text-lightWhite xs:dark:hover:bg-lightWhite xs:dark:hover:text-darkBlack sm:text-lg"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
        >
          github
        </a>
        <a
          className="flex h-10 items-center rounded-2xl text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-twitterBlue xs:hover:text-lightWhite sm:text-lg"
          target="_blank"
          href="https://twitter.com/phivedphived"
        >
          twitter
        </a>
        <a
          className="flex h-10 items-center rounded-2xl from-instagramPink via-instagramOrange to-instagramPurple text-base font-medium text-darkerBlack transition duration-100 hover:ease-in dark:text-lighterWhite xs:px-4 xs:hover:bg-gradient-to-r xs:hover:text-lightWhite sm:text-lg"
          target="_blank"
          href="https://twitter.com/lukeberrypi"
        >
          instagram
        </a>
      </div>
    </footer>
  );
}
