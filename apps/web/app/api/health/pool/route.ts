/**
 * GET /api/health/pool — Tier 6 zad. 265.
 *
 * Statystyki połączeń + circuit breakerów + idempotency table size.
 * Wymaga token-protect (HEALTH_DEEP_TOKEN) tak samo jak /api/health/deep.
 */

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { ALL_CIRCUITS } from "@/lib/observability/circuit-breaker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PoolStats {
  time: string;
  node: {
    uptime_seconds: number;
    memory_mb: { rss: number; heap_used: number; heap_total: number };
    event_loop_lag_ms: number | null;
  };
  circuits: Array<{ name: string; state: string; failure_count: number; opened_at: number }>;
  idempotency: { in_progress: number | null; completed_24h: number | null };
}

async function measureEventLoopLag(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const end = process.hrtime.bigint();
      resolve(Number(end - start) / 1_000_000);
    });
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  const expected = process.env.HEALTH_DEEP_TOKEN;
  if (expected) {
    const provided =
      request.headers.get("x-health-token") ||
      new URL(request.url).searchParams.get("token");
    if (provided !== expected) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const mem = process.memoryUsage();
  const lag = await measureEventLoopLag();

  let inProgress: number | null = null;
  let completed24h: number | null = null;
  const admin = createSupabaseAdminClient();
  if (admin) {
    try {
      const { count: ip } = await admin
        .from("idempotency_records")
        .select("id", { head: true, count: "exact" })
        .eq("status", "in_progress");
      inProgress = ip ?? null;
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: c24 } = await admin
        .from("idempotency_records")
        .select("id", { head: true, count: "exact" })
        .eq("status", "completed")
        .gte("created_at", since);
      completed24h = c24 ?? null;
    } catch {
      // table may not exist yet
    }
  }

  const stats: PoolStats = {
    time: new Date().toISOString(),
    node: {
      uptime_seconds: Math.floor(process.uptime()),
      memory_mb: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heap_used: Math.round(mem.heapUsed / 1024 / 1024),
        heap_total: Math.round(mem.heapTotal / 1024 / 1024),
      },
      event_loop_lag_ms: Math.round(lag * 100) / 100,
    },
    circuits: ALL_CIRCUITS.map((c) => {
      const s = c.getState();
      return {
        name: s.circuit,
        state: s.state,
        failure_count: s.failureCount,
        opened_at: s.openedAt,
      };
    }),
    idempotency: { in_progress: inProgress, completed_24h: completed24h },
  };

  return NextResponse.json(stats, {
    status: 200,
    headers: {
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}
