// Public template gallery — featured/curated lists, category browsing, search.
import type { Listing } from "./listings";

export interface GallerySection {
  title: string;
  filter: (l: Listing) => boolean;
}

export const GALLERY_SECTIONS: GallerySection[] = [
  { title: "Najpopularniejsze", filter: (l) => l.installCount >= 100 },
  { title: "Najlepiej oceniane", filter: (l) => l.averageRating >= 4.5 },
  { title: "Darmowe", filter: (l) => l.pricingModel === "free" },
  { title: "Nowości", filter: (l) => {
    const ageDays = (Date.now() - new Date(l.createdAt).getTime()) / 86400000;
    return ageDays <= 30;
  } },
];

export interface GalleryView {
  sections: Array<{ title: string; listings: Listing[] }>;
  categories: Array<{ name: string; count: number }>;
  totalCount: number;
}

export async function getGalleryView(sb: any): Promise<GalleryView> {
  // Only show approved templates in the public gallery.
  const { data, error } = await sb
    .from("marketplace_listings")
    .select("*")
    .eq("type", "template")
    .eq("status", "approved")
    .order("install_count", { ascending: false })
    .limit(200);
  if (error) throw error;

  const listings: Listing[] = (data ?? []).map((r: any) => ({
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
  }));

  const categoryCounts = new Map<string, number>();
  for (const l of listings) categoryCounts.set(l.category, (categoryCounts.get(l.category) ?? 0) + 1);

  return {
    sections: GALLERY_SECTIONS.map((s) => ({ title: s.title, listings: listings.filter(s.filter).slice(0, 12) })),
    categories: Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    totalCount: listings.length,
  };
}
