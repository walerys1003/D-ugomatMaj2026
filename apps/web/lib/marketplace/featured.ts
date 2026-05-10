// Featured listings + editorial picks. Curated by Długomat staff.
import type { Listing } from "./listings";

export interface FeaturedSlot {
  position: number;
  listingId: string;
  headline: string;
  badge?: "editors_pick" | "new" | "trending" | "verified";
  startsAt: string;
  endsAt: string;
}

export async function listFeatured(supabase: any): Promise<FeaturedSlot[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("marketplace_featured")
    .select("*")
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    position: r.position,
    listingId: r.listing_id,
    headline: r.headline,
    badge: r.badge ?? undefined,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
  }));
}

// Compute a trending score using install velocity (last 7d vs prior 7d).
export function trendingScore(listing: Listing & { installs7d?: number; installsPrev7d?: number }): number {
  const a = listing.installs7d ?? 0;
  const b = listing.installsPrev7d ?? 0;
  if (a === 0 && b === 0) return 0;
  if (b === 0) return a;
  return (a - b) / b;
}
