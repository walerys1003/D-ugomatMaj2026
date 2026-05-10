import "server-only";

/**
 * Tier 6 zad. 288 — Read-after-write consistency helper.
 *
 * Problem: Supabase Postgres ma replikę read-only dla niektórych zapytań,
 * a `auth.getUser()` może być cache'owane przez ssr-helpers. W praktyce
 * po INSERT/UPDATE czasem `SELECT` z innej sesji nie widzi nowych danych
 * (eventual consistency w sub-second window).
 *
 * Strategia:
 *   1. Session pinning — używaj tego samego supabase clienta dla write+read
 *      w obrębie request (już domyślne w supabase-server.ts).
 *   2. RYW guard — po krytycznym write, poczekaj na readback z tym samym
 *      ID lub powtórz z exponential backoff (max 3 próby, 50/100/200 ms).
 *   3. ETag/version column — kolumna `updated_at` lub `version` z monotonic
 *      increment, sprawdzamy że readback widzi nową wartość.
 *
 * Use case:
 *   - Po `cases.insert()` przed redirect na /app/sprawy/[id]
 *   - Po `ai_generation_runs.insert(status='running')` przed pierwszym SSE
 *   - Po Stripe webhook handler przed redirect na /app/platnosci
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/observability/logger";

export interface RywOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
}

const DEFAULT_OPTS: Required<RywOptions> = {
  maxAttempts: 3,
  initialDelayMs: 50,
  backoffFactor: 2,
};

/**
 * Czeka aż readback ma `expectedUpdatedAt >= lastWrite.updated_at`.
 * Jeśli po `maxAttempts` nadal stale → loguje warning, ale **zwraca**
 * ostatnie stale data (graceful degradation, lepsze niż 500).
 */
export async function waitForReadAfterWrite<T extends { updated_at?: string | null }>(
  client: SupabaseClient,
  params: {
    table: string;
    id: string;
    expectedUpdatedAt?: string;
    select?: string;
  },
  opts: RywOptions = {},
): Promise<T | null> {
  const config = { ...DEFAULT_OPTS, ...opts };
  let delay = config.initialDelayMs;
  let lastRow: T | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    const { data, error } = await client
      .from(params.table)
      .select(params.select ?? "*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      logger.warn("ryw.select_error", {
        table: params.table,
        id: params.id,
        error: error.message,
        attempt,
      });
      return lastRow;
    }

    lastRow = (data as T) ?? null;

    if (!lastRow) {
      // Wiersz jeszcze nie widoczny — czekaj i retry
      if (attempt < config.maxAttempts) {
        await sleep(delay);
        delay *= config.backoffFactor;
        continue;
      }
      logger.warn("ryw.row_not_visible", {
        table: params.table,
        id: params.id,
        attempts: config.maxAttempts,
      });
      return null;
    }

    if (!params.expectedUpdatedAt) return lastRow;

    const seen = lastRow.updated_at ? new Date(lastRow.updated_at).getTime() : 0;
    const expected = new Date(params.expectedUpdatedAt).getTime();
    if (seen >= expected) return lastRow;

    if (attempt < config.maxAttempts) {
      await sleep(delay);
      delay *= config.backoffFactor;
    }
  }

  logger.warn("ryw.stale_after_retries", {
    table: params.table,
    id: params.id,
    expected: params.expectedUpdatedAt,
    last_seen: lastRow?.updated_at ?? null,
  });
  return lastRow;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Helper: write + immediate readback z RYW guard.
 *
 * Przykład:
 *   const caseRow = await writeWithReadback(supabase, {
 *     table: "cases",
 *     insert: { user_id, title, type },
 *     select: "*",
 *   });
 */
export async function writeWithReadback<T extends { id: string; updated_at?: string | null }>(
  client: SupabaseClient,
  params: {
    table: string;
    insert?: Record<string, unknown>;
    update?: { id: string; values: Record<string, unknown> };
    select?: string;
  },
  opts: RywOptions = {},
): Promise<T | null> {
  let writeResult: T | null = null;

  if (params.insert) {
    const { data, error } = await client
      .from(params.table)
      .insert(params.insert)
      .select(params.select ?? "*")
      .single();
    if (error) {
      logger.warn("ryw.insert_failed", {
        table: params.table,
        error: error.message,
      });
      return null;
    }
    writeResult = data as T;
  } else if (params.update) {
    const { data, error } = await client
      .from(params.table)
      .update(params.update.values)
      .eq("id", params.update.id)
      .select(params.select ?? "*")
      .single();
    if (error) {
      logger.warn("ryw.update_failed", {
        table: params.table,
        error: error.message,
      });
      return null;
    }
    writeResult = data as T;
  }

  if (!writeResult) return null;

  // Readback dla pewności
  return waitForReadAfterWrite<T>(
    client,
    {
      table: params.table,
      id: writeResult.id,
      expectedUpdatedAt: writeResult.updated_at ?? undefined,
      select: params.select,
    },
    opts,
  );
}
