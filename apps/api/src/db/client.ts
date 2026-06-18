// Single Kysely instance over a node-postgres pool. Better Auth's Kysely
// adapter and the app-owned queries share this connection. Created lazily so
// the static server can boot without a database (see env.isProConfigured).
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { env } from "../env.ts";
import type { Database } from "./schema.ts";

let cached: Kysely<Database> | null = null;

export function getDb(): Kysely<Database> {
  if (cached) {
    return cached;
  }

  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not set; the Pro backend is disabled");
  }

  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString: env.databaseUrl,
      max: 10,
    }),
  });

  cached = new Kysely<Database>({ dialect });
  return cached;
}
