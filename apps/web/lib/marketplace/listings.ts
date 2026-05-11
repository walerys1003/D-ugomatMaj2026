/**
 * Tier 35 — Marketplace typings + client helpers.
 *
 * Maps backend `GET /api/marketplace/listings` to frontend.
 * Listings = wtyczki, integracje, szablony pism, usługi partnerów.
 */

export type ListingKind =
  | "integration"
  | "template"
  | "service"
  | "plugin"
  | "ai_agent";

export type ListingPriceModel =
  | "free"
  | "one_time"
  | "subscription"
  | "revenue_share";

export interface MarketplaceListing {
  id: string;
  slug: string;
  kind: ListingKind;
  title: string;
  tagline: string;
  description_md: string;
  vendor: {
    id: string;
    name: string;
    verified: boolean;
    logo_url: string | null;
  };
  category: string;          // e.g. "epuap", "ksiegowosc", "ai", "crm"
  tags: string[];
  price_model: ListingPriceModel;
  price_pln: number | null;
  install_count: number;
  rating_avg: number;        // 0..5
  rating_count: number;
  cover_image_url: string | null;
  gallery: string[];
  changelog_url: string | null;
  documentation_url: string | null;
  /** GDPR-relevant: czy plugin przetwarza dane osobowe. */
  processes_pii: boolean;
  status: "draft" | "review" | "live" | "archived";
  published_at: string | null;
}

export interface MarketplaceFilters {
  kind?: ListingKind;
  category?: string;
  price_model?: ListingPriceModel;
  search?: string;
  sort?: "popular" | "newest" | "rating" | "name";
}

/** Server-side fetch — używane w Server Components. */
export async function fetchListings(
  filters: MarketplaceFilters = {},
): Promise<MarketplaceListing[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  const url = new URL(`${baseUrl}/api/marketplace/listings`);
  for (const [k, v] of Object.entries(filters)) {
    if (v != null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 300, tags: ["marketplace:listings"] },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: MarketplaceListing[] };
  return json.items ?? [];
}

export async function fetchListingBySlug(
  slug: string,
): Promise<MarketplaceListing | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  const res = await fetch(`${baseUrl}/api/marketplace/listings?slug=${encodeURIComponent(slug)}`, {
    next: { revalidate: 300, tags: [`marketplace:${slug}`] },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { items?: MarketplaceListing[] };
  return json.items?.[0] ?? null;
}

export const LISTING_CATEGORIES: { key: string; label: string; description: string }[] = [
  { key: "epuap", label: "e-Sąd / ePUAP", description: "Integracje z elektronicznym postępowaniem upominawczym i ePUAP." },
  { key: "ksiegowosc", label: "Księgowość", description: "Sync faktur, raportowanie VAT, integracje z fakturownią." },
  { key: "ai", label: "AI agenty", description: "Wyspecjalizowane agenty AI: cesja, upadłość, BIK." },
  { key: "crm", label: "CRM / kancelaria", description: "Synchronizacja klientów i spraw z systemami kancelarii." },
  { key: "esign", label: "Podpis elektroniczny", description: "mObywatel, eIDAS, kwalifikowany podpis." },
  { key: "court", label: "Sądy i KRS", description: "Live data z KRS, KW, EPU, MSiG." },
  { key: "communication", label: "Komunikacja", description: "Slack, MS Teams, SMS, push." },
  { key: "templates", label: "Szablony pism", description: "Premium wzory pism procesowych certyfikowane przez radców." },
];

export const KIND_LABELS: Record<ListingKind, string> = {
  integration: "Integracja",
  template: "Szablon pisma",
  service: "Usługa partnera",
  plugin: "Plugin",
  ai_agent: "Agent AI",
};

export const PRICE_MODEL_LABELS: Record<ListingPriceModel, string> = {
  free: "Bezpłatne",
  one_time: "Jednorazowo",
  subscription: "Subskrypcja",
  revenue_share: "Revenue share",
};
