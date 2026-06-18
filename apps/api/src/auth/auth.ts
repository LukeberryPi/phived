import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import type { Kysely } from "kysely";
import type { ApiEnv } from "../env";
import type { Database } from "../db/schema";
import { createPolarClient } from "../entitlements/reconcile";
import {
  extractPolarEntitlementUpdate,
  recordWebhookEvent,
  upsertEntitlement,
} from "../entitlements/service";

export function createAuth(db: Kysely<Database>, env: ApiEnv) {
  const plugins = [];

  if (env.polarAccessToken) {
    const polarClient = createPolarClient(env);

    plugins.push(
      polar({
        client: polarClient!,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              ...(env.polarProductIdMonthly
                ? [
                    {
                      productId: env.polarProductIdMonthly,
                      slug: "pro-monthly",
                    },
                  ]
                : []),
              ...(env.polarProductIdAnnual
                ? [{ productId: env.polarProductIdAnnual, slug: "pro-annual" }]
                : []),
            ],
            successUrl: `${env.betterAuthUrl}/app?checkout={CHECKOUT_ID}`,
            returnUrl: `${env.betterAuthUrl}/pricing`,
            authenticatedUsersOnly: true,
          }),
          portal({
            returnUrl: `${env.betterAuthUrl}/app`,
          }),
          webhooks({
            secret: env.polarWebhookSecret ?? "",
            onPayload: async (payload) => {
              const event = payload as Record<string, unknown>;
              const eventId =
                typeof event.id === "string" ? event.id : crypto.randomUUID();
              const type =
                typeof event.type === "string" ? event.type : "unknown";

              if (!(await recordWebhookEvent(db, eventId, type))) {
                return;
              }

              const entitlement = extractPolarEntitlementUpdate(payload);
              if (entitlement) {
                await upsertEntitlement(
                  db,
                  entitlement.userId,
                  entitlement.update
                );
              }
            },
          }),
        ],
      })
    );
  }

  return betterAuth({
    baseURL: env.betterAuthUrl,
    secret: env.betterAuthSecret,
    database: kyselyAdapter(db, { type: "postgres" }),
    socialProviders:
      env.googleClientId && env.googleClientSecret
        ? {
            google: {
              clientId: env.googleClientId,
              clientSecret: env.googleClientSecret,
            },
          }
        : {},
    plugins,
  });
}

export type PhivedAuth = ReturnType<typeof createAuth>;
