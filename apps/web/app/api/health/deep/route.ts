/**
 * GET /api/health/deep — Tier 6 zad. 259.
 *
 * Sprawdza zdrowie zewnętrznych zależności:
 *   - Supabase (SELECT 1 z timeoutem 1.5 s)
 *   - Stripe (account.retrieve z timeoutem 2 s)
 *   - Anthropic (HEAD na api.anthropic.com z timeoutem 2 s)
 *   - Resend (jeśli RESEND_API_KEY ustawiony)
 *
 * Status code:
 *   - 200 — wszystkie zdrowe lub degradacja (jedno zewn. niedostępne)
 *   - 503 — Supabase lub Stripe niedostępne (krytyczne usługi)
 *
 * NIE jest tym samym co /api/health (liveness). Deep check używać tylko:
 *   - synthetic monitoring (Checkly co 5 min)
 *   - oncall dashboard
 *   - przed Vercel deploy promote
 *
 * Endpoint nie jest publiczny — wymaga `HEALTH_DEEP_TOKEN` header
 * (defense-in-depth, żeby nikt nie spamował zewn. API z naszej domeny).
 */

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";
import { ALL_CIRCUITS } from "@/lib/observability/circuit-breaker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "ok" | "degraded" | "down" | "skipped";

interface ComponentHealth {
  name: string;
  status: Status;
  latency_ms?: number;
  detail?: string;
}

interface DeepHealthPayload {
  ok: boolean;
  overall: Status;
  components: ComponentHealth[];
  circuits: Array<{ name: string; state: string; failure_count: number }>;
  time: string;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout_${ms}ms`)), ms),
    ),
  ]);
}

async function checkSupabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    // Audyt 2026-06-27 (iter. 35): usuwamy `as any`. REALNY BUG: ping RTT
    // odpytywał tabelę `audit_log`, która NIE ISTNIEJE — health-check Supabase
    // zawsze raportowałby "down". Przepinamy na realną `admin_audit_log`.
    const sb = createSupabaseAdminClient();
    if (!sb) return { name: "sb", status: "skipped" };
    // Minimal RTT query: query existing tiny table, head only.
    // PostgREST builder jest tylko `PromiseLike` (thenable) — opakowujemy w
    // Promise.resolve, by spełnić sygnaturę `withTimeout<T>(p: Promise<T>)`.
    const { error } = await withTimeout<{ error: { message: string } | null }>(
      Promise.resolve(
        sb.from("admin_audit_log").select("id", { head: true, count: "exact" }).limit(1),
      ),
      1500,
    );
    if (error) {
      return {
        name: "sb",
        status: "down",
        latency_ms: Date.now() - start,
        detail: error.message,
      };
    }
    return { name: "sb", status: "ok", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      name: "sb",
      status: "down",
      latency_ms: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkStripe(): Promise<ComponentHealth> {
  const start = Date.now();
  if (!process.env.STRIPE_SECRET_KEY) return { name: "stripe", status: "skipped" };
  try {
    const resp = await withTimeout(
      fetch("https://api.stripe.com/v1/balance", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
      }),
      2000,
    );
    if (!resp.ok) {
      return {
        name: "stripe",
        status: "down",
        latency_ms: Date.now() - start,
        detail: `http_${resp.status}`,
      };
    }
    return { name: "stripe", status: "ok", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      name: "stripe",
      status: "down",
      latency_ms: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkAnthropic(): Promise<ComponentHealth> {
  const start = Date.now();
  if (!process.env.ANTHROPIC_API_KEY) return { name: "anthropic", status: "skipped" };
  try {
    // Anthropic API nie ma dedykowanego health endpointu — HEAD na /v1/messages
    // zwraca 405 (method not allowed) ale potwierdza, że TLS + DNS działa.
    const resp = await withTimeout(
      fetch("https://api.anthropic.com/v1/messages", { method: "HEAD" }),
      2000,
    );
    // 401/405 są oczekiwane — oznaczają że serwer odpowiada.
    if (resp.status >= 500) {
      return {
        name: "anthropic",
        status: "degraded",
        latency_ms: Date.now() - start,
        detail: `http_${resp.status}`,
      };
    }
    return { name: "anthropic", status: "ok", latency_ms: Date.now() - start };
  } catch (err) {
    return {
      name: "anthropic",
      status: "down",
      latency_ms: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

function overallStatus(components: ComponentHealth[]): Status {
  const critical = components.filter((c) => c.name === "sb" || c.name === "stripe");
  if (critical.some((c) => c.status === "down")) return "down";
  if (components.some((c) => c.status === "down")) return "degraded";
  if (components.some((c) => c.status === "degraded")) return "degraded";
  return "ok";
}

export async function GET(request: Request): Promise<NextResponse> {
  // Lightweight token protection — defense in depth.
  const expected = process.env.HEALTH_DEEP_TOKEN;
  if (expected) {
    const provided =
      request.headers.get("x-health-token") ||
      new URL(request.url).searchParams.get("token");
    if (provided !== expected) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const [sb, stripe, anthropic] = await Promise.all([
    checkSupabase(),
    checkStripe(),
    checkAnthropic(),
  ]);

  const components = [sb, stripe, anthropic];
  const overall = overallStatus(components);

  const circuits = ALL_CIRCUITS.map((c) => {
    const s = c.getState();
    return { name: s.circuit, state: s.state, failure_count: s.failureCount };
  });

  const payload: DeepHealthPayload = {
    ok: overall === "ok",
    overall,
    components,
    circuits,
    time: new Date().toISOString(),
  };

  if (overall === "down") {
    logger.error("health.deep.down", { components, circuits });
  } else if (overall === "degraded") {
    logger.warn("health.deep.degraded", { components });
  }

  return NextResponse.json(payload, {
    status: overall === "down" ? 503 : 200,
    headers: {
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-robots-tag": "noindex",
    },
  });
}
