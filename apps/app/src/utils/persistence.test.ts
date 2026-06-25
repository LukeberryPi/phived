/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import type { Task, TaskLists, Viewport } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import {
  parseTaskHistory,
  parseTaskLists,
  parseViewport,
} from "src/utils/persistence";

const task = (text: string): Task => ({ id: crypto.randomUUID(), text });
const texts = (list: Task[]): string[] => list.map((item) => item.text);

const fallbackLists: TaskLists = [
  {
    id: "default",
    tag: "",
    x: 100,
    y: 200,
    tasks: [task(""), task(""), task(""), task(""), task("")],
  },
];

const fallbackHistory: TaskHistory = [];

const fallbackViewport: Viewport = { x: 0, y: 0, zoom: 1 };

describe("parseTaskLists", () => {
  test("returns fallback for non-arrays", () => {
    expect(parseTaskLists(null, fallbackLists)).toBe(fallbackLists);
    expect(parseTaskLists("bad", fallbackLists)).toBe(fallbackLists);
  });

  test("returns fallback when no valid lists survive", () => {
    expect(parseTaskLists([], fallbackLists)).toBe(fallbackLists);
  });

  test("accepts valid task lists and preserves stored task ids", () => {
    const stored = [task("one"), task("")];
    const lists = [
      { id: "a", tag: "work", x: 10, y: 20, width: 300, tasks: stored },
    ];

    const [parsed, ...rest] = parseTaskLists(lists, fallbackLists);

    expect(rest).toHaveLength(0);
    expect(parsed.id).toBe("a");
    expect(parsed.tag).toBe("work");
    expect(parsed.x).toBe(16);
    expect(parsed.width).toBe(300);
    expect(texts(parsed.tasks)).toEqual(["one", "", "", "", ""]);
    expect(parsed.tasks[0].id).toBe(stored[0].id);
    expect(parsed.tasks[1].id).toBe(stored[1].id);
  });

  test("migrates legacy string tasks into identified tasks", () => {
    const [parsed] = parseTaskLists(
      [{ id: "a", tag: "", x: 10, y: 20, tasks: ["one", ""] }],
      fallbackLists
    );

    expect(texts(parsed.tasks)).toEqual(["one", "", "", "", ""]);
    expect(parsed.tasks.every((item) => typeof item.id === "string")).toBe(
      true
    );
    expect(parsed.tasks.every((item) => item.id.length > 0)).toBe(true);
    expect(new Set(parsed.tasks.map((item) => item.id)).size).toBe(
      parsed.tasks.length
    );
  });

  test("skips invalid list entries and keeps the valid ones", () => {
    const valid = { id: "a", tag: "", x: 10, y: 20, tasks: ["one", ""] };

    const [parsed, ...rest] = parseTaskLists(
      [{ id: "b", tag: "", x: "bad", y: 0, tasks: [] }, valid],
      fallbackLists
    );

    expect(rest).toHaveLength(0);
    expect(parsed.id).toBe("a");
    expect(parsed.x).toBe(16);
    expect(texts(parsed.tasks)).toEqual(["one", "", "", "", ""]);
  });

  test("skips entries whose tasks are neither strings nor task objects", () => {
    expect(
      parseTaskLists(
        [{ id: "a", tag: "", x: 0, y: 0, tasks: [1, 2] }],
        fallbackLists
      )
    ).toBe(fallbackLists);
  });

  test("normalizes stored list position, width, and task rows", () => {
    const [list] = parseTaskLists(
      [
        {
          id: "a",
          tag: "",
          x: 999999,
          y: -999999,
          width: 999999,
          tasks: ["one"],
        },
      ],
      fallbackLists
    );

    expect(list.x).toBeLessThan(999999);
    expect(list.y).toBeGreaterThan(-999999);
    expect(list.width).toBe(960);
    expect(list.tasks.length).toBeGreaterThan(1);
    expect(list.tasks.at(-1)?.text).toBe("");
  });
});

describe("parseTaskHistory", () => {
  test("returns fallback for non-arrays", () => {
    expect(parseTaskHistory({}, fallbackHistory)).toBe(fallbackHistory);
  });

  test("accepts valid history entries", () => {
    const history: TaskHistory = [
      {
        id: "1",
        text: "done",
        completedAt: "2026-01-01T00:00:00.000Z",
        listId: "list-1",
        listTag: "work",
      },
    ];

    expect(parseTaskHistory(history, fallbackHistory)).toEqual(history);
  });

  test("skips invalid entries and keeps the valid ones", () => {
    const valid = {
      id: "2",
      text: "kept",
      completedAt: "2026-02-01T00:00:00.000Z",
    };

    expect(
      parseTaskHistory(
        [{ id: "1", text: 42, completedAt: "2026-01-01T00:00:00.000Z" }, valid],
        fallbackHistory
      )
    ).toEqual([valid]);
  });
});

describe("parseViewport", () => {
  test("returns fallback for invalid shapes", () => {
    expect(parseViewport(null, fallbackViewport)).toBe(fallbackViewport);
    expect(parseViewport({ x: 1, y: 2 }, fallbackViewport)).toBe(
      fallbackViewport
    );
    expect(parseViewport({ x: 1, y: 2, zoom: Infinity }, null)).toBe(null);
  });

  test("accepts valid viewport values", () => {
    expect(parseViewport({ x: 10, y: -20, zoom: 0.5 }, null)).toEqual({
      x: 10,
      y: -20,
      zoom: 0.5,
    });
  });
});
