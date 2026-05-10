/**
 * Tier 18 — Notification preferences API.
 *
 * GET   /api/notifications/preferences  → odczyt prefs usera
 * PATCH /api/notifications/preferences  → aktualizacja prefs
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  getUserPreferences,
  updateUserPreferences,
  type NotificationPreferences,
} from "@/lib/notifications/orchestration";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const prefs = await getUserPreferences(user.id);
  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Partial<NotificationPreferences> | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const updated = await updateUserPreferences(user.id, body);
  return NextResponse.json({ preferences: updated });
}
