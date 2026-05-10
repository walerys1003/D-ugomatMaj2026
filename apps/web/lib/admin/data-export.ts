/**
 * Tier 10 — RODO/GDPR-compliant user data export (Art. 15 — right of access).
 * Bundles profile, cases, documents references, payments, subscriptions into JSON.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface UserDataExport {
  user_id: string;
  exported_at: string;
  profile: Record<string, unknown> | null;
  cases: unknown[];
  documents: unknown[];
  payments: unknown[];
  subscriptions: unknown[];
  affiliate_account?: unknown;
  referrals?: unknown[];
}

export async function exportUserData(userId: string): Promise<UserDataExport> {
  const sb = await createServerSupabase();
  const [profile, cases, documents, payments, subs, aff, refs] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
    sb.from("cases").select("*").eq("user_id", userId),
    sb.from("documents").select("id, case_id, kind, created_at").eq("user_id", userId),
    sb.from("payments").select("*").eq("user_id", userId),
    sb.from("subscriptions").select("*").eq("user_id", userId),
    sb.from("affiliate_accounts").select("*").eq("user_id", userId).maybeSingle(),
    sb.from("referrals_v2").select("*").or(`referrer_id.eq.${userId},referred_id.eq.${userId}`),
  ]);
  return {
    user_id: userId,
    exported_at: new Date().toISOString(),
    profile: profile.data ?? null,
    cases: cases.data ?? [],
    documents: documents.data ?? [],
    payments: payments.data ?? [],
    subscriptions: subs.data ?? [],
    affiliate_account: aff.data ?? undefined,
    referrals: refs.data ?? [],
  };
}

/**
 * RODO Art. 17 — right to erasure. Soft-deletes by anonymizing identifiable fields.
 */
export async function eraseUserData(userId: string): Promise<void> {
  const sb = await createServerSupabase();
  const anon = `deleted-${userId.slice(0, 8)}@anon.local`;
  await sb
    .from("profiles")
    .update({
      email: anon,
      full_name: "[deleted]",
      phone: null,
      address: null,
      nip: null,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", userId);
  // Documents/cases retained per legal accounting obligations (5y PL VAT records)
}
