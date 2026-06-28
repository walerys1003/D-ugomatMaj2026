// Offline queue — buffers user actions (case create, message, draft save) while
// the device is offline. Persists to IndexedDB on the client and drains via
// Background Sync API once connectivity returns. Server-side companion lives
// in /api/offline-queue.

import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/types";

type Db = SupabaseClient<Database>;
type OfflineQueueRow = Database["public"]["Tables"]["offline_queue"]["Row"];

export type QueueOp = "case.create" | "case.update" | "document.draft" | "message.send" | "deadline.snooze";

export interface QueuedAction {
  id: string;
  op: QueueOp;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
  lastError?: string;
}

const DB_NAME = "dlugomat-offline";
const STORE = "queue";

// Client-side IndexedDB helpers (lazy — only run in browser).
export async function enqueueAction(op: QueueOp, payload: Record<string, unknown>): Promise<string> {
  if (typeof indexedDB === "undefined") throw new Error("indexeddb_unavailable");
  const db = await openDb();
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const action: QueuedAction = { id, op, payload, createdAt: new Date().toISOString(), retries: 0 };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(action);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  await registerSync().catch(() => null);
  return id;
}

export async function listQueued(): Promise<QueuedAction[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedAction[]);
    req.onerror = () => reject(req.error);
  });
}

export async function removeQueued(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function registerSync() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  // @ts-expect-error — Background Sync API (reg.sync) not in TS lib types
  if (reg.sync) await reg.sync.register("dlugomat-offline-queue");
}

// Server-side helpers — persist queued actions for cross-device drain.
export interface ServerQueuedAction {
  id: string;
  userId: string;
  op: QueueOp;
  payload: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export async function persistServerAction(supabase: Db, userId: string, op: QueueOp, payload: Record<string, unknown>): Promise<ServerQueuedAction> {
  const row = { id: randomUUID(), user_id: userId, op, payload: payload as Json, status: "pending" as const };
  const { data, error } = await supabase.from("offline_queue").insert(row).select("*").single();
  if (error) throw error;
  return mapAction(data);
}

export async function drainServerQueue(supabase: Db, userId: string, handler: (a: ServerQueuedAction) => Promise<Record<string, unknown>>): Promise<{ processed: number; failed: number }> {
  const { data, error } = await supabase.from("offline_queue").select("*").eq("user_id", userId).eq("status", "pending").limit(100);
  if (error) throw error;
  let processed = 0;
  let failed = 0;
  for (const r of data ?? []) {
    const a = mapAction(r);
    try {
      const result = await handler(a);
      await supabase.from("offline_queue").update({ status: "done", processed_at: new Date().toISOString(), result: result as Json }).eq("id", a.id);
      processed++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      await supabase.from("offline_queue").update({ status: "failed", processed_at: new Date().toISOString(), error: msg }).eq("id", a.id);
      failed++;
    }
  }
  return { processed, failed };
}

function mapAction(r: OfflineQueueRow): ServerQueuedAction {
  return {
    id: r.id,
    userId: r.user_id,
    op: r.op,
    payload: (r.payload ?? {}) as Record<string, unknown>,
    createdAt: r.created_at,
    processedAt: r.processed_at ?? undefined,
    result: (r.result ?? undefined) as Record<string, unknown> | undefined,
    error: r.error ?? undefined,
  };
}
