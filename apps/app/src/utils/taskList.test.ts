/// <reference types="bun" />

import { describe, expect, test } from "bun:test";
import {
  MIN_TASK_ROWS,
  addEmptyTaskRow,
  changeTaskAt,
  createEmptyTasks,
  insertEmptyTaskRowAbove,
  insertEmptyTaskRowBelow,
  removeEmptyExtraRow,
  removeTaskRow,
  reorderTaskRows,
  restoreTaskText,
  withTrailingEmptyRow,
} from "src/utils/taskList";
import type { Task } from "src/types/canvas";

const task = (text: string): Task => ({ id: crypto.randomUUID(), text });
const tasks = (...values: string[]): Task[] => values.map(task);
const texts = (list: Task[]): string[] => list.map((item) => item.text);

describe("task list utilities", () => {
  test("creates exactly the minimum number of empty rows with unique ids", () => {
    const empties = createEmptyTasks();

    expect(empties).toHaveLength(MIN_TASK_ROWS);
    expect(texts(empties)).toEqual(Array(MIN_TASK_ROWS).fill(""));
    expect(new Set(empties.map((item) => item.id)).size).toBe(MIN_TASK_ROWS);
  });

  test("pads short task arrays to the minimum row count", () => {
    expect(texts(withTrailingEmptyRow(tasks("first", "second")))).toEqual([
      "first",
      "second",
      "",
      "",
      "",
    ]);
  });

  test("appends one row when the final row is populated", () => {
    expect(
      texts(withTrailingEmptyRow(tasks("one", "two", "three", "four", "five")))
    ).toEqual(["one", "two", "three", "four", "five", ""]);
  });

  test("does not append when the final row is already empty", () => {
    expect(
      texts(withTrailingEmptyRow(tasks("one", "two", "three", "four", "")))
    ).toEqual(["one", "two", "three", "four", ""]);
  });

  test("removes the requested row while retaining minimum padding", () => {
    expect(
      texts(removeTaskRow(tasks("one", "two", "three", "four", "five"), 1))
    ).toEqual(["one", "three", "four", "five", ""]);
  });

  test("changes one task without changing the row count or identity", () => {
    const original = tasks("one", "");
    const result = changeTaskAt(original, 1, "two");

    expect(texts(result)).toEqual(["one", "two"]);
    // Identity is preserved: the edited row keeps its id, and untouched rows
    // keep their object reference.
    expect(result[1].id).toBe(original[1].id);
    expect(result[0]).toBe(original[0]);
  });

  test("adds exactly one explicit empty row", () => {
    expect(texts(addEmptyTaskRow(tasks("one")))).toEqual(["one", ""]);
  });

  test("inserts an empty row directly below the given index", () => {
    const original = tasks("one", "two", "three");

    expect(texts(insertEmptyTaskRowBelow(original, 0))).toEqual([
      "one",
      "",
      "two",
      "three",
    ]);
    expect(texts(insertEmptyTaskRowBelow(original, 2))).toEqual([
      "one",
      "two",
      "three",
      "",
    ]);
    expect(insertEmptyTaskRowBelow(original, 3)).toBe(original);
    expect(insertEmptyTaskRowBelow(original, -1)).toBe(original);
  });

  test("inserts an empty row directly above the given index", () => {
    const original = tasks("one", "two", "three");

    expect(texts(insertEmptyTaskRowAbove(original, 0))).toEqual([
      "",
      "one",
      "two",
      "three",
    ]);
    expect(texts(insertEmptyTaskRowAbove(original, 2))).toEqual([
      "one",
      "two",
      "",
      "three",
    ]);
    expect(insertEmptyTaskRowAbove(original, 3)).toBe(original);
    expect(insertEmptyTaskRowAbove(original, -1)).toBe(original);
  });

  test("only removes empty rows beyond the minimum", () => {
    const original = tasks("one", "two", "three", "four", "five", "");

    expect(texts(removeEmptyExtraRow(original, 5))).toEqual([
      "one",
      "two",
      "three",
      "four",
      "five",
    ]);
    expect(removeEmptyExtraRow(original, 4)).toBe(original);

    const atMinimum = original.slice(0, 5);
    expect(removeEmptyExtraRow(atMinimum, 4)).toBe(atMinimum);
  });

  test("reorders rows, preserves identity, and keeps the original for invalid moves", () => {
    const original = tasks("one", "two", "three");
    const reordered = reorderTaskRows(original, 0, 2);

    expect(texts(reordered)).toEqual(["two", "three", "one"]);
    // The moved row keeps its identity (the same object rides along).
    expect(reordered[2].id).toBe(original[0].id);
    expect(reorderTaskRows(original, 0, 3)).toBe(original);
  });

  test("restores into the first empty row and keeps a trailing empty row", () => {
    expect(texts(restoreTaskText(tasks("one", "", "", "", ""), "two"))).toEqual(
      ["one", "two", "", "", ""]
    );
    expect(
      texts(
        restoreTaskText(tasks("one", "two", "three", "four", "five"), "six")
      )
    ).toEqual(["one", "two", "three", "four", "five", "six", ""]);
  });
});
