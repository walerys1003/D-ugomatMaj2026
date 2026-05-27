/**
 * Wave 8 / T003-208 — GET+POST /api/orgs/webhooks
 *
 * GET  — list webhook endpoints for active org
 * POST — register a new webhook endpoint; returns generated signing secret once.
 */
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string().max(80)).min(1).max(40),
  description: z.string().max(200).optional(),
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
      .from("webhook_endpoints")
      .select("id, url, events, description, active, secret_prefix, created_at, last_delivery_at")
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
  const parsed = WebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues.slice(0, 8) }, { status: 400 });
  }

  const secret = `whsec_${randomBytes(32).toString("base64url")}`;
  const secretPrefix = secret.slice(0, 12);

  const row = {
    org_id: orgId,
    url: parsed.data.url,
    events: parsed.data.events,
    description: parsed.data.description ?? null,
    active: true,
    secret, // full secret stored; FE reveals once
    secret_prefix: secretPrefix,
    created_at: new Date().toISOString(),
    created_by: user.id,
  };
  const { data, error } = await sb.from("webhook_endpoints").insert(row as never).select().maybeSingle();
  if (error) {
    return NextResponse.json({ error: "insert_failed", details: error.message }, { status: 500 });
  }
  return NextResponse.json({
    data,
    secret,
    message: "Skopiuj sekret TERAZ — będzie ukryty po zamknięciu okna.",
  }, { status: 201 });
}
