// Session-scoped reads: GET /api/me drives the client mode machine (Free / Pro
// / LocalOnly), and POST /api/checkout/confirm is the one-shot authoritative
// entitlement pull on the post-checkout return. Both opportunistically
// self-heal the entitlement mirror so a dropped webhook cannot strand a User.
import { Hono } from "hono";
import { getSessionUser } from "../auth.ts";
import { computeEntitled, getEntitlement } from "../entitlement.ts";
import { hasTaskDocument } from "../routes/tasks.ts";
import { confirmCheckout, selfHealEntitlement } from "../polar.ts";

export const sessionRoutes = new Hono();

sessionRoutes.get("/me", async (c) => {
  const user = await getSessionUser(c.req.raw);
  if (!user) {
    return c.json({ user: null, entitlement: null });
  }

  let entitlement = await getEntitlement(user.id);
  // Lazy self-heal: if the mirror does not currently grant Pro, re-pull from
  // Polar once in case a webhook was missed, then re-read.
  if (!computeEntitled(entitlement)) {
    await selfHealEntitlement(user.id);
    entitlement = await getEntitlement(user.id);
  }

  const entitled = computeEntitled(entitlement);

  return c.json({
    user: { id: user.id, email: user.email, name: user.name },
    entitlement: {
      entitled,
      plan: entitlement?.plan ?? null,
      status: entitlement?.status ?? null,
      currentPeriodEnd: entitlement?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: entitlement?.cancelAtPeriodEnd ?? false,
    },
    hasServerDocument: entitled ? await hasTaskDocument(user.id) : false,
  });
});

sessionRoutes.post("/checkout/confirm", async (c) => {
  const user = await getSessionUser(c.req.raw);
  if (!user) {
    return c.json({ error: "unauthenticated" }, 401);
  }

  const body = (await c.req.json().catch(() => null)) as {
    checkoutId?: unknown;
  } | null;
  const checkoutId =
    body && typeof body.checkoutId === "string" ? body.checkoutId : null;
  if (!checkoutId) {
    return c.json({ error: "missing_checkout_id" }, 400);
  }

  await confirmCheckout(checkoutId, user.id);
  const entitlement = await getEntitlement(user.id);
  const entitled = computeEntitled(entitlement);

  return c.json({
    entitled,
    plan: entitlement?.plan ?? null,
    status: entitlement?.status ?? null,
    hasServerDocument: entitled ? await hasTaskDocument(user.id) : false,
  });
});
