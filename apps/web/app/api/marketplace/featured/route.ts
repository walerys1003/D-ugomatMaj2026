import { NextRequest, NextResponse } from "next/server";
import { listFeatured } from "@/lib/marketplace/featured";

export async function GET(_req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  try {
    const slots = await listFeatured(supabase);
    return NextResponse.json({ slots });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "featured_failed" }, { status: 500 });
  }
}
