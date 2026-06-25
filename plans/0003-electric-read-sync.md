# 0003 — Electric read sync + gatekeeper

## Goal

Entitled, signed-in users stream **their own** cloud rows (lists, tasks, history)
into the app through a **private** Electric service fronted by an authorizing
proxy on the single origin. **Reads only** in this phase — editing still uses
localStorage; the write path is [0004]. Anonymous and non-entitled users are
completely unaffected.

> Depends on [0002] (Postgres + server + Better Auth + entitlement) and on
> Postgres logical replication being available.

## Decisions (do not deviate)

- Deploy Electric (`electric-sql/electric`) as a **private** Railway service:
  `DATABASE_URL` = the **direct** Postgres connection, `ELECTRIC_SECRET` set,
  a **persistent volume** for Electric state, **no public domain**.
- **Proxy auth** pattern (not gatekeeper tokens). The server's `/sync/*` route
  validates the Better Auth session + `isEntitled`, **injects `where user_id =
  '<me>'`**, appends `secret=ELECTRIC_SECRET`, and reverse-proxies to private
  Electric. The client never sees the secret and cannot widen the shape.
- App-data schema is created here, every table carrying `user_id` for shape
  scoping. `task` gets the fractional `order` (text) deferred from [0001] and a
  soft-delete `deleted_at`.
- Client uses `@electric-sql/client` + TanStack DB `electricCollectionOptions`
  pointed at the same-origin `/sync/v1/shape`. Read mapping: order cloud tasks by
  `order` → array position; re-synthesize empty padding client-side (the [0001]
  rule). 
- Keep this phase **flag-gated**: when entitled + sync flag on, the canvas reads
  from the synced collections; editing stays local (or write-through disabled) so
  we never ship a "looks editable but isn't synced" state to real users. The
  anonymous path stays 100% localStorage.

## External prerequisites

- `wal_level=logical` already enabled on Postgres per [0002] (preferred: the
  Postgres service's Custom Start Command flags). A good starting point is
  Railway's official **"Deploy ElectricSQL with your own Postgres"** template.
- Electric service on Railway (private): `DATABASE_URL` (the **direct**,
  non-pooled URL), `ELECTRIC_SECRET`, a **persistent volume**
  (`ELECTRIC_STORAGE_DIR`). Confirm it creates its publication/replication slot
  and is reachable only via private networking.
- Server env += `ELECTRIC_URL` (internal/private), `ELECTRIC_SECRET`.

## Scope (touch only these)

New:
- DB migration: `list`, `task`, `task_history` (DDL below).
- `apps/server/src/sync-proxy.ts` — the `/sync/*` authorizing reverse proxy.
- `apps/app/src/sync/collections.ts` — Electric collections; plus the flag-gated
  read-swap glue in the canvas context.

Edited:
- `apps/server` route table (mount `/sync/*` with auth + entitlement
  middleware).
- Infra notes / `railway.json` for the Electric service (or document here for
  the operator).

Do **not**: implement any write handlers/mutations, merge, or account deletion
([0004]).

## Drift check (run first)

```bash
rg -n "entitlement" apps/server/src || echo "DRIFT: 0002 not in place"
psql "$DATABASE_URL" -c '\dt' | rg -n '"?user"?|entitlement' || echo "auth/entitlement tables missing"
bun run check
```

If [0002] artifacts are absent, STOP — this plan builds on them.

## Steps (in order)

1. **App-data schema.** Apply the DDL below. Indexes on `user_id` (and
   `task.list_id`).
2. **Deploy Electric (private).** Against the direct Postgres URL; set
   `ELECTRIC_SECRET`; attach a volume; confirm publication/slot creation and
   that it has **no** public ingress.
3. **Authorizing proxy `/sync/*`.** Middleware: require a valid session and
   `isEntitled(getEntitlement(user.id).status)`; else 401/403. For shape
   requests: restrict `table` to the allow-list (`list`, `task`,
   `task_history`); **force** `where = "user_id = '<me>'"` (ignore/override any
   client-supplied `where`); append `secret=ELECTRIC_SECRET`; reverse-proxy to
   `ELECTRIC_URL`, streaming the response (support Electric's long-poll/live
   mode and pass through the relevant offset/handle/cursor query params).
4. **Client collections (read-only).** Define `listCollection`,
   `taskCollection`, `historyCollection` via `electricCollectionOptions({ id,
   schema, getKey: (r) => r.id, shapeOptions: { url: "/sync/v1/shape", params: {
   table } } })`. No `onInsert/onUpdate/onDelete` yet.
5. **Read swap (flag-gated).** When entitled + sync flag on, render the canvas
   from the collections: group `task` rows by `list_id`, sort by `order`, map to
   the in-memory `Task[]` (Phase 1 shape) and re-pad empties; lists from `list`;
   history from `task_history`. Editing stays local in this phase. Anonymous /
   non-entitled path unchanged.
6. **Manual seed + live test.** Insert rows for a test user directly in
   Postgres; confirm they stream to the client and update live on change.

DDL:

```sql
create table list (
  id uuid primary key,
  user_id text not null references "user"(id) on delete cascade,
  tag text not null default '',
  x double precision not null,
  y double precision not null,
  width double precision,
  updated_at timestamptz not null default now()
);
create index on list (user_id);

create table task (
  id uuid primary key,
  list_id uuid not null references list(id) on delete cascade,
  user_id text not null references "user"(id) on delete cascade,
  text text not null default '',
  "order" text not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on task (user_id);
create index on task (list_id);

create table task_history (
  id uuid primary key,
  user_id text not null references "user"(id) on delete cascade,
  text text not null,
  completed_at timestamptz not null,
  list_id uuid,
  list_tag text
);
create index on task_history (user_id);
```

## Verification

- Anonymous / non-entitled: `/sync/*` → 401/403; the app is exactly today's
  localStorage app.
- Entitled test user: collections populate from seeded rows; a manual
  `insert`/`update`/`delete` in Postgres streams to the client live.
- **Isolation:** a crafted `/sync` request naming another table or a different
  `user_id` is rejected or forcibly scoped to the caller — no cross-user data is
  ever returned.
- Electric is not reachable from the public internet (direct curl fails); only
  via the server proxy.
- `bun run check` green.

## STOP conditions

- Electric can't connect/replicate → re-check the [0002] checklist before
  stopping: `SHOW wal_level` is `logical` (set via Custom Start Command flags so
  it survives restarts), the role has `REPLICATION`, the URL is the **direct**
  (non-pooled) connection, and a persistent volume is attached. STOP only if all
  of these hold and replication still fails.
- The proxy cannot guarantee `user_id` scoping (any cross-user leakage) → STOP;
  security blocker, do not ship.
- You find you must implement writes to make the read experience usable for real
  users → that's [0004]; keep this phase flag-gated instead.

## Out of scope

The write path, optimistic mutations, fractional-order *writes*, first-sign-in
merge, account deletion ([0004]).
