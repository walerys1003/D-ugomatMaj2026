/**
 * Tier 32 — Database connection pool tuning.
 *
 * Supabase używa PgBouncer pod spodem z transaction pooler na porcie 6543.
 * Direct connection (5432) tylko dla migracji / długich transakcji.
 *
 * Strategia:
 *   - Server actions / API routes → transaction pooler (6543) → max 200 connections shared
 *   - Cron jobs / migracje → direct connection (5432) → max 60
 *   - Read replicas (jeśli włączone) → osobne URL dla read-heavy queries
 */
import "server-only";

export interface PoolConfig {
  /** URL z portem 6543 (transaction pooler). */
  pooled_url: string;
  /** URL z portem 5432 (direct). Dla migracji / długich transakcji. */
  direct_url: string;
  /** URL read replica (opcjonalnie). */
  read_replica_url?: string;
  /** Max połączeń per role / per worker (Vercel Edge: 1, Node: do 10). */
  pool_size: number;
  /** Statement timeout (ms) — chroni przed long-running queries. */
  statement_timeout_ms: number;
  /** Idle timeout (s) — kiedy zwracamy połączenie do PgBouncer. */
  idle_timeout_s: number;
}

export const DEFAULT_POOL_CONFIG: PoolConfig = {
  pooled_url: process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL ?? "",
  direct_url: process.env.DATABASE_URL ?? "",
  read_replica_url: process.env.DATABASE_READ_REPLICA_URL,
  pool_size: parseInt(process.env.DATABASE_POOL_SIZE ?? "10", 10),
  statement_timeout_ms: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT_MS ?? "10000", 10),
  idle_timeout_s: parseInt(process.env.DATABASE_IDLE_TIMEOUT_S ?? "30", 10),
};

/**
 * Wybiera odpowiedni URL bazy danych w zależności od kontekstu.
 * @param mode - 'read' używa replika (jeśli dostępna), 'write' / 'migration' używa primary
 */
export function selectDatabaseUrl(mode: "read" | "write" | "migration" = "write"): string {
  const cfg = DEFAULT_POOL_CONFIG;
  if (mode === "migration") return cfg.direct_url;
  if (mode === "read" && cfg.read_replica_url) return cfg.read_replica_url;
  return cfg.pooled_url || cfg.direct_url;
}

/**
 * Helper do uruchamiania queries z timeout-em.
 */
export async function withStatementTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_POOL_CONFIG.statement_timeout_ms,
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`statement_timeout_exceeded:${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

/**
 * Health check pool-a: SELECT 1 + sprawdzenie liczby aktywnych połączeń.
 */
export interface PoolHealth {
  pooled_reachable: boolean;
  pooled_latency_ms?: number;
  direct_reachable: boolean;
  direct_latency_ms?: number;
  replica_reachable?: boolean;
  active_connections?: number;
  max_connections?: number;
}

export async function checkPoolHealth(): Promise<PoolHealth> {
  const result: PoolHealth = {
    pooled_reachable: false,
    direct_reachable: false,
  };
  try {
    const { createSupabaseAdminClient } = await import("@/lib/db/supabase-server");
    const sb = createSupabaseAdminClient();
    const start = Date.now();
    const { error } = await sb.from("profiles").select("id", { count: "exact", head: true });
    result.pooled_latency_ms = Date.now() - start;
    result.pooled_reachable = !error;
    result.direct_reachable = !error;
  } catch {
    /* tolerable */
  }
  return result;
}
