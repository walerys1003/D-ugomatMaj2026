/**
 * Wave 8 / T003-201 — GET /api/orgs/billing/details
 *
 * Returns billing snapshot for the user's active organization:
 *   { plan, currency, next_invoice_at, payment_method_last4,
 *     subscription_status, seats_used, seats_limit }
 *
 * FE caller: panel/organizacja/billing page.
 */
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  // Active org membership (most recent)
  const { data: m } = await sb
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1);
  const orgId = m?.[0]?.org_id as string | undefined;
  if (!orgId) {
    return NextResponse.json({ error: "no_organization" }, { status: 404 });
  }

  // Loose-typed access — `organization_billing` / `subscriptions` may not be in Database type.
  const sbLoose = sb as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, v: unknown) => {
          maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
        };
      };
    };
  };

  let billing: Record<string, unknown> | null = null;
  try {
    const { data } = await sbLoose
      .from("organization_billing")
      .select("plan, currency, next_invoice_at, payment_method_last4, subscription_status, seats_used, seats_limit, stripe_customer_id")
      .eq("org_id", orgId)
      .maybeSingle();
    billing = data;
  } catch {
    billing = null;
  }

  // Member count fallback
  let seatsUsed = (billing?.seats_used as number | undefined) ?? null;
  if (seatsUsed === null) {
    const { count } = await sb
      .from("org_memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", orgId);
    seatsUsed = count ?? 0;
  }

  return NextResponse.json({
    org_id: orgId,
    plan: billing?.plan ?? "free",
    currency: billing?.currency ?? "PLN",
    subscription_status: billing?.subscription_status ?? "inactive",
    next_invoice_at: billing?.next_invoice_at ?? null,
    payment_method_last4: billing?.payment_method_last4 ?? null,
    seats_used: seatsUsed,
    seats_limit: billing?.seats_limit ?? 3,
  });
}
