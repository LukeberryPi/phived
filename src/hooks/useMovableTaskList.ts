import type {
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useState } from "react";
import type { TaskList } from "src/types/canvas";

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

  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target;

    if (
      !event.isPrimary ||
      (target instanceof Element &&
        (target.closest("input") || target.closest("button")))
    ) {
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

      const zoom = zoomRef.current || 1;
      onMove(
        list.id,
        startPosition.x + (moveEvent.clientX - startClient.x) / zoom,
        startPosition.y + (moveEvent.clientY - startClient.y) / zoom
      );
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

  return { isMoving, handleHeaderPointerDown };
}
