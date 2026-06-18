// Carries forward the scripts/site-contract.test.mjs routing assertions against
// the Hono port (ADR 0004): the contract must not drift when serving moved from
// the node static server into apps/api middleware.
import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  appMountDir,
  securityHeaders,
} from "../../../scripts/site-contract.mjs";
import { createStaticApp } from "./site-static.ts";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true }))
  );
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "phived-api-site-"));
  tempRoots.push(root);
  await mkdir(path.join(root, appMountDir), { recursive: true });
  await writeFile(path.join(root, "index.html"), "web");
  await writeFile(path.join(root, "robots.txt"), "robots");
  await writeFile(path.join(root, "sw.js"), "sw");
  await writeFile(path.join(root, appMountDir, "index.html"), "app");
  await writeFile(path.join(root, appMountDir, "asset.js"), "asset");
  return root;
}

describe("static app routing", () => {
  test("serves root, app shell fallback, app assets, and sw headers", async () => {
    const root = await createFixtureRoot();
    const app = createStaticApp(root);

    expect(await (await app.request("/")).text()).toBe("web");
    expect(await (await app.request("/app/deep")).text()).toBe("app");
    expect(await (await app.request("/app/asset.js")).text()).toBe("asset");

    const sw = await app.request("/sw.js");
    expect(sw.headers.get("cache-control")).toBe(
      "public, max-age=0, must-revalidate"
    );
    expect(await sw.text()).toBe("sw");
  });

  test("applies the baseline security headers to every response", async () => {
    const root = await createFixtureRoot();
    const app = createStaticApp(root);
    const res = await app.request("/");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Content-Security-Policy")).toBe(
      securityHeaders["Content-Security-Policy"]
    );
  });

  test("handles HEAD, 405 writes, 404s, and malformed paths", async () => {
    const root = await createFixtureRoot();
    const app = createStaticApp(root);

    expect((await app.request("/", { method: "HEAD" })).status).toBe(200);
    expect((await app.request("/", { method: "POST" })).status).toBe(405);
    expect((await app.request("/missing")).status).toBe(404);
    expect((await app.request("/%E0%A4%A")).status).toBe(400);
  });

  test("when api is mounted, writes to non-api paths are still 405", async () => {
    const root = await createFixtureRoot();
    const app = createStaticApp(root, { apiMounted: true });
    expect((await app.request("/", { method: "POST" })).status).toBe(405);
    expect((await app.request("/api/unknown")).status).toBe(404);
  });
});
