// Ratings + reviews — 1..5 stars, optional body, unique per (user, listing).
import { randomUUID } from "crypto";

export interface ReviewInput {
  listingId: string;
  userId: string;
  rating: number; // 1..5
  title?: string;
  body?: string;
}

export interface Review {
  id: string;
  listingId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  helpfulCount: number;
  createdAt: string;
}

export async function submitReview(supabase: any, input: ReviewInput): Promise<Review> {
  if (input.rating < 1 || input.rating > 5 || !Number.isInteger(input.rating)) {
    throw new Error("rating must be integer 1..5");
  }
  const row = {
    id: randomUUID(),
    listing_id: input.listingId,
    user_id: input.userId,
    rating: input.rating,
    title: input.title ?? null,
    body: input.body ?? null,
  };
  const { data, error } = await supabase
    .from("marketplace_reviews")
    .upsert(row, { onConflict: "listing_id,user_id" })
    .select("*")
    .single();
  if (error) throw error;

  // Recompute average rating for the listing (read-modify-write, kept simple).
  const { data: agg } = await supabase
    .from("marketplace_reviews")
    .select("rating")
    .eq("listing_id", input.listingId);
  const ratings = (agg ?? []).map((r: any) => r.rating);
  const avg = ratings.length === 0 ? 0 : ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
  await supabase.from("marketplace_listings").update({ average_rating: Number(avg.toFixed(2)) }).eq("id", input.listingId);

  return mapReview(data);
}

export async function listReviews(supabase: any, listingId: string, limit = 20): Promise<Review[]> {
  const { data, error } = await supabase
    .from("marketplace_reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapReview);
}

export async function markHelpful(supabase: any, reviewId: string): Promise<void> {
  await supabase.rpc("increment_review_helpful", { p_review_id: reviewId }).catch(() => null);
}

function mapReview(r: any): Review {
  return {
    id: r.id,
    listingId: r.listing_id,
    userId: r.user_id,
    rating: r.rating,
    title: r.title ?? undefined,
    body: r.body ?? undefined,
    helpfulCount: Number(r.helpful_count ?? 0),
    createdAt: r.created_at,
  };
}
