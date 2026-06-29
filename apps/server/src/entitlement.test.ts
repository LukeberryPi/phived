import { describe, expect, test } from "bun:test";
import { isEntitled } from "./entitlement";

describe("isEntitled", () => {
  test("entitled while active or in the dunning window", () => {
    expect(isEntitled("active")).toBe(true);
    expect(isEntitled("past_due")).toBe(true);
  });

  test("not entitled for any other status", () => {
    for (const status of ["canceled", "revoked", "incomplete", "none", ""]) {
      expect(isEntitled(status)).toBe(false);
    }
  });

  test("not entitled when status is missing", () => {
    expect(isEntitled(null)).toBe(false);
    expect(isEntitled(undefined)).toBe(false);
  });
});
