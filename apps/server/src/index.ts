// Production entrypoint: bind the composed Hono app to Bun.
import { host, ports } from "../../../scripts/site-contract.mjs";
import { createServerApp } from "./app";
import { getServerMode } from "./env";

const app = await createServerApp(getServerMode());

const server = Bun.serve({
  port: ports.server,
  hostname: host,
  fetch: app.fetch,
});

console.log(`phived server: http://${server.hostname}:${server.port}`);
