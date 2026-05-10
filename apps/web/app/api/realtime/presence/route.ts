/**
 * Tier 21 — Presence heartbeat endpoint.
 *
 * POST /api/realtime/presence  → heartbeat (klient pinguje co 20s)
 *   body: { topic?, status?, device?, metadata? }
 *
 * DELETE /api/realtime/presence  → set offline (logout / page unload)
 *
 * GET /api/realtime/presence?topic=case:42  → lista obecnych w topicu
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { heartbeat, setOffline, listPresenceForTopic, type PresenceStatus } from "@/lib/realtime/presence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    topic?: string | null;
    status?: PresenceStatus;
    device?: "web" | "ios" | "android" | "desktop";
    metadata?: Record<string, unknown>;
  };
  const state = await heartbeat({
    userId: user.id,
    displayName: (user.user_metadata as Record<string, unknown> | undefined)?.full_name as string | null | undefined,
    avatarUrl: (user.user_metadata as Record<string, unknown> | undefined)?.avatar_url as string | null | undefined,
    status: body.status,
    topic: body.topic ?? null,
    device: body.device,
    metadata: body.metadata,
  });
  return NextResponse.json({ presence: state });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await setOffline(user.id);
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const topic = new URL(req.url).searchParams.get("topic");
  if (!topic) return NextResponse.json({ error: "missing_topic" }, { status: 400 });
  const list = await listPresenceForTopic(topic);
  return NextResponse.json({ presence: list });
}
