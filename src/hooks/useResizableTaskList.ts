import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useState } from "react";
import type { TaskList } from "src/types/canvas";
import { LIST_WIDTH, resizedListWidth } from "src/utils/canvas";

type UseResizableTaskListOptions = {
  list: TaskList;
  zoomRef: MutableRefObject<number>;
  onResize: (listId: string, width: number) => void;
};

/** Drag the list's right edge to change its width (clamped by the action). */
export function useResizableTaskList({
  list,
  zoomRef,
  onResize,
}: UseResizableTaskListOptions) {
  const [isResizing, setIsResizing] = useState(false);

  const handleResizePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary) {
      return;
    }

    event.preventDefault();
    const { pointerId } = event;
    const startClientX = event.clientX;
    const startWidth = list.width ?? LIST_WIDTH;
    setIsResizing(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }

      onResize(
        list.id,
        resizedListWidth(startWidth, startClientX, moveEvent.clientX, zoomRef.current)
      );
    };

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) {
        return;
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      setIsResizing(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
  };

  return { isResizing, handleResizePointerDown };
}
