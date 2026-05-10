/**
 * Tier 18 — Deadlines: due reminders (cron-only).
 *
 * GET /api/deadlines/due — zwraca wszystkie "due" przypomnienia dla
 * wszystkich userów w obecnym oknie. Wywoływane przez scheduler (Vercel Cron
 * lub Supabase pg_cron). Chronione `CRON_SECRET` w headerze `x-cron-key`.
 */

import { NextResponse } from "next/server";
import { findDueReminders } from "@/lib/deadlines";

export async function GET(req: Request) {
  const key = req.headers.get("x-cron-key");
  if (!key || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const due = await findDueReminders();
  return NextResponse.json({ due, count: due.length });
}
