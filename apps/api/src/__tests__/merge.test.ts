import { describe, expect, test } from "bun:test";
import { mergeTaskSnapshots } from "../tasks/merge";

describe("mergeTaskSnapshots", () => {
  test("unions task history by id and uses client canvas lists", () => {
    const merged = mergeTaskSnapshots(
      {
        canvasLists: [{ id: "server", tag: "", x: 0, y: 0, tasks: ["a"] }],
        taskHistory: [
          {
            id: "done-1",
            text: "server",
            completedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        version: 3,
      },
      {
        canvasLists: [{ id: "client", tag: "", x: 1, y: 1, tasks: ["b"] }],
        taskHistory: [
          {
            id: "done-2",
            text: "client",
            completedAt: "2026-01-02T00:00:00.000Z",
          },
          {
            id: "done-1",
            text: "server edited",
            completedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }
    );

    expect(merged.canvasLists[0]?.id).toBe("client");
    expect(merged.taskHistory.map((entry) => entry.id)).toEqual([
      "done-2",
      "done-1",
    ]);
    expect(
      merged.taskHistory.find((entry) => entry.id === "done-1")?.text
    ).toBe("server edited");
  });
});
