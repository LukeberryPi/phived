import { Polar } from "@polar-sh/sdk";
import type { Kysely } from "kysely";
import type { ApiEnv } from "../env";
import type { Database } from "../db/schema";
import { getEntitlement, upsertEntitlement } from "./service";

export function createPolarClient(env: ApiEnv) {
  if (!env.polarAccessToken) {
    return null;
  }

  return new Polar({
    accessToken: env.polarAccessToken,
    server: env.polarServer,
  });
}

export async function reconcileEntitlementFromPolar({
  db,
  polarClient,
  userId,
  productIds,
}: {
  db: Kysely<Database>;
  polarClient: Polar | null;
  userId: string;
  productIds: string[];
}) {
  if (!polarClient) {
    return await getEntitlement(db, userId);
  }

  try {
    const state = await polarClient.customers.getStateExternal({
      externalId: userId,
    });
    const subscriptions = state.activeSubscriptions.filter(
      (subscription) =>
        productIds.length === 0 || productIds.includes(subscription.productId)
    );
    const subscription = subscriptions[0];

    if (!subscription) {
      return await upsertEntitlement(db, userId, {
        status: "inactive",
        polarSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }

    return await upsertEntitlement(db, userId, {
      status: subscription.status === "trialing" ? "trialing" : "active",
      polarSubscriptionId: subscription.id,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
  } catch (error) {
    console.warn("polar entitlement reconciliation failed", error);
    return await getEntitlement(db, userId);
  }
}
