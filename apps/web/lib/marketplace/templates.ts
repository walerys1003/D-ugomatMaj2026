/**
 * Marketplace szablonów — zad. 350
 *
 * Authors (kancelarie, prawnicy) can submit template variants for review.
 * Reviewers approve / reject. Users can browse, rate, and use approved templates.
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";
import type { CaseType } from "@/lib/db/types";

export type MarketplaceStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "deprecated";

export interface MarketplaceTemplate {
  id: string;
  author_id: string;
  author_display_name?: string;
  case_type: CaseType;
  title: string;
  description: string;
  body_markdown: string;
  tags: string[];
  status: MarketplaceStatus;
  rating_avg?: number;
  rating_count: number;
  usage_count: number;
  review_notes?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitTemplateInput {
  author_id: string;
  author_display_name?: string;
  case_type: CaseType;
  title: string;
  description: string;
  body_markdown: string;
  tags?: string[];
}

const MIN_TITLE = 5;
const MAX_TITLE = 120;
const MIN_BODY = 300;
const MAX_BODY = 50_000;

export async function submitTemplate(
  input: SubmitTemplateInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (input.title.length < MIN_TITLE || input.title.length > MAX_TITLE) {
    return { ok: false, error: "title_invalid" };
  }
  if (input.body_markdown.length < MIN_BODY || input.body_markdown.length > MAX_BODY) {
    return { ok: false, error: "body_invalid" };
  }
  if (!input.description || input.description.length < 30) {
    return { ok: false, error: "description_too_short" };
  }

  // Basic PII heuristic — reject if real-looking PESEL/NIP/IBAN found
  if (/\b\d{11}\b/.test(input.body_markdown) || /\bPL\d{26}\b/.test(input.body_markdown)) {
    return { ok: false, error: "contains_pii" };
  }

  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("marketplace_templates")
    .insert({
      author_id: input.author_id,
      author_display_name: input.author_display_name ?? null,
      case_type: input.case_type,
      title: input.title,
      description: input.description,
      body_markdown: input.body_markdown,
      tags: input.tags ?? [],
      status: "submitted",
      rating_count: 0,
      usage_count: 0,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  return { ok: true, id: data.id };
}

export async function reviewTemplate(
  reviewerId: string,
  templateId: string,
  decision: "approved" | "rejected",
  reviewNotes?: string,
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { error } = await sb
    .from("marketplace_templates")
    .update({
      status: decision,
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
    })
    .eq("id", templateId);
  return { ok: !error };
}

export async function listApprovedTemplates(opts: {
  case_type?: CaseType;
  limit?: number;
  offset?: number;
  sort?: "popular" | "newest" | "highest_rated";
}): Promise<{ templates: MarketplaceTemplate[]; total: number }> {
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  let q = sb
    .from("marketplace_templates")
    .select("*", { count: "exact" })
    .eq("status", "approved");
  if (opts.case_type) q = q.eq("case_type", opts.case_type);
  const sort = opts.sort ?? "popular";
  if (sort === "newest") q = q.order("created_at", { ascending: false });
  else if (sort === "highest_rated") q = q.order("rating_avg", { ascending: false, nullsFirst: false });
  else q = q.order("usage_count", { ascending: false });
  q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 20) - 1);
  const { data, error, count } = await q;
  if (error) {
    logger.warn("marketplace.list_failed", { error: error.message });
    return { templates: [], total: 0 };
  }
  return { templates: (data ?? []) as MarketplaceTemplate[], total: count ?? 0 };
}

export async function rateTemplate(
  userId: string,
  templateId: string,
  rating: number,
  comment?: string,
): Promise<{ ok: boolean }> {
  if (rating < 1 || rating > 5) return { ok: false };
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { error } = await sb.from("marketplace_template_ratings").upsert(
    {
      user_id: userId,
      template_id: templateId,
      rating,
      comment: comment ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,template_id" },
  );
  if (error) return { ok: false };
  // Recompute aggregate
  const { data: agg } = await sb
    .from("marketplace_template_ratings")
    .select("rating")
    .eq("template_id", templateId);
  if (agg && agg.length > 0) {
    const avg = agg.reduce((s: any, r: any) => s + Number(r.rating), 0) / agg.length;
    await sb
      .from("marketplace_templates")
      .update({ rating_avg: Math.round(avg * 100) / 100, rating_count: agg.length })
      .eq("id", templateId);
  }
  return { ok: true };
}

export async function recordTemplateUsage(templateId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb.rpc("increment_template_usage", { p_template_id: templateId }).then(
    () => {},
    async () => {
      // fallback: best-effort increment
      const { data } = await sb.from("marketplace_templates").select("usage_count").eq("id", templateId).maybeSingle();
      if (data) {
        await sb.from("marketplace_templates").update({ usage_count: (data.usage_count ?? 0) + 1 }).eq("id", templateId);
      }
    },
  );
}
