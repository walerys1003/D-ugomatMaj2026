/**
 * Długomat — Tier 9 — Offline sync queue (mobile + PWA).
 *
 * Extension of `sw/background-sync.ts` — robust offline operation queue:
 *  - Wizard answer save → queue jeśli offline
 *  - Case create → queue
 *  - Document download → cache locally (IndexedDB)
 *  - Notification ack → queue
 *
 * Storage:
 *  - IndexedDB (preferred — większy limit, async)
 *  - localStorage fallback (małe payload-y, sync)
 *
 * Replay: on `online` event, FIFO drain z exponential backoff per op.
 */

export type OfflineOpKind =
  | "wizard_save"
  | "case_create"
  | "case_update"
  | "document_revise"
  | "notification_ack"
  | "deadline_update"
  | "conversion_event";

export interface OfflineOp {
  id: string;
  kind: OfflineOpKind;
  endpoint: string; // np. "/api/cases" or "/api/wizard/save"
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: unknown;
  enqueuedAt: number;
  attempts: number;
  lastAttemptAt: number | null;
  lastError: string | null;
}

const DB_NAME = "dlk_offline";
const STORE_NAME = "ops";
const DB_VERSION = 1;
const LS_KEY = "dlk_offline_ops_v1";

// -----------------------------------------------------------------------------
// IndexedDB backing (preferred)
// -----------------------------------------------------------------------------

async function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function idbPut(op: OfflineOp): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(op);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function idbGetAll(): Promise<OfflineOp[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as OfflineOp[]);
    req.onerror = () => resolve([]);
  });
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// -----------------------------------------------------------------------------
// localStorage fallback
// -----------------------------------------------------------------------------

function lsRead(): OfflineOp[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as OfflineOp[];
  } catch {
    return [];
  }
}

function lsWrite(ops: OfflineOp[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ops.slice(0, 200)));
  } catch {
    // quota exceeded — silently drop oldest
  }
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export async function enqueueOfflineOp(
  input: Omit<OfflineOp, "id" | "enqueuedAt" | "attempts" | "lastAttemptAt" | "lastError">,
): Promise<string> {
  const op: OfflineOp = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    enqueuedAt: Date.now(),
    attempts: 0,
    lastAttemptAt: null,
    lastError: null,
    ...input,
  };
  const db = await openDb();
  if (db) {
    await idbPut(op);
  } else {
    const ops = lsRead();
    ops.push(op);
    lsWrite(ops);
  }
  return op.id;
}

export async function readOfflineOps(): Promise<OfflineOp[]> {
  const db = await openDb();
  if (db) return idbGetAll();
  return lsRead();
}

export async function deleteOfflineOp(id: string): Promise<void> {
  const db = await openDb();
  if (db) {
    await idbDelete(id);
  } else {
    lsWrite(lsRead().filter((o) => o.id !== id));
  }
}

export async function updateOfflineOp(id: string, patch: Partial<OfflineOp>): Promise<void> {
  const db = await openDb();
  if (db) {
    const all = await idbGetAll();
    const op = all.find((o) => o.id === id);
    if (!op) return;
    await idbPut({ ...op, ...patch });
    return;
  }
  const ops = lsRead();
  const next = ops.map((o) => (o.id === id ? { ...o, ...patch } : o));
  lsWrite(next);
}

/**
 * Replays all pending ops FIFO. Returns counts.
 * Caller should ensure online; uses exp backoff per failed op (max 5 attempts).
 */
export async function replayOfflineOps(): Promise<{ ok: number; failed: number; skipped: number }> {
  const ops = await readOfflineOps();
  let ok = 0;
  let failed = 0;
  let skipped = 0;
  const now = Date.now();

  for (const op of ops) {
    if (op.attempts >= 5) {
      skipped += 1;
      continue;
    }
    // Exp backoff: 1m, 5m, 15m, 60m
    const backoffMs = [0, 60_000, 300_000, 900_000, 3_600_000][op.attempts] ?? 3_600_000;
    if (op.lastAttemptAt && now - op.lastAttemptAt < backoffMs) {
      skipped += 1;
      continue;
    }

    try {
      const res = await fetch(op.endpoint, {
        method: op.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload),
      });
      if (res.ok) {
        await deleteOfflineOp(op.id);
        ok += 1;
      } else {
        await updateOfflineOp(op.id, {
          attempts: op.attempts + 1,
          lastAttemptAt: now,
          lastError: `http_${res.status}`,
        });
        failed += 1;
      }
    } catch (err) {
      await updateOfflineOp(op.id, {
        attempts: op.attempts + 1,
        lastAttemptAt: now,
        lastError: err instanceof Error ? err.message : String(err),
      });
      failed += 1;
    }
  }

  return { ok, failed, skipped };
}

/**
 * Register online listener that triggers replay automatically.
 */
export function registerOnlineReplay(): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    void replayOfflineOps();
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
