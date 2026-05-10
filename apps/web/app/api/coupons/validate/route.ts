/**
 * POST /api/coupons/validate — sprawdza kod kuponu subskrypcyjnego.
 * Body: { code }
 */
import { NextResponse } from "next/server";
import { getCouponByCode } from "@/lib/coupons/coupon-engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { code?: string };
  if (!body.code) return NextResponse.json({ error: "missing_code" }, { status: 400 });
  const coupon = await getCouponByCode(body.code);
  if (!coupon) return NextResponse.json({ valid: false }, { status: 404 });
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount_pct: coupon.discount_pct,
    discount_grosze: coupon.discount_grosze,
    duration: coupon.duration,
    duration_in_months: coupon.duration_in_months,
    campaign_label: coupon.campaign_label,
    stripe_promotion_code_id: coupon.stripe_promotion_code_id,
  });
}
