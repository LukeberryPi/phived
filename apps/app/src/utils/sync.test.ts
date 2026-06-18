import { describe, expect, test } from "bun:test";
import type { TaskHistory } from "src/types/taskHistory";
import type { TasksGetResponse } from "src/lib/syncApi";
import {
  reconcileWithServer,
  resolveAdoption,
  unionTaskHistory,
  type SyncDocument,
} from "src/utils/sync";

function history(...ids: string[]): TaskHistory {
  return ids.map((id) => ({
    id,
    text: `task ${id}`,
    completedAt: `2026-01-${id.padStart(2, "0")}T00:00:00.000Z`,
  }));
}

const localDoc: SyncDocument = {
  canvasLists: [{ id: "local", tag: "", x: 0, y: 0, tasks: [""] }],
  taskHistory: history("01", "02"),
};

describe("unionTaskHistory", () => {
  test("unions by id and orders newest first", () => {
    const merged = unionTaskHistory(history("01"), history("03"));
    expect(merged.map((e) => e.id)).toEqual(["03", "01"]);
  });
});

describe("reconcileWithServer", () => {
  test("server canvas wins and history is unioned", () => {
    const server: SyncDocument = {
      canvasLists: [{ id: "server", tag: "", x: 0, y: 0, tasks: [""] }],
      taskHistory: history("02", "03"),
    };
    const result = reconcileWithServer(localDoc, server);
    expect(result.canvasLists).toEqual(server.canvasLists);
    expect(result.taskHistory.map((e) => e.id).sort()).toEqual([
      "01",
      "02",
      "03",
    ]);
  });
});

describe("resolveAdoption", () => {
  test("first upgrade (no server doc) seeds local unchanged and pushes", () => {
    const server: TasksGetResponse = { version: 0, document: null };
    const result = resolveAdoption(localDoc, server);
    expect(result.branch).toBe("seed");
    expect(result.next).toEqual(localDoc);
    expect(result.shouldPush).toBe(true);
    expect(result.baseVersion).toBe(0);
  });

  test("existing server doc is authoritative; canvas adopts server", () => {
    const server: TasksGetResponse = {
      version: 4,
      document: {
        canvasLists: [{ id: "server", tag: "", x: 0, y: 0, tasks: [""] }],
        taskHistory: history("02"),
      },
    };
    const result = resolveAdoption(localDoc, server);
    expect(result.branch).toBe("adopt-server");
    expect(result.next.canvasLists).toEqual(server.document!.canvasLists);
    expect(result.baseVersion).toBe(4);
    // Local had history 01 that the server lacked, so a push is required.
    expect(result.next.taskHistory.map((e) => e.id).sort()).toEqual([
      "01",
      "02",
    ]);
    expect(result.shouldPush).toBe(true);
  });

  test("no push when server history already covers local", () => {
    const server: TasksGetResponse = {
      version: 2,
      document: {
        canvasLists: [],
        taskHistory: history("01", "02"),
      },
    };
    const result = resolveAdoption(localDoc, server);
    expect(result.shouldPush).toBe(false);
  });
});
