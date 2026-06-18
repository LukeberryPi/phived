// Entitlement is the derived "is this User Pro?" gate, deliberately separate
// from authentication (ADR 0004). It is generous: a lapsed payment keeps Pro
// through the provider's grace and cancel-at-period-end windows, and is revoked
// only when the provider definitively ends it. `computeEntitled` is a pure
// function of the mirrored row plus the current time so it is trivially
// testable and identical between the runtime gate and the /api/me view.
import type { MiddlewareHandler } from "hono";
import { getDb } from "./db/client.ts";
import type { Entitlement } from "./db/schema.ts";
import { getSessionUser } from "./auth.ts";

/** Days a `past_due` subscription stays entitled past its period end. */
const PAST_DUE_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export type EntitlementStatus = Pick<
  Entitlement,
  "status" | "currentPeriodEnd" | "cancelAtPeriodEnd"
>;

function periodEndMs(value: Entitlement["currentPeriodEnd"]): number | null {
  if (!value) {
    return null;
  }
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function computeEntitled(
  entitlement: EntitlementStatus | null,
  now: number = Date.now()
): boolean {
  if (!entitlement) {
    return false;
  }

  const status = entitlement.status.toLowerCase();
  const periodEnd = periodEndMs(entitlement.currentPeriodEnd);

  switch (status) {
    case "active":
    case "trialing":
      // Cancel-at-period-end keeps Pro until the period actually ends.
      if (entitlement.cancelAtPeriodEnd && periodEnd !== null) {
        return now < periodEnd;
      }
      return true;

    case "past_due":
      // Generous grace: stay Pro through the retry window. Treat an unknown
      // period end as still-in-grace rather than demoting prematurely.
      if (periodEnd === null) {
        return true;
      }
      return now < periodEnd + PAST_DUE_GRACE_MS;

    case "canceled":
    case "cancelled":
      // A cancellation that has not yet reached its paid-through date is still
      // entitled; once the period ends, demote.
      return periodEnd !== null && now < periodEnd;

    case "revoked":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    default:
      return false;
  }
}

export async function getEntitlement(
  userId: string
): Promise<Entitlement | null> {
  const row = await getDb()
    .selectFrom("entitlement")
    .selectAll()
    .where("userId", "=", userId)
    .executeTakeFirst();
  return row ?? null;
}

export type ApiVariables = {
  userId: string;
  entitlement: Entitlement | null;
};

/**
 * Guards every /api/tasks route: a valid session AND a live entitlement.
 * Returns 401 when unauthenticated and 402 when authenticated-but-unentitled,
 * and never partially writes (the gate runs before any handler).
 */
export const requireActiveEntitlement: MiddlewareHandler<{
  Variables: ApiVariables;
}> = async (c, next) => {
  const user = await getSessionUser(c.req.raw);
  if (!user) {
    return c.json({ error: "unauthenticated" }, 401);
  }

  const entitlement = await getEntitlement(user.id);
  if (!computeEntitled(entitlement)) {
    return c.json({ error: "not_entitled" }, 402);
  }

  c.set("userId", user.id);
  c.set("entitlement", entitlement);
  await next();
};
