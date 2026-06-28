import { NextRequest, NextResponse } from "next/server";
import { listFeatured } from "@/lib/marketplace/featured";

export async function GET(_req: NextRequest) {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  const supabase = await createSupabaseServerClient();
  try {
    const slots = await listFeatured(supabase);
    return NextResponse.json({ slots });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "featured_failed" }, { status: 500 });
  }
}
