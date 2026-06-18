// Centralised environment access for the Pro backend. Reading happens here so
// the rest of the code depends on a typed, validated config rather than poking
// `process.env`. Pro features only initialise when their secrets are present,
// which keeps the static site (and the ported site-contract tests) working in
// environments that have no database or billing credentials configured.

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function require(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  bindHost: process.env.BIND_HOST ?? "127.0.0.1",
  databaseUrl: read("DATABASE_URL"),
  betterAuthSecret: read("BETTER_AUTH_SECRET"),
  betterAuthUrl: read("BETTER_AUTH_URL") ?? "http://localhost:3000",
  googleClientId: read("GOOGLE_CLIENT_ID"),
  googleClientSecret: read("GOOGLE_CLIENT_SECRET"),
  polarAccessToken: read("POLAR_ACCESS_TOKEN"),
  polarWebhookSecret: read("POLAR_WEBHOOK_SECRET"),
  polarProductIdMonthly: read("POLAR_PRODUCT_ID_MONTHLY"),
  polarProductIdAnnual: read("POLAR_PRODUCT_ID_ANNUAL"),
  polarServer:
    (read("POLAR_SERVER") as "sandbox" | "production" | undefined) ??
    "production",
  tasksEncKey: read("TASKS_ENC_KEY"),
} as const;

/**
 * Pro requires a database, an auth secret, and the task-encryption key. Without
 * all three we serve the static site only and the `/api/*` surface is disabled.
 */
export function isProConfigured(): boolean {
  return Boolean(env.databaseUrl && env.betterAuthSecret && env.tasksEncKey);
}

export function isPolarConfigured(): boolean {
  return Boolean(
    env.polarAccessToken && env.polarWebhookSecret && env.polarProductIdMonthly
  );
}

export function isGoogleConfigured(): boolean {
  return Boolean(env.googleClientId && env.googleClientSecret);
}

export { require as requireEnv };
