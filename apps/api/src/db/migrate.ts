// Migrate-then-boot entrypoint (ADR 0004). Run as the first half of the Railway
// start command; safe to run repeatedly because Kysely tracks applied
// migrations. A no-op when Pro is unconfigured so static-only deploys still
// start cleanly.
import { Migrator } from "kysely";
import { getDb } from "./client.ts";
import { migrationProvider } from "./migrations.ts";
import { isProConfigured } from "../env.ts";

export async function runMigrations(): Promise<void> {
  if (!isProConfigured()) {
    console.log("[migrate] Pro is not configured; skipping migrations");
    return;
  }

  const db = getDb();
  const migrator = new Migrator({ db, provider: migrationProvider });
  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    if (result.status === "Success") {
      console.log(`[migrate] applied ${result.migrationName}`);
    } else if (result.status === "Error") {
      console.error(`[migrate] failed ${result.migrationName}`);
    }
  }

  if (error) {
    console.error("[migrate] migration failed", error);
    throw error;
  }

  console.log("[migrate] up to date");
}

if (import.meta.main) {
  try {
    await runMigrations();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}
