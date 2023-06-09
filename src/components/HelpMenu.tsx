// import { CloseIcon } from "src/icons";

export function HelpMenu() {
  return (
    <div className="absolute right-7 top-full max-w-xs rounded-2xl border border-darkBlack bg-lightWhite py-4 px-5 shadow-brutalist-dark dark:border-lightWhite dark:bg-darkBlack dark:shadow-brutalist-light">
      {/* <CloseIcon className="absolute top-0 right-0 m-2 cursor-pointer fill-darkBlack dark:fill-lightWhite" /> */}
      <p className="text-darkBlack dark:text-lightWhite">
        welcome to the <strong>anti-procrastination to-do list</strong>!
      </p>
      <br />
      <p className="text-darkBlack dark:text-lightWhite">
        list five things you want to do. <br />
        want to add more tasks? <strong>complete existing ones</strong>.
      </p>
      <br />
      <p className="text-darkBlack dark:text-lightWhite">
        reorder tasks by <strong>clicking and dragging</strong> the icon besides the done button.
      </p>
      <br />
      <p className="text-darkBlack dark:text-lightWhite">
        <strong>wanna know more?</strong> access{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://twitter.com/phivedphived/status/1636734098252128257?s=20"
          className="cursor-pointer underline decoration-darkBlack decoration-1 underline-offset-2 dark:decoration-lightWhite"
        >
          this post{" "}
        </a>
        or{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://twitter.com/LukeberryPi"
          className="cursor-pointer underline decoration-darkBlack decoration-1 underline-offset-2 dark:decoration-lightWhite"
        >
          DM me
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
          to the previous one,
        </p>
        <br />
        <p className="leading-7 text-darkBlack dark:text-lightWhite">
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
    </div>
  );
}
