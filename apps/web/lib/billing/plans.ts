/**
 * Długomat — Tier 8 (zad. 351-400) — Pricing v2: tiered subscription plans.
 *
 * Single source of truth dla planów subskrypcyjnych:
 *  - Free: 1 sprawa, brak generacji AI (preview only)
 *  - Starter: 3 sprawy/m-c, 5 generacji AI, email support
 *  - Pro: nieograniczone sprawy, 30 generacji AI, priority support
 *  - Family: wszystko z Pro + 5 członków rodziny (tenant)
 *  - Company: wszystko z Pro + nieograniczeni członkowie tenanta + API + webhooks
 *
 * Wszystkie ceny są w **groszach**. VAT 23% (PL) — netto/brutto liczone przez
 * `computeBreakdown()` z `pricing.ts`.
 *
 * Annual vs monthly: annual = 12 * monthly * 0.8 (20% rabat za roczną opłatę).
 * Stripe Price IDs są oddzielne per cykl rozliczeniowy.
 */
import type { CaseType } from "@/lib/db/types";

export type BillingPlanId = "free" | "starter" | "pro" | "family" | "company";
export type BillingCycle = "monthly" | "annual";

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  tagline: string;
  /** Cena miesięczna w groszach (do wyświetlenia "od X zł / m-c"). */
  monthlyGrosze: number;
  /** Cena roczna w groszach (rozliczenie raz/rok, ~20% taniej). */
  annualGrosze: number;
  features: string[];
  /** Limit nowych spraw na miesiąc (null = unlimited). */
  caseLimit: number | null;
  /** Limit generacji AI na miesiąc (null = unlimited). */
  aiGenerationsPerMonth: number | null;
  /** Liczba członków tenanta (null = unlimited). */
  tenantSeatLimit: number | null;
  /** Czy plan obejmuje publiczne API + webhooki. */
  apiAccess: boolean;
  /** Stripe Price ID dla cyklu monthly (env var fallback). */
  stripePriceMonthlyEnv: string;
  /** Stripe Price ID dla cyklu annual (env var fallback). */
  stripePriceAnnualEnv: string;
  /** Highlight w UI (zalecany plan). */
  highlight?: boolean;
}

export const billingPlans: Record<BillingPlanId, BillingPlan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Spróbuj Długomat za darmo",
    monthlyGrosze: 0,
    annualGrosze: 0,
    features: [
      "1 aktywna sprawa",
      "Podgląd dokumentu (bez pobrania)",
      "Baza wiedzy (publiczna)",
      "Asystent AI Q&A",
    ],
    caseLimit: 1,
    aiGenerationsPerMonth: 0,
    tenantSeatLimit: 1,
    apiAccess: false,
    stripePriceMonthlyEnv: "",
    stripePriceAnnualEnv: "",
  },
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Dla osób z 1-3 sprawami",
    monthlyGrosze: 4_900, // 49 zł / m-c
    annualGrosze: 47_000, // ~470 zł / rok (= 39.17 / m-c)
    features: [
      "3 sprawy w miesiącu",
      "5 generacji AI / m-c",
      "Pełne PDF do pobrania",
      "Powiadomienia o terminach",
      "Email support",
    ],
    caseLimit: 3,
    aiGenerationsPerMonth: 5,
    tenantSeatLimit: 1,
    apiAccess: false,
    stripePriceMonthlyEnv: "STRIPE_PRICE_STARTER_MONTHLY",
    stripePriceAnnualEnv: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Dla aktywnych użytkowników",
    monthlyGrosze: 9_900, // 99 zł / m-c
    annualGrosze: 95_000, // ~950 zł / rok (= 79.17 / m-c)
    features: [
      "Nieograniczone sprawy",
      "30 generacji AI / m-c",
      "Multi-turn revision",
      "Wirtualny sędzia (10 / m-c)",
      "Priorytetowy support",
      "Co-pilot mode",
    ],
    caseLimit: null,
    aiGenerationsPerMonth: 30,
    tenantSeatLimit: 1,
    apiAccess: false,
    stripePriceMonthlyEnv: "STRIPE_PRICE_PRO_MONTHLY",
    stripePriceAnnualEnv: "STRIPE_PRICE_PRO_ANNUAL",
    highlight: true,
  },
  family: {
    id: "family",
    name: "Family",
    tagline: "Dla rodziny — do 5 osób",
    monthlyGrosze: 14_900,
    annualGrosze: 143_000,
    features: [
      "Wszystko z Pro",
      "5 członków rodziny (tenant)",
      "Wspólny dashboard",
      "Wewnętrzne notatki + zadania",
      "Plik PDF/A archiwalny",
    ],
    caseLimit: null,
    aiGenerationsPerMonth: 60,
    tenantSeatLimit: 5,
    apiAccess: false,
    stripePriceMonthlyEnv: "STRIPE_PRICE_FAMILY_MONTHLY",
    stripePriceAnnualEnv: "STRIPE_PRICE_FAMILY_ANNUAL",
  },
  company: {
    id: "company",
    name: "Company",
    tagline: "Dla kancelarii i działów prawnych",
    monthlyGrosze: 49_900,
    annualGrosze: 479_000,
    features: [
      "Wszystko z Family",
      "Nieograniczeni członkowie tenanta",
      "Publiczne REST API + Webhooks",
      "Marketplace szablonów",
      "RAG legal context (LEX/LegalMind)",
      "Custom branding (white-label)",
      "Dedykowany SLA",
    ],
    caseLimit: null,
    aiGenerationsPerMonth: null,
    tenantSeatLimit: null,
    apiAccess: true,
    stripePriceMonthlyEnv: "STRIPE_PRICE_COMPANY_MONTHLY",
    stripePriceAnnualEnv: "STRIPE_PRICE_COMPANY_ANNUAL",
  },
};

export function getPlan(planId: BillingPlanId): BillingPlan {
  return billingPlans[planId];
}

export function listPlans(): BillingPlan[] {
  return Object.values(billingPlans);
}

/**
 * Zwraca Stripe Price ID dla planu + cyklu (z env). Throw jeśli brak konfigu.
 */
export function getStripePriceId(
  planId: BillingPlanId,
  cycle: BillingCycle,
): string {
  const plan = getPlan(planId);
  if (planId === "free") {
    throw new Error("Free plan nie ma Stripe Price ID.");
  }
  const envKey = cycle === "monthly" ? plan.stripePriceMonthlyEnv : plan.stripePriceAnnualEnv;
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`Brak Stripe Price ID dla ${planId}/${cycle} (${envKey}).`);
  }
  return value;
}

/**
 * Procentowy rabat za rozliczenie roczne (na podstawie cennika).
 * Zwraca np. 0.20 dla 20% rabatu.
 */
export function annualDiscountPct(planId: BillingPlanId): number {
  const plan = getPlan(planId);
  if (plan.monthlyGrosze === 0) return 0;
  const monthlyEquivYear = plan.monthlyGrosze * 12;
  if (monthlyEquivYear <= 0) return 0;
  return 1 - plan.annualGrosze / monthlyEquivYear;
}

/**
 * Czy plan wystarcza na konkretny case_type. Wszystkie payload płatne plany
 * obejmują wszystkie case_types — lock wynika tylko z `caseLimit` i
 * `aiGenerationsPerMonth`. Free plan blokuje wszystko poza preview.
 */
export function planAllowsCaseType(planId: BillingPlanId, _type: CaseType): boolean {
  if (planId === "free") return false;
  return true;
}
