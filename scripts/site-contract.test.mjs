import { describe, expect, test } from "bun:test";
import {
  isAppPath,
  requiredOutputs,
  securityHeaders,
  serviceWorker,
} from "./site-contract.mjs";

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

describe("securityHeaders", () => {
  test("includes the baseline hardening headers", () => {
    for (const name of [
      "X-Content-Type-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Content-Security-Policy",
    ]) {
      expect(securityHeaders).toHaveProperty(name);
    }
  });

  test("X-Content-Type-Options is nosniff", () => {
    expect(securityHeaders["X-Content-Type-Options"]).toBe("nosniff");
  });

  test("CSP restricts default-src to self and disallows object-src", () => {
    expect(securityHeaders["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(securityHeaders["Content-Security-Policy"]).toContain("object-src 'none'");
  });
});

describe("requiredOutputs", () => {
  test("includes assembled dist contract files", () => {
    for (const output of ["index.html", "app/index.html", "sw.js", "robots.txt"]) {
      expect(requiredOutputs).toContain(output);
    }
  });
});
