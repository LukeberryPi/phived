import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

/**
 * Better Auth React client for the Pro layer. Same-origin, so the session
 * cookie is first-party and `credentials` defaults to include. The Polar
 * client plugin mirrors the server's checkout/portal endpoints (mounted under
 * /api/auth by Better Auth). Free users never touch this.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [polarClient()],
});

export const { useSession, signIn, signOut } = authClient;
