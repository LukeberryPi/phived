// The background sync engine (ADR 0004). Local stays the in-session source of
// truth (instant localStorage writes via useLocalStorage); this hook mirrors
// the { canvasLists, taskHistory } document to the server when the User is Pro:
//   - adoption on first entry to Pro (seed vs server-authoritative);
//   - debounced push on change, plus a keepalive flush when the tab hides;
//   - pull on load / focus / reconnect, reconciled (union history, LWW canvas);
//   - optimistic concurrency via a version counter (409 -> reconcile + retry);
//   - offline backoff, multi-tab coherence, and a silent-401 pause.
import { useEffect, useRef } from "react";
import {
  fetchTasks,
  putTasks,
  SyncAuthError,
  type ServerDocument,
} from "src/lib/syncApi";
import type { Mode, SyncBridge, SyncStatus } from "src/types/account";
import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import { buildInitialLists } from "src/utils/canvas";
import { resolveAdoption, reconcileWithServer } from "src/utils/sync";
import {
  clearPreSignIn,
  clearServerVersion,
  getServerVersion,
  readPreSignIn,
  setServerVersion,
  snapshotClobberBackup,
  snapshotPreSignIn,
  SYNC_KEYS,
} from "src/utils/syncStorage";

const PUSH_DEBOUNCE_MS = 1500;
const BACKOFF_BASE_MS = 2000;
const BACKOFF_MAX_MS = 60_000;

interface UseTaskSyncParams {
  mode: Mode;
  lists: TaskLists;
  taskHistory: TaskHistory;
  setLists: (value: TaskLists) => void;
  setTaskHistory: (value: TaskHistory) => void;
  setSyncStatus: (status: SyncStatus) => void;
  onAuthError: () => void;
  registerSyncBridge: (bridge: SyncBridge | null) => void;
}

function serialize(doc: ServerDocument): string {
  return JSON.stringify(doc);
}

