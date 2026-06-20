import { pressFeedbackClassName } from "src/constants/motion";
import { CaretDown } from "src/icons";
import { cn } from "src/utils";

export function HelpContent() {
  return (
    <div className="space-y-3 text-sm">
      <h1>
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
    </div>
  );
}

type HelpPanelProps = {
  onClose: () => void;
};

export function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <div className="relative px-5 pt-4 pb-4">
      <button
        type="button"
        aria-label="Close help"
        onClick={onClose}
        className={cn(
          "absolute right-3 flex size-8 shrink-0 items-center justify-center rounded-full",
          "dark:hover:bg-surface-hover-dark hover:bg-surface-hover-light",
          pressFeedbackClassName
        )}
      >
        <CaretDown size={18} className="dark:text-ink-dark text-black" />
      </button>
      <div className="pr-9">
        <HelpContent />
      </div>
    </div>
  );
}
