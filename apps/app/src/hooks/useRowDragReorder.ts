import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useRef, useState } from "react";

type UseRowDragReorderOptions = {
  rowsRef: RefObject<HTMLElement | null>;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

/**
 * Pointer-driven task row reordering that live-swaps rows as the pointer
 * crosses them. Works at any canvas zoom because it only compares screen
 * rects against the pointer position.
 */
export function useRowDragReorder({
  rowsRef,
  onReorder,
}: UseRowDragReorderOptions) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const handleDragHandlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, index: number) => {
      if (!event.isPrimary) {
        return;
      }

      event.preventDefault();
      const { pointerId } = event;
      let currentIndex = index;
      setDraggingIndex(index);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        const rows =
          rowsRef.current?.querySelectorAll<HTMLElement>("[data-task-row]");

        if (!rows || rows.length === 0) {
          return;
        }

        let nextIndex = currentIndex;
        const pointerY = moveEvent.clientY;

        if (pointerY < rows[0].getBoundingClientRect().top) {
          nextIndex = 0;
        } else if (
          pointerY > rows[rows.length - 1].getBoundingClientRect().bottom
        ) {
          nextIndex = rows.length - 1;
        } else {
          rows.forEach((row, rowIndex) => {
            const rect = row.getBoundingClientRect();

            if (pointerY >= rect.top && pointerY < rect.bottom) {
              nextIndex = rowIndex;
            }
          });
        }

        if (nextIndex !== currentIndex) {
          onReorderRef.current(currentIndex, nextIndex);
          currentIndex = nextIndex;
          setDraggingIndex(nextIndex);
        }
      };

      const handlePointerEnd = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== pointerId) {
          return;
        }

        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerEnd);
        window.removeEventListener("pointercancel", handlePointerEnd);
        setDraggingIndex(null);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerEnd);
      window.addEventListener("pointercancel", handlePointerEnd);
    },
    [rowsRef]
  );

  return { draggingIndex, handleDragHandlePointerDown };
}
