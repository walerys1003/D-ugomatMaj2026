import { NextRequest, NextResponse } from "next/server";
import { trackEvent, trackBatch } from "@/lib/analytics/event-stream";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const ctx = {
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    user_agent: req.headers.get("user-agent") ?? undefined,
    locale: req.headers.get("accept-language") ?? undefined,
  };
  if (Array.isArray(body.events)) {
    const r = await trackBatch(
      body.events.map((e: any) => ({ ...e, user_id: e.user_id ?? user?.id ?? null, context: { ...ctx, ...(e.context ?? {}) } })),
    );
    return NextResponse.json(r);
  }
  if (!body.event) return NextResponse.json({ error: "missing event" }, { status: 400 });
  const r = await trackEvent({ ...body, user_id: body.user_id ?? user?.id ?? null, context: { ...ctx, ...(body.context ?? {}) } });
  return NextResponse.json(r);
}
