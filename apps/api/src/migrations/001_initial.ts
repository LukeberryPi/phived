import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable("user")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("emailVerified", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn("image", "text")
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .execute();

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("ipAddress", "text")
    .addColumn("userAgent", "text")
    .addColumn("userId", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade")
    )
    .execute();

  await db.schema
    .createIndex("session_userId_idx")
    .ifNotExists()
    .on("session")
    .column("userId")
    .execute();

  await db.schema
    .createTable("account")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("accountId", "text", (col) => col.notNull())
    .addColumn("providerId", "text", (col) => col.notNull())
    .addColumn("userId", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade")
    )
    .addColumn("accessToken", "text")
    .addColumn("refreshToken", "text")
    .addColumn("idToken", "text")
    .addColumn("accessTokenExpiresAt", "timestamptz")
    .addColumn("refreshTokenExpiresAt", "timestamptz")
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("createdAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .execute();

  await db.schema
    .createIndex("account_userId_idx")
    .ifNotExists()
    .on("account")
    .column("userId")
    .execute();

  await db.schema
    .createTable("verification")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz")
    .addColumn("updatedAt", "timestamptz")
    .execute();

  await db.schema
    .createTable("entitlement")
    .ifNotExists()
    .addColumn("userId", "text", (col) =>
      col.primaryKey().references("user.id").onDelete("cascade")
    )
    .addColumn("plan", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("polarSubscriptionId", "text")
    .addColumn("currentPeriodEnd", "timestamptz")
    .addColumn("cancelAtPeriodEnd", "boolean", (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .execute();

  await db.schema
    .createTable("task_document")
    .ifNotExists()
    .addColumn("userId", "text", (col) =>
      col.primaryKey().references("user.id").onDelete("cascade")
    )
    .addColumn("ciphertext", "bytea", (col) => col.notNull())
    .addColumn("iv", "bytea", (col) => col.notNull())
    .addColumn("authTag", "bytea", (col) => col.notNull())
    .addColumn("keyVersion", "integer", (col) => col.notNull())
    .addColumn("version", "integer", (col) => col.notNull())
    .addColumn("updatedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .execute();

  await db.schema
    .createTable("polar_webhook_event")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("receivedAt", "timestamptz", (col) =>
      col.notNull().defaultTo(db.fn("now"))
    )
    .execute();
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("polar_webhook_event").ifExists().execute();
  await db.schema.dropTable("task_document").ifExists().execute();
  await db.schema.dropTable("entitlement").ifExists().execute();
  await db.schema.dropTable("verification").ifExists().execute();
  await db.schema.dropTable("account").ifExists().execute();
  await db.schema.dropTable("session").ifExists().execute();
  await db.schema.dropTable("user").ifExists().execute();
}
