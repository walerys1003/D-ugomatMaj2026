import { NextRequest, NextResponse } from "next/server";
import { installPlugin } from "@/lib/marketplace/plugin-lifecycle";

export async function POST(req: NextRequest) {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.orgId || !body.listingId || !body.manifest || !Array.isArray(body.grantedPermissions)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const installation = await installPlugin(supabase, {
      orgId: body.orgId,
      listingId: body.listingId,
      installedBy: user.id,
      manifest: body.manifest,
      grantedPermissions: body.grantedPermissions,
      config: body.config,
    });
    return NextResponse.json({ installation }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "install_failed" }, { status: 400 });
  }
}
