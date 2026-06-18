// Committed, ordered migrations run migrate-then-boot from the start command
// (ADR 0004). Better Auth's tables are created here by hand rather than via its
// CLI so the schema is reviewable and versioned alongside the app tables.
import {
  type Kysely,
  type Migration,
  type MigrationProvider,
  sql,
} from "kysely";

const initialSchema: Migration = {
  async up(db: Kysely<unknown>): Promise<void> {
    await db.schema
      .createTable("user")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("name", "text", (col) => col.notNull())
      .addColumn("email", "text", (col) => col.notNull().unique())
      .addColumn("emailVerified", "boolean", (col) =>
        col.notNull().defaultTo(false)
      )
      .addColumn("image", "text")
      .addColumn("createdAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .addColumn("updatedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();

    await db.schema
      .createTable("session")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("userId", "text", (col) =>
        col.notNull().references("user.id").onDelete("cascade")
      )
      .addColumn("token", "text", (col) => col.notNull().unique())
      .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
      .addColumn("ipAddress", "text")
      .addColumn("userAgent", "text")
      .addColumn("createdAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .addColumn("updatedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();

    await db.schema
      .createTable("account")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("userId", "text", (col) =>
        col.notNull().references("user.id").onDelete("cascade")
      )
      .addColumn("accountId", "text", (col) => col.notNull())
      .addColumn("providerId", "text", (col) => col.notNull())
      .addColumn("accessToken", "text")
      .addColumn("refreshToken", "text")
      .addColumn("accessTokenExpiresAt", "timestamptz")
      .addColumn("refreshTokenExpiresAt", "timestamptz")
      .addColumn("scope", "text")
      .addColumn("idToken", "text")
      .addColumn("password", "text")
      .addColumn("createdAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .addColumn("updatedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();

    await db.schema
      .createTable("verification")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("identifier", "text", (col) => col.notNull())
      .addColumn("value", "text", (col) => col.notNull())
      .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
      .addColumn("createdAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .addColumn("updatedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();

    await db.schema
      .createTable("entitlement")
      .addColumn("userId", "text", (col) =>
        col.primaryKey().references("user.id").onDelete("cascade")
      )
      .addColumn("plan", "text")
      .addColumn("status", "text", (col) => col.notNull())
      .addColumn("polarSubscriptionId", "text")
      .addColumn("currentPeriodEnd", "timestamptz")
      .addColumn("cancelAtPeriodEnd", "boolean", (col) =>
        col.notNull().defaultTo(false)
      )
      .addColumn("updatedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();

    await db.schema
      .createTable("task_document")
      .addColumn("userId", "text", (col) =>
        col.primaryKey().references("user.id").onDelete("cascade")
      )
      .addColumn("ciphertext", "bytea", (col) => col.notNull())
      .addColumn("iv", "bytea", (col) => col.notNull())
      .addColumn("authTag", "bytea", (col) => col.notNull())
      .addColumn("keyVersion", "integer", (col) => col.notNull())
      .addColumn("version", "integer", (col) => col.notNull().defaultTo(0))
      .addColumn("updatedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();

    await db.schema
      .createTable("webhook_event")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("type", "text", (col) => col.notNull())
      .addColumn("receivedAt", "timestamptz", (col) =>
        col.notNull().defaultTo(sql`now()`)
      )
      .execute();
  },

  async down(db: Kysely<unknown>): Promise<void> {
    for (const table of [
      "webhook_event",
      "task_document",
      "entitlement",
      "verification",
      "account",
      "session",
      "user",
    ]) {
      await db.schema.dropTable(table).ifExists().execute();
    }
  },
};

const migrations: Record<string, Migration> = {
  "0001_initial_schema": initialSchema,
};

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations;
  },
};
