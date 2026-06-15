/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import type { TaskLists, Viewport } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import {
  parseTaskHistory,
  parseTaskLists,
  parseViewport,
} from "src/utils/persistence";

const fallbackLists: TaskLists = [
  {
    id: "default",
    tag: "",
    x: 100,
    y: 200,
    tasks: ["", "", "", "", ""],
  },
];

const fallbackHistory: TaskHistory = [];

const fallbackViewport: Viewport = { x: 0, y: 0, zoom: 1 };

describe("parseTaskLists", () => {
  test("returns fallback for non-arrays", () => {
    expect(parseTaskLists(null, fallbackLists)).toBe(fallbackLists);
    expect(parseTaskLists("bad", fallbackLists)).toBe(fallbackLists);
  });

  test("accepts a valid empty array", () => {
    expect(parseTaskLists([], fallbackLists)).toEqual([]);
  });

  test("accepts valid task lists", () => {
    const lists: TaskLists = [
      {
        id: "a",
        tag: "work",
        x: 10,
        y: 20,
        width: 300,
        tasks: ["one", ""],
      },
    ];

    expect(parseTaskLists(lists, fallbackLists)).toEqual(lists);
  });

  test("skips invalid list entries and keeps the valid ones", () => {
    const valid = { id: "a", tag: "", x: 10, y: 20, tasks: ["one", ""] };

    expect(
      parseTaskLists(
        [{ id: "b", tag: "", x: "bad", y: 0, tasks: [] }, valid],
        fallbackLists
      )
    ).toEqual([valid]);
  });

  test("skips entries whose tasks are not strings", () => {
    expect(
      parseTaskLists(
        [{ id: "a", tag: "", x: 0, y: 0, tasks: [1, 2] }],
        fallbackLists
      )
    ).toEqual([]);
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
