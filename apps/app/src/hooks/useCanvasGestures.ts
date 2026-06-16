import type { MutableRefObject, RefObject } from "react";
import { useEffect, useState } from "react";
import type { Viewport } from "src/types/canvas";
import { clampZoom, isCanvasBackgroundTarget } from "src/utils/canvas";

const WHEEL_ZOOM_SENSITIVITY = 0.01;

type Point = { x: number; y: number };

type UseCanvasGesturesOptions = {
  boardRef: RefObject<HTMLDivElement | null>;
  viewportRef: MutableRefObject<Viewport | null>;
  setViewport: (viewport: Viewport) => void;
  zoomAt: (point: Point, factor: number) => void;
};

function getPinchState(pointers: Map<number, Point>) {
  const [first, second] = [...pointers.values()];

  return {
    distance: Math.max(Math.hypot(first.x - second.x, first.y - second.y), 1),
    center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
  };
}

export function useCanvasGestures({
  boardRef,
  viewportRef,
  setViewport,
  zoomAt,
}: UseCanvasGesturesOptions) {
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const activePointers = new Map<number, Point>();
    let panPointerId: number | null = null;
    let lastPanPoint: Point | null = null;
    let pinch: ReturnType<typeof getPinchState> | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      if (!isCanvasBackgroundTarget(event.target)) {
        return;
      }

      if (
        event.pointerType === "mouse" &&
        event.button !== 0 &&
        event.button !== 1
      ) {
        return;
      }

      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      board.setPointerCapture(event.pointerId);

      if (activePointers.size === 1) {
        panPointerId = event.pointerId;
        lastPanPoint = { x: event.clientX, y: event.clientY };
        setIsPanning(true);
      } else if (activePointers.size === 2) {
        panPointerId = null;
        lastPanPoint = null;
        pinch = getPinchState(activePointers);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!activePointers.has(event.pointerId)) {
        return;
      }

      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      const current = viewportRef.current;

      if (!current) {
        return;
      }

      if (activePointers.size >= 2) {
        const nextPinch = getPinchState(activePointers);

        if (pinch) {
          const rect = board.getBoundingClientRect();
          const panned = {
            x: current.x + nextPinch.center.x - pinch.center.x,
            y: current.y + nextPinch.center.y - pinch.center.y,
          };
          const zoom = clampZoom(
            current.zoom * (nextPinch.distance / pinch.distance)
          );
          const scale = zoom / current.zoom;
          const center = {
            x: nextPinch.center.x - rect.left,
            y: nextPinch.center.y - rect.top,
          };

          setViewport({
            x: center.x - (center.x - panned.x) * scale,
            y: center.y - (center.y - panned.y) * scale,
            zoom,
          });
        }

        pinch = nextPinch;
        return;
      }

      if (event.pointerId === panPointerId && lastPanPoint) {
        setViewport({
          x: current.x + event.clientX - lastPanPoint.x,
          y: current.y + event.clientY - lastPanPoint.y,
          zoom: current.zoom,
        });
        lastPanPoint = { x: event.clientX, y: event.clientY };
      }
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (!activePointers.delete(event.pointerId)) {
        return;
      }

      if (activePointers.size < 2) {
        pinch = null;
      }

      if (activePointers.size === 1) {
        const [pointerId] = activePointers.keys();
        const [point] = activePointers.values();
        panPointerId = pointerId;
        lastPanPoint = point;
      } else if (activePointers.size === 0) {
        panPointerId = null;
        lastPanPoint = null;
        setIsPanning(false);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const current = viewportRef.current;

      if (!current) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        const rect = board.getBoundingClientRect();
        zoomAt(
          { x: event.clientX - rect.left, y: event.clientY - rect.top },
          Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY)
        );
        return;
      }

      setViewport({
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
        zoom: current.zoom,
      });
    };

    board.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    board.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      board.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      board.removeEventListener("wheel", handleWheel);
    };
  }, [boardRef, setViewport, viewportRef, zoomAt]);

  return isPanning;
}
