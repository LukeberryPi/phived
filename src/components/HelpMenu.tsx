import { useEffect, useRef } from "react";
import { DragIcon } from "src/icons";

interface HelpMenuProps {
  showHelpMenu: boolean;
  setShowHelpMenu: Dispatch;
}

export function HelpMenu() {
  const helpMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (showHelpMenu && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [showHelpMenu]);

  return (
    <div className="fit-content absolute right-7 top-16 z-50 flex flex-col items-start rounded-2xl border bg-lightWhite p-3">
      <p>
        welcome to the <strong>anti-procrastination to-do list</strong>!
      </p>
      <hr className="my-3 h-px w-full border-0 bg-darkBlack" />
      <p>
        list five things you want to do. <br />
        want more tasks? <strong>complete existing ones</strong>.
      </p>
      <hr className="my-3 h-px w-full border-0 bg-darkBlack" />
      <p className="inline-flex items-center">
        reorder tasks by clicking and dragging the
        <DragIcon className="mx-1 fill-darkBlack" squareWidthAndHeight={20} />
        icon besides the done button.
      </p>
      <hr className="my-3 h-px w-full border-0 bg-darkBlack" />
      <div className="space-y-5">
        <p>
          <kbd className="rounded border border-darkBlack px-3 py-1 font-sans">enter</kbd> navigates
          to the next task,{" "}
          <kbd className="rounded border border-darkBlack px-3 py-1 font-sans">shift</kbd> +{" "}
          <kbd className="rounded border border-darkBlack px-3 py-1 font-sans">enter</kbd> to
          previous
        </p>
        <p>
          <kbd className="rounded border border-darkBlack px-3 py-1 font-sans">ctrl</kbd> +{" "}
          <kbd className="rounded border border-darkBlack px-3 py-1 font-sans">enter</kbd> will
          complete the current task, or just click{" "}
          <span className="rounded border border-darkBlack bg-berryBlue py-1 px-3">done</span>
        </p>
      </div>
      <hr className="my-3 h-px w-full border-0 bg-darkBlack" />
      <p>
        if you have any doubts,{" "}
        <a
          href="https://twitter.com/phivedphived/status/1636734098252128257?s=20"
          rel="noreferrer"
          target="_blank"
        >
          access this post
        </a>
      </p>
    </div>
  );
}
