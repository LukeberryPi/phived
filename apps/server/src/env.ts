// Minimal environment boundary for the server. Static-only mode is allowed when
// DATABASE_URL is absent; once the DB is configured, the auth/billing
// surface must have its required configuration instead of silently substituting
// empty strings. The Better Auth schema generator opts into placeholders for
// non-DB values so it can still introspect the auth config during development.

export type PolarServer = "sandbox" | "production";

export interface ApiEnv {
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  polarAccessToken: string;
  polarWebhookSecret: string;
  polarProductIdMonthly: string;
  polarProductIdAnnual: string;
  polarServer: PolarServer;
}

export type ServerMode =
  | { mode: "static-only" }
  | { mode: "api"; apiEnv: ApiEnv };

const AUTH_GENERATE_PLACEHOLDER = "placeholder-for-better-auth-schema";
const MIN_SECRET_LENGTH = 32;

export function getServerMode(): ServerMode {
  if (!read("DATABASE_URL")) {
    return { mode: "static-only" };
  }

  return { mode: "api", apiEnv: getApiEnv() };
}

export function getApiEnv(): ApiEnv {
  const allowPlaceholders = process.env.BETTER_AUTH_SCHEMA_GENERATE === "true";
  const databaseUrl = requireValue("DATABASE_URL");
  const betterAuthSecret = allowPlaceholders
    ? (read("BETTER_AUTH_SECRET") ?? AUTH_GENERATE_PLACEHOLDER)
    : requireValue("BETTER_AUTH_SECRET");

  if (!allowPlaceholders && betterAuthSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `BETTER_AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters`
    );
  }

  const polarServer =
    read("POLAR_SERVER") === "production" ? "production" : "sandbox";

  return {
    databaseUrl,
    betterAuthSecret,
    betterAuthUrl: valueOrPlaceholder("BETTER_AUTH_URL", allowPlaceholders),
    googleClientId: valueOrPlaceholder("GOOGLE_CLIENT_ID", allowPlaceholders),
    googleClientSecret: valueOrPlaceholder(
      "GOOGLE_CLIENT_SECRET",
      allowPlaceholders
    ),
    polarAccessToken: valueOrPlaceholder(
      "POLAR_ACCESS_TOKEN",
      allowPlaceholders
    ),
    polarWebhookSecret: valueOrPlaceholder(
      "POLAR_WEBHOOK_SECRET",
      allowPlaceholders
    ),
    polarProductIdMonthly: valueOrPlaceholder(
      "POLAR_PRODUCT_ID_MONTHLY",
      allowPlaceholders
    ),
    polarProductIdAnnual: valueOrPlaceholder(
      "POLAR_PRODUCT_ID_ANNUAL",
      allowPlaceholders
    ),
    polarServer,
  };
}

function valueOrPlaceholder(name: string, allowPlaceholders: boolean): string {
  if (allowPlaceholders) {
    return read(name) ?? AUTH_GENERATE_PLACEHOLDER;
  }

  return requireValue(name);
}

function requireValue(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function read(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}
