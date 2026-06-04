import { useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import { Close, Light } from "src/icons";
import { cn } from "src/utils";

const TOAST_ID = "tasks-wont-be-lost";

export function useTasksWontBeLostToast(hasMultipleTasks: boolean) {
  const [showAlert, setShowAlert] = useLocalStorage(
    "showTasksWontBeLostAlert",
    true
  );
  const show = hasMultipleTasks && showAlert;

  useEffect(() => {
    if (!show) {
      toast.dismiss(TOAST_ID);
      return;
    }

    toast.custom(
      (id) => (
        <div
          className={cn(
            "phived-surface flex items-center gap-3 px-4 py-3",
            "text-black dark:text-white"
          )}
        >
          <Light size={24} />
          <p className="text-xs xs:text-sm">
            your tasks won&apos;t be lost
            <br />
            if you close the website
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              toast.dismiss(id);
              setShowAlert(false);
            }}
            className="rounded-md p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <Close size={24} className="fill-black dark:fill-white" />
          </button>
        </div>
      ),
      {
        id: TOAST_ID,
        duration: Infinity,
        position: "bottom-center",
      }
    );

    return () => {
      toast.dismiss(TOAST_ID);
    };
  }, [setShowAlert, show]);
}
