/**
 * Długomat — Tier 10 — Structured error tracking & Sentry-compat reporter.
 *
 * Lightweight wrapper around Sentry SDK (lazy import) + DB fallback table
 * `error_reports` dla awarii kiedy Sentry niedostępny.
 *
 * Usage:
 *   captureError(err, { user_id, route, severity })
 *   captureMessage("payment_failed", { ... })
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export type ErrorSeverity = "debug" | "info" | "warning" | "error" | "critical";

export interface ErrorContext {
  user_id?: string | null;
  route?: string | null;
  case_id?: string | null;
  severity?: ErrorSeverity;
  fingerprint?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export async function captureError(
  err: unknown,
  ctx: ErrorContext = {},
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  const severity = ctx.severity ?? "error";

  // 1. Try Sentry (if configured)
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import("@sentry/nextjs").catch(() => null);
      if (Sentry?.captureException) {
        Sentry.captureException(err, {
          level: mapSeverity(severity),
          tags: ctx.tags,
          user: ctx.user_id ? { id: ctx.user_id } : undefined,
          extra: { ...ctx.extra, route: ctx.route, case_id: ctx.case_id },
          fingerprint: ctx.fingerprint ? [ctx.fingerprint] : undefined,
        });
      }
    } catch {
      // fall through to DB
    }
  }

  // 2. DB fallback (always — for analytics + offline replay if Sentry down)
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("error_reports").insert({
      message: message.slice(0, 1000),
      stack: stack?.slice(0, 8000) ?? null,
      severity,
      user_id: ctx.user_id ?? null,
      route: ctx.route ?? null,
      case_id: ctx.case_id ?? null,
      fingerprint: ctx.fingerprint ?? hashFingerprint(message),
      tags: ctx.tags ?? null,
      extra: ctx.extra ?? null,
    });
  } catch (dbErr) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[captureError] DB fallback failed:", dbErr);
    }
  }
}

export async function captureMessage(
  message: string,
  ctx: ErrorContext = {},
): Promise<void> {
  return captureError(new Error(message), ctx);
}

function mapSeverity(s: ErrorSeverity): string {
  switch (s) {
    case "debug": return "debug";
    case "info": return "info";
    case "warning": return "warning";
    case "critical": return "fatal";
    default: return "error";
  }
}

function hashFingerprint(message: string): string {
  let h = 0;
  for (let i = 0; i < message.length; i += 1) {
    h = ((h << 5) - h) + message.charCodeAt(i);
    h |= 0;
  }
  return `auto_${Math.abs(h).toString(36)}`;
}

/**
 * Aggregates last 24h errors grouped by fingerprint.
 */
export async function recentErrorSummary(): Promise<
  Array<{ fingerprint: string; count: number; sample_message: string; last_seen: string }>
> {
  const supabase = createSupabaseAdminClient();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { data } = await supabase
    .from("error_reports")
    .select("fingerprint, message, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);

  const groups = new Map<string, { count: number; sample: string; last: string }>();
  for (const r of (data as Array<{ fingerprint: string; message: string; created_at: string }>) ?? []) {
    const g = groups.get(r.fingerprint) ?? { count: 0, sample: r.message, last: r.created_at };
    g.count += 1;
    if (r.created_at > g.last) g.last = r.created_at;
    groups.set(r.fingerprint, g);
  }
  return [...groups.entries()]
    .map(([fingerprint, g]) => ({
      fingerprint,
      count: g.count,
      sample_message: g.sample,
      last_seen: g.last,
    }))
    .sort((a, b) => b.count - a.count);
}
