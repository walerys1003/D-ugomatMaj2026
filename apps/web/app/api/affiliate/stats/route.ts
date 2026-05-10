/**
 * GET /api/affiliate/stats — statystyki dla zalogowanego affiliate.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { getAffiliateStats } from "@/lib/affiliate/tracking";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  const { data: acc } = await admin
    .from("affiliate_accounts")
    .select("*")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!acc) return NextResponse.json({ error: "not_affiliate" }, { status: 404 });
  const stats = await getAffiliateStats((acc as { id: string }).id);
  return NextResponse.json({ account: acc, stats });
}
