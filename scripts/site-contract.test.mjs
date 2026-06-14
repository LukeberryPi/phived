import { describe, expect, test } from "bun:test";
import { isAppPath, requiredOutputs, serviceWorker } from "./site-contract.mjs";

describe("isAppPath", () => {
  test.each(["/app", "/app/", "/app/deep"])("returns true for %s", (pathname) => {
    expect(isAppPath(pathname)).toBe(true);
  });

  test.each(["/", "/sw.js", "/application"])("returns false for %s", (pathname) => {
    expect(isAppPath(pathname)).toBe(false);
  });
});

describe("serviceWorker", () => {
  test("path is /sw.js", () => {
    expect(serviceWorker.path).toBe("/sw.js");
  });

  test("cacheControl is no-cache kill-switch header", () => {
    expect(serviceWorker.cacheControl).toBe("public, max-age=0, must-revalidate");
  });
});

describe("requiredOutputs", () => {
  test("includes assembled dist contract files", () => {
    for (const output of ["index.html", "app/index.html", "sw.js", "robots.txt"]) {
      expect(requiredOutputs).toContain(output);
    }
  });
});
