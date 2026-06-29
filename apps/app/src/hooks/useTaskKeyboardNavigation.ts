import type { KeyboardEvent, RefObject } from "react";
import type { Task } from "src/types/canvas";
import { MIN_TASK_ROWS } from "src/utils/taskList";

type UseTaskKeyboardNavigationOptions = {
  taskListRef: RefObject<HTMLElement | null>;
  tagRef: RefObject<HTMLInputElement | null>;
  tasks: Task[];
  onDone: (index: number) => void;
  addTaskRow: () => void;
  insertTaskRowBelow: (index: number) => void;
  insertTaskRowAbove: (index: number) => void;
  removeEmptyTaskRow: (index: number) => void;
  moveTaskUp: (index: number) => void;
  moveTaskDown: (index: number) => void;
};

function focusTaskInput(taskList: HTMLElement | null, index: number) {
  taskList?.querySelectorAll("input")[index]?.focus();
}

export function useTaskKeyboardNavigation({
  taskListRef,
  tagRef,
  tasks,
  onDone,
  addTaskRow,
  insertTaskRowBelow,
  insertTaskRowAbove,
  removeEmptyTaskRow,
  moveTaskUp,
  moveTaskDown,
}: UseTaskKeyboardNavigationOptions) {
  const focusTag = () => tagRef.current?.focus();

  const onTaskKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const taskList = taskListRef.current;
    const taskCount = tasks.length;
    const isFirstTask = index === 0;
    const isLastTask = index === taskCount - 1;

    if (
      event.key === "Backspace" &&
      event.currentTarget.value === "" &&
      taskCount > MIN_TASK_ROWS
    ) {
      event.preventDefault();
      removeEmptyTaskRow(index);
      return requestAnimationFrame(() =>
        focusTaskInput(taskList, Math.max(0, index - 1))
      );
    }

    // Reorders run through an async state update, so the rows haven't swapped
    // yet. Focus the moved task after the re-render commits, otherwise we'd
    // focus the row currently sitting at the destination (the other task),
    // which then carries focus to the wrong place once the DOM reorders.
    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      if (isFirstTask) {
        return;
      }
      moveTaskUp(index);
      return requestAnimationFrame(() => focusTaskInput(taskList, index - 1));
    }

    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      if (isLastTask) {
        return;
      }
      moveTaskDown(index);
      return requestAnimationFrame(() => focusTaskInput(taskList, index + 1));
    }

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      return onDone(index);
    }

    // The tag sits directly above the list, so the first row steps up into it.
    if (event.key === "ArrowUp" && !event.altKey) {
      event.preventDefault();
      if (isFirstTask) {
        if (tagRef.current) {
          return focusTag();
        }
        return focusTaskInput(taskList, taskCount - 1);
      }
      return focusTaskInput(taskList, index - 1);
    }

    // Shift+Enter always lands on a fresh (empty) row above the current one.
    if (event.key === "Enter" && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      const previousTask = tasks[index - 1];

      if (!isFirstTask && previousTask.text.trim() === "") {
        return focusTaskInput(taskList, index - 1);
      }

      insertTaskRowAbove(index);
      return requestAnimationFrame(() => focusTaskInput(taskList, index));
    }

    // Stepping down past the last row wraps up to the tag, closing the loop.
    if (event.key === "ArrowDown" && !event.altKey) {
      event.preventDefault();
      if (isLastTask) {
        if (tagRef.current) {
          return focusTag();
        }
        return focusTaskInput(taskList, 0);
      }
      return focusTaskInput(taskList, index + 1);
    }

    // Plain Enter always lands on a fresh (empty) row below the current one.
    if (event.key === "Enter" && !event.ctrlKey) {
      event.preventDefault();
      const nextTask = tasks[index + 1];

      if (!isLastTask && nextTask.text.trim() === "") {
        return focusTaskInput(taskList, index + 1);
      }

      if (isLastTask) {
        addTaskRow();
      } else {
        insertTaskRowBelow(index);
      }
      return requestAnimationFrame(() => focusTaskInput(taskList, index + 1));
    }
  };

  const onTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const taskList = taskListRef.current;

    // Down / Enter drop into the first row; Enter "submits" the tag by moving
    // focus into the list whether or not the first row already has text.
    if (
      (event.key === "ArrowDown" && !event.altKey) ||
      (event.key === "Enter" && !event.ctrlKey && !event.metaKey)
    ) {
      event.preventDefault();
      return focusTaskInput(taskList, 0);
    }

    // Up from the tag wraps to the last row, closing the tag → list → tag loop.
    if (event.key === "ArrowUp" && !event.altKey) {
      event.preventDefault();
      return focusTaskInput(taskList, tasks.length - 1);
    }
  };

  return { onTaskKeyDown, onTagKeyDown };
}
