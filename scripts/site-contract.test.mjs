import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createSiteServer } from "./serve-site.mjs";
import {
  appHref,
  appBasePath,
  appMountDir,
  isAppPath,
  requiredOutputs,
  securityHeaders,
  serviceWorker,
} from "./site-contract.mjs";

const tempRoots = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))
  );
});

async function createFixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), "phived-site-"));
  tempRoots.push(root);
  await mkdir(path.join(root, appMountDir), { recursive: true });
  await writeFile(path.join(root, "index.html"), "web");
  await writeFile(path.join(root, "robots.txt"), "robots");
  await writeFile(path.join(root, "sw.js"), "sw");
  await writeFile(path.join(root, appMountDir, "index.html"), "app");
  await writeFile(path.join(root, appMountDir, "asset.js"), "asset");
  return root;
}

async function withServer(root, callback) {
  const server = createSiteServer(root);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const { port } = server.address();
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

describe("isAppPath", () => {
  test.each([appBasePath, `${appBasePath}/`, `${appBasePath}/deep`])(
    "returns true for %s",
    (pathname) => {
      expect(isAppPath(pathname)).toBe(true);
    }
  );

  test.each(["/", "/sw.js", "/application"])("returns false for %s", (pathname) => {
    expect(isAppPath(pathname)).toBe(false);
  });
});

describe("app route contract", () => {
  test("exports the app href and mount directory from the shared contract", () => {
    expect(appHref).toBe("/app");
    expect(appMountDir).toBe("app");
    expect(requiredOutputs).toContain(`${appMountDir}/index.html`);
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
    for (const output of [
      "index.html",
      `${appMountDir}/index.html`,
      "sw.js",
      "robots.txt",
    ]) {
      expect(requiredOutputs).toContain(output);
    }
  });
});

describe("site server routing", () => {
  test("serves root, app shell fallback, app assets, and service worker headers", async () => {
    const root = await createFixtureRoot();

    await withServer(root, async (origin) => {
      await expect((await fetch(`${origin}/`)).text()).resolves.toBe("web");
      await expect((await fetch(`${origin}${appHref}/deep`)).text()).resolves.toBe(
        "app"
      );
      await expect(
        (await fetch(`${origin}${appHref}/asset.js`)).text()
      ).resolves.toBe("asset");

      const sw = await fetch(`${origin}${serviceWorker.path}`);
      expect(sw.headers.get("cache-control")).toBe(serviceWorker.cacheControl);
      await expect(sw.text()).resolves.toBe("sw");
    });
  });

  test("handles HEAD, unsupported methods, 404s, and malformed paths", async () => {
    const root = await createFixtureRoot();

    await withServer(root, async (origin) => {
      expect((await fetch(`${origin}/`, { method: "HEAD" })).status).toBe(200);
      expect((await fetch(`${origin}/`, { method: "POST" })).status).toBe(405);
      expect((await fetch(`${origin}/missing`)).status).toBe(404);
      expect((await fetch(`${origin}/%E0%A4%A`)).status).toBe(400);
    });
  });
});
