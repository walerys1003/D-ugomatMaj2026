/**
 * Tier 18 — Deadlines API.
 *
 * GET    /api/deadlines           → lista aktywnych terminów usera
 * POST   /api/deadlines           → utwórz nowy termin
 * PATCH  /api/deadlines           → snooze / complete
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  createDeadline,
  listUserDeadlines,
  snoozeDeadline,
  completeDeadline,
} from "@/lib/deadlines";
import type { DeadlineKind } from "@/lib/deadlines";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const deadlines = await listUserDeadlines(user.id);
  return NextResponse.json({ deadlines });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | {
        kind?: DeadlineKind;
        title?: string;
        caseId?: string | null;
        startDate?: string;
        daysOverride?: number;
        modeOverride?: "calendar" | "business";
      }
    | null;
  if (!body?.kind || !body?.title || !body?.startDate) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const rec = await createDeadline({
    userId: user.id,
    caseId: body.caseId ?? null,
    kind: body.kind,
    title: body.title,
    startDate: body.startDate,
    daysOverride: body.daysOverride,
    modeOverride: body.modeOverride,
  });
  return NextResponse.json({ deadline: rec }, { status: 201 });
}

export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { id?: string; action?: "snooze" | "complete"; until?: string }
    | null;
  if (!body?.id || !body?.action) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (body.action === "snooze") {
    if (!body.until) return NextResponse.json({ error: "missing_until" }, { status: 400 });
    await snoozeDeadline(body.id, user.id, new Date(body.until));
  } else if (body.action === "complete") {
    await completeDeadline(body.id, user.id);
  }
  return NextResponse.json({ ok: true });
}
