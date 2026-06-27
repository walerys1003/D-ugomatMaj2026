/**
 * Tier 20 — Realtime collaboration via CRDT (Yjs-style operational state).
 *
 * Lightweight CRDT layer dla współedycji dokumentów (np. pism procesowych,
 * notatek na sprawie). Pełen Yjs jest ciężki — tu mamy abstract API + serwerowe
 * persistowanie state vectorów i incremental updates.
 *
 * Model:
 *  - doc_id (UUID) — logiczny dokument
 *  - update (bytes) — Yjs update binary (klient generuje, my tylko forwardujemy)
 *  - state_vector — opcjonalny snapshot pełnego stanu dla nowych klientów
 *  - awareness — efemeryczne (kursor/selekcja użytkownika) — broadcast bez persist
 *
 * Persist strategy:
 *  - "append-only" — każda update'a leci do `crdt_updates`
 *  - okresowo `compactDocument()` mergeuje N updateów w jeden snapshot
 *    (klient liczy merge i wysyła wynik z `replaces_updates: [...ids]`)
 *
 * Broadcast (websocket/SSE) jest poza tym modułem — to lib `realtime/channel.ts`.
 * Ten plik daje contract i persist.
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export interface CrdtUpdate {
  id: string;
  doc_id: string;
  user_id: string;
  client_id: string;
  update_base64: string; // Yjs update encoded
  size_bytes: number;
  is_snapshot: boolean;
  replaces_ids: string[] | null;
  created_at: string;
}

export interface AppendUpdateInput {
  docId: string;
  userId: string;
  clientId: string;
  updateBase64: string;
  isSnapshot?: boolean;
  replacesIds?: string[];
}

const MAX_UPDATE_BYTES = 1024 * 1024; // 1MB — bezpieczny limit per update

export async function appendUpdate(input: AppendUpdateInput): Promise<CrdtUpdate> {
  const sizeBytes = Math.ceil((input.updateBase64.length * 3) / 4);
  if (sizeBytes > MAX_UPDATE_BYTES) {
    throw new Error(`crdt_update_too_large:${sizeBytes}`);
  }
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb
    .from("crdt_updates")
    .insert({
      doc_id: input.docId,
      user_id: input.userId,
      client_id: input.clientId,
      update_base64: input.updateBase64,
      size_bytes: sizeBytes,
      is_snapshot: Boolean(input.isSnapshot),
      replaces_ids: input.replacesIds ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Jeśli to snapshot kompaktujący — usuwamy zastąpione updates.
  if (input.isSnapshot && input.replacesIds && input.replacesIds.length > 0) {
    await sb
      .from("crdt_updates")
      .delete()
      .in("id", input.replacesIds)
      .eq("doc_id", input.docId);
  }
  return data as CrdtUpdate;
}

/**
 * Hydration — wszystkie updates od czasu zadanego snapshotu (lub od początku).
 * Klient łączy je w pamięci Yjs.applyUpdate(...).
 */
export async function getUpdates(args: {
  docId: string;
  since?: string; // ISO timestamp
  limit?: number;
}): Promise<CrdtUpdate[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  let q = sb
    .from("crdt_updates")
    .select("*")
    .eq("doc_id", args.docId)
    .order("created_at", { ascending: true })
    .limit(args.limit ?? 1000);
  if (args.since) q = q.gt("created_at", args.since);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as CrdtUpdate[];
}

/**
 * Statystyki dokumentu — używane przez heurystykę "czas na kompakcję".
 */
export interface DocStats {
  docId: string;
  updateCount: number;
  totalBytes: number;
  snapshotCount: number;
  lastUpdateAt: string | null;
  shouldCompact: boolean;
}

const COMPACT_THRESHOLD_UPDATES = 100;
const COMPACT_THRESHOLD_BYTES = 256 * 1024;

export async function getDocStats(docId: string): Promise<DocStats> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb
    .from("crdt_updates")
    .select("id,size_bytes,is_snapshot,created_at")
    .eq("doc_id", docId);
  if (error) throw error;
  const rows = (data ?? []) as Array<{ id: string; size_bytes: number; is_snapshot: boolean; created_at: string }>;
  const updateCount = rows.length;
  const totalBytes = rows.reduce((s, r) => s + (r.size_bytes ?? 0), 0);
  const snapshotCount = rows.filter((r) => r.is_snapshot).length;
  const lastUpdateAt = rows
    .map((r) => r.created_at)
    .sort()
    .pop() ?? null;
  return {
    docId,
    updateCount,
    totalBytes,
    snapshotCount,
    lastUpdateAt,
    shouldCompact:
      updateCount >= COMPACT_THRESHOLD_UPDATES || totalBytes >= COMPACT_THRESHOLD_BYTES,
  };
}

/**
 * Awareness state — efemeryczne (TTL 30s). Nie persistujemy w `crdt_updates`,
 * tylko w `crdt_awareness` z auto-cleanup.
 */
export interface AwarenessState {
  // Audyt 2026-06-27 (iter. 12): interfejs deklarował docId/userId/clientId
  // (camelCase), ale `select("*")` z crdt_awareness zwraca kolumny snake_case
  // (doc_id/user_id/client_id). Przy `as any` nikt tego nie wychwycił =>
  // każdy odczyt .docId/.userId/.clientId dawał undefined. Wyrównane do
  // realnego kształtu wiersza DB.
  doc_id: string;
  user_id: string;
  client_id: string;
  state: Record<string, unknown>; // np. { cursor: {anchor, head}, name, color }
  updated_at: string;
  expires_at: string;
}

const AWARENESS_TTL_MS = 30_000;

export async function updateAwareness(args: {
  docId: string;
  userId: string;
  clientId: string;
  state: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const now = new Date();
  await sb
    .from("crdt_awareness")
    .upsert(
      {
        doc_id: args.docId,
        user_id: args.userId,
        client_id: args.clientId,
        state: args.state as Json,
        updated_at: now.toISOString(),
        expires_at: new Date(now.getTime() + AWARENESS_TTL_MS).toISOString(),
      },
      { onConflict: "doc_id,client_id" },
    );
}

export async function listAwareness(docId: string): Promise<AwarenessState[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("crdt_awareness")
    .select("*")
    .eq("doc_id", docId)
    .gt("expires_at", now);
  if (error) throw error;
  return (data ?? []) as unknown as AwarenessState[];
}

export async function sweepExpiredAwareness(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb
    .from("crdt_awareness")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("doc_id");
  if (error) throw error;
  return (data ?? []).length;
}

/**
 * Permission check — czy user może edytować doc?
 * Wbija się w istniejący `documents` / `cases` RLS — tu tylko pomocnik.
 */
export async function canEditDocument(docId: string, userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data } = await sb
    .from("documents")
    .select("id")
    .eq("id", docId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}
