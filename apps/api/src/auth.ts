// Better Auth configuration (ADR 0004): the Kysely/Postgres adapter, the Google
// social provider, a single essential HttpOnly SameSite=Lax session cookie
// (Better Auth's default), and the built-in rate limiter. The bearer plugin is
// deliberately NOT enabled — the first-party cookie is the only credential. The
// Polar plugin is attached only when billing is configured.
import { betterAuth } from "better-auth";
import { getDb } from "./db/client.ts";
import {
  env,
  isGoogleConfigured,
  isPolarConfigured,
  isProConfigured,
} from "./env.ts";
import { buildPolarPlugin } from "./polar.ts";

function buildAuth() {
  const plugins = isPolarConfigured() ? [buildPolarPlugin()] : [];

  return betterAuth({
    // Kysely adapter over the shared Postgres connection.
    database: { db: getDb(), type: "postgres" },
    secret: env.betterAuthSecret,
    baseURL: env.betterAuthUrl,
    trustedOrigins: [env.betterAuthUrl],
    emailAndPassword: { enabled: false },
    socialProviders: isGoogleConfigured()
      ? {
          google: {
            clientId: env.googleClientId as string,
            clientSecret: env.googleClientSecret as string,
          },
        }
      : {},
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      cookiePrefix: "phived",
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
      },
    },
    // Keep Better Auth's built-in rate limiting on.
    rateLimit: { enabled: true },
    plugins,
  });
}

type Auth = ReturnType<typeof buildAuth>;

let cached: Auth | null = null;

export function getAuth(): Auth {
  if (cached) {
    return cached;
  }

  if (!isProConfigured()) {
    throw new Error("auth requested but Pro is not configured");
  }

  cached = buildAuth();
  return cached;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/** Resolve the signed-in User from the request cookie, or null. */
export async function getSessionUser(
  request: Request
): Promise<SessionUser | null> {
  if (!isProConfigured()) {
    return null;
  }
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return null;
    }
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch (error) {
    console.error("[auth] getSession failed", error);
    return null;
  }
}
