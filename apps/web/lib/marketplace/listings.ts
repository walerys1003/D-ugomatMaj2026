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

// -----------------------------------------------------------------------------
// Tier 35 — server-side schema + CRUD helpers
//
// Powyżej żyje legacy publiczny model (`MarketplaceListing` / `fetchListings`).
// Poniżej — schemat z bazy `marketplace_listings` używany przez route
// handlery (`/api/marketplace/listings`) i moduły kuratorskie
// (`featured.ts`, `template-gallery.ts`). Trzymamy oba w jednym pliku, żeby
// nie rozjeżdżać importów — caller wybiera potrzebny zestaw symboli.
// -----------------------------------------------------------------------------

export type ListingType =
  | "integration"
  | "template"
  | "service"
  | "plugin"
  | "ai_agent";

export type ListingStatus =
  | "draft"
  | "submitted"
  | "review"
  | "approved"
  | "rejected"
  | "archived";

export type PricingModel =
  | "free"
  | "one_time"
  | "subscription"
  | "revenue_share";

/** Snake_case row z bazy (`marketplace_listings`). */
export interface ListingRow {
  id: string;
  publisher_id: string;
  type: ListingType;
  name: string;
  slug: string;
  short_description: string;
  long_description: string | null;
  category: string;
  tags: string[] | null;
  pricing_model: PricingModel;
  price_cents: number | null;
  currency: string | null;
  revenue_share_pct: number | null;
  icon_url: string | null;
  homepage_url: string | null;
  source_repo_url: string | null;
  manifest: Record<string, unknown> | null;
  status: ListingStatus;
  install_count: number | null;
  average_rating: number | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
}

/** CamelCase view używany w UI i kuratorskich modułach. */
export interface Listing {
  id: string;
  publisherId: string;
  type: ListingType;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  tags: string[];
  pricingModel: PricingModel;
  priceCents?: number;
  currency?: string;
  revenueSharePct?: number;
  iconUrl?: string;
  homepageUrl?: string;
  sourceRepoUrl?: string;
  manifest?: Record<string, unknown>;
  status: ListingStatus;
  installCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CreateListingInput {
  publisherId: string;
  type: ListingType;
  name: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  tags?: string[];
  pricingModel: PricingModel;
  priceCents?: number;
  currency?: string;
  revenueSharePct?: number;
  iconUrl?: string;
  homepageUrl?: string;
  sourceRepoUrl?: string;
  manifest?: Record<string, unknown>;
}

export interface ListListingsFilter {
  type?: ListingType;
  category?: string;
  status?: ListingStatus;
  /** Full-text search query. */
  q?: string;
  limit?: number;
  offset?: number;
}

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    publisherId: row.publisher_id,
    type: row.type,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    longDescription: row.long_description ?? undefined,
    category: row.category,
    tags: row.tags ?? [],
    pricingModel: row.pricing_model,
    priceCents: row.price_cents ?? undefined,
    currency: row.currency ?? undefined,
    revenueSharePct: row.revenue_share_pct ?? undefined,
    iconUrl: row.icon_url ?? undefined,
    homepageUrl: row.homepage_url ?? undefined,
    sourceRepoUrl: row.source_repo_url ?? undefined,
    manifest: row.manifest ?? undefined,
    status: row.status,
    installCount: row.install_count ?? 0,
    averageRating: row.average_rating ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Server-side query helper. Bezpośredni read z `marketplace_listings`.
 * `sb` jest celowo typowany jako `any` — Database typed jest stale dla tej
 * tabeli (Tier 35 dodał kolumny po wygenerowaniu types).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listListings(sb: any, filter: ListListingsFilter = {}): Promise<Listing[]> {
  let query = sb
    .from("marketplace_listings")
    .select("*")
    .order("install_count", { ascending: false });

  if (filter.type) query = query.eq("type", filter.type);
  if (filter.category) query = query.eq("category", filter.category);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.q) {
    const term = `%${filter.q}%`;
    query = query.or(`name.ilike.${term},short_description.ilike.${term}`);
  }
  const limit = Math.max(1, Math.min(filter.limit ?? 50, 200));
  query = query.limit(limit);
  if (filter.offset) query = query.range(filter.offset, filter.offset + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: ListingRow) => rowToListing(r));
}

/**
 * Create a new listing in `submitted` status. Slug derived from `name`,
 * `currency` defaults to PLN, `tags` to `[]`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createListing(sb: any, input: CreateListingInput): Promise<Listing> {
  const slug = slugify(input.name) || `listing-${Date.now()}`;
  const row = {
    publisher_id: input.publisherId,
    type: input.type,
    name: input.name,
    slug,
    short_description: input.shortDescription,
    long_description: input.longDescription ?? null,
    category: input.category,
    tags: input.tags ?? [],
    pricing_model: input.pricingModel,
    price_cents: input.priceCents ?? null,
    currency: input.currency ?? "PLN",
    revenue_share_pct: input.revenueSharePct ?? null,
    icon_url: input.iconUrl ?? null,
    homepage_url: input.homepageUrl ?? null,
    source_repo_url: input.sourceRepoUrl ?? null,
    manifest: input.manifest ?? null,
    status: "submitted" as ListingStatus,
  };
  const { data, error } = await sb
    .from("marketplace_listings")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToListing(data as ListingRow);
}
