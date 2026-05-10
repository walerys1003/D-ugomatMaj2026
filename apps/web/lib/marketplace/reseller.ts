// White-label reseller program — branded subdomains, custom theme, commission tiers.
import { randomUUID } from "crypto";

export type ResellerStatus = "applied" | "active" | "suspended" | "terminated";
export type ResellerTier = "starter" | "growth" | "enterprise";

export const RESELLER_COMMISSION: Record<ResellerTier, number> = {
  starter: 0.15, // 15% on referred MRR
  growth: 0.25,
  enterprise: 0.35,
};

export interface ResellerInput {
  ownerUserId: string;
  brandName: string;
  brandSubdomain: string; // e.g. mojakancelaria → mojakancelaria.dlugomat.pl
  primaryColor?: string; // hex
  logoUrl?: string;
  supportEmail: string;
}

export interface Reseller {
  id: string;
  ownerUserId: string;
  brandName: string;
  brandSubdomain: string;
  status: ResellerStatus;
  tier: ResellerTier;
  commissionPct: number;
  primaryColor?: string;
  logoUrl?: string;
  supportEmail: string;
  referredOrgCount: number;
  createdAt: string;
}

const SUBDOMAIN_RE = /^[a-z][a-z0-9-]{2,30}$/;
const RESERVED = new Set(["www", "api", "admin", "app", "auth", "dashboard", "dlugomat", "billing", "status"]);

export function validateSubdomain(sub: string): { ok: boolean; reason?: string } {
  if (!SUBDOMAIN_RE.test(sub)) return { ok: false, reason: "invalid subdomain format" };
  if (RESERVED.has(sub)) return { ok: false, reason: "subdomain is reserved" };
  return { ok: true };
}

export async function createReseller(supabase: any, input: ResellerInput): Promise<Reseller> {
  const v = validateSubdomain(input.brandSubdomain);
  if (!v.ok) throw new Error(v.reason);

  const row = {
    id: randomUUID(),
    owner_user_id: input.ownerUserId,
    brand_name: input.brandName,
    brand_subdomain: input.brandSubdomain,
    status: "applied" as const,
    tier: "starter" as ResellerTier,
    commission_pct: RESELLER_COMMISSION.starter,
    primary_color: input.primaryColor ?? "#1d4ed8",
    logo_url: input.logoUrl ?? null,
    support_email: input.supportEmail,
  };
  const { data, error } = await supabase.from("resellers").insert(row).select("*").single();
  if (error) throw error;
  return mapReseller(data);
}

export async function activateReseller(supabase: any, resellerId: string, tier: ResellerTier = "starter"): Promise<Reseller> {
  const { data, error } = await supabase
    .from("resellers")
    .update({ status: "active", tier, commission_pct: RESELLER_COMMISSION[tier] })
    .eq("id", resellerId)
    .select("*")
    .single();
  if (error) throw error;
  return mapReseller(data);
}

export async function attachReferralToOrg(
  supabase: any,
  orgId: string,
  resellerId: string,
): Promise<void> {
  const { error } = await supabase.from("reseller_referrals").insert({
    id: randomUUID(),
    reseller_id: resellerId,
    org_id: orgId,
  });
  if (error) throw error;
}

export async function computeResellerCommission(
  supabase: any,
  resellerId: string,
  periodMrrCents: number,
): Promise<{ commissionCents: number; tier: ResellerTier }> {
  const { data, error } = await supabase.from("resellers").select("tier,commission_pct").eq("id", resellerId).single();
  if (error) throw error;
  const pct = Number(data.commission_pct ?? 0.15);
  return { commissionCents: Math.round(periodMrrCents * pct), tier: data.tier };
}

function mapReseller(r: any): Reseller {
  return {
    id: r.id,
    ownerUserId: r.owner_user_id,
    brandName: r.brand_name,
    brandSubdomain: r.brand_subdomain,
    status: r.status,
    tier: r.tier,
    commissionPct: Number(r.commission_pct ?? 0.15),
    primaryColor: r.primary_color ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    supportEmail: r.support_email,
    referredOrgCount: Number(r.referred_org_count ?? 0),
    createdAt: r.created_at,
  };
}
