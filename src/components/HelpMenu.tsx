import { CloseIcon, DragIcon } from "src/icons";

export function HelpMenu() {
  return (
    <div className="fit-content absolute right-7 top-16 flex max-w-xs flex-col items-start rounded-2xl border bg-lightWhite p-3">
      <CloseIcon className="absolute top-0 right-0 m-2 cursor-pointer fill-darkBlack" />
      <p className="my-4">
        welcome to the <strong>anti-procrastination to-do list</strong>!
      </p>
      <hr className="h-px w-full border-0 bg-greyLight" />
      <p className="my-4">
        list five things you want to do. <br />
        want more tasks? <strong>complete existing ones</strong>.
      </p>
      <hr className="h-px w-full border-0 bg-greyLight" />
      <p className="my-4">
        reorder tasks by clicking and dragging the icon besides the done button.
      </p>
      <hr className="h-px w-full border-0 bg-greyLight" />
      <p className="my-4">
        <kbd className="my-12 rounded border border-darkBlack px-3 py-1 font-sans">enter</kbd>{" "}
        navigates to the next task,{" "}
      </p>
      <p className="my-4">
        <kbd className="my-12 rounded border border-darkBlack px-3 py-1 font-sans">shift</kbd> +{" "}
        <kbd className="my-12 rounded border border-darkBlack px-3 py-1 font-sans">enter</kbd> to
        the previous one,
      </p>
      <p className="my-4">
        <kbd className="my-12 rounded border border-darkBlack px-3 py-1 font-sans">ctrl</kbd> +{" "}
        <kbd className="my-12 rounded border border-darkBlack px-3 py-1 font-sans">enter</kbd> will
        complete the current task, or just click{" "}
        <span className="rounded border border-darkBlack bg-berryBlue py-1 px-3">done</span>
      </p>
      <hr className="h-px w-full border-0 bg-greyLight" />
      <p className="my-4">
        if you have doubts, access{" "}
        <a
          href="https://twitter.com/phivedphived/status/1636734098252128257?s=20"
          rel="noreferrer"
          target="_blank"
          className="underline decoration-berryBlue underline-offset-2"
        >
          this post{" "}
        </a>
        or{" "}
        <a
          href="https://twitter.com/LukeberryPi"
          rel="noreferrer"
          target="_blank"
          className="underline decoration-berryBlue underline-offset-2"
        >
          DM me
        </a>
      </p>
    </div>
  );
}
