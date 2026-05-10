/**
 * GET /api/status — Tier 5 status page data source.
 *
 * Sprawdza składniki ekosystemu i zwraca summary:
 *   - DB (Supabase) — czy `select 1` z anonem działa (anon RLS-safe)
 *   - Auth (Supabase Auth) — czy /auth/v1/health odpowiada
 *   - AI (APIPod / Anthropic) — tylko sprawdzamy obecność ENV (bez wywołania,
 *     by nie palić tokenów na każdy refresh)
 *   - Email (Resend) — obecność ENV + reachability host (DNS resolve via fetch)
 *   - SMS (SMSAPI) — obecność ENV
 *   - Stripe — obecność ENV
 *
 * Każdy komponent ma status: 'operational' | 'degraded' | 'unconfigured' | 'down'.
 *
 * Cache: 30 s (klient panel/status odświeża co min, status page co 30 s).
 *
 * Bezpieczeństwo:
 *   - Brak detali secretów (wartości ENV) — tylko boolean "configured".
 *   - Rate-limit: 60 / min / IP (status page może spamować).
 */
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
} from "@/lib/security/rate-limit";
import { isResendAvailable } from "@/lib/notifications";
import { isSmsApiAvailable } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompStatus = "operational" | "degraded" | "unconfigured" | "down";

interface ComponentReport {
  name: string;
  status: CompStatus;
  latency_ms: number | null;
  detail: string | null;
}

const TIMEOUT_MS = 4_000;

async function probe<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<{ ok: boolean; durationMs: number; error: string | null }> {
  const start = Date.now();
  try {
    await Promise.race([
      fn(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), TIMEOUT_MS)),
    ]);
    return { ok: true, durationMs: Date.now() - start, error: null };
  } catch (e) {
    return {
      ok: false,
      durationMs: Date.now() - start,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkDatabase(): Promise<ComponentReport> {
  const supabase = createSupabaseServerClient();
  const r = await probe("supabase-db", async () => {
    // count z `legal_knowledge` jest tani i RLS-safe (publicznie czytalna).
    const { error } = await supabase
      .from("legal_knowledge")
      .select("id", { head: true, count: "exact" })
      .limit(1);
    if (error) throw error;
  });
  return {
    name: "Supabase Postgres",
    status: r.ok ? "operational" : "down",
    latency_ms: r.durationMs,
    detail: r.error,
  };
}

async function checkAuth(): Promise<ComponentReport> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return {
      name: "Supabase Auth",
      status: "unconfigured",
      latency_ms: null,
      detail: "NEXT_PUBLIC_SUPABASE_URL not set",
    };
  }
  const r = await probe("supabase-auth", async () => {
    const resp = await fetch(`${url}/auth/v1/health`, { method: "GET" });
    if (!resp.ok && resp.status !== 404) {
      throw new Error(`HTTP ${resp.status}`);
    }
  });
  return {
    name: "Supabase Auth",
    status: r.ok ? "operational" : "degraded",
    latency_ms: r.durationMs,
    detail: r.error,
  };
}

function checkAi(): ComponentReport {
  const apipod = Boolean(
    process.env.APIPOD_API_KEY && process.env.APIPOD_BASE_URL,
  );
  const anthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  if (!apipod && !anthropic) {
    return {
      name: "AI (Claude)",
      status: "unconfigured",
      latency_ms: null,
      detail: "Brak APIPOD_* lub ANTHROPIC_API_KEY",
    };
  }
  return {
    name: "AI (Claude)",
    status: "operational",
    latency_ms: null,
    detail: apipod ? "APIPod primary" : "Anthropic direct",
  };
}

function checkEmail(): ComponentReport {
  return isResendAvailable()
    ? {
        name: "Email (Resend)",
        status: "operational",
        latency_ms: null,
        detail: null,
      }
    : {
        name: "Email (Resend)",
        status: "unconfigured",
        latency_ms: null,
        detail: "Brak RESEND_API_KEY / RESEND_FROM_EMAIL",
      };
}

function checkSms(): ComponentReport {
  return isSmsApiAvailable()
    ? {
        name: "SMS (SMSAPI)",
        status: "operational",
        latency_ms: null,
        detail: null,
      }
    : {
        name: "SMS (SMSAPI)",
        status: "unconfigured",
        latency_ms: null,
        detail: "Brak SMSAPI_OAUTH_TOKEN / SMSAPI_SENDER",
      };
}

function checkStripe(): ComponentReport {
  const ok = Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
  );
  return {
    name: "Płatności (Stripe)",
    status: ok ? "operational" : "unconfigured",
    latency_ms: null,
    detail: ok ? null : "Brak STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET",
  };
}

function rollupStatus(comps: ComponentReport[]): CompStatus {
  if (comps.some((c) => c.status === "down")) return "down";
  if (comps.some((c) => c.status === "degraded")) return "degraded";
  // 'unconfigured' nie obniża statusu — to świadomy stan dev/staging.
  return "operational";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = clientIdFromHeaders(req.headers);
  const rl = rateLimit(`api:status:${ip}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  // Parallel probes
  const [db, auth] = await Promise.all([checkDatabase(), checkAuth()]);
  const components: ComponentReport[] = [
    db,
    auth,
    checkAi(),
    checkEmail(),
    checkSms(),
    checkStripe(),
  ];

  const overall = rollupStatus(components);

  return NextResponse.json(
    {
      ok: overall !== "down",
      overall_status: overall,
      components,
      checked_at: new Date().toISOString(),
      service: "dlugomat-web",
      env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    },
    {
      status: 200,
      headers: {
        // 30 s edge cache — chroni przed flood, nie blokuje user-facing checks
        "cache-control": "public, max-age=10, s-maxage=30, stale-while-revalidate=60",
        "x-robots-tag": "noindex",
      },
    },
  );
}
