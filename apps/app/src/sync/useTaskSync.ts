import { useCallback, useEffect, useRef } from "react";
import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";
import { parseTaskHistory, parseTaskLists } from "src/utils/persistence";
import type { AuthMode } from "src/auth/AuthContext";

type TaskSnapshot = {
  canvasLists: TaskLists;
  taskHistory: TaskHistory;
};

type ServerDocument = TaskSnapshot & {
  version: number;
};

type UseTaskSyncArgs = {
  mode: AuthMode;
  lists: TaskLists;
  taskHistory: TaskHistory;
  setLists: (value: TaskLists | ((prev: TaskLists) => TaskLists)) => void;
  setTaskHistory: (
    value: TaskHistory | ((prev: TaskHistory) => TaskHistory)
  ) => void;
};

const SYNC_VERSION_KEY = "phived.sync.version";
const CLOBBER_BACKUP_KEY = "canvasLists.backup";
const SYNC_DEBOUNCE_MS = 1500;

export function useTaskSync({
  mode,
  lists,
  taskHistory,
  setLists,
  setTaskHistory,
}: UseTaskSyncArgs) {
  const snapshotRef = useRef<TaskSnapshot>({ canvasLists: lists, taskHistory });
  const versionRef = useRef<number | null>(readStoredVersion());
  const pushTimerRef = useRef<number | null>(null);
  const pushingRef = useRef(false);

  snapshotRef.current = { canvasLists: lists, taskHistory };

  const applyServerDocument = useCallback(
    (document: ServerDocument | null) => {
      if (!document) {
        return;
      }

      backupCurrentSnapshot();
      setLists(
        parseTaskLists(document.canvasLists, snapshotRef.current.canvasLists)
      );
      setTaskHistory(
        parseTaskHistory(document.taskHistory, snapshotRef.current.taskHistory)
      );
      versionRef.current = document.version;
      localStorage.setItem(SYNC_VERSION_KEY, String(document.version));
    },
    [setLists, setTaskHistory]
  );

  const pull = useCallback(async () => {
    if (mode !== "pro") {
      return;
    }

    const response = await fetch("/api/tasks", { credentials: "include" });
    if (response.status === 401) {
      return;
    }

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      document: ServerDocument | null;
    };
    applyServerDocument(payload.document);
  }, [applyServerDocument, mode]);

  const push = useCallback(
    async (keepalive = false) => {
      if (mode !== "pro" || pushingRef.current) {
        return;
      }

      pushingRef.current = true;
      try {
        const response = await fetch("/api/tasks", {
          method: "PUT",
          credentials: "include",
          keepalive,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blob: snapshotRef.current,
            baseVersion: versionRef.current,
          }),
        });

        if (response.status === 409) {
          const conflict = (await response.json()) as {
            document: ServerDocument;
          };
          applyServerDocument(conflict.document);
          return;
        }

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { document: ServerDocument };
        applyServerDocument(payload.document);
      } finally {
        pushingRef.current = false;
      }
    },
    [applyServerDocument, mode]
  );

  useEffect(() => {
    if (mode !== "pro") {
      return;
    }

    void pull().then(() => push());
  }, [mode, pull, push]);

  useEffect(() => {
    if (mode !== "pro") {
      return;
    }

    if (pushTimerRef.current) {
      window.clearTimeout(pushTimerRef.current);
    }

    pushTimerRef.current = window.setTimeout(
      () => void push(),
      SYNC_DEBOUNCE_MS
    );

    return () => {
      if (pushTimerRef.current) {
        window.clearTimeout(pushTimerRef.current);
      }
    };
  }, [lists, mode, push, taskHistory]);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        void push(true);
      }
    };
    const onPageHide = () => void push(true);
    const onOnline = () => void pull().then(() => push());
    const onStorage = (event: StorageEvent) => {
      if (event.key === "canvasLists" && event.newValue) {
        setLists(
          parseTaskLists(
            JSON.parse(event.newValue),
            snapshotRef.current.canvasLists
          )
        );
      }

      if (event.key === "taskHistory" && event.newValue) {
        setTaskHistory(
          parseTaskHistory(
            JSON.parse(event.newValue),
            snapshotRef.current.taskHistory
          )
        );
      }
    };

    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", onOnline);
    window.addEventListener("storage", onStorage);

    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("storage", onStorage);
    };
  }, [pull, push, setLists, setTaskHistory]);
}

function readStoredVersion() {
  const raw = localStorage.getItem(SYNC_VERSION_KEY);
  const parsed = raw ? Number(raw) : null;
  return Number.isInteger(parsed) ? parsed : null;
}

function backupCurrentSnapshot() {
  const backup = {
    canvasLists: localStorage.getItem("canvasLists"),
    taskHistory: localStorage.getItem("taskHistory"),
    at: new Date().toISOString(),
  };

  localStorage.setItem(CLOBBER_BACKUP_KEY, JSON.stringify(backup));
}
