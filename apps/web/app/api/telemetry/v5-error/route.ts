/**
 * V5-INFRA · error telemetry sink (Wave 5 · AGENT B5)
 * ----------------------------------------------------------------
 * Receives client-side error reports from V5 error boundary.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 2048) return new NextResponse(null, { status: 204 });

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[V5][error-telemetry]", payload);
    }

    const sink = process.env.ERROR_TELEMETRY_DESTINATION_URL;
    if (sink) {
      void fetch(sink, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(2000),
      }).catch(() => {});
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
