import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useState } from "react";
import type { TaskList } from "src/types/canvas";
import { movedListPosition } from "src/utils/canvas";

type UseMovableTaskListOptions = {
  list: TaskList;
  zoomRef: MutableRefObject<number>;
  onMove: (listId: string, x: number, y: number) => void;
};

export function useMovableTaskList({
  list,
  zoomRef,
  onMove,
}: UseMovableTaskListOptions) {
  const [isMoving, setIsMoving] = useState(false);

  // Attached to the dedicated move button, so any primary pointer counts.
  const handleMovePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary) {
      return;
    }

    event.preventDefault();
    const { pointerId } = event;
    const startClient = { x: event.clientX, y: event.clientY };
    const startPosition = { x: list.x, y: list.y };
    setIsMoving(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }

      const next = movedListPosition(
        startPosition,
        startClient,
        { x: moveEvent.clientX, y: moveEvent.clientY },
        zoomRef.current
      );
      onMove(list.id, next.x, next.y);
    };

    const handlePointerEnd = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) {
        return;
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      setIsMoving(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
  };

  return { isMoving, handleMovePointerDown };
}
