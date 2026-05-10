import { NextRequest, NextResponse } from "next/server";
import { verifyAuditChain } from "@/lib/enterprise/audit-trail";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: { orgId: string } }) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const limit = Math.min(500, parseInt(req.nextUrl.searchParams.get("limit") ?? "200", 10));
  const { data } = await sb
    .from("org_audit_log")
    .select("*")
    .eq("org_id", ctx.params.orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(_req: NextRequest, ctx: { params: { orgId: string } }) {
  const r = await verifyAuditChain(ctx.params.orgId);
  return NextResponse.json(r);
}
