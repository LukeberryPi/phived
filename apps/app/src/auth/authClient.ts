// Better Auth + Polar browser client. Same-origin in production (phived.com
// serves both /app and /api/auth), so no baseURL is needed; VITE_AUTH_BASE_URL
// lets a dev point the app at a separately-running combined server. This module
// is only ever imported by the flag-gated sync UI (see App.tsx), so the auth
// client never ships to anonymous/non-paying users.
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || undefined,
  plugins: [polarClient()],
});
