/// <reference types="bun" />

import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { formatHistoryExportWhen, formatHistoryWhen } from "src/utils/formatHistoryWhen";

describe("formatHistoryWhen", () => {
  afterEach(() => {
    setSystemTime();
  });

  test("returns an empty string for invalid ISO input", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("not-a-date")).toBe("");
  });

  test("formats values under one minute", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-12T11:59:30")).toBe("just now");
  });

  test("formats exactly one minute", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-12T11:59:00")).toBe("1 minute ago");
  });

  test("formats multiple minutes under one hour", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-12T11:18:00")).toBe("42 minutes ago");
  });

  test("formats same-day values older than an hour", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-12T09:00:00")).toBe("earlier today");
  });

  test("formats yesterday", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-11T20:00:00")).toBe("yesterday");
  });

  test("formats two to six calendar days ago", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-06T12:00:00")).toBe("a few days ago");
  });

  test("formats seven or more calendar days ago", () => {
    setSystemTime(new Date("2026-06-12T12:00:00"));
    expect(formatHistoryWhen("2026-06-05T12:00:00")).toBe("over a week ago");
  });
});

describe("formatHistoryExportWhen", () => {
  test("returns an empty string for invalid ISO input", () => {
    expect(formatHistoryExportWhen("not-a-date")).toBe("");
  });

  test("formats completedAt as dd/mm/yyyy at hh:mm in local time", () => {
    const completedAt = new Date(2026, 5, 16, 14, 30).toISOString();
    expect(formatHistoryExportWhen(completedAt)).toBe("16/06/2026 at 14:30");
  });

  test("zero-pads single-digit day, month, hours, and minutes", () => {
    const completedAt = new Date(2026, 0, 5, 9, 7).toISOString();
    expect(formatHistoryExportWhen(completedAt)).toBe("05/01/2026 at 09:07");
  });
});
