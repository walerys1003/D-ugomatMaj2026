import { NextRequest, NextResponse } from "next/server";
import { createOrganization, listUserOrganizations } from "@/lib/enterprise/organizations";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json({ organizations: await listUserOrganizations(user.id) });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "missing name" }, { status: 400 });
  const org = await createOrganization({ ownerUserId: user.id, name: body.name, plan: body.plan, seats: body.seats });
  return NextResponse.json(org, { status: 201 });
}
