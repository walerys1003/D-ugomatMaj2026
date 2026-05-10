// Partner / developer program — apply, approve, tiers, revenue share rates.
import { randomUUID } from "crypto";

export type PartnerTier = "bronze" | "silver" | "gold" | "platinum";
export type PartnerStatus = "applied" | "approved" | "rejected" | "suspended";

export interface PartnerApplication {
  userId: string;
  companyName: string;
  contactEmail: string;
  websiteUrl?: string;
  pitch: string;
  expectedListings?: number;
}

export interface Partner {
  id: string;
  userId: string;
  companyName: string;
  contactEmail: string;
  status: PartnerStatus;
  tier: PartnerTier;
  revenueSharePct: number; // creator share
  payoutMethod?: "bank_transfer" | "stripe" | "paypal";
  taxId?: string;
  createdAt: string;
}

// Revenue-share schedule. Higher tier = more retained by creator.
export const TIER_REVENUE_SHARE: Record<PartnerTier, number> = {
  bronze: 0.7,
  silver: 0.75,
  gold: 0.8,
  platinum: 0.85,
};

export async function applyToPartnerProgram(supabase: any, app: PartnerApplication): Promise<Partner> {
  const row = {
    id: randomUUID(),
    user_id: app.userId,
    company_name: app.companyName,
    contact_email: app.contactEmail,
    website_url: app.websiteUrl ?? null,
    pitch: app.pitch,
    expected_listings: app.expectedListings ?? 0,
    status: "applied" as const,
    tier: "bronze" as PartnerTier,
    revenue_share_pct: TIER_REVENUE_SHARE.bronze,
  };
  const { data, error } = await supabase.from("marketplace_partners").insert(row).select("*").single();
  if (error) throw error;
  return mapPartner(data);
}

export async function approvePartner(supabase: any, partnerId: string, tier: PartnerTier = "bronze"): Promise<Partner> {
  const { data, error } = await supabase
    .from("marketplace_partners")
    .update({ status: "approved", tier, revenue_share_pct: TIER_REVENUE_SHARE[tier] })
    .eq("id", partnerId)
    .select("*")
    .single();
  if (error) throw error;
  return mapPartner(data);
}

export async function promoteTier(supabase: any, partnerId: string, tier: PartnerTier): Promise<Partner> {
  const { data, error } = await supabase
    .from("marketplace_partners")
    .update({ tier, revenue_share_pct: TIER_REVENUE_SHARE[tier] })
    .eq("id", partnerId)
    .select("*")
    .single();
  if (error) throw error;
  return mapPartner(data);
}

export async function listPartners(supabase: any, status?: PartnerStatus): Promise<Partner[]> {
  let q = supabase.from("marketplace_partners").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapPartner);
}

function mapPartner(r: any): Partner {
  return {
    id: r.id,
    userId: r.user_id,
    companyName: r.company_name,
    contactEmail: r.contact_email,
    status: r.status,
    tier: r.tier,
    revenueSharePct: Number(r.revenue_share_pct ?? 0.7),
    payoutMethod: r.payout_method ?? undefined,
    taxId: r.tax_id ?? undefined,
    createdAt: r.created_at,
  };
}
