// Storage side effects for the sync engine (ADR 0004). The live task keys
// ("canvasLists", "taskHistory") are written by useLocalStorage; these helpers
// manage the auxiliary keys: clobber backups (so a last-write-wins canvas
// overwrite is recoverable), the pre-sign-in snapshot (restored on explicit
// sign-out), and the mirrored server version.
const LIVE_LISTS = "canvasLists";
const LIVE_HISTORY = "taskHistory";
const LISTS_BACKUP = "canvasLists.backup";
const HISTORY_BACKUP = "taskHistory.backup";
const PRE_SIGN_IN = "phived.preSignIn";
const SERVER_VERSION = "phived.sync.version";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota / private-mode failures are non-fatal for backups.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Copy the live canvas + history to their `.backup` keys before a clobber. */
export function snapshotClobberBackup(): void {
  const lists = read(LIVE_LISTS);
  const history = read(LIVE_HISTORY);
  if (lists !== null) {
    write(LISTS_BACKUP, lists);
  }
  if (history !== null) {
    write(HISTORY_BACKUP, history);
  }
}

/** Snapshot the live state as it was before authenticating, once. */
export function snapshotPreSignIn(): void {
  if (read(PRE_SIGN_IN) !== null) {
    return;
  }
  write(
    PRE_SIGN_IN,
    JSON.stringify({
      canvasLists: read(LIVE_LISTS),
      taskHistory: read(LIVE_HISTORY),
    })
  );
}

export interface PreSignInSnapshot {
  canvasLists: string | null;
  taskHistory: string | null;
}

export function readPreSignIn(): PreSignInSnapshot | null {
  const raw = read(PRE_SIGN_IN);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as PreSignInSnapshot;
  } catch {
    return null;
  }
}

export function clearPreSignIn(): void {
  remove(PRE_SIGN_IN);
}

export function getServerVersion(): number {
  const raw = read(SERVER_VERSION);
  const parsed = raw === null ? 0 : Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setServerVersion(version: number): void {
  write(SERVER_VERSION, String(version));
}

export function clearServerVersion(): void {
  remove(SERVER_VERSION);
}

export const SYNC_KEYS = {
  liveLists: LIVE_LISTS,
  liveHistory: LIVE_HISTORY,
} as const;
