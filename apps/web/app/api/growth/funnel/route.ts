/**
 * GET /api/growth/funnel — funnel metrics (admin only).
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { computeFunnel, STANDARD_FUNNEL } from "@/lib/growth/conversion-tracking";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  // Admin role check
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if ((prof as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") ?? "30");
  const steps = await computeFunnel(STANDARD_FUNNEL, days);
  return NextResponse.json({ steps, window_days: days });
}
