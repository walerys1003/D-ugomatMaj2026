/**
 * Tier 6 zad. 255 — Idempotency keys dla /api/ai/generate (i nie tylko).
 *
 * Klient wysyła header `Idempotency-Key: <uuid>`. Serwer:
 *   1) Sprawdza w tabeli `idempotency_records` czy klucz już istnieje.
 *   2) Jeśli istnieje i ma stored response — zwraca cache (sub-50 ms).
 *   3) Jeśli istnieje, ale "in_progress" — 409 conflict (równoczesna).
 *   4) Jeśli nie istnieje — zapisujemy "in_progress", wykonujemy operację,
 *      zapisujemy result, zwracamy.
 *
 * TTL: 24 h (zgodne ze Stripe pattern). Klucz scoped per-user (+ optional
 * per-route w skomplikowanych workflowach).
 *
 * Backend: Supabase tabela `idempotency_records`. Nie używamy Redis,
 * by zachować jeden source of truth (Supabase). Cost: ~2 zapytania/req
 * dla pierwszego wywołania, 1 dla retry.
 */

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { logger } from "./logger";

export interface IdempotencyKey {
  scope: string; // np. "ai-generate"
  key: string;
  user_id?: string;
}

export interface IdempotencyHit<T> {
  hit: true;
  status: "completed" | "in_progress";
  result?: T;
  http_status?: number;
}

export interface IdempotencyMiss {
  hit: false;
}

export type IdempotencyLookup<T> = IdempotencyHit<T> | IdempotencyMiss;

const TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Sprawdza, czy klucz idempotencyjny istnieje. Jeżeli tak — zwraca stored
 * wynik (lub status="in_progress"). Jeżeli nie — odrazu rezerwuje rekord
 * status="in_progress", aby kolejne równoległe żądania dostały 409.
 */
export async function reserveIdempotency<T>(
  k: IdempotencyKey,
): Promise<IdempotencyLookup<T>> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (!sb) {
    // Bez admin clienta nie możemy gwarantować idempotencji — pomiń.
    logger.warn("idempotency.no_admin", { scope: k.scope });
    return { hit: false };
  }

  const { data: existing, error: lookupErr } = await sb
    .from("idempotency_records")
    .select("status,result,http_status,created_at")
    .eq("scope", k.scope)
    .eq("key", k.key)
    .maybeSingle();

  if (lookupErr) {
    logger.warn("idempotency.lookup_failed", { scope: k.scope, err: lookupErr.message });
    return { hit: false };
  }

  if (existing) {
    const age = Date.now() - new Date(existing.created_at as string).getTime();
    if (age > TTL_MS) {
      // TTL przeterminowany — re-reserve.
      await sb
        .from("idempotency_records")
        .delete()
        .eq("scope", k.scope)
        .eq("key", k.key);
    } else {
      return {
        hit: true,
        status: (existing.status as "completed" | "in_progress") ?? "completed",
        result: existing.result as T,
        http_status: existing.http_status as number | undefined,
      };
    }
  }

  // Reserve in_progress.
  const { error: insertErr } = await sb.from("idempotency_records").insert({
    scope: k.scope,
    key: k.key,
    user_id: k.user_id ?? null,
    status: "in_progress",
  });

  if (insertErr) {
    // UNIQUE conflict — ktoś nas wyprzedził.
    if (insertErr.code === "23505") {
      logger.info("idempotency.race", { scope: k.scope });
      return { hit: true, status: "in_progress" };
    }
    logger.warn("idempotency.insert_failed", { scope: k.scope, err: insertErr.message });
    return { hit: false };
  }

  return { hit: false };
}

export async function completeIdempotency<T>(
  k: IdempotencyKey,
  result: T,
  httpStatus = 200,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (!sb) return;
  const { error } = await sb
    .from("idempotency_records")
    .update({
      status: "completed",
      result: result as unknown as object,
      http_status: httpStatus,
      completed_at: new Date().toISOString(),
    })
    .eq("scope", k.scope)
    .eq("key", k.key);

  if (error) {
    logger.warn("idempotency.complete_failed", { scope: k.scope, err: error.message });
  }
}

export async function abortIdempotency(k: IdempotencyKey): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (!sb) return;
  await sb
    .from("idempotency_records")
    .delete()
    .eq("scope", k.scope)
    .eq("key", k.key);
}

/** Validates the `Idempotency-Key` header (UUID-like, 8–64 chars). */
export function parseIdempotencyHeader(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const trimmed = headerValue.trim();
  if (trimmed.length < 8 || trimmed.length > 64) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}
