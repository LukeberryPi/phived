export type ApiEnv = {
  databaseUrl?: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  googleClientId?: string;
  googleClientSecret?: string;
  polarAccessToken?: string;
  polarWebhookSecret?: string;
  polarProductIdMonthly?: string;
  polarProductIdAnnual?: string;
  polarServer?: "production" | "sandbox";
  tasksEncryptionKey?: string;
  port: number;
  host: string;
};

export function readEnv(source: Record<string, string | undefined>): ApiEnv {
  return {
    databaseUrl: source.DATABASE_URL,
    betterAuthSecret:
      source.BETTER_AUTH_SECRET ?? "dev-only-change-me-change-me-change-me",
    betterAuthUrl: source.BETTER_AUTH_URL ?? "http://localhost:3000",
    googleClientId: source.GOOGLE_CLIENT_ID,
    googleClientSecret: source.GOOGLE_CLIENT_SECRET,
    polarAccessToken: source.POLAR_ACCESS_TOKEN,
    polarWebhookSecret: source.POLAR_WEBHOOK_SECRET,
    polarProductIdMonthly: source.POLAR_PRODUCT_ID_MONTHLY,
    polarProductIdAnnual: source.POLAR_PRODUCT_ID_ANNUAL,
    polarServer: source.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
    tasksEncryptionKey: source.TASKS_ENC_KEY,
    port: Number(source.PORT ?? 3000),
    host: source.BIND_HOST ?? "127.0.0.1",
  };
}

export function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
