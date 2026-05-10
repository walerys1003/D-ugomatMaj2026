import { NextRequest, NextResponse } from "next/server";
import { getGalleryView } from "@/lib/marketplace/template-gallery";

export async function GET(_req: NextRequest) {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabase();
  try {
    const view = await getGalleryView(supabase);
    return NextResponse.json(view);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gallery_failed" }, { status: 500 });
  }
}
