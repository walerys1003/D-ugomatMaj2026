/**
 * Tier 28 — Notification preferences API.
 * GET  /api/notifications/preferences  — zwraca preferencje
 * PUT  /api/notifications/preferences  — upsert preferencji
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  email_deadlines: true,
  email_case_updates: true,
  email_payments: true,
  email_marketing: false,
  sms_deadlines: false,
  sms_critical: true,
  push_enabled: true,
  push_quiet_start: "22:00",
  push_quiet_end: "07:00",
  digest_frequency: "daily" as const,
};

export async function GET() {
  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await sb
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ preferences: data ?? { user_id: user.id, ...DEFAULTS } });
}

export async function PUT(req: NextRequest) {
  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
  for (const key of Object.keys(DEFAULTS) as Array<keyof typeof DEFAULTS>) {
    if (key in body) update[key] = body[key];
  }

  const { error } = await sb.from("notification_preferences").upsert(update, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
