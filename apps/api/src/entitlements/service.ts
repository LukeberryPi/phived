import type { Kysely } from "kysely";
import type {
  Database,
  Entitlement,
  EntitlementStatus,
  EntitlementUpdate,
} from "../db/schema";

const PAST_DUE_GRACE_MS = 14 * 24 * 60 * 60 * 1000;

export type EntitlementState = {
  plan: "free" | "pro";
  status: EntitlementStatus | "none";
  active: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export function isActiveEntitlement(
  entitlement: Entitlement | null | undefined,
  now = new Date()
) {
  if (!entitlement) {
    return false;
  }

  if (entitlement.status === "active" || entitlement.status === "trialing") {
    return true;
  }

  const periodEnd = entitlement.currentPeriodEnd
    ? new Date(entitlement.currentPeriodEnd)
    : null;

  if (
    entitlement.status === "past_due" &&
    periodEnd &&
    now.getTime() <= periodEnd.getTime() + PAST_DUE_GRACE_MS
  ) {
    return true;
  }

  if (
    entitlement.cancelAtPeriodEnd &&
    periodEnd &&
    now.getTime() <= periodEnd.getTime()
  ) {
    return true;
  }

  return false;
}

export function toEntitlementState(
  entitlement: Entitlement | null | undefined,
  now = new Date()
): EntitlementState {
  return {
    plan: isActiveEntitlement(entitlement, now) ? "pro" : "free",
    status: entitlement?.status ?? "none",
    active: isActiveEntitlement(entitlement, now),
    currentPeriodEnd: entitlement?.currentPeriodEnd
      ? new Date(entitlement.currentPeriodEnd).toISOString()
      : null,
    cancelAtPeriodEnd: entitlement?.cancelAtPeriodEnd ?? false,
  };
}

export async function getEntitlement(db: Kysely<Database>, userId: string) {
  return await db
    .selectFrom("entitlement")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirst();
}

export async function upsertEntitlement(
  db: Kysely<Database>,
  userId: string,
  update: EntitlementUpdate
) {
  const next = {
    userId,
    plan: "pro" as const,
    status: update.status ?? "inactive",
    polarSubscriptionId: update.polarSubscriptionId ?? null,
    currentPeriodEnd: update.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: update.cancelAtPeriodEnd ?? false,
    updatedAt: new Date(),
  };

  await db
    .insertInto("entitlement")
    .values(next)
    .onConflict((oc) =>
      oc.column("userId").doUpdateSet({
        ...update,
        updatedAt: new Date(),
      })
    )
    .execute();

  return await getEntitlement(db, userId);
}

export async function recordWebhookEvent(
  db: Kysely<Database>,
  eventId: string,
  type: string
) {
  const result = await db
    .insertInto("polar_webhook_event")
    .values({ id: eventId, type, receivedAt: new Date() })
    .onConflict((oc) => oc.column("id").doNothing())
    .executeTakeFirst();

  return Number(result.numInsertedOrUpdatedRows ?? 0n) > 0;
}

export function extractPolarEntitlementUpdate(payload: unknown) {
  const record = payload as Record<string, unknown>;
  const data = (record.data ?? record) as Record<string, unknown>;
  const customer = data.customer as Record<string, unknown> | undefined;
  const metadata = data.metadata as Record<string, unknown> | undefined;
  const userId =
    asString(data.customerExternalId) ??
    asString(data.customer_external_id) ??
    asString(customer?.externalId) ??
    asString(customer?.external_id) ??
    asString(metadata?.userId);

  if (!userId) {
    return null;
  }

  const status = normalizeStatus(asString(data.status));
  const currentPeriodEnd =
    asString(data.currentPeriodEnd) ??
    asString(data.current_period_end) ??
    asString(data.endsAt) ??
    asString(data.ends_at);

  return {
    userId,
    update: {
      status,
      polarSubscriptionId: asString(data.id) ?? null,
      currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
      cancelAtPeriodEnd:
        Boolean(data.cancelAtPeriodEnd) || Boolean(data.cancel_at_period_end),
    },
  };
}

function normalizeStatus(status: string | undefined): EntitlementStatus {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "canceled" ||
    status === "revoked"
  ) {
    return status;
  }

  return "inactive";
}

function asString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}
