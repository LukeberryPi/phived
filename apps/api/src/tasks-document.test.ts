import { describe, expect, test } from "bun:test";
import {
  mergeDocuments,
  parseTaskDocument,
  unionTaskHistory,
  type TaskDocumentBlob,
  type TaskHistoryEntry,
} from "./tasks-document.ts";

function entry(id: string, completedAt: string): TaskHistoryEntry {
  return { id, text: `task ${id}`, completedAt };
}

describe("parseTaskDocument", () => {
  test("accepts a well-formed blob", () => {
    const doc = {
      canvasLists: [{ id: "a", tag: "", x: 0, y: 0, tasks: [""] }],
      taskHistory: [entry("1", "2026-01-01T00:00:00.000Z")],
    };
    expect(parseTaskDocument(doc)).not.toBeNull();
  });

  test("rejects non-array fields and malformed history", () => {
    expect(parseTaskDocument(null)).toBeNull();
    expect(parseTaskDocument({ canvasLists: {}, taskHistory: [] })).toBeNull();
    expect(
      parseTaskDocument({ canvasLists: [], taskHistory: [{ id: 1 }] })
    ).toBeNull();
  });
});

describe("unionTaskHistory", () => {
  test("unions by id so no completed task is lost", () => {
    const a = [entry("1", "2026-01-01T00:00:00.000Z")];
    const b = [entry("2", "2026-01-02T00:00:00.000Z")];
    const merged = unionTaskHistory(a, b);
    expect(merged.map((e) => e.id).sort()).toEqual(["1", "2"]);
  });

  test("dedupes overlapping ids and orders newest first", () => {
    const a = [
      entry("1", "2026-01-01T00:00:00.000Z"),
      entry("2", "2026-01-03T00:00:00.000Z"),
    ];
    const b = [entry("1", "2026-01-01T00:00:00.000Z")];
    const merged = unionTaskHistory(a, b);
    expect(merged.map((e) => e.id)).toEqual(["2", "1"]);
  });
});

describe("mergeDocuments", () => {
  const stored: TaskDocumentBlob = {
    canvasLists: [{ id: "old" }],
    taskHistory: [entry("1", "2026-01-01T00:00:00.000Z")],
  };
  const incoming: TaskDocumentBlob = {
    canvasLists: [{ id: "new" }],
    taskHistory: [entry("2", "2026-01-02T00:00:00.000Z")],
  };

  test("canvas is last-write-wins (incoming replaces stored)", () => {
    const merged = mergeDocuments(stored, incoming);
    expect(merged.canvasLists).toEqual([{ id: "new" }]);
  });

  test("history is unioned across stored and incoming", () => {
    const merged = mergeDocuments(stored, incoming);
    expect(merged.taskHistory.map((e) => e.id).sort()).toEqual(["1", "2"]);
  });

  test("returns incoming verbatim when there is no stored document", () => {
    expect(mergeDocuments(null, incoming)).toEqual(incoming);
  });
});
