/**
 * Wave 6 / T003-001 — GET /api/orgs/current
 *
 * FE caller: `lib/orgs/membership.ts → fetchCurrentOrg()`.
 *
 * Returns the user's primary (most-recently-active) organization or
 * null. Uses `org_memberships.last_active_at` as the recency signal;
 * falls back to `joined_at`.
 */
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Tolerate older schemas where last_active_at column does not yet exist.
  const { data, error } = await sb
    .from("org_memberships")
    .select("role, joined_at, last_active_at, org:organizations(*)")
    .eq("user_id", user.id)
    .order("last_active_at", { ascending: false, nullsFirst: false })
    .order("joined_at", { ascending: false })
    .limit(1);

  if (error) {
    // Fall back without last_active_at ordering if column missing.
    const { data: fallback } = await sb
      .from("org_memberships")
      .select("role, joined_at, org:organizations(*)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1);
    const row = fallback?.[0];
    if (!row) return NextResponse.json(null, { status: 200 });
    return NextResponse.json(row.org, { status: 200 });
  }

  const row = data?.[0];
  if (!row) return NextResponse.json(null, { status: 200 });
  return NextResponse.json(row.org, { status: 200 });
}
