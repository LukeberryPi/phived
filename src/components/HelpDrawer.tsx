import { FloatingDrawer } from "src/components/FloatingDrawer";
import { pressFeedbackClassName } from "src/constants/motion";
import { DRAWER_TEXT } from "src/constants/ui";
import { Close, Question } from "src/icons";
import { cn } from "src/utils";

type HelpPanelProps = {
  onClose: () => void;
};

export function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <div className="relative space-y-3 px-5 pb-4">
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
        <Close size={18} className="fill-black dark:fill-ink" />
      </button>
      <h1 className="pr-9">
        Welcome to <strong>phived, the anti-procrastination to-do list.</strong>
      </h1>
      <h2>
        Stay focused on what matters. You can only have up to five tasks at a
        time.
      </h2>
      <p>
        To add a new task, you first have to{" "}
        <strong>finish one you&apos;re already working on.</strong>
      </p>
      <p>No logins. No ads. No distractions.</p>
      <p>
        <a
          className="text-blue-500 underline decoration-2"
          href="https://www.phived.com"
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
