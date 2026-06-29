/// <reference types="bun" />

import { afterEach, describe, expect, mock, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TaskListCard } from "src/components/TaskListCard";
import type { TaskListActions } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";
import type { TaskList } from "src/types/canvas";
import { LIST_WIDTH } from "src/utils/canvas";
import { createTask } from "src/utils/taskList";

function createActions(): TaskListActions {
  return {
    bringListToFront: mock(),
    moveList: mock(),
    resizeList: mock(),
    requestDeleteList: mock(),
    setListTag: mock(),
    changeTask: mock(),
    addTaskRow: mock(),
    insertTaskRowBelow: mock(),
    insertTaskRowAbove: mock(),
    removeEmptyTaskRow: mock(),
    completeTask: mock(),
    reorderTask: mock(),
    moveTaskUp: mock(),
    moveTaskDown: mock(),
  };
}

const list: TaskList = {
  id: "list-1",
  tag: "work",
  x: 100,
  y: 100,
  tasks: [
    createTask("one"),
    createTask(),
    createTask(),
    createTask(),
    createTask(),
  ],
};

let root: Root | null = null;
let container: HTMLElement | null = null;

function renderCard({
  dimmed,
  actions,
  taskList = list,
}: {
  dimmed: boolean;
  actions: TaskListActions;
  taskList?: TaskList;
}) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root!.render(
      <TaskListCard
        list={taskList}
        stackIndex={0}
        zoomRef={{ current: 1 }}
        autoFocusFirstRow={false}
        focused={false}
        dimmed={dimmed}
        canDeleteList
        onToggleFocus={() => {}}
        actions={actions}
      />
    );
  });

  return container.querySelector("section")!;
}

function getFirstTaskInput(section: HTMLElement) {
  return section.querySelector<HTMLInputElement>('input[aria-label="Task 1"]')!;
}

function setInputWidthMetrics(
  input: HTMLInputElement,
  {
    scrollWidth,
    clientWidth,
  }: {
    scrollWidth: number;
    clientWidth: number;
  }
) {
  Object.defineProperty(input, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(input, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
}

function changeInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;

  act(() => {
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

/**
 * Regression contract for focus mode: while another list is focused, dimmed
 * lists must be completely non-interactive, and their pointer interactions
 * must be swallowed rather than passing through to the canvas (which would
 * pan or spawn a new list "through" the card).
 */
describe("TaskListCard dimmed state", () => {
  test("renders an interaction-swallowing overlay inside the canvas item", () => {
    const section = renderCard({ dimmed: true, actions: createActions() });

    const overlay = section.querySelector(':scope > [aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    // Canvas pan/double-click handlers ignore events originating inside
    // [data-canvas-item]; the overlay must live inside it to swallow them.
    expect(overlay!.closest("[data-canvas-item]")).toBe(section);
    // The overlay must not be inert, or hit-testing would skip it.
    expect(overlay!.closest("[inert]")).toBeNull();
  });

  test("marks all interactive content inert", () => {
    const section = renderCard({ dimmed: true, actions: createActions() });

    for (const element of section.querySelectorAll("input, button")) {
      expect(element.closest("[inert]")).not.toBeNull();
    }
  });

  test("does not bring the list to the front on pointerdown", () => {
    const actions = createActions();
    const section = renderCard({ dimmed: true, actions });

    act(() => {
      section.dispatchEvent(
        new window.PointerEvent("pointerdown", { bubbles: true })
      );
    });

    expect(actions.bringListToFront).not.toHaveBeenCalled();
  });
});

describe("TaskListCard active state", () => {
  test("has no overlay and no inert content", () => {
    const section = renderCard({ dimmed: false, actions: createActions() });

    expect(section.querySelector(':scope > [aria-hidden="true"]')).toBeNull();
    expect(section.querySelector("[inert]")).toBeNull();
  });

  test("brings the list to the front on pointerdown", () => {
    const actions = createActions();
    const section = renderCard({ dimmed: false, actions });

    act(() => {
      section.dispatchEvent(
        new window.PointerEvent("pointerdown", { bubbles: true })
      );
    });

    expect(actions.bringListToFront).toHaveBeenCalledWith("list-1");
  });
});

describe("TaskListCard auto width", () => {
  test("does not resize when row controls shrink the input but text fits the list", () => {
    const actions = createActions();
    const section = renderCard({ dimmed: false, actions });
    const input = getFirstTaskInput(section);

    setInputWidthMetrics(input, {
      scrollWidth: LIST_WIDTH - 20,
      clientWidth: LIST_WIDTH - 120,
    });
    changeInputValue(input, "do tasksssssssss");

    expect(actions.changeTask).toHaveBeenCalledWith(
      "list-1",
      0,
      "do tasksssssssss"
    );
    expect(actions.resizeList).not.toHaveBeenCalled();
  });

  test("resizes when the task text exceeds the list width", () => {
    const actions = createActions();
    const section = renderCard({ dimmed: false, actions });
    const input = getFirstTaskInput(section);

    setInputWidthMetrics(input, {
      scrollWidth: LIST_WIDTH + 10,
      clientWidth: LIST_WIDTH - 120,
    });
    changeInputValue(input, "do taskssssssssssssssssssssssss");

    expect(actions.resizeList).toHaveBeenCalledWith("list-1", LIST_WIDTH + 12);
  });
});
