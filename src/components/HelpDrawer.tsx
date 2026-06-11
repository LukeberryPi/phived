import { FloatingDrawer } from "src/components/FloatingDrawer";
import { pressFeedbackClassName } from "src/constants/motion";
import { DRAWER_TEXT } from "src/constants/ui";
import { CaretDown, Question } from "src/icons";
import { cn } from "src/utils";

type HelpPanelProps = {
  onClose: () => void;
};

export function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <div className="relative space-y-3 px-5 pb-4 text-sm">
      <button
        type="button"
        aria-label="Close help"
        onClick={onClose}
        className={cn(
          "absolute right-3 flex size-8 shrink-0 items-center justify-center rounded-full",
          "sm:hover:bg-zinc-100 dark:sm:hover:bg-surfaceHover",
          pressFeedbackClassName
        )}
      >
        <CaretDown size={18} className="fill-black dark:fill-ink" />
      </button>
      <h1 className="pr-9">
        Welcome to <strong>phived, the anti-procrastination to-do list.</strong>
      </h1>
      <h2>
        Your tasks live on a canvas now. Spawn as many lists as you need and
        give each one a tag, like <strong>work</strong> or{" "}
        <strong>personal</strong>.
      </h2>
      <p>
        <strong>Double-click</strong> anywhere on the canvas (or press{" "}
        <strong>new list</strong>) to spawn a list. Drag a list by its header to
        move it around.
      </p>
      <p>
        <strong>Scroll to pan</strong> and <strong>ctrl/⌘ + scroll</strong> (or
        pinch) to zoom. Lists grow as you type, and finished tasks move to
        history when you press <strong>done</strong>.
      </p>
      <p>No login. No ads. No distractions.</p>
      <p>
        <a
          className="text-blue-600 underline decoration-2 dark:text-blue-500"
          href="https://www.github.com/lukeberrypi/phived"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Source
        </a>{" "}
        and free. Forever.
      </p>
    </div>
  );
}

export function HelpDrawer() {
  return (
    <FloatingDrawer
      side="left"
      storageKey="showHelpMenu"
      ariaLabel="Help"
      panelId="help-panel"
      renderToggle={(isOpen) => (
        <>
          <Question size={20} className={DRAWER_TEXT} />
          <span className="whitespace-nowrap">
            {isOpen ? "hide help" : "show help"}
          </span>
        </>
      )}
    >
      {({ close }) => <HelpPanel onClose={close} />}
    </FloatingDrawer>
  );
}
