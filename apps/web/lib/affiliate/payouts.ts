/**
 * Długomat — Tier 8 — Affiliate payouts (monthly batch).
 *
 * Reguły wypłat:
 *  - Próg minimum: 200 zł brutto (20_000 grosze) komisji w statusie "pending"
 *  - Cykl: 1. dnia każdego miesiąca (cron job)
 *  - Wypłata: przelew bankowy / Stripe Connect / PayPal (skonfigurowane przez affiliate)
 *  - Po payout: commissions.status = "paid", payouts row z PDF stwierdzeniem
 *
 * Bookkeeping: każda payout to faktura korekta (affiliate jest klientem,
 * Długomat płaci za usługę "promocja serwisu" — koszt operacyjny).
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export const MIN_PAYOUT_GROSZE = 20_000; // 200 zł

export interface PayoutBatch {
  affiliateId: string;
  payoutId: string;
  amountGrosze: number;
  commissionIds: string[];
  affiliateEmail: string;
  affiliateSlug: string;
}

/**
 * Generuje payout-y dla wszystkich affiliate, którzy mają ≥ MIN_PAYOUT_GROSZE
 * w pending commissions. Zwraca listę utworzonych batchy.
 */
export async function runMonthlyPayouts(): Promise<PayoutBatch[]> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const periodEnd = new Date().toISOString();

  // Aggregate pending commissions per affiliate
  const { data: rows, error } = await sb
    .from("affiliate_commissions")
    .select("id, affiliate_id, amount_grosze, affiliate:affiliate_accounts(payout_email, slug)")
    .eq("status", "pending");
  if (error) throw error;

  const grouped = new Map<string, { sum: number; ids: string[]; email: string; slug: string }>();
  for (const row of (rows as Array<any>) ?? []) {
    const key = row.affiliate_id;
    const existing = grouped.get(key) ?? {
      sum: 0,
      ids: [],
      email: row.affiliate?.payout_email ?? "",
      slug: row.affiliate?.slug ?? "",
    };
    existing.sum += row.amount_grosze;
    existing.ids.push(row.id);
    grouped.set(key, existing);
  }

  const batches: PayoutBatch[] = [];

  for (const [affiliateId, agg] of grouped.entries()) {
    if (agg.sum < MIN_PAYOUT_GROSZE) continue;

    const { data: payout, error: payoutErr } = await sb
      .from("affiliate_payouts")
      .insert({
        affiliate_id: affiliateId,
        amount_grosze: agg.sum,
        period_end: periodEnd,
        status: "pending",
        commission_count: agg.ids.length,
      })
      .select("id")
      .single();

    if (payoutErr || !payout) continue;

    // Mark commissions as paid (linked to payout)
    await sb
      .from("affiliate_commissions")
      .update({
        status: "paid",
        payout_id: (payout as { id: string }).id,
        paid_at: periodEnd,
      })
      .in("id", agg.ids);

    batches.push({
      affiliateId,
      payoutId: (payout as { id: string }).id,
      amountGrosze: agg.sum,
      commissionIds: agg.ids,
      affiliateEmail: agg.email,
      affiliateSlug: agg.slug,
    });
  }

  return batches;
}

export async function markPayoutTransferred(
  payoutId: string,
  externalRef: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb
    .from("affiliate_payouts")
    .update({
      status: "transferred",
      external_ref: externalRef,
      transferred_at: new Date().toISOString(),
    })
    .eq("id", payoutId);
}
