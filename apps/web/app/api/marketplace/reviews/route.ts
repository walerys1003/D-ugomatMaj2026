import { NextRequest, NextResponse } from "next/server";
import { submitReview, listReviews } from "@/lib/marketplace/reviews";

export async function GET(req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const listingId = req.nextUrl.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId_required" }, { status: 400 });
  try {
    const reviews = await listReviews(supabase, listingId, 50);
    return NextResponse.json({ reviews });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "list_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.listingId || !body.rating) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  try {
    const review = await submitReview(supabase, {
      listingId: body.listingId,
      userId: user.id,
      rating: Number(body.rating),
      title: body.title,
      body: body.body,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "review_failed" }, { status: 400 });
  }
}
