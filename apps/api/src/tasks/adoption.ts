import { mergeTaskSnapshots } from "./merge";
import type { TaskSnapshot, VersionedTaskSnapshot } from "./types";

export type AdoptionDecision =
  | {
      kind: "seed";
      snapshot: VersionedTaskSnapshot;
    }
  | {
      kind: "merge";
      snapshot: VersionedTaskSnapshot;
    }
  | {
      kind: "stale";
      snapshot: VersionedTaskSnapshot;
    };

export function decideTaskAdoption(
  server: VersionedTaskSnapshot | null,
  client: TaskSnapshot,
  baseVersion: number | null
): AdoptionDecision {
  if (!server) {
    return {
      kind: "seed",
      snapshot: { ...client, version: 1 },
    };
  }

  if (baseVersion !== server.version) {
    return {
      kind: "stale",
      snapshot: server,
    };
  }

  return {
    kind: "merge",
    snapshot: {
      ...mergeTaskSnapshots(server, client),
      version: server.version + 1,
    },
  };
}
