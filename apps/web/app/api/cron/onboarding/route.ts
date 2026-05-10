/**
 * GET /api/cron/onboarding — dispatcher for due onboarding emails (zad. 243).
 *
 * Wywoływane przez:
 *   - Vercel Cron (vercel.json: schedule "0 * * * *" — co godzinę)
 *   - Supabase Edge Function (alternatywnie)
 *   - Ręcznie z curl + X-Cron-Secret
 *
 * Auth: wymaga nagłówka `X-Cron-Secret` zgodnego z `CRON_SECRET` env.
 *
 * Body: brak (GET). Query:
 *   - ?limit=50 (default 100, max 500)
 *
 * Response 200:
 *   { picked, sent, failed, skipped, ts }
 */
import { NextResponse, type NextRequest } from "next/server";
import { dispatchDueOnboardingEmails } from "@/lib/notifications/onboarding-scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret");

  if (!cronSecret) {
    return NextResponse.json(
      { error: "cron_not_configured" },
      { status: 503 },
    );
  }
  if (!provided || !timingSafeEqual(provided, cronSecret)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Math.min(500, Math.max(1, Number(limitRaw))) : 100;

  try {
    const result = await dispatchDueOnboardingEmails({ limit });
    return NextResponse.json(
      {
        ...result,
        ts: new Date().toISOString(),
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: "internal",
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
