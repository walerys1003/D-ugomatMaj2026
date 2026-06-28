import { NextRequest, NextResponse } from "next/server";
import { createListing, listListings, ListingType, ListingStatus, PricingModel } from "@/lib/marketplace/listings";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  const sp = req.nextUrl.searchParams;
  try {
    const listings = await listListings(supabase, {
      type: (sp.get("type") as ListingType) ?? undefined,
      category: sp.get("category") ?? undefined,
      status: (sp.get("status") as ListingStatus) ?? "approved",
      q: sp.get("q") ?? undefined,
      limit: sp.get("limit") ? Number(sp.get("limit")) : 50,
    });
    return NextResponse.json({ listings });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "list_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.name || !body.type || !body.shortDescription || !body.category || !body.pricingModel) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const listing = await createListing(supabase, {
      publisherId: user.id,
      type: body.type as ListingType,
      name: body.name,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription,
      category: body.category,
      tags: body.tags,
      pricingModel: body.pricingModel as PricingModel,
      priceCents: body.priceCents,
      currency: body.currency,
      revenueSharePct: body.revenueSharePct,
      iconUrl: body.iconUrl,
      homepageUrl: body.homepageUrl,
      sourceRepoUrl: body.sourceRepoUrl,
      manifest: body.manifest,
    });
    return NextResponse.json({ listing }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "create_failed" }, { status: 500 });
  }
}
