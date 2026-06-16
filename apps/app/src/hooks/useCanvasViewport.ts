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
import { parseViewport } from "src/utils/persistence";
import { useCanvasGestures } from "src/hooks/useCanvasGestures";
import { toast } from "sonner";
import { STORAGE_WRITE_ERROR_MESSAGE } from "src/constants/ui";

const VIEWPORT_STORAGE_KEY = "canvasViewport";
const ZOOM_STEP = 1.2;
const CENTER_ANIMATION_MS = 220;

type Point = { x: number; y: number };

function loadStoredViewport(): Viewport | null {
  try {
    const item = window.localStorage.getItem(VIEWPORT_STORAGE_KEY);
    return item ? parseViewport(JSON.parse(item), null) : null;
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
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
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const animationFrameRef = useRef<number | null>(null);

  const zoomRef = useRef(viewport?.zoom ?? 1);
  zoomRef.current = viewport?.zoom ?? 1;

  const setViewport = useCallback(
    (next: Viewport) => {
      const board = boardRef.current;

      if (!board) {
        return;
      }

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const rect = board.getBoundingClientRect();
      setViewportState(clampViewport(next, rect.width, rect.height));
    },
    [boardRef]
  );

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    },
    []
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
        toast(STORAGE_WRITE_ERROR_MESSAGE);
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

  const centerCanvasPoint = useCallback(
    (point: Point) => {
      const board = boardRef.current;
      const current = viewportRef.current;

      if (!board || !current) {
        return;
      }

      const rect = board.getBoundingClientRect();
      const next = clampViewport(
        {
          x: rect.width / 2 - point.x * current.zoom,
          y: rect.height / 2 - point.y * current.zoom,
          zoom: current.zoom,
        },
        rect.width,
        rect.height
      );

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setViewport(next);
        return;
      }

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      const start = current;
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - startedAt) / CENTER_ANIMATION_MS, 1);
        const eased = easeOutCubic(progress);

        setViewportState({
          x: start.x + (next.x - start.x) * eased,
          y: start.y + (next.y - start.y) * eased,
          zoom: start.zoom + (next.zoom - start.zoom) * eased,
        });

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    },
    [boardRef, setViewport]
  );

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

  const isPanning = useCanvasGestures({
    boardRef,
    viewportRef,
    setViewport,
    zoomAt,
  });

  return {
    viewport,
    isPanning,
    zoomRef,
    screenToCanvas,
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvasPoint,
  };
}
