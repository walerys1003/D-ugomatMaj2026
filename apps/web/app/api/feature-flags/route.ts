/**
 * Tier 20 — Feature flags API.
 *
 * GET /api/feature-flags?keys=a,b,c — evaluate batch for current user
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { evaluateAll, type EvaluationContext } from "@/lib/feature-flags";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const url = new URL(req.url);
  const keysRaw = url.searchParams.get("keys");
  if (!keysRaw) return NextResponse.json({ error: "missing_keys" }, { status: 400 });
  const keys = keysRaw.split(",").map((s) => s.trim()).filter(Boolean);
  if (keys.length === 0) return NextResponse.json({ flags: {} });

  const ctx: EvaluationContext = {
    userId: user?.id,
    email: user?.email ?? undefined,
    country: url.searchParams.get("country") ?? undefined,
    plan: url.searchParams.get("plan") ?? undefined,
  };
  const flags = await evaluateAll(keys, ctx);
  return NextResponse.json({ flags });
}
