// The encrypted task-sync API (ADR 0004), guarded by requireActiveEntitlement.
// GET returns the current document and version; PUT is optimistic-concurrency
// controlled by a version counter (409 on a stale baseVersion) and merges the
// incoming write against the stored document before re-encrypting. The body is
// capped at ~1MB (413).
import { Hono } from "hono";
import { decrypt, encrypt } from "../crypto.ts";
import { getDb } from "../db/client.ts";
import type { ApiVariables } from "../entitlement.ts";
import { requireActiveEntitlement } from "../entitlement.ts";
import {
  mergeDocuments,
  parseTaskDocument,
  type TaskDocumentBlob,
} from "../tasks-document.ts";

const MAX_BODY_BYTES = 1_000_000;

export const tasksRoutes = new Hono<{ Variables: ApiVariables }>();

tasksRoutes.use("*", requireActiveEntitlement);

export async function hasTaskDocument(userId: string): Promise<boolean> {
  const row = await getDb()
    .selectFrom("task_document")
    .select("userId")
    .where("userId", "=", userId)
    .executeTakeFirst();
  return Boolean(row);
}

async function loadDocument(
  userId: string
): Promise<{ version: number; blob: TaskDocumentBlob } | null> {
  const row = await getDb()
    .selectFrom("task_document")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirst();
  if (!row) {
    return null;
  }
  const plaintext = decrypt({
    ciphertext: Buffer.from(row.ciphertext),
    iv: Buffer.from(row.iv),
    authTag: Buffer.from(row.authTag),
    keyVersion: row.keyVersion,
  });
  return {
    version: row.version,
    blob: JSON.parse(plaintext) as TaskDocumentBlob,
  };
}

tasksRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const current = await loadDocument(userId);
  if (!current) {
    return c.json({ version: 0, document: null });
  }
  return c.json({
    version: current.version,
    document: current.blob,
  });
});

tasksRoutes.put("/", async (c) => {
  const userId = c.get("userId");

  const rawBody = await c.req.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return c.json({ error: "payload_too_large" }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  const body = parsed as { baseVersion?: unknown } & Record<string, unknown>;
  const baseVersion =
    typeof body.baseVersion === "number" ? body.baseVersion : null;
  if (baseVersion === null || baseVersion < 0) {
    return c.json({ error: "missing_base_version" }, 400);
  }

  const incoming = parseTaskDocument(body);
  if (!incoming) {
    return c.json({ error: "invalid_document" }, 422);
  }

  const current = await loadDocument(userId);
  const currentVersion = current?.version ?? 0;

  // Optimistic concurrency: a stale base means another device wrote first.
  // Return the authoritative document so the client merges and retries.
  if (baseVersion !== currentVersion) {
    return c.json(
      {
        error: "version_conflict",
        version: currentVersion,
        document: current?.blob ?? null,
      },
      409
    );
  }

  const merged = mergeDocuments(current?.blob ?? null, incoming);
  const nextVersion = currentVersion + 1;
  const { ciphertext, iv, authTag, keyVersion } = encrypt(
    JSON.stringify(merged)
  );

  await getDb()
    .insertInto("task_document")
    .values({
      userId,
      ciphertext,
      iv,
      authTag,
      keyVersion,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .onConflict((oc) =>
      oc.column("userId").doUpdateSet({
        ciphertext,
        iv,
        authTag,
        keyVersion,
        version: nextVersion,
        updatedAt: new Date(),
      })
    )
    .execute();

  return c.json({ version: nextVersion, document: merged });
});
