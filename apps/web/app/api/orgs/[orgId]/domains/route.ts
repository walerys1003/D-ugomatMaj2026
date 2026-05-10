import { NextRequest, NextResponse } from "next/server";
import { registerDomain, verifyDomain } from "@/lib/enterprise/custom-domains";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest, ctx: { params: { orgId: string } }) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.domain) return NextResponse.json({ error: "missing domain" }, { status: 400 });
  const d = await registerDomain(ctx.params.orgId, body.domain);
  return NextResponse.json(d, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.domain_id) return NextResponse.json({ error: "missing domain_id" }, { status: 400 });
  const r = await verifyDomain(body.domain_id);
  return NextResponse.json(r);
}
