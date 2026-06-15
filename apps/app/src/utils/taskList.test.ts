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

describe("task list utilities", () => {
  test("creates exactly the minimum number of empty rows", () => {
    expect(createEmptyTasks()).toEqual(Array(MIN_TASK_ROWS).fill(""));
  });

  test("pads short task arrays to the minimum row count", () => {
    expect(withTrailingEmptyRow(["first", "second"])).toEqual([
      "first",
      "second",
      "",
      "",
      "",
    ]);
  });

  test("appends one row when the final row is populated", () => {
    expect(
      withTrailingEmptyRow(["one", "two", "three", "four", "five"])
    ).toEqual(["one", "two", "three", "four", "five", ""]);
  });

  test("does not append when the final row is already empty", () => {
    expect(withTrailingEmptyRow(["one", "two", "three", "four", ""])).toEqual([
      "one",
      "two",
      "three",
      "four",
      "",
    ]);
  });

  test("removes the requested row while retaining minimum padding", () => {
    expect(removeTaskRow(["one", "two", "three", "four", "five"], 1)).toEqual([
      "one",
      "three",
      "four",
      "five",
      "",
    ]);
  });

  test("changes one task without changing the row count", () => {
    expect(changeTaskAt(["one", ""], 1, "two")).toEqual(["one", "two"]);
  });

  test("adds exactly one explicit empty row", () => {
    expect(addEmptyTaskRow(["one"])).toEqual(["one", ""]);
  });

  test("inserts an empty row directly below the given index", () => {
    const tasks = ["one", "two", "three"];

    expect(insertEmptyTaskRowBelow(tasks, 0)).toEqual([
      "one",
      "",
      "two",
      "three",
    ]);
    expect(insertEmptyTaskRowBelow(tasks, 2)).toEqual([
      "one",
      "two",
      "three",
      "",
    ]);
    expect(insertEmptyTaskRowBelow(tasks, 3)).toBe(tasks);
    expect(insertEmptyTaskRowBelow(tasks, -1)).toBe(tasks);
  });

  test("inserts an empty row directly above the given index", () => {
    const tasks = ["one", "two", "three"];

    expect(insertEmptyTaskRowAbove(tasks, 0)).toEqual([
      "",
      "one",
      "two",
      "three",
    ]);
    expect(insertEmptyTaskRowAbove(tasks, 2)).toEqual([
      "one",
      "two",
      "",
      "three",
    ]);
    expect(insertEmptyTaskRowAbove(tasks, 3)).toBe(tasks);
    expect(insertEmptyTaskRowAbove(tasks, -1)).toBe(tasks);
  });

  test("only removes empty rows beyond the minimum", () => {
    const tasks = ["one", "two", "three", "four", "five", ""];

    expect(removeEmptyExtraRow(tasks, 5)).toEqual([
      "one",
      "two",
      "three",
      "four",
      "five",
    ]);
    expect(removeEmptyExtraRow(tasks, 4)).toBe(tasks);
    expect(removeEmptyExtraRow(tasks.slice(0, 5), 4)).toEqual(
      tasks.slice(0, 5)
    );
  });

  test("reorders valid rows and preserves the original for invalid moves", () => {
    const tasks = ["one", "two", "three"];

    expect(reorderTaskRows(tasks, 0, 2)).toEqual(["two", "three", "one"]);
    expect(reorderTaskRows(tasks, 0, 3)).toBe(tasks);
  });

  test("restores into the first empty row and keeps a trailing empty row", () => {
    expect(restoreTaskText(["one", "", "", "", ""], "two")).toEqual([
      "one",
      "two",
      "",
      "",
      "",
    ]);
    expect(
      restoreTaskText(["one", "two", "three", "four", "five"], "six")
    ).toEqual(["one", "two", "three", "four", "five", "six", ""]);
  });
});
