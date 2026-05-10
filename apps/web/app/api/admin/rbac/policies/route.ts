/**
 * Tier 23 — RBAC fine-grained policies admin API.
 *
 * GET    /api/admin/rbac/policies  → list all
 * POST   /api/admin/rbac/policies  → upsert (create/update)
 * DELETE /api/admin/rbac/policies?id=… → delete
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { listAllPolicies, upsertPolicy, deletePolicy, type PolicyRule } from "@/lib/security/rbac-fine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  return { ok: role === "admin", userId: user.id };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const policies = await listAllPolicies();
  return NextResponse.json({ policies });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as Partial<PolicyRule> | null;
  if (!body?.name || !Array.isArray(body.actions) || !Array.isArray(body.resources) || !body.effect) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const rule = await upsertPolicy({
    id: body.id,
    name: body.name,
    effect: body.effect,
    actions: body.actions,
    resources: body.resources,
    subjects: body.subjects ?? {},
    conditions: body.conditions ?? [],
    priority: body.priority ?? 100,
    enabled: body.enabled ?? true,
  });
  return NextResponse.json({ policy: rule }, { status: 201 });
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await deletePolicy(id);
  return NextResponse.json({ ok: true });
}
