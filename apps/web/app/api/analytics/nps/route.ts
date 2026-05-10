import { NextRequest, NextResponse } from "next/server";
import { recordNpsResponse, computeNps } from "@/lib/analytics/nps-survey";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await computeNps(90));
}

export async function POST(req: NextRequest) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.score !== "number") return NextResponse.json({ error: "missing score" }, { status: 400 });
  await recordNpsResponse({ user_id: user.id, score: body.score, comment: body.comment, channel: body.channel });
  return NextResponse.json({ ok: true });
}
