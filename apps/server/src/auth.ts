// Better Auth (Google sign-in) with the Polar billing plugin
// (checkout / portal / webhooks), backed by the shared Postgres pool. This is
// the single config the Better Auth CLI introspects to generate the auth
// tables (see `bun --cwd apps/server auth:generate`) and the instance the
// server mounts at /api/auth/*. API-enabled startup uses the validated
// environment boundary in env.ts; the schema generator opts into placeholders
// for non-DB values. See ADR 0005.
import { Polar } from "@polar-sh/sdk";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import type { Pool } from "pg";
import { getPool } from "./db";
import { getApiEnv, type ApiEnv } from "./env";
import { isEntitled, upsertEntitlement } from "./entitlement";

interface PolarSubscriptionForEntitlement {
  id: string;
  status: string;
  currentPeriodEnd?: Date | null;
  customerId: string;
  customer: {
    externalId?: string | null;
  };
}

async function upsertSubscriptionEntitlement(
  data: PolarSubscriptionForEntitlement
): Promise<void> {
  await upsertEntitlement({
    userId: data.customer.externalId ?? null,
    status: data.status,
    polarCustomerId: data.customerId,
    polarSubscriptionId: data.id,
    currentPeriodEnd: data.currentPeriodEnd ?? null,
  });
}

export function createAuth(apiEnv: ApiEnv, pool: Pool = getPool()) {
  const useSecureCookies = apiEnv.betterAuthUrl.startsWith("https://");
  const polarClient = new Polar({
    accessToken: apiEnv.polarAccessToken,
    server: apiEnv.polarServer,
  });

  return betterAuth({
    database: pool,
    baseURL: apiEnv.betterAuthUrl,
    secret: apiEnv.betterAuthSecret,
    socialProviders: {
      google: {
        clientId: apiEnv.googleClientId,
        clientSecret: apiEnv.googleClientSecret,
      },
    },
    plugins: [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: apiEnv.polarProductIdMonthly,
                slug: "monthly",
              },
              {
                productId: apiEnv.polarProductIdAnnual,
                slug: "annual",
              },
            ],
            successUrl: "/app?checkout=success",
            authenticatedUsersOnly: true,
          }),
          portal(),
          webhooks({
            secret: apiEnv.polarWebhookSecret,
            onSubscriptionActive: async ({ data }) => {
              await upsertSubscriptionEntitlement(data);
            },
            onSubscriptionUpdated: async ({ data }) => {
              await upsertSubscriptionEntitlement(data);
            },
            onSubscriptionCanceled: async ({ data }) => {
              await upsertSubscriptionEntitlement(data);
            },
            onSubscriptionRevoked: async ({ data }) => {
              await upsertSubscriptionEntitlement(data);
            },
            onCustomerStateChanged: async ({ data }) => {
              const userId = "externalId" in data ? data.externalId : null;
              const subscriptions =
                "activeSubscriptions" in data ? data.activeSubscriptions : [];
              const active =
                subscriptions.find((sub) => isEntitled(sub.status)) ??
                subscriptions[0] ??
                null;
              await upsertEntitlement({
                userId,
                status: active?.status ?? "none",
                polarCustomerId: data.id,
                polarSubscriptionId: active?.id ?? null,
                currentPeriodEnd: active?.currentPeriodEnd ?? null,
              });
            },
          }),
        ],
      }),
    ],
    advanced: {
      useSecureCookies,
      defaultCookieAttributes: {
        sameSite: "lax",
        httpOnly: true,
        secure: useSecureCookies,
        path: "/",
      },
    },
  });
}

export const auth =
  process.env.BETTER_AUTH_SCHEMA_GENERATE === "true"
    ? createAuth(getApiEnv())
    : null;

export type Auth = ReturnType<typeof createAuth>;
