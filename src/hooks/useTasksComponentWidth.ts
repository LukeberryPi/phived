import type { MouseEvent } from "react";
import { useEffect } from "react";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import { setTasksDefaultWidth } from "src/utils";

const DEFAULT_WIDTH = setTasksDefaultWidth();

export function useTasksComponentWidth() {
  const [tasksComponentWidth, setTasksComponentWidth] = useLocalStorage(
    "tasksComponentWidth",
    DEFAULT_WIDTH
  );

  useEffect(() => {
    setTasksComponentWidth(tasksComponentWidth);
  }, [setTasksComponentWidth, tasksComponentWidth]);

  const handleResize = (event: MouseEvent<HTMLUListElement>) => {
    const newWidth = event.currentTarget.offsetWidth;

    if (newWidth !== tasksComponentWidth) {
      setTasksComponentWidth(newWidth);
    }
  };

  return { tasksComponentWidth, handleResize };
}
