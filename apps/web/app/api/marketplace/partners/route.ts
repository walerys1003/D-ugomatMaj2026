import { NextRequest, NextResponse } from "next/server";
import { applyToPartnerProgram, approvePartner, listPartners, promoteTier, PartnerStatus, PartnerTier } from "@/lib/marketplace/partner-program";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin" || data?.role === "owner";
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const status = (req.nextUrl.searchParams.get("status") as PartnerStatus) ?? undefined;
  try {
    const partners = await listPartners(supabase, status);
    return NextResponse.json({ partners });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "list_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.companyName || !body.contactEmail || !body.pitch) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const partner = await applyToPartnerProgram(supabase, {
      userId: user.id,
      companyName: body.companyName,
      contactEmail: body.contactEmail,
      websiteUrl: body.websiteUrl,
      pitch: body.pitch,
      expectedListings: body.expectedListings,
    });
    return NextResponse.json({ partner }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "apply_failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  if (!body.partnerId || !body.action) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  try {
    if (body.action === "approve") {
      const partner = await approvePartner(supabase, body.partnerId, (body.tier as PartnerTier) ?? "bronze");
      return NextResponse.json({ partner });
    }
    if (body.action === "promote") {
      const partner = await promoteTier(supabase, body.partnerId, body.tier as PartnerTier);
      return NextResponse.json({ partner });
    }
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "update_failed" }, { status: 500 });
  }
}
