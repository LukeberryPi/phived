import { describe, expect, test } from "bun:test";
import { isActiveEntitlement } from "../entitlements/service";
import type { Entitlement } from "../db/schema";

const now = new Date("2026-06-17T12:00:00.000Z");

function entitlement(overrides: Partial<Entitlement>): Entitlement {
  return {
    userId: "user-1",
    plan: "pro",
    status: "inactive",
    polarSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: now,
    ...overrides,
  };
}

describe("isActiveEntitlement", () => {
  test("allows active, trialing, grace past_due, and cancel-at-period-end", () => {
    expect(isActiveEntitlement(entitlement({ status: "active" }), now)).toBe(
      true
    );
    expect(isActiveEntitlement(entitlement({ status: "trialing" }), now)).toBe(
      true
    );
    expect(
      isActiveEntitlement(
        entitlement({
          status: "past_due",
          currentPeriodEnd: new Date("2026-06-10T12:00:00.000Z"),
        }),
        now
      )
    ).toBe(true);
    expect(
      isActiveEntitlement(
        entitlement({
          status: "canceled",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: new Date("2026-06-18T12:00:00.000Z"),
        }),
        now
      )
    ).toBe(true);
  });

  test("denies revoked and actually-ended subscriptions", () => {
    expect(isActiveEntitlement(entitlement({ status: "revoked" }), now)).toBe(
      false
    );
    expect(
      isActiveEntitlement(
        entitlement({
          status: "canceled",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: new Date("2026-06-16T12:00:00.000Z"),
        }),
        now
      )
    ).toBe(false);
  });
});
