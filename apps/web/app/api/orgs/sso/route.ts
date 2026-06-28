/**
 * Wave 8 / T003-204 — GET+PUT /api/orgs/sso
 *
 * Read or update SSO configuration for the user's active organization.
 * Only org owners can mutate.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SsoConfigSchema = z.object({
  provider: z.enum(["saml", "oidc"]),
  enabled: z.boolean().optional(),
  metadata_url: z.string().url().optional(),
  metadata_xml: z.string().max(50000).optional(),
  acs_url: z.string().url().optional(),
  entity_id: z.string().max(200).optional(),
  attribute_mappings: z.record(z.string(), z.string()).optional(),
});

async function resolveOrg(sb: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data } = await sb
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1);
  return { orgId: data?.[0]?.org_id as string | undefined, role: data?.[0]?.role as string | undefined };
}

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { orgId } = await resolveOrg(sb, user.id);
  if (!orgId) return NextResponse.json({ error: "no_organization" }, { status: 404 });

  const sbLoose = sb as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, v: unknown) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null }> };
      };
    };
  };
  try {
    const { data } = await sbLoose
      .from("org_sso_configs")
      .select("provider, enabled, metadata_url, acs_url, entity_id, attribute_mappings, updated_at")
      .eq("org_id", orgId)
      .maybeSingle();
    return NextResponse.json(data ?? { provider: null, enabled: false });
  } catch {
    return NextResponse.json({ provider: null, enabled: false });
  }
}

export async function PUT(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { orgId, role } = await resolveOrg(sb, user.id);
  if (!orgId) return NextResponse.json({ error: "no_organization" }, { status: 404 });
  if (role !== "owner") return NextResponse.json({ error: "owner_only" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = SsoConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues.slice(0, 8) }, { status: 400 });
  }

  const row = {
    org_id: orgId,
    provider: parsed.data.provider,
    enabled: parsed.data.enabled ?? false,
    metadata_url: parsed.data.metadata_url ?? null,
    metadata_xml: parsed.data.metadata_xml ?? null,
    acs_url: parsed.data.acs_url ?? null,
    entity_id: parsed.data.entity_id ?? null,
    attribute_mappings: parsed.data.attribute_mappings ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("org_sso_configs")
    .upsert(row as never, { onConflict: "org_id" })
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: "upsert_failed", details: error.message }, { status: 500 });
  return NextResponse.json(data ?? { ok: true });
}
