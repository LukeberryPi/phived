import { Close } from "src/icons";
import { cn } from "src/utils";

type HelpMenuProps = {
  closeHelpMenu?: () => void;
};

const kbdClassName = cn(
  "rounded border border-black px-2 py-1 font-sans dark:border-white"
);

export function HelpMenu({ closeHelpMenu }: HelpMenuProps) {
  return (
    <main
      className={cn(
        "absolute right-7 top-full hidden max-w-xs flex-col rounded-xl",
        "border border-black bg-white px-5 pb-2 pt-4",
        "shadow-brutalist-dark dark:border-white dark:bg-zinc-950",
        "dark:shadow-brutalist-light lg:flex"
      )}
    >
      <button
        aria-label="Close"
        onClick={closeHelpMenu}
        className={cn(
          "absolute right-3 top-3 h-fit w-fit rounded-md p-1",
          "hover:bg-zinc-200 dark:hover:bg-zinc-800"
        )}
      >
        <Close className="fill-black dark:fill-white" />
      </button>
      <h1 className="text-black dark:text-white">
        welcome to the phived.com, the
        <br />
        <strong>anti-procrastination to-do list!</strong>
      </h1>
      <br />
      <h2 className="text-black dark:text-white">
        <strong>list five things you wish to get done.</strong> to add more
        tasks, complete existing ones!
      </h2>
      <br />
      <hr className="mb-7 h-px w-full border-black dark:border-white" />
      <div className="space-y-3">
        <p className="text-black dark:text-white">
          <kbd className={kbdClassName}>enter</kbd> navigates to the next
          task,{" "}
        </p>
        <br />
        <p className="leading-7 text-black dark:text-white">
          <kbd className={kbdClassName}>shift</kbd> +{" "}
          <kbd className={kbdClassName}>enter</kbd> navigates to the previous
          task,
        </p>
        <br />
        <p className="-translate-y-3 leading-7 text-black dark:text-white">
          <kbd className={kbdClassName}>ctrl</kbd> +{" "}
          <kbd className={kbdClassName}>enter</kbd> will complete the current
          task, or just click{" "}
          <span
            onClick={closeHelpMenu}
            className={cn(
              "cursor-pointer rounded-r-md border border-black px-2 py-1",
              "bg-sky-300 dark:border-white dark:bg-cyan-800"
            )}
          >
            done?
          </span>
        </p>
      </div>
    </main>
  );
}
