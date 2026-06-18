import { createAuth } from "./auth/auth";
import { createApp } from "./app";
import { createDb } from "./db/client";
import { readEnv, requireEnv } from "./env";

const env = readEnv(process.env);
const db = createDb(requireEnv(env.databaseUrl, "DATABASE_URL"));
const auth = createAuth(db, env);
const app = createApp({ db, auth, env });

Bun.serve({
  fetch: app.fetch,
  port: env.port,
  hostname: env.host,
});

console.log(`api listening on http://${env.host}:${env.port}`);
