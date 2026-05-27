/**
 * Wave 8 / T003-206 — POST /api/orgs/scim/regenerate-token
 *
 * Generates a new SCIM bearer token for the organization, stores its
 * SHA-256 hash + prefix, and returns the *plain token* exactly once.
 */
import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const sb = await createServerSupabase();
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
  if (role !== "owner") {
    return NextResponse.json({ error: "owner_only" }, { status: 403 });
  }

  // 32-byte URL-safe token, prefixed for easy identification
  const raw = randomBytes(32).toString("base64url");
  const token = `scim_${raw}`;
  const tokenPrefix = token.slice(0, 12);
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const sbLoose = sb as unknown as {
    from: (t: string) => {
      upsert: (row: Record<string, unknown>, opts?: { onConflict?: string }) => Promise<{ error: { message: string } | null }>;
    };
  };

  try {
    const { error } = await sbLoose
      .from("org_scim_configs")
      .upsert(
        {
          org_id: orgId,
          enabled: true,
          token_hash: tokenHash,
          token_prefix: tokenPrefix,
          rotated_at: new Date().toISOString(),
          rotated_by: user.id,
        },
        { onConflict: "org_id" },
      );
    if (error) {
      return NextResponse.json({ error: "persist_failed", details: error.message }, { status: 500 });
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: "persist_failed", details: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({
    token, // shown exactly once
    token_prefix: tokenPrefix,
    endpoint: `/api/orgs/${orgId}/scim/v2`,
    message: "Skopiuj token TERAZ — nie będzie ponownie wyświetlony.",
  });
}
