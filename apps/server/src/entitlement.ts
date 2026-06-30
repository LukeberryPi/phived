// The server's view of whether a user may sync. Polar is the billing source of
// truth; its webhooks (see auth.ts) land subscription state here, one row per
// user. `isEntitled` honours the dunning window (`past_due`) per ADR 0005 — no
// trial, so the state machine is essentially active/past_due vs. everything
// else. This module is deliberately SDK-agnostic: callers map Polar payloads
// into the primitive shape below.
import { getPool } from "./db";

export interface EntitlementInput {
  userId: string | null | undefined;
  status: string;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}

export interface Entitlement {
  status: string;
  isEntitled: boolean;
  currentPeriodEnd: Date | null;
}

/** A user may sync while their subscription is active or in the dunning window. */
export function isEntitled(status: string | null | undefined): boolean {
  return status === "active" || status === "past_due";
}

/** Upsert the user's entitlement row. No-ops (with a warning) when we cannot
 * resolve the owning user — Polar customers carry the Better Auth user id as
 * their `externalId`, so a missing one means the webhook predates linkage. */
export async function upsertEntitlement(
  input: EntitlementInput
): Promise<void> {
  if (!input.userId) {
    console.warn(
      `[entitlement] skipping upsert for subscription ${input.polarSubscriptionId ?? "?"}: no externalId on the Polar customer`
    );
    return;
  }

  await getPool().query(
    `insert into entitlement
       (user_id, status, polar_customer_id, polar_subscription_id, current_period_end, updated_at)
     values ($1, $2, $3, $4, $5, now())
     on conflict (user_id) do update set
       status = excluded.status,
       polar_customer_id = excluded.polar_customer_id,
       polar_subscription_id = excluded.polar_subscription_id,
       current_period_end = excluded.current_period_end,
       updated_at = now()`,
    [
      input.userId,
      input.status,
      input.polarCustomerId,
      input.polarSubscriptionId,
      input.currentPeriodEnd,
    ]
  );
}

export async function getEntitlement(
  userId: string
): Promise<Entitlement | null> {
  const result = await getPool().query<{
    status: string;
    current_period_end: Date | null;
  }>("select status, current_period_end from entitlement where user_id = $1", [
    userId,
  ]);

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    status: row.status,
    isEntitled: isEntitled(row.status),
    currentPeriodEnd: row.current_period_end ?? null,
  };
}
