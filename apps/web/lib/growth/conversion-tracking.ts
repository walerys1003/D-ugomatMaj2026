/**
 * Długomat — Tier 8 — Conversion tracking + funnel analytics.
 *
 * Lekki internal analytics — nie wysyłamy do GA/FB Pixel z serwera (osobna
 * warstwa client-side dla marketing pixels). Tutaj zapisujemy do
 * `conversion_events` aby:
 *  - liczyć funnel (landing → wizard_start → wizard_complete → checkout → paid)
 *  - łączyć z affiliate / referral / coupon / experiment dla atrybucji
 *  - eksportować do BI (Metabase / Looker przez Supabase)
 *
 * Standardowe eventy:
 *  - landing_view, signup_completed, wizard_started, wizard_completed,
 *    checkout_started, payment_completed, document_downloaded,
 *    subscription_started, subscription_cancelled, refund_requested
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export type ConversionEvent =
  | "landing_view"
  | "signup_started"
  | "signup_completed"
  | "wizard_started"
  | "wizard_completed"
  | "checkout_started"
  | "payment_completed"
  | "document_downloaded"
  | "subscription_started"
  | "subscription_cancelled"
  | "subscription_upgraded"
  | "subscription_downgraded"
  | "refund_requested"
  | "referral_redeemed"
  | "affiliate_attributed";

export interface RecordEventInput {
  event: ConversionEvent;
  userId?: string | null;
  anonId?: string | null;
  caseId?: string | null;
  paymentId?: string | null;
  amountGrosze?: number | null;
  attribution?: {
    affiliateSlug?: string;
    referralCode?: string;
    couponCode?: string;
    experimentKey?: string;
    variant?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  meta?: Record<string, unknown>;
}

export async function recordConversionEvent(input: RecordEventInput): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("conversion_events").insert({
    event: input.event,
    user_id: input.userId ?? null,
    anon_id: input.anonId ?? null,
    case_id: input.caseId ?? null,
    payment_id: input.paymentId ?? null,
    amount_grosze: input.amountGrosze ?? null,
    attribution: input.attribution ?? null,
    meta: input.meta ?? null,
  });
}

export interface FunnelStep {
  event: ConversionEvent;
  count: number;
  conversionFromPrev: number;
  conversionFromTop: number;
}

export async function computeFunnel(
  steps: ConversionEvent[],
  windowDays: number = 30,
): Promise<FunnelStep[]> {
  const supabase = createSupabaseAdminClient();
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();

  const counts: number[] = [];
  for (const step of steps) {
    const { count } = await supabase
      .from("conversion_events")
      .select("id", { count: "exact", head: true })
      .eq("event", step)
      .gte("created_at", since);
    counts.push(count ?? 0);
  }

  const top = counts[0] ?? 0;
  return steps.map((event, i) => ({
    event,
    count: counts[i],
    conversionFromPrev: i === 0 ? 1 : counts[i - 1] > 0 ? counts[i] / counts[i - 1] : 0,
    conversionFromTop: top > 0 ? counts[i] / top : 0,
  }));
}

export const STANDARD_FUNNEL: ConversionEvent[] = [
  "landing_view",
  "signup_completed",
  "wizard_started",
  "wizard_completed",
  "checkout_started",
  "payment_completed",
  "document_downloaded",
];
