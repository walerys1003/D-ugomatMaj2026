import { NextRequest, NextResponse } from "next/server";
import { uninstallPlugin, updatePlugin, listInstalledPlugins } from "@/lib/marketplace/plugin-lifecycle";

export async function GET(req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId_required" }, { status: 400 });
  try {
    const installations = await listInstalledPlugins(supabase, orgId);
    return NextResponse.json({ installations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "list_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const body = await req.json().catch(() => ({}));
  if (!body.installationId || !body.orgId) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  try {
    await uninstallPlugin(supabase, body.installationId, body.orgId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "uninstall_failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const body = await req.json().catch(() => ({}));
  if (!body.installationId || !body.orgId || !body.manifest) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const installation = await updatePlugin(supabase, body.installationId, body.orgId, body.manifest);
    return NextResponse.json({ installation });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "update_failed" }, { status: 400 });
  }
}
