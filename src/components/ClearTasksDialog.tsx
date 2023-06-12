import { useTasksContext } from "src/contexts";

export interface ClearTasksDialogProps {
  onClose: () => void;
}

export function ClearTasksDialog({ onClose }: ClearTasksDialogProps) {
  const { clearTasks } = useTasksContext();

  const handleClearTasks = () => {
    clearTasks();
    onClose();
  };

  return (
    <div className="absolute top-full hidden max-w-xs -translate-x-3 flex-col rounded-2xl border border-darkBlack bg-lightWhite px-5 pt-5 pb-3 shadow-brutalist-dark dark:border-lightWhite dark:bg-darkBlack dark:shadow-brutalist-light lg:flex">
      <p className="text-darkBlack dark:text-lightWhite">
        Are you sure you want to <b>delete</b> all your tasks?
      </p>
      <br />
      <div className="flex w-full justify-end gap-2">
        <button
          onClick={onClose}
          className={
            "cursor-pointer items-center justify-center rounded-lg border border-l bg-berryBlue px-4 text-base dark:bg-purpleRain dark:text-lighterWhite xs:text-lg"
          }
        >
          cancel
        </button>
        <button
          onClick={handleClearTasks}
          className={
            "cursor-pointer items-center justify-center rounded-lg border border-l bg-alertRed px-4 text-base dark:text-lighterWhite xs:text-lg"
          }
        >
          delete
        </button>
      </div>
    </div>
  );
}
