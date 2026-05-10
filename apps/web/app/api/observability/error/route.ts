import { NextResponse } from "next/server";
import { rateLimit, clientIdFromHeaders, RATE_LIMIT_PROFILES } from "@/lib/security/rate-limit";

/**
 * Tier 5.5 — Error reporting endpoint.
 *
 * Klient (error.tsx, global-error.tsx, error-reporter.ts) wysyła JSON
 * z błędami. Backend:
 *  - rate-limit (60/min/IP) — ochrona przed spamem,
 *  - sanityzacja (limit pól + długości),
 *  - log strukturalny (stdout JSON) — łatwy do przechwycenia przez
 *    Vercel/CloudWatch/Datadog bez dodatkowej zależności.
 *
 * W przyszłości łatwo podłączyć Sentry/PostHog — w tym samym handlerze
 * dodaje się przekazanie payloadu do SDK.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ErrorReport {
  message?: unknown;
  name?: unknown;
  stack?: unknown;
  digest?: unknown;
  boundary?: unknown;
  url?: unknown;
  user_agent?: unknown;
  timestamp?: unknown;
  extra?: unknown;
}

function trimString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  if (value.length === 0) return null;
  return value.slice(0, max);
}

export async function POST(request: Request) {
  const ip = clientIdFromHeaders(request.headers);
  const rl = rateLimit(`obs:error:${ip}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rl.resetMs / 1000).toString(),
        },
      },
    );
  }

  let payload: ErrorReport = {};
  try {
    payload = (await request.json()) as ErrorReport;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const sanitized = {
    message: trimString(payload.message, 1000) ?? "(no message)",
    name: trimString(payload.name, 200),
    stack: trimString(payload.stack, 4000),
    digest: trimString(payload.digest, 200),
    boundary: trimString(payload.boundary, 100),
    url: trimString(payload.url, 1000),
    user_agent: trimString(payload.user_agent, 500),
    timestamp:
      trimString(payload.timestamp, 50) ?? new Date().toISOString(),
    ip,
    extra:
      payload.extra && typeof payload.extra === "object"
        ? Object.fromEntries(
            Object.entries(payload.extra as Record<string, unknown>)
              .slice(0, 16)
              .map(([k, v]) => [k.slice(0, 50), v]),
          )
        : undefined,
  };

  // Strukturalny log JSON — Vercel/CloudWatch/Datadog parsują automatycznie.
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: "error",
      source: "client_error_report",
      ...sanitized,
    }),
  );

  return NextResponse.json({ ok: true });
}
