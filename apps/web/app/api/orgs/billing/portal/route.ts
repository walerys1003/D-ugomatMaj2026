/**
 * Wave 8 / T003-203 — POST /api/orgs/billing/portal
 *
 * Creates a Stripe Billing Portal session for the user's organization
 * and returns the redirect URL.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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

  // Look up stripe customer id
  const sbLoose = sb as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, v: unknown) => {
          maybeSingle: () => Promise<{ data: { stripe_customer_id?: string } | null }>;
        };
      };
    };
  };

  let customerId: string | null = null;
  try {
    const { data } = await sbLoose
      .from("organization_billing")
      .select("stripe_customer_id")
      .eq("org_id", orgId)
      .maybeSingle();
    customerId = data?.stripe_customer_id ?? null;
  } catch {
    customerId = null;
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "no_stripe_customer", message: "Brak aktywnej subskrypcji dla tej organizacji." },
      { status: 404 },
    );
  }

  // Create portal session via Stripe REST API (avoids importing the SDK).
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }
  const origin = new URL(req.url).origin;
  const returnUrl = `${origin}/panel/organizacja/rozliczenia`;

  try {
    const params = new URLSearchParams({
      customer: customerId,
      return_url: returnUrl,
    });
    const r = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const j = (await r.json()) as { url?: string; error?: { message?: string } };
    if (!r.ok || !j.url) {
      return NextResponse.json(
        { error: "stripe_portal_failed", message: j.error?.message ?? "unknown" },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: j.url });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "stripe_portal_failed", message: (e as Error).message },
      { status: 502 },
    );
  }
}
