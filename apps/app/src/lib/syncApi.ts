// Thin fetch helpers for the same-origin Pro API. All requests are first-party
// (the session cookie rides along automatically), so there is no CORS and no
// bearer token. Server contract is defined in apps/api.
import type { TaskLists } from "src/types/canvas";
import type { TaskHistory } from "src/types/taskHistory";

export interface ServerDocument {
  canvasLists: TaskLists;
  taskHistory: TaskHistory;
}

export interface MeResponse {
  user: { id: string; email: string; name: string } | null;
  entitlement: {
    entitled: boolean;
    plan: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  hasServerDocument: boolean;
}

export interface TasksGetResponse {
  version: number;
  document: ServerDocument | null;
}

export type TasksPutResult =
  | { ok: true; version: number; document: ServerDocument }
  | {
      ok: false;
      conflict: true;
      version: number;
      document: ServerDocument | null;
    }
  | { ok: false; conflict: false; status: number };

async function jsonOrNull<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchMe(signal?: AbortSignal): Promise<MeResponse> {
  const res = await fetch("/api/me", { signal });
  if (!res.ok) {
    throw new Error(`/api/me failed: ${res.status}`);
  }
  return (await res.json()) as MeResponse;
}

export async function fetchTasks(
  signal?: AbortSignal
): Promise<TasksGetResponse> {
  const res = await fetch("/api/tasks", { signal });
  if (res.status === 401 || res.status === 402) {
    throw new SyncAuthError(res.status);
  }
  if (!res.ok) {
    throw new Error(`/api/tasks GET failed: ${res.status}`);
  }
  return (await res.json()) as TasksGetResponse;
}

export async function putTasks(
  document: ServerDocument,
  baseVersion: number,
  options: { keepalive?: boolean } = {}
): Promise<TasksPutResult> {
  const res = await fetch("/api/tasks", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...document, baseVersion }),
    keepalive: options.keepalive,
  });

  if (res.ok) {
    const data = (await res.json()) as {
      version: number;
      document: ServerDocument;
    };
    return { ok: true, version: data.version, document: data.document };
  }

  if (res.status === 409) {
    const data = await jsonOrNull<{
      version: number;
      document: ServerDocument | null;
    }>(res);
    return {
      ok: false,
      conflict: true,
      version: data?.version ?? baseVersion,
      document: data?.document ?? null,
    };
  }

  if (res.status === 401 || res.status === 402) {
    throw new SyncAuthError(res.status);
  }

  return { ok: false, conflict: false, status: res.status };
}

export async function confirmCheckout(checkoutId: string): Promise<MeResponse> {
  await fetch("/api/checkout/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkoutId }),
  }).catch(() => undefined);
  // The mirror is authoritative after confirm; re-read the full session view.
  return fetchMe();
}

/** Raised on 401/402 so the sync engine can pause and prompt re-sign-in. */
export class SyncAuthError extends Error {
  constructor(public readonly status: number) {
    super(`sync auth error: ${status}`);
    this.name = "SyncAuthError";
  }
}
