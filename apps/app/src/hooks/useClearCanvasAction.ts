import { useCallback } from "react";
import { toast } from "sonner";
import { NO_TASKS_TO_CLEAR_MESSAGE } from "src/constants/ui";
import { useCanvasTasksContext } from "src/contexts/CanvasTasksContext/CanvasTasksContext";
import { canvasHasContent } from "src/utils/canvas";

export function useClearCanvasAction() {
  const { clearCanvas, lists } = useCanvasTasksContext();
  const unavailable = !canvasHasContent(lists);

  const clear = useCallback(() => {
    if (unavailable) {
      toast(NO_TASKS_TO_CLEAR_MESSAGE);
      return;
    }

    clearCanvas();
  }, [clearCanvas, unavailable]);

  return { clear, unavailable };
}
