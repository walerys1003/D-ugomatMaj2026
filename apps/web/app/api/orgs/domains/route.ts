/**
 * Wave 8 / T003-207 — GET+POST /api/orgs/domains
 *
 * GET — list verified + pending domains for active organization
 * POST — register a new domain claim, generates DNS TXT challenge value
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DomainSchema = z.object({
  domain: z.string().trim().min(3).max(253).regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, "invalid_domain"),
});

async function resolveOrg(sb: Awaited<ReturnType<typeof createServerSupabase>>, userId: string) {
  const { data } = await sb
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })
    .limit(1);
  return { orgId: data?.[0]?.org_id as string | undefined, role: data?.[0]?.role as string | undefined };
}

export async function GET() {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { orgId } = await resolveOrg(sb, user.id);
  if (!orgId) return NextResponse.json({ data: [] });

  const sbLoose = sb as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, v: unknown) => {
          order: (col: string, opts: { ascending: boolean }) => Promise<{ data: Array<Record<string, unknown>> | null }>;
        };
      };
    };
  };
  try {
    const { data } = await sbLoose
      .from("custom_domains")
      .select("id, domain, verified, txt_challenge, verified_at, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req: NextRequest) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { orgId, role } = await resolveOrg(sb, user.id);
  if (!orgId) return NextResponse.json({ error: "no_organization" }, { status: 404 });
  if (role !== "owner" && role !== "org_admin") {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = DomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues.slice(0, 8) }, { status: 400 });
  }

  const txtChallenge = `dlugomat-verify=${randomBytes(16).toString("hex")}`;
  const row = {
    org_id: orgId,
    domain: parsed.data.domain.toLowerCase(),
    verified: false,
    txt_challenge: txtChallenge,
    created_at: new Date().toISOString(),
    created_by: user.id,
  };
  const { data, error } = await sb.from("custom_domains").insert(row as never).select().maybeSingle();
  if (error) {
    return NextResponse.json({ error: "insert_failed", details: error.message }, { status: 500 });
  }
  return NextResponse.json({
    data,
    instructions: {
      record_type: "TXT",
      host: `_dlugomat.${parsed.data.domain.toLowerCase()}`,
      value: txtChallenge,
      message: "Dodaj rekord TXT w panelu DNS. Weryfikacja w ciągu 5 minut.",
    },
  }, { status: 201 });
}
