/// <reference types="bun" />

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, useMemo, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TaskListCard } from "src/components/TaskListCard";
import type { TaskListActions } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";
import type { Task, TaskList } from "src/types/canvas";
import { LIST_WIDTH } from "src/utils/canvas";
import { createTask, reorderTaskRows } from "src/utils/taskList";

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

/**
 * Renders a real, stateful list so Alt+Arrow reordering actually mutates the
 * task order and re-renders, the way the provider does in the app. The mocked
 * actions used elsewhere can't surface the focus regression because they never
 * reorder, so focus would always appear to "stay put".
 */
function ReorderHarness({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const actions = useMemo<TaskListActions>(
    () => ({
      ...createActions(),
      moveTaskUp: (_listId: string, index: number) =>
        setTasks((prev) => reorderTaskRows(prev, index, index - 1)),
      moveTaskDown: (_listId: string, index: number) =>
        setTasks((prev) => reorderTaskRows(prev, index, index + 1)),
    }),
    []
  );

  return (
    <TaskListCard
      list={{ ...list, tasks }}
      stackIndex={0}
      zoomRef={{ current: 1 }}
      autoFocusFirstRow={false}
      focused={false}
      dimmed={false}
      canDeleteList
      onToggleFocus={() => {}}
      actions={actions}
    />
  );
}

function renderReorderHarness(initialTasks: Task[]) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root!.render(<ReorderHarness initialTasks={initialTasks} />);
  });

  return container.querySelector("section")!;
}

function getRowInputs(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLInputElement>("ul input"));
}

function getRowValues(section: HTMLElement) {
  return getRowInputs(section).map((input) => input.value);
}

function activeInputValue() {
  return (document.activeElement as HTMLInputElement | null)?.value;
}

/**
 * Regression contract for Alt+Arrow reordering: the moved row must keep focus
 * after the reorder commits, so the user can press the shortcut repeatedly to
 * walk a task up or down. The bug focused the displaced row instead, which
 * (because rows reuse DOM nodes via stable keys) carried focus to the wrong
 * task and made every second press swap it straight back.
 */
describe("TaskListCard Alt+Arrow reordering", () => {
  // Focus is restored inside requestAnimationFrame so it runs after the reorder
  // renders. Capture the callbacks and flush them only once the DOM has
  // updated, mirroring the browser's "after the commit" timing.
  let pendingFrames: FrameRequestCallback[] = [];
  let originalRequestAnimationFrame: typeof requestAnimationFrame;

  beforeEach(() => {
    pendingFrames = [];
    originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      pendingFrames.push(callback);
      return pendingFrames.length;
    }) as typeof requestAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });

  function pressAltArrow(key: "ArrowUp" | "ArrowDown") {
    act(() => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent("keydown", {
          key,
          altKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
    });

    // The reorder has now committed; run the queued focus callback against the
    // updated DOM, just as the next animation frame would in the browser.
    const frames = pendingFrames;
    pendingFrames = [];
    act(() => {
      frames.forEach((frame) => frame(0));
    });
  }

  test("keeps focus on a task moved up so it can move more than once", () => {
    const section = renderReorderHarness([
      createTask("alpha"),
      createTask("bravo"),
      createTask("charlie"),
      createTask("delta"),
      createTask("echo"),
    ]);

    const charlie = getRowInputs(section).find(
      (input) => input.value === "charlie"
    )!;
    act(() => charlie.focus());

    pressAltArrow("ArrowUp");
    expect(getRowValues(section)).toEqual([
      "alpha",
      "charlie",
      "bravo",
      "delta",
      "echo",
    ]);
    expect(activeInputValue()).toBe("charlie");

    pressAltArrow("ArrowUp");
    expect(getRowValues(section)).toEqual([
      "charlie",
      "alpha",
      "bravo",
      "delta",
      "echo",
    ]);
    expect(activeInputValue()).toBe("charlie");
  });

  test("keeps focus on a task moved down so it can move more than once", () => {
    const section = renderReorderHarness([
      createTask("alpha"),
      createTask("bravo"),
      createTask("charlie"),
      createTask("delta"),
      createTask("echo"),
    ]);

    const alpha = getRowInputs(section).find(
      (input) => input.value === "alpha"
    )!;
    act(() => alpha.focus());

    pressAltArrow("ArrowDown");
    expect(getRowValues(section)).toEqual([
      "bravo",
      "alpha",
      "charlie",
      "delta",
      "echo",
    ]);
    expect(activeInputValue()).toBe("alpha");

    pressAltArrow("ArrowDown");
    expect(getRowValues(section)).toEqual([
      "bravo",
      "charlie",
      "alpha",
      "delta",
      "echo",
    ]);
    expect(activeInputValue()).toBe("alpha");
  });
});
