// Marketplace listings — templates, plugins, integrations.
// Each listing has a stable slug, type, pricing model and approval state.
import { createHash, randomUUID } from "crypto";

export type ListingType = "template" | "plugin" | "integration";
export type ListingStatus = "draft" | "in_review" | "approved" | "rejected" | "deprecated";
export type PricingModel = "free" | "one_time" | "subscription" | "revenue_share";

export interface ListingInput {
  publisherId: string;
  type: ListingType;
  name: string;
  shortDescription: string;
  longDescription?: string;
  category: string;
  tags?: string[];
  pricingModel: PricingModel;
  priceCents?: number;
  currency?: "PLN" | "EUR" | "USD";
  revenueSharePct?: number; // 0..1 — fraction kept by creator
  iconUrl?: string;
  homepageUrl?: string;
  sourceRepoUrl?: string;
  manifest?: Record<string, unknown>;
}

export interface Listing extends ListingInput {
  id: string;
  slug: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  installCount: number;
}

export function slugifyListing(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || createHash("sha256").update(name).digest("hex").slice(0, 12);
}

export async function createListing(supabase: any, input: ListingInput): Promise<Listing> {
  const slug = `${slugifyListing(input.name)}-${createHash("sha256").update(`${input.publisherId}:${input.name}:${Date.now()}`).digest("hex").slice(0, 6)}`;
  const row = {
    id: randomUUID(),
    publisher_id: input.publisherId,
    type: input.type,
    name: input.name,
    slug,
    short_description: input.shortDescription,
    long_description: input.longDescription ?? null,
    category: input.category,
    tags: input.tags ?? [],
    pricing_model: input.pricingModel,
    price_cents: input.priceCents ?? 0,
    currency: input.currency ?? "PLN",
    revenue_share_pct: input.revenueSharePct ?? 0.7,
    icon_url: input.iconUrl ?? null,
    homepage_url: input.homepageUrl ?? null,
    source_repo_url: input.sourceRepoUrl ?? null,
    manifest: input.manifest ?? {},
    status: "draft" as ListingStatus,
  };
  const { data, error } = await supabase.from("marketplace_listings").insert(row).select("*").single();
  if (error) throw error;
  return mapListing(data);
}

export async function submitForReview(supabase: any, listingId: string): Promise<void> {
  const { error } = await supabase.from("marketplace_listings").update({ status: "in_review", updated_at: new Date().toISOString() }).eq("id", listingId);
  if (error) throw error;
}

export async function approveListing(supabase: any, listingId: string, reviewerId: string): Promise<void> {
  const { error } = await supabase.from("marketplace_listings").update({ status: "approved", reviewed_by: reviewerId, updated_at: new Date().toISOString() }).eq("id", listingId);
  if (error) throw error;
}

export async function rejectListing(supabase: any, listingId: string, reviewerId: string, reason: string): Promise<void> {
  const { error } = await supabase.from("marketplace_listings").update({ status: "rejected", reviewed_by: reviewerId, rejection_reason: reason, updated_at: new Date().toISOString() }).eq("id", listingId);
  if (error) throw error;
}

export async function listListings(
  supabase: any,
  filter: { type?: ListingType; category?: string; status?: ListingStatus; q?: string; limit?: number } = {},
): Promise<Listing[]> {
  let query = supabase.from("marketplace_listings").select("*").order("install_count", { ascending: false });
  if (filter.type) query = query.eq("type", filter.type);
  if (filter.category) query = query.eq("category", filter.category);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.q) query = query.ilike("name", `%${filter.q}%`);
  query = query.limit(filter.limit ?? 50);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapListing);
}

function mapListing(r: any): Listing {
  return {
    id: r.id,
    publisherId: r.publisher_id,
    type: r.type,
    name: r.name,
    slug: r.slug,
    shortDescription: r.short_description,
    longDescription: r.long_description ?? undefined,
    category: r.category,
    tags: r.tags ?? [],
    pricingModel: r.pricing_model,
    priceCents: r.price_cents ?? 0,
    currency: r.currency ?? "PLN",
    revenueSharePct: r.revenue_share_pct ?? 0.7,
    iconUrl: r.icon_url ?? undefined,
    homepageUrl: r.homepage_url ?? undefined,
    sourceRepoUrl: r.source_repo_url ?? undefined,
    manifest: r.manifest ?? {},
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    averageRating: Number(r.average_rating ?? 0),
    installCount: Number(r.install_count ?? 0),
  };
}
