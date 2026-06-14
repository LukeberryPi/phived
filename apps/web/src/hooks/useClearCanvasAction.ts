import { useCallback } from "react";
import { toast } from "sonner";
import { NO_TASKS_TO_CLEAR_MESSAGE } from "src/constants/ui";
import { useCanvasTasksContext } from "src/contexts/CanvasTasksContext/CanvasTasksContext";
import { countFilledTasks } from "src/utils/countFilledTasks";

export function useClearCanvasAction() {
  const { clearCanvas, lists } = useCanvasTasksContext();
  const unavailable =
    lists.length <= 1 &&
    lists.every((list) => countFilledTasks(list.tasks) === 0);

  const clear = useCallback(() => {
    if (unavailable) {
      toast(NO_TASKS_TO_CLEAR_MESSAGE);
      return;
    }

    clearCanvas();
  }, [clearCanvas, unavailable]);

  return { clear, unavailable };
}
