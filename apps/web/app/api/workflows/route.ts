import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { data } = await sb.from("workflows").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return NextResponse.json({ workflows: data ?? [] });
}

export async function POST(req: NextRequest) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.trigger || !Array.isArray(body?.actions)) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const id = randomUUID();
  await sb.from("workflows").insert({
    id,
    user_id: user.id,
    name: body.name,
    enabled: body.enabled ?? true,
    trigger: body.trigger,
    conditions: body.conditions ?? [],
    actions: body.actions,
    created_at: new Date().toISOString(),
  });
  return NextResponse.json({ id }, { status: 201 });
}
