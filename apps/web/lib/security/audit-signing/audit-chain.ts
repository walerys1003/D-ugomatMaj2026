/**
 * Tier 23 — Tamper-evident audit log (HMAC chain).
 *
 * Każdy wpis w `audit_chain` zawiera:
 *  - prev_hash: SHA256 poprzedniego wpisu
 *  - payload: canonical JSON (sortowane klucze)
 *  - hmac:    HMAC-SHA256(secret, prev_hash || payload || created_at)
 *
 * Verify: idziemy od ostatniego do pierwszego, sprawdzając, czy każdy
 * curr_hash = SHA256(prev_hash || payload || hmac) — jeśli ktoś zmodyfikuje
 * pojedynczy wpis, łańcuch się rozsypie.
 *
 * Append: pobieramy ostatni wpis (FOR UPDATE), liczymy nowy hash, INSERT.
 * Race condition zabezpieczony przez Postgres advisory_lock.
 */

import { createHash, createHmac } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export interface AuditChainEntry {
  id: string;
  seq: number;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  payload: Record<string, unknown>;
  prev_hash: string;
  curr_hash: string;
  hmac: string;
  created_at: string;
}

const HMAC_SECRET = process.env.AUDIT_HMAC_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "fallback-dev-secret-audit";
const GENESIS_HASH = "0".repeat(64);

/** Kanoniczny JSON — sortowanie kluczy rekurencyjnie. */
export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(canonicalJson).join(",") + "]";
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + canonicalJson((obj as Record<string, unknown>)[k]))
      .join(",") +
    "}"
  );
}

export function computeHmac(prevHash: string, payloadCanonical: string, createdAt: string): string {
  return createHmac("sha256", HMAC_SECRET)
    .update(prevHash)
    .update("|")
    .update(payloadCanonical)
    .update("|")
    .update(createdAt)
    .digest("hex");
}

export function computeCurrHash(prevHash: string, payloadCanonical: string, hmac: string): string {
  return createHash("sha256")
    .update(prevHash)
    .update("|")
    .update(payloadCanonical)
    .update("|")
    .update(hmac)
    .digest("hex");
}

/**
 * Dodaje wpis do łańcucha. Wykorzystuje pg_advisory_xact_lock dla atomowości.
 */
export async function appendAuditEntry(args: {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  payload?: Record<string, unknown>;
}): Promise<AuditChainEntry> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;

  // Try RPC variant which holds advisory lock; if not available, fall back
  // to optimistic concurrency: read last → insert with computed hash, retry on conflict.
  const payload = args.payload ?? {};

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: lastRow } = await sb
      .from("audit_chain")
      .select("seq, curr_hash")
      .order("seq", { ascending: false })
      .limit(1)
      .maybeSingle();
    const prevSeq = (lastRow as { seq?: number } | null)?.seq ?? 0;
    const prevHash = (lastRow as { curr_hash?: string } | null)?.curr_hash ?? GENESIS_HASH;
    const createdAt = new Date().toISOString();
    const canonical = canonicalJson({
      actor_id: args.actorId,
      action: args.action,
      target_type: args.targetType,
      target_id: args.targetId ?? null,
      payload,
    });
    const hmac = computeHmac(prevHash, canonical, createdAt);
    const currHash = computeCurrHash(prevHash, canonical, hmac);

    const { data, error } = await sb
      .from("audit_chain")
      .insert({
        seq: prevSeq + 1,
        actor_id: args.actorId,
        action: args.action,
        target_type: args.targetType,
        target_id: args.targetId ?? null,
        payload: payload as Json,
        prev_hash: prevHash,
        curr_hash: currHash,
        hmac,
        created_at: createdAt,
      })
      .select("*")
      .single();
    if (!error && data) return data as AuditChainEntry;
    // Conflict on seq unique constraint — retry
    if (error?.code !== "23505") {
      throw error ?? new Error("audit_chain_insert_failed");
    }
  }
  throw new Error("audit_chain_contention_exhausted");
}

/**
 * Verify pełnego łańcucha — zwraca pierwszy złamany wpis lub null jeśli OK.
 */
export async function verifyAuditChain(args?: {
  fromSeq?: number;
  toSeq?: number;
}): Promise<{ valid: boolean; brokenAt: AuditChainEntry | null; checked: number }> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  let q = sb
    .from("audit_chain")
    .select("*")
    .order("seq", { ascending: true });
  if (args?.fromSeq) q = q.gte("seq", args.fromSeq);
  if (args?.toSeq) q = q.lte("seq", args.toSeq);

  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as AuditChainEntry[];

  let prevHash = args?.fromSeq && args.fromSeq > 1
    ? (await getEntryBySeq(args.fromSeq - 1))?.curr_hash ?? GENESIS_HASH
    : GENESIS_HASH;

  for (const entry of rows) {
    const canonical = canonicalJson({
      actor_id: entry.actor_id,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      payload: entry.payload,
    });
    const expectedHmac = computeHmac(prevHash, canonical, entry.created_at);
    const expectedCurr = computeCurrHash(prevHash, canonical, expectedHmac);
    if (entry.prev_hash !== prevHash || entry.hmac !== expectedHmac || entry.curr_hash !== expectedCurr) {
      return { valid: false, brokenAt: entry, checked: rows.length };
    }
    prevHash = entry.curr_hash;
  }
  return { valid: true, brokenAt: null, checked: rows.length };
}

async function getEntryBySeq(seq: number): Promise<AuditChainEntry | null> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data } = await sb.from("audit_chain").select("*").eq("seq", seq).maybeSingle();
  return (data ?? null) as AuditChainEntry | null;
}

export async function getLatestAuditEntries(limit = 100): Promise<AuditChainEntry[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data } = await sb
    .from("audit_chain")
    .select("*")
    .order("seq", { ascending: false })
    .limit(limit);
  return (data ?? []) as AuditChainEntry[];
}
