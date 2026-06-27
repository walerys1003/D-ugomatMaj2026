import { NextRequest, NextResponse } from "next/server";
import { persistServerAction, QueueOp } from "@/lib/pwa/offline-queue";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function GET(_req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("offline_queue")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ queue: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.op || !body.payload) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  try {
    const action = await persistServerAction(supabase, user.id, body.op as QueueOp, body.payload);
    return NextResponse.json({ action }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "queue_failed" }, { status: 500 });
  }
}
