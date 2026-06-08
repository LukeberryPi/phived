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
        welcome to the phived.com, the
        <br />
        <strong>anti-procrastination to-do list!</strong>
      </h1>
      <h2>
        <strong>list five things you wish to get done.</strong> to add more
        tasks, complete existing ones!
      </h2>
      <hr className="my-4 h-px w-full border-black dark:border-white" />
      <p>
        <kbd className={KBD_CLASS}>enter</kbd> navigates to the next task,
      </p>
      <p className="leading-7">
        <kbd className={KBD_CLASS}>shift</kbd> +{" "}
        <kbd className={KBD_CLASS}>enter</kbd> navigates to the previous task,
      </p>
      <p className="leading-7">
        <kbd className={KBD_CLASS}>ctrl</kbd> +{" "}
        <kbd className={KBD_CLASS}>enter</kbd> will complete the current task,
        or just click{" "}
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
