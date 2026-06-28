/**
 * GET /api/billing/plans — lista wszystkich planów subskrypcji.
 */
import { NextResponse } from "next/server";
import { listPlans, annualDiscountPct } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function GET() {
  const plans = listPlans().map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    monthly_grosze: p.monthlyGrosze,
    annual_grosze: p.annualGrosze,
    annual_discount_pct: Math.round(annualDiscountPct(p.id) * 100),
    features: p.features,
    case_limit: p.caseLimit,
    ai_generations_per_month: p.aiGenerationsPerMonth,
    tenant_seat_limit: p.tenantSeatLimit,
    api_access: p.apiAccess,
    highlight: !!p.highlight,
  }));
  return NextResponse.json({ plans });
}
