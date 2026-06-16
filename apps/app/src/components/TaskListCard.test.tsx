/// <reference types="bun" />

import { afterEach, describe, expect, mock, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TaskListCard } from "src/components/TaskListCard";
import type { TaskListActions } from "src/contexts/CanvasTasksContext/CanvasTasksContext.types";
import type { TaskList } from "src/types/canvas";

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
  tasks: ["one", "", "", "", ""],
};

let root: Root | null = null;
let container: HTMLElement | null = null;

function renderCard({
  dimmed,
  actions,
}: {
  dimmed: boolean;
  actions: TaskListActions;
}) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root!.render(
      <TaskListCard
        list={list}
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
