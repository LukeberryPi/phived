import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DESKTOP_MEDIA_QUERY } from "src/constants/ui";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import { setTasksDefaultWidth } from "src/utils";

const RESIZE_HANDLE_SIZE = 16;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}

export function useTasksComponentWidth() {
  const isDesktop = useIsDesktop();
  const [storedWidth, setStoredWidth] = useLocalStorage(
    "tasksComponentWidth",
    setTasksDefaultWidth()
  );
  const [width, setWidth] = useState(storedWidth);
  const [isResizing, setIsResizing] = useState(false);
  const tasksListRef = useRef<HTMLUListElement>(null);
  const isResizingRef = useRef(false);

  isResizingRef.current = isResizing;

  useEffect(() => {
    if (!isDesktop || isResizingRef.current) {
      return;
    }

    setWidth(storedWidth);
  }, [isDesktop, storedWidth]);

  useEffect(() => {
    if (!isDesktop || !isResizing) {
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
  }, [isDesktop, isResizing]);

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    const handlePointerUp = () => {
      if (!isResizingRef.current) {
        return;
      }

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
  }, [isDesktop, setStoredWidth]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLUListElement>) => {
      if (!isDesktop) {
        return;
      }

      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const isOnResizeHandle =
        event.clientX >= rect.right - RESIZE_HANDLE_SIZE &&
        event.clientY >= rect.bottom - RESIZE_HANDLE_SIZE;

      if (!isOnResizeHandle) {
        return;
      }

      setIsResizing(true);
    },
    [isDesktop]
  );

  return {
    tasksListRef,
    width: isDesktop ? width : undefined,
    isResizable: isDesktop,
    handlePointerDown,
  };
}
