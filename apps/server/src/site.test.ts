import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  appMountDir,
  securityHeaders,
  serviceWorker,
} from "../../../scripts/site-contract.mjs";
import { createSiteApp } from "./site";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true }))
  );
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "phived-server-"));
  tempRoots.push(root);
  await mkdir(path.join(root, appMountDir), { recursive: true });
  await writeFile(path.join(root, "index.html"), "web");
  await writeFile(path.join(root, "robots.txt"), "robots");
  await writeFile(path.join(root, "sw.js"), "sw");
  await writeFile(path.join(root, appMountDir, "index.html"), "app");
  await writeFile(path.join(root, appMountDir, "asset.js"), "asset");
  return root;
}

describe("server site contract", () => {
  test("serves root, app shell fallback, app assets, and the service worker header", async () => {
    const app = createSiteApp(await createFixtureRoot());

    await expect((await app.request("/")).text()).resolves.toBe("web");
    await expect((await app.request("/app/deep")).text()).resolves.toBe("app");
    await expect((await app.request("/app/asset.js")).text()).resolves.toBe(
      "asset"
    );

    const sw = await app.request(serviceWorker.path);
    expect(sw.headers.get("cache-control")).toBe(serviceWorker.cacheControl);
    await expect(sw.text()).resolves.toBe("sw");
  });

  test("applies the baseline security headers to every response", async () => {
    const app = createSiteApp(await createFixtureRoot());

    const res = await app.request("/");
    for (const name of Object.keys(securityHeaders)) {
      expect(res.headers.get(name)).toBe(
        securityHeaders[name as keyof typeof securityHeaders]
      );
    }

    const missing = await app.request("/missing");
    expect(missing.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  test("handles HEAD, unsupported methods, 404s, and malformed paths", async () => {
    const app = createSiteApp(await createFixtureRoot());

    expect((await app.request("/", { method: "HEAD" })).status).toBe(200);

    const post = await app.request("/", { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.get("allow")).toBe("GET, HEAD");

    expect((await app.request("/missing")).status).toBe(404);
    expect((await app.request("/%E0%A4%A")).status).toBe(400);
  });
});
