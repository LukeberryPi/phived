import { describe, expect, test } from "bun:test";
import { decideTaskAdoption } from "../tasks/adoption";

const client = {
  canvasLists: [{ id: "local", tag: "", x: 0, y: 0, tasks: ["local"] }],
  taskHistory: [
    {
      id: "history-local",
      text: "local",
      completedAt: "2026-06-17T00:00:00.000Z",
    },
  ],
};

describe("decideTaskAdoption", () => {
  test("first upgrade seeds the server with the local snapshot", () => {
    const decision = decideTaskAdoption(null, client, null);

    expect(decision.kind).toBe("seed");
    expect(decision.snapshot.canvasLists[0]?.id).toBe("local");
    expect(decision.snapshot.version).toBe(1);
  });

  test("existing server document wins on stale base version", () => {
    const server = {
      canvasLists: [{ id: "server", tag: "", x: 1, y: 1, tasks: ["server"] }],
      taskHistory: [],
      version: 4,
    };
    const decision = decideTaskAdoption(server, client, 3);

    expect(decision.kind).toBe("stale");
    expect(decision.snapshot.canvasLists[0]?.id).toBe("server");
  });

  test("matching base version merges and advances the version", () => {
    const decision = decideTaskAdoption(
      {
        canvasLists: [{ id: "server", tag: "", x: 1, y: 1, tasks: ["server"] }],
        taskHistory: [
          {
            id: "history-server",
            text: "server",
            completedAt: "2026-06-16T00:00:00.000Z",
          },
        ],
        version: 4,
      },
      client,
      4
    );

    expect(decision.kind).toBe("merge");
    expect(decision.snapshot.canvasLists[0]?.id).toBe("local");
    expect(decision.snapshot.taskHistory.map((entry) => entry.id)).toContain(
      "history-server"
    );
    expect(decision.snapshot.version).toBe(5);
  });
});
