import type { KeyboardEvent } from "react";

type UseTaskKeyboardNavigationOptions = {
  taskCount: number;
  onDone: (index: number) => void;
  moveTaskUp: (index: number) => void;
  moveTaskDown: (index: number) => void;
};

function focusTaskInput(index: number) {
  document.querySelectorAll("input")[index]?.focus();
}

export function useTaskKeyboardNavigation({
  taskCount,
  onDone,
  moveTaskUp,
  moveTaskDown,
}: UseTaskKeyboardNavigationOptions) {
  return (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    const isFirstTask = index === 0;
    const isLastTask = index === taskCount - 1;

    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      if (isFirstTask) {
        return;
      }
      moveTaskUp(index);
      return focusTaskInput(index - 1);
    }

    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      if (isLastTask) {
        return;
      }
      moveTaskDown(index);
      return focusTaskInput(index + 1);
    }

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      return onDone(index);
    }

    if (
      (event.key === "ArrowUp" && !event.altKey) ||
      (event.key === "Enter" && event.shiftKey && !event.ctrlKey)
    ) {
      event.preventDefault();
      if (isFirstTask) {
        return focusTaskInput(taskCount - 1);
      }
      return focusTaskInput(index - 1);
    }

    if (
      (event.key === "ArrowDown" && !event.altKey) ||
      (event.key === "Enter" && !event.ctrlKey)
    ) {
      event.preventDefault();
      if (isLastTask) {
        focusTaskInput(0);
        return;
      }
      return focusTaskInput(index + 1);
    }
  };
}
