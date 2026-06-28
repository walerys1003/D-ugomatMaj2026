// Creator payouts — accrue earnings from purchases, generate monthly payout batches.
import { randomUUID } from "crypto";

export interface PurchaseEvent {
  listingId: string;
  partnerId: string;
  buyerOrgId: string;
  grossCents: number;
  currency: "PLN" | "EUR" | "USD";
  revenueSharePct: number; // creator share
}

export interface PayoutLine {
  partnerId: string;
  currency: "PLN" | "EUR" | "USD";
  earnedCents: number;
  platformFeeCents: number;
  netCents: number;
  purchaseCount: number;
}

const PLATFORM_FIXED_FEE_PCT = 0.05; // platform always takes 5% from creator share for processing

export async function recordPurchase(supabase: any, evt: PurchaseEvent): Promise<void> {
  const creatorGross = Math.round(evt.grossCents * evt.revenueSharePct);
  const platformFee = Math.round(creatorGross * PLATFORM_FIXED_FEE_PCT);
  const net = creatorGross - platformFee;
  const row = {
    id: randomUUID(),
    listing_id: evt.listingId,
    partner_id: evt.partnerId,
    buyer_org_id: evt.buyerOrgId,
    gross_cents: evt.grossCents,
    currency: evt.currency,
    revenue_share_pct: evt.revenueSharePct,
    creator_gross_cents: creatorGross,
    platform_fee_cents: platformFee,
    net_cents: net,
    settled: false,
  };
  const { error } = await supabase.from("marketplace_earnings").insert(row);
  if (error) throw error;
}

export async function computePendingPayouts(supabase: any): Promise<PayoutLine[]> {
  const { data, error } = await supabase
    .from("marketplace_earnings")
    .select("partner_id, currency, creator_gross_cents, platform_fee_cents, net_cents")
    .eq("settled", false);
  if (error) throw error;

  const byKey = new Map<string, PayoutLine>();
  for (const r of data ?? []) {
    const key = `${r.partner_id}:${r.currency}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.earnedCents += Number(r.creator_gross_cents);
      existing.platformFeeCents += Number(r.platform_fee_cents);
      existing.netCents += Number(r.net_cents);
      existing.purchaseCount += 1;
    } else {
      byKey.set(key, {
        partnerId: r.partner_id,
        currency: r.currency,
        earnedCents: Number(r.creator_gross_cents),
        platformFeeCents: Number(r.platform_fee_cents),
        netCents: Number(r.net_cents),
        purchaseCount: 1,
      });
    }
  }
  return Array.from(byKey.values());
}

export async function createPayoutBatch(supabase: any): Promise<{ batchId: string; lines: PayoutLine[]; totalNet: number }> {
  const lines = await computePendingPayouts(supabase);
  const batchId = randomUUID();
  const totalNet = lines.reduce((s, l) => s + l.netCents, 0);

  const { error } = await supabase.from("marketplace_payout_batches").insert({
    id: batchId,
    line_count: lines.length,
    total_net_cents: totalNet,
    status: "pending",
    lines,
  });
  if (error) throw error;

  // Mark all unsettled earnings as part of this batch.
  await supabase
    .from("marketplace_earnings")
    .update({ settled: true, payout_batch_id: batchId, settled_at: new Date().toISOString() })
    .eq("settled", false);

  return { batchId, lines, totalNet };
}
