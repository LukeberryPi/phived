import { Close } from "src/icons";

interface HelpMenuProps {
  onCloseClick?: () => void;
}

export function HelpMenu({ onCloseClick }: HelpMenuProps) {
  return (
    <article className="absolute right-7 top-full hidden max-w-xs flex-col rounded-2xl border border-darkBlack bg-lighterWhite px-5 pt-4 pb-2 shadow-brutalist-dark dark:border-lightWhite dark:bg-darkBlack dark:shadow-brutalist-light lg:flex">
      <span
        onClick={onCloseClick}
        className="absolute right-3 top-3 h-fit w-fit cursor-pointer rounded-md p-1 hover:bg-unavailableLight dark:hover:bg-unavailableDark"
      >
        <Close className="fill-darkBlack dark:fill-lightWhite" />
      </span>
      <h1 className="text-darkBlack dark:text-lightWhite">
        welcome to the phived.com, the
        <br />
        <strong>anti-procrastination to-do list!</strong>
      </h1>
      <br />
      <h2 className="text-darkBlack dark:text-lightWhite">
        <strong>list five things you wish to get done.</strong> to add more tasks, complete existing
        ones!
      </h2>
      <br />
      <p className="text-darkBlack dark:text-lightWhite">
        <strong>want to know more?</strong> access{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://twitter.com/phivedphived/status/1636734098252128257?s=20"
          className="cursor-pointer underline decoration-darkBlack underline-offset-2 dark:decoration-lightWhite"
        >
          this post{" "}
        </a>
        or{" "}
        <a
          target="_blank"
          href="https://twitter.com/LukeberryPi"
          className="cursor-pointer underline decoration-darkBlack underline-offset-2 dark:decoration-lightWhite"
          rel="noreferrer"
        >
          send me a message
        </a>
        .
      </p>
      <br />
      <hr className="mb-7 h-px w-full border-darkBlack dark:border-lightWhite" />
      <div className="space-y-3">
        <p className="text-darkBlack dark:text-lightWhite">
          <kbd className="rounded border border-darkBlack px-2 py-1 font-sans dark:border-lightWhite">
            enter
          </kbd>{" "}
          navigates to the next task,{" "}
        </p>
        <br />
        <p className="text-darkBlack dark:text-lightWhite">
          <kbd className="rounded border border-darkBlack px-2 py-1 font-sans dark:border-lightWhite">
            shift
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-darkBlack px-2 py-1 font-sans dark:border-lightWhite">
            enter
          </kbd>{" "}
          navigates to the previous task,
        </p>
        <br />
        <p className="-translate-y-3 leading-7 text-darkBlack dark:text-lightWhite">
          <kbd className="rounded border border-darkBlack px-2 py-1 font-sans dark:border-lightWhite">
            ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-darkBlack px-2 py-1 font-sans dark:border-lightWhite">
            enter
          </kbd>{" "}
          will complete the current task, or just click{" "}
          <span className="rounded-r-md border border-darkBlack bg-berryBlue py-1 px-2 dark:border-lightWhite dark:bg-purpleRain">
            done?
          </span>
        </p>
      </div>
    </article>
  );
}
