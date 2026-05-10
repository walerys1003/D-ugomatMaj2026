/**
 * GET /api/health — Tier 5 liveness probe.
 *
 * Lightweight check (bez DB query, bez wywołań zewnętrznych) używany przez:
 *   - load balancery (Cloudflare/Vercel),
 *   - skrypty CI/CD ("smoke test" po deploy),
 *   - status page jako baseline up/down.
 *
 * Response:
 *   { ok: true, version, uptime_seconds, build_sha, env, time }
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROCESS_START = Date.now();

interface HealthPayload {
  ok: true;
  service: "dlugomat-web";
  version: string;
  build_sha: string;
  env: string;
  uptime_seconds: number;
  time: string;
}

export async function GET(): Promise<NextResponse> {
  const payload: HealthPayload = {
    ok: true,
    service: "dlugomat-web",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
    build_sha:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
      process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 12) ??
      "dev",
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    uptime_seconds: Math.floor((Date.now() - PROCESS_START) / 1000),
    time: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-robots-tag": "noindex",
    },
  });
}

export async function HEAD(): Promise<Response> {
  return new Response(null, {
    status: 200,
    headers: {
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });
}
