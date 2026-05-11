/**
 * Tier 33-1/33-2 — Cron endpoint to run drip-email scheduler.
 *
 * Triggered hourly by Vercel Cron (or Supabase Edge cron). Protected by
 * `CRON_SECRET` header. Returns JSON summary of enqueued / skipped emails.
 */
import { NextResponse } from "next/server";
import { runDripScheduler } from "@/lib/notifications/drip-scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runDripScheduler();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
