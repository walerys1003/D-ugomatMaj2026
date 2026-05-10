/**
 * GET /api/referrals/code — zwraca lub tworzy referral code dla usera.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getOrCreateReferralCode, getReferralBalance } from "@/lib/referrals/program-v2";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const code = await getOrCreateReferralCode(auth.user.id);
  const balance = await getReferralBalance(auth.user.id);
  return NextResponse.json({ code, balance });
}
