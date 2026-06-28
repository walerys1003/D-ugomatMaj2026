/**
 * Tier 13 — Seat-based billing for enterprise plans (per-active-user/month).
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type EnterprisePlanKey = "team" | "business" | "enterprise";

export interface SeatPricing {
  plan: EnterprisePlanKey;
  per_seat_grosze_monthly: number;
  min_seats: number;
  features: string[];
}

export const SEAT_PRICING: Record<EnterprisePlanKey, SeatPricing> = {
  team: {
    plan: "team",
    per_seat_grosze_monthly: 4900,
    min_seats: 3,
    features: ["Współdzielone sprawy", "Workspaces", "RBAC podstawowe", "Wsparcie e-mail"],
  },
  business: {
    plan: "business",
    per_seat_grosze_monthly: 9900,
    min_seats: 5,
    features: ["Wszystko z Team", "SSO (SAML/OIDC)", "Audit log", "Custom domain", "Wsparcie priorytetowe", "API rozszerzone"],
  },
  enterprise: {
    plan: "enterprise",
    per_seat_grosze_monthly: 19900,
    min_seats: 10,
    features: ["Wszystko z Business", "SCIM provisioning", "DPA + ISO 27001", "Data residency EU", "Dedykowany CSM", "SLA 99.95%", "Audyt hash-chain"],
  },
};

export async function computeMonthlySeatCharge(orgId: string): Promise<{ active_seats: number; per_seat: number; total_grosze: number; plan: EnterprisePlanKey }> {
  const sb = await createSupabaseServerClient();
  const { data: org } = await sb.from("organizations").select("plan, seats_purchased").eq("id", orgId).maybeSingle();
  if (!org) throw new Error("org_not_found");
  const plan = (org.plan as EnterprisePlanKey) ?? "team";
  const pricing = SEAT_PRICING[plan];
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { count: activeSeats } = await sb
    .from("org_memberships")
    .select("user_id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("last_active_at", since);
  const seats = Math.max(activeSeats ?? 0, pricing.min_seats, org.seats_purchased ?? 0);
  return { active_seats: seats, per_seat: pricing.per_seat_grosze_monthly, total_grosze: seats * pricing.per_seat_grosze_monthly, plan };
}
