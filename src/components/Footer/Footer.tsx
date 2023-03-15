export function Footer() {
  return (
    <footer className="fixed bottom-0 flex h-16 w-full items-center justify-center sm:justify-start">
      <div className="flex h-full w-64 items-center justify-between xs:w-80 sm:w-96 sm:pl-10">
        <a
          className="flex h-full items-center text-base font-medium text-blackDawn decoration-petrolBlue underline-offset-4 hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:pr-2 sm:text-lg"
          target="_blank"
          href="https://github.com/LukeberryPi/phived"
        >
          github
        </a>
        <a
          className="flex h-full items-center text-base font-medium text-blackDawn decoration-petrolBlue underline-offset-4 hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:pr-2 sm:text-lg"
          target="_blank"
          href="https://twitter.com/phivedphived"
        >
          twitter
        </a>
        <a
          className="flex h-full items-center text-base font-medium text-blackDawn decoration-petrolBlue underline-offset-4 hover:underline dark:text-snowWhite dark:decoration-berryBlue sm:pr-2 sm:text-lg"
          target="_blank"
          href="https://twitter.com/lukeberrypi"
        >
          by @lukeberrypi
        </a>
      </div>
    </footer>
  );
}
