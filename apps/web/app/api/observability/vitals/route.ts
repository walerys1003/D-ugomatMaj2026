import { NextResponse } from "next/server";
import { rateLimit, clientIdFromHeaders, RATE_LIMIT_PROFILES } from "@/lib/security/rate-limit";

/**
 * Tier 5.5 — Web Vitals beacon endpoint.
 *
 * Odbiera metryki Core Web Vitals (CLS, INP, LCP, FCP, TTFB) wysyłane
 * przez `app/web-vitals.tsx` przez `navigator.sendBeacon`. Loguje
 * strukturalny JSON do stdout — gotowy do scrapowania przez Vercel
 * Analytics / Datadog / CloudWatch.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VitalReport {
  id?: unknown;
  name?: unknown;
  value?: unknown;
  rating?: unknown;
  delta?: unknown;
  navigationType?: unknown;
  url?: unknown;
}

const ALLOWED_NAMES = new Set(["CLS", "INP", "LCP", "FCP", "TTFB", "FID"]);

function trimString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  if (value.length === 0) return null;
  return value.slice(0, max);
}

function safeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value * 1000) / 1000;
}

export async function POST(request: Request) {
  const ip = clientIdFromHeaders(request.headers);
  const rl = rateLimit(`obs:vitals:${ip}`, RATE_LIMIT_PROFILES.api);
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

  let payload: VitalReport = {};
  try {
    payload = (await request.json()) as VitalReport;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = trimString(payload.name, 20);
  if (!name || !ALLOWED_NAMES.has(name)) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }

  const sanitized = {
    id: trimString(payload.id, 100),
    name,
    value: safeNumber(payload.value),
    rating: trimString(payload.rating, 20),
    delta: safeNumber(payload.delta),
    navigation_type: trimString(payload.navigationType, 30),
    url: trimString(payload.url, 1000),
    ip,
    timestamp: new Date().toISOString(),
  };

  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      level: "info",
      source: "web_vitals",
      ...sanitized,
    }),
  );

  return NextResponse.json({ ok: true });
}
