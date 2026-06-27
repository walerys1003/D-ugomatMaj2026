import { NextRequest, NextResponse } from "next/server";
import { registerEndpoint, WebhookEvent } from "@/lib/integrations/webhooks-v2";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.url || !Array.isArray(body?.events)) {
    return NextResponse.json({ error: "missing url or events" }, { status: 400 });
  }
  const ep = await registerEndpoint({ user_id: user.id, url: body.url, events: body.events as WebhookEvent[] });
  return NextResponse.json(ep, { status: 201 });
}

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data } = await sb.from("webhook_endpoints").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return NextResponse.json({ endpoints: data ?? [] });
}
