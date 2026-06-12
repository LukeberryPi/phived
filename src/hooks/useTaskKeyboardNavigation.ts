import type { KeyboardEvent, RefObject } from "react";

type UseTaskKeyboardNavigationOptions = {
  taskListRef: RefObject<HTMLElement | null>;
  taskCount: number;
  onDone: (index: number) => void;
  addTaskRow: () => void;
  removeEmptyTaskRow: (index: number) => void;
  moveTaskUp: (index: number) => void;
  moveTaskDown: (index: number) => void;
};

function focusTaskInput(taskList: HTMLElement | null, index: number) {
  taskList?.querySelectorAll("input")[index]?.focus();
}

export function useTaskKeyboardNavigation({
  taskListRef,
  taskCount,
  onDone,
  addTaskRow,
  removeEmptyTaskRow,
  moveTaskUp,
  moveTaskDown,
}: UseTaskKeyboardNavigationOptions) {
  return (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    const taskList = taskListRef.current;
    const isFirstTask = index === 0;
    const isLastTask = index === taskCount - 1;

    if (
      event.key === "Backspace" &&
      event.currentTarget.value === "" &&
      taskCount > 5
    ) {
      event.preventDefault();
      removeEmptyTaskRow(index);
      return requestAnimationFrame(() =>
        focusTaskInput(taskList, Math.max(0, index - 1))
      );
    }

    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      if (isFirstTask) {
        return;
      }
      moveTaskUp(index);
      return focusTaskInput(taskList, index - 1);
    }

    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      if (isLastTask) {
        return;
      }
      moveTaskDown(index);
      return focusTaskInput(taskList, index + 1);
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
        return focusTaskInput(taskList, taskCount - 1);
      }
      return focusTaskInput(taskList, index - 1);
    }

    if (
      (event.key === "ArrowDown" && !event.altKey) ||
      (event.key === "Enter" && !event.ctrlKey)
    ) {
      event.preventDefault();
      if (isLastTask) {
        addTaskRow();
        return requestAnimationFrame(() => focusTaskInput(taskList, taskCount));
      }
      return focusTaskInput(taskList, index + 1);
    }
  };
}
