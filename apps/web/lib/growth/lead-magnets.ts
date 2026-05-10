/**
 * Długomat — Tier 8 — Lead magnets (PDF guides, checklists, calculators).
 *
 * Cel: zbieranie maili na top-of-funnel poprzez darmowe materiały:
 *  - "Darmowy poradnik: 7 błędów w sprzeciwie od nakazu zapłaty" (PDF)
 *  - "Kalkulator odsetek windykacyjnych" (interaktywny)
 *  - "Checklist: dokumenty potrzebne do upadłości konsumenckiej"
 *  - "Wzór wniosku o raty sądowe (.docx)"
 *
 * Flow:
 *  1. Landing /poradnik/X → form email
 *  2. POST /api/leads/subscribe → INSERT lead, send email z magnet
 *  3. Auto-enrol w campaign "welcome" + tag "lead_X"
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { enrollInCampaign } from "@/lib/email/drip-campaigns";

export interface LeadMagnet {
  slug: string;
  title: string;
  description: string;
  fileUrl: string;
  campaignTag: string;
}

export const LEAD_MAGNETS: Record<string, LeadMagnet> = {
  "7-bledow-sprzeciw": {
    slug: "7-bledow-sprzeciw",
    title: "7 błędów w sprzeciwie od nakazu zapłaty",
    description: "Poradnik PDF — 12 stron, sprawdzone case'y z sądów",
    fileUrl: "/lead-magnets/7-bledow-sprzeciw.pdf",
    campaignTag: "lead_sprzeciw",
  },
  "checklist-upadlosc": {
    slug: "checklist-upadlosc",
    title: "Checklist: dokumenty do upadłości konsumenckiej",
    description: "Lista 32 dokumentów + wzory załączników",
    fileUrl: "/lead-magnets/checklist-upadlosc.pdf",
    campaignTag: "lead_upadlosc",
  },
  "kalkulator-odsetek": {
    slug: "kalkulator-odsetek",
    title: "Kalkulator odsetek windykacyjnych",
    description: "Excel z formułami — odsetki ustawowe + maksymalne",
    fileUrl: "/lead-magnets/kalkulator-odsetek.xlsx",
    campaignTag: "lead_odsetki",
  },
  "wzor-raty-sadowe": {
    slug: "wzor-raty-sadowe",
    title: "Wzór wniosku o raty sądowe (.docx)",
    description: "Edytowalny wzór + instrukcja krok po kroku",
    fileUrl: "/lead-magnets/wzor-raty-sadowe.docx",
    campaignTag: "lead_raty",
  },
};

export interface CaptureLeadInput {
  email: string;
  magnetSlug: string;
  source?: string; // utm_source
  medium?: string; // utm_medium
  campaign?: string; // utm_campaign
  consentMarketing: boolean;
}

export async function captureLead(input: CaptureLeadInput): Promise<{ ok: boolean; magnet: LeadMagnet | null }> {
  const magnet = LEAD_MAGNETS[input.magnetSlug];
  if (!magnet) return { ok: false, magnet: null };
  if (!isValidEmail(input.email)) return { ok: false, magnet };
  if (!input.consentMarketing) return { ok: false, magnet };

  const supabase = createSupabaseAdminClient();
  const { data: lead } = await supabase
    .from("leads")
    .upsert(
      {
        email: input.email.toLowerCase().trim(),
        magnet_slug: magnet.slug,
        source: input.source ?? null,
        medium: input.medium ?? null,
        campaign: input.campaign ?? null,
        consent_marketing: true,
        consent_at: new Date().toISOString(),
        tags: [magnet.campaignTag],
      },
      { onConflict: "email,magnet_slug", ignoreDuplicates: false },
    )
    .select("*")
    .single();

  // Auto-enroll w welcome campaign (jeśli mamy user_id)
  if (lead && (lead as any).user_id) {
    await enrollInCampaign({
      userId: (lead as any).user_id,
      campaignKey: "welcome",
      context: { magnet_slug: magnet.slug, magnet_title: magnet.title },
    }).catch(() => undefined);
  }

  return { ok: true, magnet };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function listLeadMagnets(): LeadMagnet[] {
  return Object.values(LEAD_MAGNETS);
}
