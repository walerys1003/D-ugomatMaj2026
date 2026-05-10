/**
 * POST /api/growth/track — endpoint do logowania conversion events z client-side.
 * Body: { event, anon_id?, case_id?, attribution?, meta? }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { recordConversionEvent, type ConversionEvent } from "@/lib/growth/conversion-tracking";

export const dynamic = "force-dynamic";

const ALLOWED_EVENTS: ConversionEvent[] = [
  "landing_view",
  "signup_started",
  "signup_completed",
  "wizard_started",
  "wizard_completed",
  "checkout_started",
  "payment_completed",
  "document_downloaded",
  "subscription_started",
  "subscription_cancelled",
  "subscription_upgraded",
  "subscription_downgraded",
  "refund_requested",
  "referral_redeemed",
  "affiliate_attributed",
];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    event?: ConversionEvent;
    anon_id?: string;
    case_id?: string;
    amount_grosze?: number;
    attribution?: Record<string, string>;
    meta?: Record<string, unknown>;
  };
  if (!body.event || !ALLOWED_EVENTS.includes(body.event)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  await recordConversionEvent({
    event: body.event,
    userId: auth.user?.id ?? null,
    anonId: body.anon_id ?? null,
    caseId: body.case_id ?? null,
    amountGrosze: body.amount_grosze ?? null,
    attribution: body.attribution as any,
    meta: body.meta,
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
