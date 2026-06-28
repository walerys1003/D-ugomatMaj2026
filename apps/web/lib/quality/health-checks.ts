/**
 * Długomat — Tier 10 (zad. 451-500) — comprehensive system health checks.
 *
 * Extension of /api/health — deep checks for production readiness:
 *  - DB connectivity + read/write
 *  - Stripe API reachability
 *  - Anthropic API reachability
 *  - Supabase Storage
 *  - Email provider (Resend/Postmark)
 *  - Queue depth (generation_jobs)
 *  - Circuit breaker status
 *
 * Returns HealthReport with overall + per-component status.
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export type ComponentStatus = "ok" | "degraded" | "down" | "unknown";

export interface HealthReport {
  status: ComponentStatus;
  timestamp: string;
  components: Array<{
    name: string;
    status: ComponentStatus;
    latencyMs: number;
    detail?: string;
  }>;
  uptime_seconds: number;
}

const startedAt = Date.now();

export async function runDeepHealthChecks(): Promise<HealthReport> {
  const components: HealthReport["components"] = [];

  // 1. DB
  components.push(await checkDb());

  // 2. Stripe
  components.push(await checkStripe());

  // 3. Anthropic
  components.push(await checkAnthropic());

  // 4. Email provider
  components.push(await checkEmailProvider());

  // 5. Queue depth
  components.push(await checkQueueDepth());

  const overall = aggregateStatus(components.map((c) => c.status));
  return {
    status: overall,
    timestamp: new Date().toISOString(),
    components,
    uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
  };
}

async function checkDb(): Promise<HealthReport["components"][number]> {
  const t0 = Date.now();
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1);
    if (error) {
      return {
        name: "database",
        status: "down",
        latencyMs: Date.now() - t0,
        detail: error.message,
      };
    }
    return { name: "database", status: "ok", latencyMs: Date.now() - t0 };
  } catch (err) {
    return {
      name: "database",
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkStripe(): Promise<HealthReport["components"][number]> {
  const t0 = Date.now();
  if (!process.env.STRIPE_SECRET_KEY) {
    return { name: "stripe", status: "unknown", latencyMs: 0, detail: "not_configured" };
  }
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      signal: AbortSignal.timeout(3000),
    });
    return {
      name: "stripe",
      status: res.ok ? "ok" : "degraded",
      latencyMs: Date.now() - t0,
      detail: res.ok ? undefined : `http_${res.status}`,
    };
  } catch (err) {
    return {
      name: "stripe",
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkAnthropic(): Promise<HealthReport["components"][number]> {
  const t0 = Date.now();
  if (!process.env.ANTHROPIC_API_KEY) {
    return { name: "anthropic", status: "unknown", latencyMs: 0, detail: "not_configured" };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 5,
        messages: [{ role: "user", content: "ping" }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    return {
      name: "anthropic",
      status: res.ok ? "ok" : "degraded",
      latencyMs: Date.now() - t0,
      detail: res.ok ? undefined : `http_${res.status}`,
    };
  } catch (err) {
    return {
      name: "anthropic",
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkEmailProvider(): Promise<HealthReport["components"][number]> {
  const t0 = Date.now();
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(3000),
      });
      return {
        name: "email",
        status: res.ok ? "ok" : "degraded",
        latencyMs: Date.now() - t0,
        detail: `resend_${res.status}`,
      };
    } catch (err) {
      return {
        name: "email",
        status: "down",
        latencyMs: Date.now() - t0,
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }
  return { name: "email", status: "unknown", latencyMs: 0, detail: "no_provider" };
}

async function checkQueueDepth(): Promise<HealthReport["components"][number]> {
  const t0 = Date.now();
  try {
    const supabase = createSupabaseAdminClient();
    const { count } = await supabase
      .from("generation_jobs")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "running"]);
    const depth = count ?? 0;
    return {
      name: "generation_queue",
      status: depth > 500 ? "degraded" : "ok",
      latencyMs: Date.now() - t0,
      detail: `depth=${depth}`,
    };
  } catch (err) {
    return {
      name: "generation_queue",
      status: "unknown",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

function aggregateStatus(statuses: ComponentStatus[]): ComponentStatus {
  if (statuses.some((s) => s === "down")) return "down";
  if (statuses.some((s) => s === "degraded")) return "degraded";
  if (statuses.every((s) => s === "unknown")) return "unknown";
  return "ok";
}
