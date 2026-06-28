/**
 * GET /api/billing/usage — bieżący stan zużycia (cases / AI generations).
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getCurrentUsage } from "@/lib/billing/subscriptions";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const usage = await getCurrentUsage(auth.user.id);
  return NextResponse.json(usage);
}
