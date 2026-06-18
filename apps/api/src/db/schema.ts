// Kysely table interfaces for the Pro backend. The four Better Auth tables
// (user, session, account, verification) match the schema Better Auth expects;
// the two app-owned tables (entitlement, task_document) are the queryable
// entitlement mirror and the encrypted task document. See ADR 0004.
import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";

type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface UserTable {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SessionTable {
  id: string;
  userId: string;
  token: string;
  expiresAt: Timestamp;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AccountTable {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  idToken: string | null;
  password: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VerificationTable {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Mirror of Polar subscription state; the truth for "is this User Pro?". */
export interface EntitlementTable {
  userId: string;
  plan: string | null;
  status: string;
  polarSubscriptionId: string | null;
  currentPeriodEnd: Timestamp | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: Timestamp;
}

/** One encrypted { canvasLists, taskHistory } blob per User. */
export interface TaskDocumentTable {
  userId: string;
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  keyVersion: number;
  version: number;
  updatedAt: Timestamp;
}

/** Idempotency ledger so a redelivered webhook is processed at most once. */
export interface WebhookEventTable {
  id: string;
  type: string;
  receivedAt: Generated<Timestamp>;
}

export interface Database {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  entitlement: EntitlementTable;
  task_document: TaskDocumentTable;
  webhook_event: WebhookEventTable;
}

export type Entitlement = Selectable<EntitlementTable>;
export type NewEntitlement = Insertable<EntitlementTable>;
export type EntitlementUpdate = Updateable<EntitlementTable>;
export type TaskDocument = Selectable<TaskDocumentTable>;
