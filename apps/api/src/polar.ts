// Polar billing integration (ADR 0004). The entitlement table is a mirror of
// Polar subscription state, updated three ways for resilience:
//   1. signed webhooks (the steady-state path), processed idempotently by event id;
//   2. a one-shot authoritative pull on the post-checkout return (beats webhook lag);
//   3. a lazy self-heal re-pull on session refresh (recovers missed webhooks).
// The Polar Customer is linked to the Better Auth User by external id, so a
// subscription always resolves back to a `user.id`.
import { Polar } from "@polar-sh/sdk";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { getDb } from "./db/client.ts";
import { env, isPolarConfigured } from "./env.ts";

let cachedClient: Polar | null = null;

export function getPolarClient(): Polar {
  if (cachedClient) {
    return cachedClient;
  }
  if (!env.polarAccessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }
  cachedClient = new Polar({
    accessToken: env.polarAccessToken,
    server: env.polarServer,
  });
  return cachedClient;
}

export function planFromProductId(
  productId: string | null | undefined
): "monthly" | "annual" | null {
  if (!productId) {
    return null;
  }
  if (productId === env.polarProductIdMonthly) {
    return "monthly";
  }
  if (productId === env.polarProductIdAnnual) {
    return "annual";
  }
  return null;
}

/** The fields we read off a Polar subscription, however it reached us. */
export interface SubscriptionLike {
  id?: string | null;
  status?: string | null;
  currentPeriodEnd?: Date | string | null;
  cancelAtPeriodEnd?: boolean | null;
  productId?: string | null;
  customer?: { externalId?: string | null } | null;
  metadata?: Record<string, unknown> | null;
}

function resolveUserId(sub: SubscriptionLike): string | null {
  const external = sub.customer?.externalId;
  if (typeof external === "string" && external.length > 0) {
    return external;
  }
  const metaUser = sub.metadata?.userId;
  return typeof metaUser === "string" && metaUser.length > 0 ? metaUser : null;
}

/** Upsert the entitlement mirror from a subscription payload. Returns userId. */
export async function upsertEntitlementFromSubscription(
  sub: SubscriptionLike
): Promise<string | null> {
  const userId = resolveUserId(sub);
  if (!userId) {
    console.warn("[polar] subscription with no resolvable user id; skipping");
    return null;
  }

  const status = (sub.status ?? "unknown").toLowerCase();
  const currentPeriodEnd = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd)
    : null;
  const plan = planFromProductId(sub.productId);

  await getDb()
    .insertInto("entitlement")
    .values({
      userId,
      plan,
      status,
      polarSubscriptionId: sub.id ?? null,
      currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
      updatedAt: new Date(),
    })
    .onConflict((oc) =>
      oc.column("userId").doUpdateSet({
        plan,
        status,
        polarSubscriptionId: sub.id ?? null,
        currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
        updatedAt: new Date(),
      })
    )
    .execute();

  return userId;
}

/**
 * Process a webhook event at most once. Returns false if the event id has
 * already been recorded (a redelivery), true on first sight.
 */
async function claimWebhookEvent(id: string, type: string): Promise<boolean> {
  const result = await getDb()
    .insertInto("webhook_event")
    .values({ id, type })
    .onConflict((oc) => oc.column("id").doNothing())
    .executeTakeFirst();
  return (result.numInsertedOrUpdatedRows ?? 0n) > 0n;
}

type WebhookPayload = {
  type?: string;
  data?: SubscriptionLike;
};

async function handleSubscriptionEvent(payload: WebhookPayload): Promise<void> {
  if (!payload.data) {
    return;
  }
  await upsertEntitlementFromSubscription(payload.data);
}

/** Build the Better Auth Polar plugin with idempotent subscription handlers. */
export function buildPolarPlugin() {
  const client = getPolarClient();

  const products = [
    ...(env.polarProductIdMonthly
      ? [{ productId: env.polarProductIdMonthly, slug: "pro-monthly" }]
      : []),
    ...(env.polarProductIdAnnual
      ? [{ productId: env.polarProductIdAnnual, slug: "pro-annual" }]
      : []),
  ];

  return polar({
    client,
    createCustomerOnSignUp: true,
    use: [
      checkout({
        products,
        authenticatedUsersOnly: true,
        // The app reads ?checkout={CHECKOUT_ID} and confirms entitlement.
        successUrl: "/app?checkout={CHECKOUT_ID}",
      }),
      portal({ returnUrl: "/app" }),
      webhooks({
        secret: env.polarWebhookSecret as string,
        onPayload: async (payload) => {
          const event = payload as unknown as {
            type?: string;
            data?: { id?: string };
          };
          const eventId =
            (payload as unknown as { id?: string }).id ?? event.data?.id;
          const type = event.type ?? "unknown";
          if (eventId) {
            const fresh = await claimWebhookEvent(eventId, type);
            if (!fresh) {
              return;
            }
          }
        },
        onSubscriptionActive: (p) =>
          handleSubscriptionEvent(p as WebhookPayload),
        onSubscriptionCreated: (p) =>
          handleSubscriptionEvent(p as WebhookPayload),
        onSubscriptionUpdated: (p) =>
          handleSubscriptionEvent(p as WebhookPayload),
        onSubscriptionCanceled: (p) =>
          handleSubscriptionEvent(p as WebhookPayload),
        onSubscriptionUncanceled: (p) =>
          handleSubscriptionEvent(p as WebhookPayload),
        onSubscriptionRevoked: (p) =>
          handleSubscriptionEvent(p as WebhookPayload),
      }),
    ],
  });
}

/**
 * One-shot authoritative pull on the post-checkout return: read the checkout,
 * resolve its subscription, and update the mirror immediately rather than
 * waiting for the webhook.
 */
export async function confirmCheckout(
  checkoutId: string,
  expectedUserId: string
): Promise<boolean> {
  if (!isPolarConfigured()) {
    return false;
  }
  try {
    const client = getPolarClient();
    const session = await client.checkouts.get({ id: checkoutId });
    const sub = (session as { subscription?: SubscriptionLike }).subscription;
    if (!sub) {
      return false;
    }
    // Stamp the user id so resolveUserId always succeeds even if the customer
    // external id has not propagated yet.
    sub.metadata = { ...(sub.metadata ?? {}), userId: expectedUserId };
    const userId = await upsertEntitlementFromSubscription(sub);
    return userId === expectedUserId;
  } catch (error) {
    console.error("[polar] confirmCheckout failed", error);
    return false;
  }
}

/**
 * Lazy self-heal: re-pull the customer's subscriptions from Polar and refresh
 * the mirror. Cheap insurance against a dropped webhook; called opportunistically
 * on session-scoped reads.
 */
export async function selfHealEntitlement(userId: string): Promise<void> {
  if (!isPolarConfigured()) {
    return;
  }
  try {
    const client = getPolarClient();
    const result = await client.subscriptions.list({
      externalCustomerId: userId,
      limit: 1,
      sorting: ["-started_at"],
    });
    const items =
      (result as { result?: { items?: SubscriptionLike[] } }).result?.items ??
      [];
    const latest = items[0];
    if (latest) {
      latest.metadata = { ...(latest.metadata ?? {}), userId };
      await upsertEntitlementFromSubscription(latest);
    }
  } catch (error) {
    console.error("[polar] selfHealEntitlement failed", error);
  }
}
