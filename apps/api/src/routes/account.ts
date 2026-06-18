// Minimal server-side delete-account-and-data path (ADR 0004). Not surfaced in
// the v1 header UI, but exposed for support/compliance. Deleting the user row
// cascades to sessions, accounts, the entitlement mirror, and the encrypted
// task document. Billing is cancelled separately via the Polar portal.
import { Hono } from "hono";
import { getSessionUser } from "../auth.ts";
import { getDb } from "../db/client.ts";

export const accountRoutes = new Hono();

accountRoutes.delete("/", async (c) => {
  const user = await getSessionUser(c.req.raw);
  if (!user) {
    return c.json({ error: "unauthenticated" }, 401);
  }

  await getDb().deleteFrom("user").where("id", "=", user.id).execute();

  return c.json({ deleted: true });
});
