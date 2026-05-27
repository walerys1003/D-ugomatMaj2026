/**
 * V5-INFRA · telemetry sink (Wave 5 · AGENT B5)
 * ----------------------------------------------------------------
 * Lightweight POST endpoint dla V5 telemetry events.
 * Strategy: log-and-noop unless TELEMETRY_DESTINATION_URL is set.
 *
 * Privacy:
 *   - Server truncates IP to /24 (IPv4) or /48 (IPv6)
 *   - Never logs body to STDOUT in production (env-gated)
 *   - 1 KB payload limit (drops larger silently)
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;

function truncateIp(ip: string | null): string {
  if (!ip) return "anon";
  if (ip.includes(":")) {
    // IPv6 — keep first 3 hextets (~/48)
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + "::/48";
  }
  // IPv4 — keep first 3 octets
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts.slice(0, 3).join(".")}.0/24` : "anon";
}

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const enriched = {
      ...((payload as object) ?? {}),
      _ip_class: truncateIp(ip),
      _ua: request.headers.get("user-agent")?.slice(0, 200) ?? null,
    };

    // Dev: log to console (sampled).
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[V5][telemetry]", enriched);
    }

    // Prod: forward to external sink if configured.
    const sink = process.env.TELEMETRY_DESTINATION_URL;
    if (sink) {
      // Fire-and-forget — never block response
      void fetch(sink, {
        method: "POST",
        body: JSON.stringify(enriched),
        headers: { "Content-Type": "application/json" },
        // Cloudflare workers limitation: short timeout
        signal: AbortSignal.timeout(2000),
      }).catch(() => {});
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    // never propagate to client
    return new NextResponse(null, { status: 204 });
  }
}

// CORS preflight (telemetry should never be cross-origin but be safe)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL ?? "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
