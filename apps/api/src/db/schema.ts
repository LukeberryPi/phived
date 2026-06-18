import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export type Timestamp = ColumnType<
  Date,
  Date | string | undefined,
  Date | string
>;

export type UserTable = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type SessionTable = {
  id: string;
  expiresAt: Timestamp;
  token: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
};

export type AccountTable = {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Timestamp | null;
  refreshTokenExpiresAt: Timestamp | null;
  scope: string | null;
  password: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type VerificationTable = {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Timestamp;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type EntitlementStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "revoked"
  | "inactive";

export type EntitlementTable = {
  userId: string;
  plan: "pro";
  status: EntitlementStatus;
  polarSubscriptionId: string | null;
  currentPeriodEnd: Timestamp | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: Timestamp;
};

export type TaskDocumentTable = {
  userId: string;
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  keyVersion: number;
  version: number;
  updatedAt: Timestamp;
};

export type PolarWebhookEventTable = {
  id: string;
  type: string;
  receivedAt: Timestamp;
};

export type Database = {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  entitlement: EntitlementTable;
  task_document: TaskDocumentTable;
  polar_webhook_event: PolarWebhookEventTable;
};

export type Entitlement = Selectable<EntitlementTable>;
export type NewEntitlement = Insertable<EntitlementTable>;
export type EntitlementUpdate = Updateable<EntitlementTable>;
export type TaskDocument = Selectable<TaskDocumentTable>;
