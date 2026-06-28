/**
 * Wave 8 / T003-209 — POST /api/orgs/switch
 *
 * Switches the user's active organization context by setting an
 * `active_org_id` cookie + bumping `last_active_at` on the membership.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  org_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues.slice(0, 8) }, { status: 400 });
  }

  // Verify user is a member of target org
  const { data: m } = await sb
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .eq("org_id", parsed.data.org_id)
    .maybeSingle();
  if (!m) {
    return NextResponse.json({ error: "not_a_member" }, { status: 403 });
  }

  // Best-effort: bump last_active_at — ignore if column missing.
  try {
    const sbLoose = sb as unknown as {
      from: (t: string) => {
        update: (vals: Record<string, unknown>) => {
          eq: (c: string, v: unknown) => { eq: (c: string, v: unknown) => Promise<{ error: unknown }> };
        };
      };
    };
    await sbLoose
      .from("org_memberships")
      .update({ last_active_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("org_id", parsed.data.org_id);
  } catch {
    // silently skip
  }

  const res = NextResponse.json({ ok: true, org_id: parsed.data.org_id, role: m.role });
  res.cookies.set("active_org_id", parsed.data.org_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
