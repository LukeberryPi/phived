import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getApiEnv, getServerMode } from "./env";

// Every key getApiEnv()/getServerMode() reads. Cleared before each test so
// tests never leak into one another or pick up the developer's real shell env.
const KEYS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_PRODUCT_ID_MONTHLY",
  "POLAR_PRODUCT_ID_ANNUAL",
  "POLAR_SERVER",
  "BETTER_AUTH_SCHEMA_GENERATE",
] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const key of KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved[key];
    }
  }
});

// A complete, valid API environment (dummy values — NOT real secrets). The
// secret is intentionally >= 32 chars to pass the length gate.
function setFullApiEnv(): void {
  process.env.DATABASE_URL = "postgres://localhost:5432/test";
  process.env.BETTER_AUTH_SECRET = "test-secret-please-ignore-0123456789";
  process.env.BETTER_AUTH_URL = "https://example.test";
  process.env.GOOGLE_CLIENT_ID = "google-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-secret";
  process.env.POLAR_ACCESS_TOKEN = "polar-token";
  process.env.POLAR_WEBHOOK_SECRET = "polar-webhook";
  process.env.POLAR_PRODUCT_ID_MONTHLY = "prod-monthly";
  process.env.POLAR_PRODUCT_ID_ANNUAL = "prod-annual";
}

describe("getServerMode", () => {
  test("static-only when DATABASE_URL is absent", () => {
    expect(getServerMode()).toEqual({ mode: "static-only" });
  });

  test("api mode with a full environment", () => {
    setFullApiEnv();
    const mode = getServerMode();
    expect(mode.mode).toBe("api");
  });
});

describe("getApiEnv", () => {
  test("throws when DATABASE_URL is missing", () => {
    expect(() => getApiEnv()).toThrow(
      "Missing required environment variable: DATABASE_URL"
    );
  });

  test("throws when a required secret is missing", () => {
    process.env.DATABASE_URL = "postgres://localhost:5432/test";
    expect(() => getApiEnv()).toThrow(
      "Missing required environment variable: BETTER_AUTH_SECRET"
    );
  });

  test("throws when BETTER_AUTH_SECRET is too short", () => {
    setFullApiEnv();
    process.env.BETTER_AUTH_SECRET = "too-short";
    expect(() => getApiEnv()).toThrow("at least 32 characters");
  });

  test("returns a fully-populated config when everything is set", () => {
    setFullApiEnv();
    const env = getApiEnv();
    expect(env.databaseUrl).toBe("postgres://localhost:5432/test");
    expect(env.polarServer).toBe("sandbox");
  });

  test("selects the production Polar server only when explicitly set", () => {
    setFullApiEnv();
    process.env.POLAR_SERVER = "production";
    expect(getApiEnv().polarServer).toBe("production");
  });

  test("schema-generate mode allows placeholders for non-DB values", () => {
    process.env.DATABASE_URL = "postgres://localhost:5432/test";
    process.env.BETTER_AUTH_SCHEMA_GENERATE = "true";
    // No other vars set: must NOT throw, and fills placeholders.
    const env = getApiEnv();
    expect(env.databaseUrl).toBe("postgres://localhost:5432/test");
    expect(env.googleClientId).toBe("placeholder-for-better-auth-schema");
  });
});
