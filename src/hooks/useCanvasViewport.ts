import type { RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Viewport } from "src/types/canvas";
import {
  clampViewport,
  clampZoom,
  createCenteredViewport,
} from "src/utils/canvas";

const VIEWPORT_STORAGE_KEY = "canvasViewport";
const WHEEL_ZOOM_SENSITIVITY = 0.01;
const ZOOM_STEP = 1.2;

type Point = { x: number; y: number };

function loadStoredViewport(): Viewport | null {
  try {
    const item = window.localStorage.getItem(VIEWPORT_STORAGE_KEY);
    return item ? (JSON.parse(item) as Viewport) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function getPinchState(pointers: Map<number, Point>) {
  const [first, second] = [...pointers.values()];

  return {
    distance: Math.max(Math.hypot(first.x - second.x, first.y - second.y), 1),
    center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
  };
}

function isBackgroundTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !target.closest("[data-canvas-item]") &&
    !target.closest("[data-canvas-ui]")
  );
}

/**
 * Pan/zoom state for the finite canvas: drag-to-pan on the background,
 * wheel to pan, ctrl/cmd+wheel or two-finger pinch to zoom, persisted to
 * localStorage. `viewport` is null until the board has been measured.
 */
export function useCanvasViewport(boardRef: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewportState] = useState<Viewport | null>(
    loadStoredViewport
  );
  const [isPanning, setIsPanning] = useState(false);

  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const zoomRef = useRef(viewport?.zoom ?? 1);
  zoomRef.current = viewport?.zoom ?? 1;

  const setViewport = useCallback(
    (next: Viewport) => {
      const board = boardRef.current;

      if (!board) {
        return;
      }

      const rect = board.getBoundingClientRect();
      setViewportState(clampViewport(next, rect.width, rect.height));
    },
    [boardRef]
  );

  useLayoutEffect(() => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const applyBounds = () => {
      const rect = board.getBoundingClientRect();
      setViewportState((prev) =>
        prev
          ? clampViewport(prev, rect.width, rect.height)
          : createCenteredViewport(rect.width, rect.height)
      );
    };

    applyBounds();
    window.addEventListener("resize", applyBounds);
    return () => window.removeEventListener("resize", applyBounds);
  }, [boardRef]);

  useEffect(() => {
    if (!viewport) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          VIEWPORT_STORAGE_KEY,
          JSON.stringify(viewport)
        );
      } catch (error) {
        console.warn(error);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [viewport]);

  const zoomAt = useCallback(
    (point: Point, factor: number) => {
      const current = viewportRef.current;

      if (!current) {
        return;
      }

      const zoom = clampZoom(current.zoom * factor);
      const scale = zoom / current.zoom;
      setViewport({
        x: point.x - (point.x - current.x) * scale,
        y: point.y - (point.y - current.y) * scale,
        zoom,
      });
    },
    [setViewport]
  );

  const zoomAtBoardCenter = useCallback(
    (factor: number) => {
      const board = boardRef.current;

      if (!board) {
        return;
      }

      const rect = board.getBoundingClientRect();
      zoomAt({ x: rect.width / 2, y: rect.height / 2 }, factor);
    },
    [boardRef, zoomAt]
  );

  const zoomIn = useCallback(
    () => zoomAtBoardCenter(ZOOM_STEP),
    [zoomAtBoardCenter]
  );

  const zoomOut = useCallback(
    () => zoomAtBoardCenter(1 / ZOOM_STEP),
    [zoomAtBoardCenter]
  );

  const resetZoom = useCallback(() => {
    const current = viewportRef.current;

    if (current) {
      zoomAtBoardCenter(1 / current.zoom);
    }
  }, [zoomAtBoardCenter]);

  const screenToCanvas = useCallback(
    (point: Point): Point => {
      const current = viewportRef.current;
      const board = boardRef.current;

      if (!current || !board) {
        return { x: 0, y: 0 };
      }

      const rect = board.getBoundingClientRect();
      return {
        x: (point.x - rect.left - current.x) / current.zoom,
        y: (point.y - rect.top - current.y) / current.zoom,
      };
    },
    [boardRef]
  );

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
      if (!isBackgroundTarget(event.target)) {
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
            x: current.x + (nextPinch.center.x - pinch.center.x),
            y: current.y + (nextPinch.center.y - pinch.center.y),
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
  }, [boardRef, setViewport, zoomAt]);

  return {
    viewport,
    isPanning,
    zoomRef,
    screenToCanvas,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
