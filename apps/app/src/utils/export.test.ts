/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import { buildCanvasJson, buildCanvasMarkdown } from "src/utils/export";
import type { Task, TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";

const task = (text: string): Task => ({ id: crypto.randomUUID(), text });

const lists: TaskLists = [
  {
    id: "list-1",
    tag: "work",
    x: 0,
    y: 0,
    tasks: [task("ship it"), task(""), task("")],
  },
  {
    id: "list-2",
    tag: "",
    x: 10,
    y: 20,
    width: 320,
    tasks: [task(""), task("")],
  },
];

const taskHistory: TaskHistory = [
  {
    id: "entry-1",
    text: "buy milk",
    completedAt: new Date(2026, 5, 16, 14, 30).toISOString(),
    listId: "list-1",
    listTag: "work",
  },
  {
    id: "entry-2",
    text: "untagged task",
    completedAt: new Date(2026, 0, 5, 9, 7).toISOString(),
  },
];

const exportedAt = "2026-06-16T13:30:00.000Z";

describe("buildCanvasJson", () => {
  test("produces valid JSON with the expected shape", () => {
    const parsed = JSON.parse(buildCanvasJson(lists, taskHistory, exportedAt));

    expect(parsed).toEqual({ exportedAt, lists, taskHistory });
  });

  test("round-trips data without loss", () => {
    const parsed = JSON.parse(buildCanvasJson(lists, taskHistory, exportedAt));

    expect(parsed.lists).toHaveLength(2);
    expect(parsed.lists[1].width).toBe(320);
    expect(parsed.taskHistory[0].listTag).toBe("work");
    expect(parsed.taskHistory[1].listTag).toBeUndefined();
  });

  test("ends with a trailing newline", () => {
    expect(buildCanvasJson(lists, taskHistory, exportedAt)).toEndWith("}\n");
  });

  test("handles empty lists and history", () => {
    const parsed = JSON.parse(buildCanvasJson([], [], exportedAt));

    expect(parsed).toEqual({ exportedAt, lists: [], taskHistory: [] });
  });
});

describe("buildCanvasMarkdown", () => {
  test("renders headings, tasks, and history with the expected shape", () => {
    const md = buildCanvasMarkdown(lists, taskHistory, exportedAt);

    expect(md).toBe(
      [
        "# phived export",
        "",
        `exported: ${exportedAt}`,
        "",
        "## work",
        "",
        "- [ ] ship it",
        "",
        "## list 2",
        "",
        "- [ ] _empty_",
        "",
        "## history",
        "",
        "- [x] buy milk (work) - 16/06/2026 at 14:30",
        "- [x] untagged task - 05/01/2026 at 09:07",
        "",
      ]
        .join("\n")
        .trimEnd() + "\n"
    );
  });

  test("falls back to placeholders when there is nothing to export", () => {
    const md = buildCanvasMarkdown([], [], exportedAt);

    expect(md).toContain("## canvas\n\n_no lists_");
    expect(md).toContain("## history\n\n_no completed tasks_");
  });

  test("ends with exactly one trailing newline", () => {
    const md = buildCanvasMarkdown(lists, taskHistory, exportedAt);

    expect(md.endsWith("\n")).toBe(true);
    expect(md.endsWith("\n\n")).toBe(false);
  });
});
