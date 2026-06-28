import { NextResponse } from "next/server";
import { getUserUsageSummary } from "@/lib/ai/usage-tracker";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const url = new URL(req.url);
  const days = Math.max(1, Math.min(365, parseInt(url.searchParams.get("days") ?? "30", 10)));
  const s = await getUserUsageSummary(user.id, days);
  return NextResponse.json(s);
}
