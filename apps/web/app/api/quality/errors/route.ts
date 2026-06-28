import { NextRequest, NextResponse } from "next/server";
import { captureError, recentErrorSummary } from "@/lib/quality/error-tracking";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message : "unknown_client_error";
  await captureError(new Error(message), {
    tags: { source: "client" },
    extra: {
      url: body?.url ?? null,
      stack: body?.stack ?? null,
      metadata: body?.metadata ?? {},
    },
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const summary = await recentErrorSummary();
  return NextResponse.json(summary);
}
