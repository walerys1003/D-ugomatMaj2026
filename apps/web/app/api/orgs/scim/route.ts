/**
 * Wave 8 / T003-205 — GET /api/orgs/scim
 *
 * Returns SCIM provisioning configuration for the user's organization
 * (token *prefix only* for display, endpoint URL, last sync, status).
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: m } = await sb
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1);
  const orgId = m?.[0]?.org_id as string | undefined;
  const role = m?.[0]?.role as string | undefined;
  if (!orgId) return NextResponse.json({ error: "no_organization" }, { status: 404 });
  if (role !== "owner" && role !== "org_admin") {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  const sbLoose = sb as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, v: unknown) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null }> };
      };
    };
  };

  let cfg: Record<string, unknown> | null = null;
  try {
    const { data } = await sbLoose
      .from("org_scim_configs")
      .select("enabled, token_prefix, last_sync_at, last_status, created_at")
      .eq("org_id", orgId)
      .maybeSingle();
    cfg = data;
  } catch {
    cfg = null;
  }

  // Compute SCIM endpoint URL
  const endpoint = `/api/orgs/${orgId}/scim/v2`;

  return NextResponse.json({
    org_id: orgId,
    enabled: cfg?.enabled ?? false,
    token_prefix: cfg?.token_prefix ?? null,
    last_sync_at: cfg?.last_sync_at ?? null,
    last_status: cfg?.last_status ?? "never",
    endpoint,
  });
}
