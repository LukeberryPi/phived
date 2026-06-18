import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Migrator, FileMigrationProvider } from "kysely";
import { createDb } from "./db/client";
import { readEnv, requireEnv } from "./env";

const env = readEnv(process.env);
const db = createDb(requireEnv(env.databaseUrl, "DATABASE_URL"));

const migrationsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations"
);

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: migrationsFolder,
  }),
});

const { error, results } = await migrator.migrateToLatest();

for (const result of results ?? []) {
  console.log(`migration ${result.migrationName}: ${result.status}`);
}

await db.destroy();

if (error) {
  console.error(error);
  process.exit(1);
}
