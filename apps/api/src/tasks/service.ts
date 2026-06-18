import type { Kysely } from "kysely";
import type { Database } from "../db/schema";
import { decideTaskAdoption } from "./adoption";
import { decryptTaskSnapshot, encryptTaskSnapshot } from "./crypto";
import type { TaskSnapshot, VersionedTaskSnapshot } from "./types";

export type PutTasksResult =
  | { ok: true; snapshot: VersionedTaskSnapshot; adopted: "seed" | "merge" }
  | { ok: false; status: 409; snapshot: VersionedTaskSnapshot };

export async function getTaskDocument(
  db: Kysely<Database>,
  key: Buffer,
  userId: string
): Promise<VersionedTaskSnapshot | null> {
  const row = await db
    .selectFrom("task_document")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirst();

  if (!row) {
    return null;
  }

  return {
    ...decryptTaskSnapshot(
      {
        ciphertext: row.ciphertext,
        iv: row.iv,
        authTag: row.authTag,
        keyVersion: row.keyVersion,
      },
      key
    ),
    version: row.version,
  };
}

export async function putTaskDocument(
  db: Kysely<Database>,
  key: Buffer,
  userId: string,
  clientSnapshot: TaskSnapshot,
  baseVersion: number | null
): Promise<PutTasksResult> {
  return await db.transaction().execute(async (trx) => {
    const row = await trx
      .selectFrom("task_document")
      .selectAll()
      .where("userId", "=", userId)
      .forUpdate()
      .executeTakeFirst();

    if (!row) {
      const decision = decideTaskAdoption(null, clientSnapshot, baseVersion);
      const encrypted = encryptTaskSnapshot(decision.snapshot, key);

      await trx
        .insertInto("task_document")
        .values({
          userId,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          keyVersion: encrypted.keyVersion,
          version: decision.snapshot.version,
          updatedAt: new Date(),
        })
        .execute();

      return {
        ok: true,
        adopted: "seed",
        snapshot: decision.snapshot,
      };
    }

    const serverSnapshot: VersionedTaskSnapshot = {
      ...decryptTaskSnapshot(
        {
          ciphertext: row.ciphertext,
          iv: row.iv,
          authTag: row.authTag,
          keyVersion: row.keyVersion,
        },
        key
      ),
      version: row.version,
    };

    const decision = decideTaskAdoption(
      serverSnapshot,
      clientSnapshot,
      baseVersion
    );

    if (decision.kind === "stale") {
      return { ok: false, status: 409, snapshot: decision.snapshot };
    }

    const encrypted = encryptTaskSnapshot(decision.snapshot, key);

    await trx
      .updateTable("task_document")
      .set({
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: encrypted.keyVersion,
        version: decision.snapshot.version,
        updatedAt: new Date(),
      })
      .where("userId", "=", userId)
      .execute();

    return {
      ok: true,
      adopted: "merge",
      snapshot: decision.snapshot,
    };
  });
}
