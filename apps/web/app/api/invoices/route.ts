/**
 * GET /api/invoices — lista faktur dla zalogowanego usera.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("invoices")
    .select("id, invoice_number, total_gross_grosze, issue_date, status, is_correction")
    .eq("user_id", auth.user.id)
    .order("issue_date", { ascending: false })
    .limit(100);
  return NextResponse.json({ invoices: data ?? [] });
}
