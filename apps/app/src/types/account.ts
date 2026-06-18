import type { MeResponse } from "src/lib/syncApi";

/**
 * The three runtime modes (ADR 0004). `free` is anonymous local-only; `pro` is
 * signed-in and entitled with background sync; `localOnly` is signed-in but not
 * entitled — it behaves like free without discarding any data.
 */
export type Mode = "free" | "pro" | "localOnly";

/** Background sync engine status, surfaced for subtle UI affordances. */
export type SyncStatus = "idle" | "syncing" | "offline" | "paused" | "error";

export type AuthUser = NonNullable<MeResponse["user"]>;
export type Entitlement = NonNullable<MeResponse["entitlement"]>;

/**
 * Bridge the sync engine (which owns task state) registers with the auth layer
 * so account actions that mutate local data can be driven from the header.
 */
export interface SyncBridge {
  /** Explicit sign-out: clear local and restore the pre-sign-in snapshot. */
  restoreLocalAfterSignOut: () => void;
}

export interface AuthContextValue {
  mode: Mode;
  user: AuthUser | null;
  entitlement: Entitlement | null;
  syncStatus: SyncStatus;
  /** True after a silent 401: keep local, sync paused, prompt re-sign-in. */
  needsReSignIn: boolean;
  ready: boolean;
  signInWithGoogle: () => Promise<void>;
  beginUpgrade: (plan?: "monthly" | "annual") => Promise<void>;
  openBillingPortal: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setSyncStatus: (status: SyncStatus) => void;
  setNeedsReSignIn: (value: boolean) => void;
  registerSyncBridge: (bridge: SyncBridge | null) => void;
}
