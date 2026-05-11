/**
 * Tier 33-1/33-2 — Customer success drip scheduler.
 *
 * Cron-driven enqueuer. Wywoływany co 1h przez Vercel Cron / Supabase Edge.
 * Iteruje po segmentach userów i kolejkuje odpowiednie drip-emaile
 * (jeśli jeszcze nie wysłane — sprawdzamy w `email_sends` po (user_id, template_key)).
 *
 * Segmenty:
 *  - `new_user_no_activity`     → D+3 tips
 *  - `new_user_no_case`          → D+7 success story
 *  - `cancelled_or_inactive_14d` → D+14 winback (kupon)
 */
import { createServerSupabase } from "@/lib/db/supabase-server";
import { renderDripDay3Tips } from "./email-templates/drip-day3-tips";
import { renderDripDay7SuccessStory } from "./email-templates/drip-day7-success-story";
import { renderDripDay14Winback } from "./email-templates/drip-day14-winback";
import type { RenderedEmail } from "./types";

export type DripTemplateKey =
  | "drip_day3_tips"
  | "drip_day7_success_story"
  | "drip_day14_winback";

export interface DripCandidate {
  user_id: string;
  email: string;
  full_name: string | null;
  template_key: DripTemplateKey;
  variables: Record<string, string | number>;
}

export interface DripRunSummary {
  scanned: number;
  enqueued: number;
  skipped_already_sent: number;
  skipped_opted_out: number;
  errors: number;
  by_template: Record<DripTemplateKey, number>;
}

function genCouponCode(userId: string): string {
  // Deterministyczny kod (po hashu ID), żeby ten sam user dostał ten sam kod
  // w wielu wysyłkach (np. retry). 8-znakowy alphanumeric.
  const hash = Buffer.from(userId).toString("base64").replace(/[^A-Z0-9]/gi, "");
  return `WROC${hash.slice(0, 4).toUpperCase()}`;
}

function pickRenderer(key: DripTemplateKey): (v: Record<string, string | number>) => RenderedEmail {
  switch (key) {
    case "drip_day3_tips":
      return renderDripDay3Tips;
    case "drip_day7_success_story":
      return renderDripDay7SuccessStory;
    case "drip_day14_winback":
      return renderDripDay14Winback;
  }
}

export async function runDripScheduler(): Promise<DripRunSummary> {
  const summary: DripRunSummary = {
    scanned: 0,
    enqueued: 0,
    skipped_already_sent: 0,
    skipped_opted_out: 0,
    errors: 0,
    by_template: {
      drip_day3_tips: 0,
      drip_day7_success_story: 0,
      drip_day14_winback: 0,
    },
  };

  const sb = await createServerSupabase();

  // 1) D+3 tips — userzy zarejestrowani 3..4 dni temu, którzy nie mają żadnej `case`
  const d3From = new Date(Date.now() - 4 * 86400_000).toISOString();
  const d3To = new Date(Date.now() - 3 * 86400_000).toISOString();
  const { data: d3rows } = await sb
    .from("profiles")
    .select("id, email, full_name, marketing_opt_in, created_at")
    .gte("created_at", d3From)
    .lt("created_at", d3To)
    .limit(2000);

  // 2) D+7 success story — userzy 7..8 dni, bez cases
  const d7From = new Date(Date.now() - 8 * 86400_000).toISOString();
  const d7To = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: d7rows } = await sb
    .from("profiles")
    .select("id, email, full_name, marketing_opt_in, created_at")
    .gte("created_at", d7From)
    .lt("created_at", d7To)
    .limit(2000);

  // 3) D+14 winback — userzy z anulowaną subskrypcją 14..15 dni temu
  const d14From = new Date(Date.now() - 15 * 86400_000).toISOString();
  const d14To = new Date(Date.now() - 14 * 86400_000).toISOString();
  const { data: cancelledRows } = await sb
    .from("subscriptions")
    .select("user_id, cancelled_at, profiles!inner(email, full_name, marketing_opt_in)")
    .gte("cancelled_at", d14From)
    .lt("cancelled_at", d14To)
    .limit(2000);

  const candidates: DripCandidate[] = [];

  for (const r of d3rows ?? []) {
    if (!r.email) continue;
    candidates.push({
      user_id: String(r.id),
      email: String(r.email),
      full_name: r.full_name ?? null,
      template_key: "drip_day3_tips",
      variables: { full_name: r.full_name ?? "" },
    });
  }

  for (const r of d7rows ?? []) {
    if (!r.email) continue;
    // Pomijaj jeśli ma już case
    const { count } = await sb
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", r.id);
    if ((count ?? 0) > 0) continue;
    candidates.push({
      user_id: String(r.id),
      email: String(r.email),
      full_name: r.full_name ?? null,
      template_key: "drip_day7_success_story",
      variables: { full_name: r.full_name ?? "" },
    });
  }

  for (const r of (cancelledRows ?? []) as Array<{
    user_id: string;
    profiles: { email: string; full_name: string | null; marketing_opt_in: boolean };
  }>) {
    if (!r.profiles?.email) continue;
    const coupon = genCouponCode(r.user_id);
    const expires = new Date(Date.now() + 7 * 86400_000).toLocaleDateString("pl-PL");
    candidates.push({
      user_id: r.user_id,
      email: r.profiles.email,
      full_name: r.profiles.full_name ?? null,
      template_key: "drip_day14_winback",
      variables: {
        full_name: r.profiles.full_name ?? "",
        coupon_code: coupon,
        expires_at: expires,
      },
    });
  }

  summary.scanned = candidates.length;

  for (const c of candidates) {
    try {
      // Sprawdź marketing opt-in (D3/D7 to transactional/edukacyjne — dozwolone bez opt-in,
      // ale D14 winback to marketing — wymaga opt-in)
      if (c.template_key === "drip_day14_winback") {
        const { data: profile } = await sb
          .from("profiles")
          .select("marketing_opt_in")
          .eq("id", c.user_id)
          .single();
        if (!profile?.marketing_opt_in) {
          summary.skipped_opted_out++;
          continue;
        }
      }

      // Idempotencja — czy już wysłano?
      const { count: alreadyCount } = await sb
        .from("email_sends")
        .select("id", { count: "exact", head: true })
        .eq("user_id", c.user_id)
        .eq("template_key", c.template_key);
      if ((alreadyCount ?? 0) > 0) {
        summary.skipped_already_sent++;
        continue;
      }

      const rendered = pickRenderer(c.template_key)(c.variables);

      const { error } = await sb.from("email_queue").insert({
        user_id: c.user_id,
        to_email: c.email,
        template_key: c.template_key,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        status: "pending",
        scheduled_at: new Date().toISOString(),
        priority: c.template_key === "drip_day14_winback" ? 5 : 7,
      });
      if (error) {
        summary.errors++;
        continue;
      }
      summary.enqueued++;
      summary.by_template[c.template_key]++;
    } catch {
      summary.errors++;
    }
  }

  return summary;
}