export function useTaskSync({
  mode,
  lists,
  taskHistory,
  setLists,
  setTaskHistory,
  setSyncStatus,
  onAuthError,
  registerSyncBridge,
}: UseTaskSyncParams): void {
  const listsRef = useRef(lists);
  listsRef.current = lists;
  const historyRef = useRef(taskHistory);
  historyRef.current = taskHistory;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const adoptedRef = useRef(false);
  const pausedRef = useRef(false);
  const lastSyncedRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(BACKOFF_BASE_MS);

  // Keep mutable handles to the React setters so listeners don't re-subscribe.
  const applyRef = useRef<(doc: ServerDocument) => void>(() => {});
  applyRef.current = (doc) => {
    setLists(doc.canvasLists as TaskLists);
    setTaskHistory(doc.taskHistory as TaskHistory);
    lastSyncedRef.current = serialize(doc);
  };

  const setStatusRef = useRef(setSyncStatus);
  setStatusRef.current = setSyncStatus;
  const onAuthErrorRef = useRef(onAuthError);
  onAuthErrorRef.current = onAuthError;

  // Stable engine functions (read everything from refs).
  const engineRef = useRef<{
    currentDoc: () => ServerDocument;
    push: (opts?: { keepalive?: boolean }) => Promise<void>;
    pull: () => Promise<void>;
    adopt: () => Promise<void>;
    pause: () => void;
    scheduleDebouncedPush: () => void;
  } | null>(null);

  if (!engineRef.current) {
    const currentDoc = (): ServerDocument => ({
      canvasLists: listsRef.current,
      taskHistory: historyRef.current,
    });

    const pause = () => {
      pausedRef.current = true;
      setStatusRef.current("paused");
      onAuthErrorRef.current();
    };

    const push = async (opts: { keepalive?: boolean } = {}): Promise<void> => {
      if (pausedRef.current || modeRef.current !== "pro") {
        return;
      }
      const doc = currentDoc();
      const base = getServerVersion();
      setStatusRef.current("syncing");
      try {
        const result = await putTasks(doc, base, opts);
        if (result.ok) {
          setServerVersion(result.version);
          lastSyncedRef.current = serialize(result.document);
          backoffRef.current = BACKOFF_BASE_MS;
          setStatusRef.current("idle");
          return;
        }
        if (result.conflict) {
          if (result.document) {
            snapshotClobberBackup();
            const reconciled = reconcileWithServer(doc, result.document);
            applyRef.current(reconciled);
            setServerVersion(result.version);
            // Persist the unioned history back under the fresh version.
            const retry = await putTasks(reconciled, result.version);
            if (retry.ok) {
              setServerVersion(retry.version);
              lastSyncedRef.current = serialize(retry.document);
            }
          } else {
            setServerVersion(result.version);
          }
          setStatusRef.current("idle");
          return;
        }
        setStatusRef.current("error");
      } catch (error) {
        if (error instanceof SyncAuthError) {
          pause();
          return;
        }
        setStatusRef.current("offline");
        scheduleBackoff();
      }
    };

    const scheduleBackoff = () => {
      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 2, BACKOFF_MAX_MS);
      window.setTimeout(() => {
        void pull().then(() => push());
      }, delay);
    };

    const pull = async (): Promise<void> => {
      if (pausedRef.current || modeRef.current !== "pro") {
        return;
      }
      try {
        const server = await fetchTasks();
        const localVersion = getServerVersion();
        if (server.document && server.version > localVersion) {
          const local = currentDoc();
          snapshotClobberBackup();
          const reconciled = reconcileWithServer(local, server.document);
          applyRef.current(reconciled);
          setServerVersion(server.version);
          if (
            reconciled.taskHistory.length !== server.document.taskHistory.length
          ) {
            await push();
          }
        }
        backoffRef.current = BACKOFF_BASE_MS;
        setStatusRef.current("idle");
      } catch (error) {
        if (error instanceof SyncAuthError) {
          pause();
          return;
        }
        setStatusRef.current("offline");
      }
    };

    const adopt = async (): Promise<void> => {
      if (adoptedRef.current) {
        return;
      }
      adoptedRef.current = true;
      snapshotPreSignIn();
      setStatusRef.current("syncing");
      try {
        const server = await fetchTasks();
        const local = currentDoc();
        const result = resolveAdoption(local, server);
        if (result.branch === "adopt-server") {
          snapshotClobberBackup();
          applyRef.current(result.next);
        } else {
          lastSyncedRef.current = serialize(result.next);
        }
        setServerVersion(result.baseVersion);
        if (result.shouldPush) {
          await push();
        } else {
          setStatusRef.current("idle");
        }
      } catch (error) {
        if (error instanceof SyncAuthError) {
          pause();
          return;
        }
        // Allow a later retry if adoption could not complete.
        adoptedRef.current = false;
        setStatusRef.current("offline");
      }
    };

    const scheduleDebouncedPush = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        void push();
      }, PUSH_DEBOUNCE_MS);
    };

    engineRef.current = {
      currentDoc,
      push,
      pull,
      adopt,
      pause,
      scheduleDebouncedPush,
    };
  }

  // Register the sign-out bridge: clear local, restore the pre-sign-in snapshot.
  useEffect(() => {
    const bridge: SyncBridge = {
      restoreLocalAfterSignOut: () => {
        const snapshot = readPreSignIn();
        if (snapshot?.canvasLists) {
          try {
            setLists(JSON.parse(snapshot.canvasLists) as TaskLists);
          } catch {
            setLists(buildInitialLists());
          }
        } else {
          setLists(buildInitialLists());
        }
        if (snapshot?.taskHistory) {
          try {
            setTaskHistory(JSON.parse(snapshot.taskHistory) as TaskHistory);
          } catch {
            setTaskHistory([]);
          }
        } else {
          setTaskHistory([]);
        }
        clearPreSignIn();
        clearServerVersion();
        adoptedRef.current = false;
        pausedRef.current = false;
        lastSyncedRef.current = null;
      },
    };
    registerSyncBridge(bridge);
    return () => registerSyncBridge(null);
  }, [registerSyncBridge, setLists, setTaskHistory]);

  // Drive adoption on entry to Pro; reset when leaving Pro (degrade, not destroy).
  useEffect(() => {
    if (mode === "pro") {
      pausedRef.current = false;
      void engineRef.current?.adopt();
    } else {
      adoptedRef.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    }
  }, [mode]);

  // Debounced push on local change (skipped when the change is an echo of what
  // we just synced/applied).
  useEffect(() => {
    if (mode !== "pro" || !adoptedRef.current || pausedRef.current) {
      return;
    }
    const current = serialize({ canvasLists: lists, taskHistory });
    if (current === lastSyncedRef.current) {
      return;
    }
    engineRef.current?.scheduleDebouncedPush();
  }, [lists, taskHistory, mode]);

  // Pull on focus / reconnect; keepalive flush + final push when the tab hides.
  useEffect(() => {
    if (mode !== "pro") {
      return;
    }

    const onFocus = () => void engineRef.current?.pull();
    const onOnline = () =>
      void engineRef.current?.pull().then(() => engineRef.current?.push());
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        void engineRef.current?.push({ keepalive: true });
      }
    };
    const onPageHide = () => void engineRef.current?.push({ keepalive: true });

    // Multi-tab coherence: when another tab writes the live keys, mirror them
    // into this tab's state so the canvas stays consistent.
    const onStorage = (event: StorageEvent) => {
      if (event.key === SYNC_KEYS.liveLists && event.newValue) {
        try {
          setLists(JSON.parse(event.newValue) as TaskLists);
        } catch {
          // ignore malformed cross-tab payloads
        }
      }
      if (event.key === SYNC_KEYS.liveHistory && event.newValue) {
        try {
          setTaskHistory(JSON.parse(event.newValue) as TaskHistory);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("storage", onStorage);
    };
  }, [mode, setLists, setTaskHistory]);
}
