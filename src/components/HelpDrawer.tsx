import { FloatingDrawer } from "src/components/FloatingDrawer";
import { pressFeedbackClassName } from "src/constants/motion";
import { DRAWER_TEXT, KBD_CLASS } from "src/constants/ui";
import { Question } from "src/icons";
import { cn } from "src/utils";

type HelpPanelProps = {
  onHideHelp: () => void;
};

export function HelpPanel({ onHideHelp }: HelpPanelProps) {
  return (
    <div className="space-y-3 px-5 pb-4 pt-4">
      <h1>
        Welcome to <strong>phived, the anti-procrastination to-do list.</strong>
      </h1>
      <h2>
        Stay focused on what matters. You can only have up to five tasks at a time.
      </h2>
      <p>
        To add a new task, you first have to{" "}
        <strong>finish one you&apos;re already working on.</strong>
        </p>  
      <p>
        No logins. No ads. No distractions.
      </p>
      <p><a className="underline decoration-2 text-blue-500" href="https://www.phived.com" target="_blank" rel="noopener noreferrer">Open Source</a> and free. Forever.</p>
      <hr className="my-4 h-px w-full border-black dark:border-white" />
      <p>
        <kbd className={KBD_CLASS}>enter</kbd> navigates to the next task.
      </p>
      <p>
        <kbd className={KBD_CLASS}>shift</kbd> + <kbd className={KBD_CLASS}>enter</kbd> navigates to the previous task.
      </p>
      <p>
        <kbd className={KBD_CLASS}>ctrl</kbd> + <kbd className={KBD_CLASS}>enter</kbd> will complete the current task, or just click{" "}
        <button
          type="button"
          onClick={onHideHelp}
          className={cn(
            "rounded-r-md border border-black px-2 py-1",
            "bg-sky-300 text-black dark:border-white dark:bg-cyan-800 dark:text-white",
            pressFeedbackClassName
          )}
        >
          done
        </button>
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
      {({ close }) => <HelpPanel onHideHelp={close} />}
    </FloatingDrawer>
  );
}
