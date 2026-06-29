/// <reference types="bun" />

import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useLocalStorage } from "src/hooks/useLocalStorage";
import type { TaskLists } from "src/types/canvas";
import { parseTaskLists } from "src/utils/persistence";
import { createTask } from "src/utils/taskList";

const fallbackLists: TaskLists = [
  {
    id: "default",
    tag: "",
    x: 100,
    y: 200,
    tasks: [
      createTask(),
      createTask(),
      createTask(),
      createTask(),
      createTask(),
    ],
  },
];

let root: Root | null = null;
let container: HTMLElement | null = null;

function CanvasListsProbe() {
  const [lists] = useLocalStorage<TaskLists>(
    "canvasLists",
    fallbackLists,
    parseTaskLists,
    { persistParsedValue: true }
  );

  return <output>{JSON.stringify(lists)}</output>;
}

function renderProbe() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root!.render(<CanvasListsProbe />);
  });

  return JSON.parse(container.textContent ?? "null") as TaskLists;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  window.localStorage.clear();
});

describe("useLocalStorage", () => {
  test("persists parsed canvas list migrations so generated task ids stay stable", () => {
    window.localStorage.setItem(
      "canvasLists",
      JSON.stringify([{ id: "a", tag: "", x: 10, y: 20, tasks: ["one", ""] }])
    );

    const firstLists = renderProbe();
    const persistedAfterMigration = JSON.parse(
      window.localStorage.getItem("canvasLists") ?? "null"
    ) as TaskLists;
    const migratedIds = persistedAfterMigration[0].tasks.map((item) => item.id);

    expect(firstLists[0].tasks.map((item) => item.text)).toEqual([
      "one",
      "",
      "",
      "",
      "",
    ]);
    expect(persistedAfterMigration[0].tasks[0]).toEqual({
      id: migratedIds[0],
      text: "one",
    });
    expect(new Set(migratedIds).size).toBe(migratedIds.length);

    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;

    const secondLists = renderProbe();

    expect(secondLists[0].tasks.map((item) => item.id)).toEqual(migratedIds);
  });
});
