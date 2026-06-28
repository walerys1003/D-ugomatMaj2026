import { NextRequest, NextResponse } from "next/server";
import { inviteMember, setMemberRole, removeMember, OrgRole } from "@/lib/enterprise/organizations";
import { hasPermission } from "@/lib/enterprise/rbac";
import { recordOrgAuditEntry } from "@/lib/enterprise/audit-trail";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

async function getRole(orgId: string, userId: string): Promise<OrgRole | null> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data } = await sb.from("org_memberships").select("role").eq("org_id", orgId).eq("user_id", userId).maybeSingle();
  return (data?.role as OrgRole) ?? null;
}

export async function GET(_req: NextRequest, ctx: { params: { orgId: string } }) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const role = await getRole(ctx.params.orgId, user.id);
  if (!role || !hasPermission(role, "org.members.read")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { data } = await sb
    .from("org_memberships")
    .select("user_id, role, joined_at, profile:profiles(email, full_name)")
    .eq("org_id", ctx.params.orgId);
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(req: NextRequest, ctx: { params: { orgId: string } }) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const role = await getRole(ctx.params.orgId, user.id);
  if (!role || !hasPermission(role, "org.members.invite")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.role) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const r = await inviteMember(ctx.params.orgId, body.email, body.role as OrgRole, user.id);
  await recordOrgAuditEntry({
    org_id: ctx.params.orgId,
    actor_id: user.id,
    action: "org.member.invite",
    target_type: "email",
    target_id: body.email,
    metadata: { role: body.role },
  });
  return NextResponse.json(r, { status: 201 });
}

export async function PATCH(req: NextRequest, ctx: { params: { orgId: string } }) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const role = await getRole(ctx.params.orgId, user.id);
  if (!role || !hasPermission(role, "org.members.change_role")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.user_id || !body?.role) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  await setMemberRole(ctx.params.orgId, body.user_id, body.role);
  await recordOrgAuditEntry({
    org_id: ctx.params.orgId,
    actor_id: user.id,
    action: "org.member.role_change",
    target_type: "user",
    target_id: body.user_id,
    metadata: { role: body.role },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: { orgId: string } }) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const role = await getRole(ctx.params.orgId, user.id);
  if (!role || !hasPermission(role, "org.members.remove")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const target = req.nextUrl.searchParams.get("user_id");
  if (!target) return NextResponse.json({ error: "missing user_id" }, { status: 400 });
  await removeMember(ctx.params.orgId, target);
  await recordOrgAuditEntry({
    org_id: ctx.params.orgId,
    actor_id: user.id,
    action: "org.member.remove",
    target_type: "user",
    target_id: target,
  });
  return NextResponse.json({ ok: true });
}
