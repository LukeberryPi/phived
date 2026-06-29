# 010 — Write path, merge, account deletion

## Goal

Complete sync. Entitled users' edits write through the API to Postgres, stream
back via Electric, and reconcile optimistically (TanStack DB). First sign-in
silently union-merges local data into the cloud. Account deletion hard-deletes
cloud data. A lapsed subscription reverts the app to local-only without touching
local data. After this, paid cross-device sync is fully live and the sync flag is
turned on.

> Depends on [009] (read sync, collections, the `/sync` proxy, app-data
> schema). Re-read ADR 0004 and ADR 0005 before starting.

## Decisions (do not deviate)

- **Write contract** (TanStack DB + Electric): UI mutates a collection
  (instant optimistic) → the collection's `onInsert/onUpdate/onDelete` calls our
  `/api/sync/*` mutation → the API writes Postgres in one transaction and returns
  the **txid** → client `awaitTxId(txid)` → optimistic state drops when the change
  streams back through Electric.
- **Every mutation enforces** session + `isEntitled` + `user_id` ownership
  (defense in depth even though the read proxy already scopes). Client gating is
  cosmetic.
- **Task ordering = fractional index** (e.g. `fractional-indexing`) stored in
  `task.order`; inserts/reorders compute an order between neighbours. This is the
  ordering deferred in [007].
- **Deletes = soft-delete tombstones** (`deleted_at`) so offline deletes merge
  deterministically; a server-side job purges old tombstones.
- **Completion** = insert a `task_history` row + soft-delete the task in one
  transaction (mirrors today's `completeTask`).
- **First sign-in merge** = silent union (ADR 0005): upload all non-empty local
  tasks (assign fractional `order` from current array position), lists, and
  history under the user's `user_id`; then make the synced collections the live
  store. Duplicate same-named lists are accepted.
- **Lapse** = mutations return 402 when `!isEntitled`; the client falls back to
  the localStorage store and shows a "sync paused" hint; the cloud copy is
  retained (ADR 0005). Local data is never touched.
- **Account deletion** = `DELETE /api/account` hard-deletes the user's
  `list`/`task`/`task_history`/`entitlement` rows (+ Better Auth user + Polar
  customer per the plugin), behind a confirm.

## Scope (touch only these)

New:

- `apps/server/src/sync-write.ts` — mutation endpoints (lists, tasks, history,
  complete, reorder), each returning `{ txid }`.
- `apps/server/src/account.ts` — account deletion.
- `apps/app/src/sync/mutations.ts` — collection write handlers + fractional
  ordering; `apps/app/src/sync/merge.ts` — first-sign-in union upload.
- tombstone purge (cron/route + notes).

Edited:

- `apps/app` canvas context: in sync mode (entitled + flag) route mutations
  through the collections; otherwise localStorage (unchanged).
- `apps/app` settings UI: subscription management (portal), account deletion,
  sign out.
- flip the sync flag **on** (ship).

## Drift check (run first)

```bash
rg -n "electricCollectionOptions" apps/app/src/sync || echo "DRIFT: 0003 collections missing"
rg -n "/sync" apps/server/src || echo "DRIFT: 0003 proxy missing"
bun run check
```

If [009] artifacts are absent, STOP.

## Steps (in order)

1. **Mutation API (`/api/sync/*`).** Endpoints: list upsert/delete; task
   upsert/delete; reorder (writes `order`); complete (history insert + task
   soft-delete); history delete/clear. Each: auth + entitlement + ownership;
   write in a transaction; return `{ txid }` from
   `SELECT pg_current_xact_id()::xid::text` (a.k.a. `txid_current()`) **in the
   same transaction / on the same direct connection** — this is the value
   TanStack DB awaits.
2. **Client write handlers.** Add `onInsert/onUpdate/onDelete` to the [009]
   collections, calling the API and returning `{ txid }`; then `awaitTxId`. In
   sync mode, replace index-based local edits with id + order operations (the
   [007] task identity makes this clean).
3. **Fractional ordering.** Add the lib; compute `order` on insert/reorder; strip
   empty padding before any upload/write (padding is view-only, never synced).
4. **First sign-in merge (`merge.ts`).** On the first authenticated load that has
   local content, union-upload local lists/tasks/history (fresh `order` values),
   then switch the live store to the collections. Silent; accept duplicate lists.
5. **Lapse handling.** Mutations 402 when not entitled; client falls back to the
   localStorage store and surfaces "sync paused — resubscribe"; local data
   untouched; cloud retained.
6. **Account deletion.** Confirm dialog → `DELETE /api/account` → hard-delete
   cloud rows + auth user + Polar customer; sign out; app returns to local-only.
7. **Ship.** Turn the sync flag on. Verify the full multi-device loop.

## Verification

- Two browsers, same entitled user: an edit on A appears on B within stream
  latency; an offline edit on A reconciles on reconnect with **no lost tasks**;
  concurrent edits to _different_ tasks both survive; the _same_ task's text edit
  resolves last-write-wins.
- Non-entitled: mutations return 402; the app stays local; no data loss.
- First sign-in with local data uploads it; a fresh device downloads it.
- Account deletion removes all cloud rows (verify in Postgres) and the app
  reverts to local-only.
- `bun run check` green; `apps/app` tests updated for sync-mode mutations.

## STOP conditions

- `awaitTxId` never resolves (sync stalls) → almost always a pooled-connection or
  `pg_current_xact_id` mismatch; STOP and confirm the API writes on a **direct**
  connection and returns the correct txid before continuing.
- Any path can read or write across `user_id` → STOP; security blocker.
- Any concurrent scenario can lose a non-empty task → STOP; this is the exact
  correctness guarantee [007] existed to enable.

## Out of scope

Per-field (vs row-level) LWW refinement for list `tag`/`x`/`y`/`width`;
real-time presence; sharing/multiplayer; syncing viewport or theme (intentionally
device-local).
