import { NextRequest, NextResponse } from "next/server";
import { createReseller, activateReseller, ResellerTier, validateSubdomain } from "@/lib/marketplace/reseller";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.brandName || !body.brandSubdomain || !body.supportEmail) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const v = validateSubdomain(body.brandSubdomain);
  if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 400 });

  try {
    const reseller = await createReseller(supabase, {
      ownerUserId: user.id,
      brandName: body.brandName,
      brandSubdomain: body.brandSubdomain,
      primaryColor: body.primaryColor,
      logoUrl: body.logoUrl,
      supportEmail: body.supportEmail,
    });
    return NextResponse.json({ reseller }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "create_failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // REALNY BUG (maskowany przez as any): UserRole = user|admin|moderator, BEZ 'owner'.
  // Porównanie do 'owner' było martwe. Uprawnienie admina wystarcza.
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (!body.resellerId) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  try {
    const reseller = await activateReseller(supabase, body.resellerId, (body.tier as ResellerTier) ?? "starter");
    return NextResponse.json({ reseller });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "activate_failed" }, { status: 500 });
  }
}
