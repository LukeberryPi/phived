import { describe, expect, test } from "bun:test";
import { computeEntitled, type EntitlementStatus } from "./entitlement.ts";

const NOW = Date.parse("2026-06-17T00:00:00.000Z");
const FUTURE = new Date(NOW + 5 * 24 * 60 * 60 * 1000);
const PAST = new Date(NOW - 5 * 24 * 60 * 60 * 1000);
const LONG_PAST = new Date(NOW - 30 * 24 * 60 * 60 * 1000);

function ent(overrides: Partial<EntitlementStatus>): EntitlementStatus {
  return {
    status: "active",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    ...overrides,
  };
}

describe("computeEntitled", () => {
  test("no mirror row is never entitled", () => {
    expect(computeEntitled(null, NOW)).toBe(false);
  });

  test("active and trialing are entitled", () => {
    expect(computeEntitled(ent({ status: "active" }), NOW)).toBe(true);
    expect(computeEntitled(ent({ status: "trialing" }), NOW)).toBe(true);
  });

  test("cancel-at-period-end keeps Pro until the period ends", () => {
    expect(
      computeEntitled(
        ent({
          status: "active",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: FUTURE,
        }),
        NOW
      )
    ).toBe(true);
    expect(
      computeEntitled(
        ent({
          status: "active",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: PAST,
        }),
        NOW
      )
    ).toBe(false);
  });

  test("past_due stays entitled within grace, demotes after", () => {
    expect(
      computeEntitled(ent({ status: "past_due", currentPeriodEnd: PAST }), NOW)
    ).toBe(true);
    expect(
      computeEntitled(
        ent({ status: "past_due", currentPeriodEnd: LONG_PAST }),
        NOW
      )
    ).toBe(false);
  });

  test("canceled is entitled until paid-through, then not", () => {
    expect(
      computeEntitled(
        ent({ status: "canceled", currentPeriodEnd: FUTURE }),
        NOW
      )
    ).toBe(true);
    expect(
      computeEntitled(ent({ status: "canceled", currentPeriodEnd: PAST }), NOW)
    ).toBe(false);
  });

  test("revoked and unpaid are never entitled", () => {
    expect(
      computeEntitled(ent({ status: "revoked", currentPeriodEnd: FUTURE }), NOW)
    ).toBe(false);
    expect(computeEntitled(ent({ status: "unpaid" }), NOW)).toBe(false);
  });
});
