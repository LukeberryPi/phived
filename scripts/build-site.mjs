#!/usr/bin/env node
// Assemble the combined phived.com deployment into ./dist, which the static host
// serves. The routing contract lives in site-contract.mjs.
import { spawnSync } from "node:child_process";
import { cp, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  appBasePath,
  appMountDir,
  paths,
  requiredOutputs,
} from "./site-contract.mjs";

build("web (astro)", ["--cwd", "apps/web", "build"]);
build("app (vite, base=/app/)", ["--cwd", "apps/app", "build"]);

console.log("assembling combined output into dist/");
await rm(paths.dist, { recursive: true, force: true });
await cp(paths.webDist, paths.dist, { recursive: true });
await cp(paths.appDist, path.join(paths.dist, appMountDir), { recursive: true });

await assertRequiredOutputs();
await assertAppAssetBase();
await assertServiceWorkerKillSwitch();

console.log("site built. root=web, /app=app, /sw.js=root kill-switch");

function build(label, args) {
  console.log(`building ${label}...`);
  const result = spawnSync("bun", args, { cwd: paths.root, stdio: "inherit" });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function assertRequiredOutputs() {
  for (const relativePath of requiredOutputs) {
    const target = path.join(paths.dist, relativePath);
    const targetStat = await stat(target).catch(() => null);

    if (!targetStat?.isFile()) {
      fail(`missing required build output: ${relativePath}`);
    }
  }
}

async function assertAppAssetBase() {
  const appHtml = await readFile(
    path.join(paths.dist, appMountDir, "index.html"),
    "utf8"
  );

  if (!appHtml.includes(`"${appBasePath}/assets/`)) {
    fail(`app build is not using ${appBasePath}/assets/ asset URLs`);
  }
}

async function assertServiceWorkerKillSwitch() {
  const sw = await readFile(path.join(paths.dist, "sw.js"), "utf8");

  if (!sw.trim()) {
    fail("sw.js is empty");
  }

  if (sw.includes("<html")) {
    fail("sw.js must not be HTML");
  }

  for (const token of ["skipWaiting", "caches.keys", "registration.unregister"]) {
    if (!sw.includes(token)) {
      fail(`sw.js is missing kill-switch token: ${token}`);
    }
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
