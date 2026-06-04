import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import { setTasksDefaultWidth } from "src/utils";

const RESIZE_HANDLE_SIZE = 16;

export function useTasksComponentWidth() {
  const [storedWidth, setStoredWidth] = useLocalStorage(
    "tasksComponentWidth",
    setTasksDefaultWidth()
  );
  const [width, setWidth] = useState(storedWidth);
  const [isResizing, setIsResizing] = useState(false);
  const tasksListRef = useRef<HTMLUListElement>(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    if (!isResizingRef.current) {
      setWidth(storedWidth);
    }
  }, [storedWidth]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const element = tasksListRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const nextWidth = element.offsetWidth;
      if (nextWidth > 0) {
        setWidth(nextWidth);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [isResizing]);

  useEffect(() => {
    const handlePointerUp = () => {
      if (!isResizingRef.current) {
        return;
      }

      isResizingRef.current = false;
      setIsResizing(false);

      const element = tasksListRef.current;
      if (!element) {
        return;
      }

      const nextWidth = element.offsetWidth;
      if (nextWidth <= 0) {
        return;
      }

      setWidth(nextWidth);
      setStoredWidth(nextWidth);
    };

    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [setStoredWidth]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLUListElement>) => {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const isOnResizeHandle =
        event.clientX >= rect.right - RESIZE_HANDLE_SIZE &&
        event.clientY >= rect.bottom - RESIZE_HANDLE_SIZE;

      if (!isOnResizeHandle) {
        return;
      }

      isResizingRef.current = true;
      setIsResizing(true);
    },
    []
  );

  return { tasksListRef, width, handlePointerDown };
}
