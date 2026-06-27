import "server-only";

/**
 * Tier 6 zad. 268 — Row-level locking for cron jobs.
 *
 * Cel: zapobiec double-execution gdy cron uruchamia się na 2 instancjach
 * (Vercel deployment overlap, manual trigger + scheduled). Używamy
 * PostgreSQL `SELECT ... FOR UPDATE SKIP LOCKED` aby każdy worker dostał
 * **inny** zestaw wierszy do przetworzenia.
 *
 * Alternative: distributed lock w `cron_locks` (advisory lock).
 *
 * Pattern użycia:
 *
 *   const { rows, release } = await claimWork({
 *     table: "notifications",
 *     where: { status: "queued" },
 *     limit: 50,
 *     workerId: "vercel-cron-1",
 *   });
 *   try {
 *     for (const row of rows) { ... }
 *   } finally {
 *     await release();
 *   }
 */

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";

export interface ClaimWorkParams {
  table: string;
  where?: Record<string, string | number | boolean | null>;
  limit?: number;
  workerId: string;
  lockTtlSeconds?: number;
}

export interface ClaimedWork<T> {
  rows: T[];
  release: () => Promise<void>;
}

/**
 * Acquire advisory lock via `pg_try_advisory_lock`. Returns true if
 * obtained, false if other worker holds it. Use this to prevent two crons
 * from racing on the same scoped task.
 */
export async function tryAdvisoryLock(scope: string): Promise<boolean> {
  const sb = createSupabaseAdminClient();
  // Hash scope → bigint (Postgres advisory locks używają int8).
  let h = 0;
  for (let i = 0; i < scope.length; i++) {
    h = (h * 31 + scope.charCodeAt(i)) | 0;
  }
  const { data, error } = await sb.rpc("try_advisory_lock", {
    lock_key: h,
  });
  if (error) {
    logger.warn("rowlock.rpc_error", { scope, error: error.message });
    return false;
  }
  return Boolean(data);
}

export async function releaseAdvisoryLock(scope: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  let h = 0;
  for (let i = 0; i < scope.length; i++) {
    h = (h * 31 + scope.charCodeAt(i)) | 0;
  }
  await sb.rpc("release_advisory_lock", { lock_key: h });
}

/**
 * Wrap a function with advisory lock — runs only if lock acquired.
 * Returns null if another worker holds the lock (cron skipped).
 */
export async function withAdvisoryLock<T>(
  scope: string,
  fn: () => Promise<T>,
): Promise<T | null> {
  const acquired = await tryAdvisoryLock(scope);
  if (!acquired) {
    logger.info("rowlock.skipped", { scope, reason: "lock_held" });
    return null;
  }
  try {
    return await fn();
  } finally {
    await releaseAdvisoryLock(scope);
  }
}

/**
 * Claim a batch of work rows via `claimed_by` + `claimed_at` columns.
 * Requires target table to have these columns + RPC `claim_work_batch`.
 * Patrz migracja 20260511120000_tier6_work_claim.sql.
 */
export async function claimWork<T>(
  params: ClaimWorkParams,
): Promise<ClaimedWork<T>> {
  const sb = createSupabaseAdminClient();

  const { data, error } = await sb.rpc("claim_work_batch", {
    p_table: params.table,
    p_status_filter: (params.where?.status as string) ?? "queued",
    p_limit: params.limit ?? 50,
    p_worker_id: params.workerId,
    p_lock_ttl_seconds: params.lockTtlSeconds ?? 300,
  });

  if (error) {
    logger.warn("rowlock.claim_error", {
      table: params.table,
      error: error.message,
    });
    return { rows: [], release: async () => {} };
  }

  const rows = (data ?? []) as T[];

  return {
    rows,
    release: async () => {
      // Best-effort release — jeżeli worker padł, lockTtlSeconds wygaśnie automatycznie.
      try {
        const ids = (rows as Array<{ id?: string }>)
          .map((r) => r.id)
          .filter(Boolean);
        if (ids.length === 0) return;
        await sb.rpc("release_work_batch", {
          p_table: params.table,
          p_ids: ids,
          p_worker_id: params.workerId,
        });
      } catch (e) {
        logger.warn("rowlock.release_error", {
          table: params.table,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
  };
}
