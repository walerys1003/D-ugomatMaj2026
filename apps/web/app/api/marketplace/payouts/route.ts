import { NextRequest, NextResponse } from "next/server";
import { computePendingPayouts, createPayoutBatch } from "@/lib/marketplace/payouts";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin" && data?.role !== "owner") return null;
  return user;
}

export async function GET(_req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (!(await requireAdmin(supabase))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const lines = await computePendingPayouts(supabase);
    return NextResponse.json({ lines, totalLines: lines.length, totalNetCents: lines.reduce((s, l) => s + l.netCents, 0) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "compute_failed" }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (!(await requireAdmin(supabase))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const batch = await createPayoutBatch(supabase);
    return NextResponse.json(batch, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "batch_failed" }, { status: 500 });
  }
}
