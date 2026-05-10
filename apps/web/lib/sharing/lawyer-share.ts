/**
 * Share-with-lawyer link with RBAC — zad. 346
 *
 * User generates a time-limited, scope-limited token that grants a lawyer (or anyone
 * with the link) read-only or comment-only access to selected case data.
 *
 * Tokens are stored in `lawyer_share_tokens` and verified per-request.
 */

import { randomBytes, createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export type ShareScope = "case_summary" | "documents_read" | "documents_comment" | "full_read";

export interface CreateShareInput {
  user_id: string;
  case_id: string;
  scopes: ShareScope[];
  /** Email of the lawyer (optional, for notification + audit). */
  lawyer_email?: string;
  /** Lawyer name */
  lawyer_name?: string;
  /** Days until expiry (default 14, max 90) */
  ttl_days?: number;
  /** Allow lawyer to download PDFs (default false) */
  allow_download?: boolean;
}

export interface ShareTokenRecord {
  id: string;
  token_hash: string;
  user_id: string;
  case_id: string;
  scopes: ShareScope[];
  lawyer_email?: string;
  lawyer_name?: string;
  allow_download: boolean;
  expires_at: string;
  revoked_at?: string;
  created_at: string;
  last_used_at?: string;
  used_count: number;
}

const MAX_TTL_DAYS = 90;
const DEFAULT_TTL_DAYS = 14;

function generateToken(): string {
  // 32 bytes -> 43 chars base64url
  return randomBytes(32).toString("base64url");
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createLawyerShare(
  input: CreateShareInput,
): Promise<{ ok: true; token: string; share_id: string; url: string; expires_at: string } | { ok: false; error: string }> {
  if (!input.scopes || input.scopes.length === 0) {
    return { ok: false, error: "scopes_required" };
  }
  const ttlDays = Math.min(Math.max(1, input.ttl_days ?? DEFAULT_TTL_DAYS), MAX_TTL_DAYS);
  const expires = new Date(Date.now() + ttlDays * 86_400_000);

  const supabase = getSupabaseAdmin();

  // Verify the case belongs to the user
  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .select("id, user_id")
    .eq("id", input.case_id)
    .eq("user_id", input.user_id)
    .maybeSingle();
  if (caseErr || !caseRow) return { ok: false, error: "case_not_found" };

  const raw = generateToken();
  const hash = hashToken(raw);

  const { data, error } = await supabase
    .from("lawyer_share_tokens")
    .insert({
      token_hash: hash,
      user_id: input.user_id,
      case_id: input.case_id,
      scopes: input.scopes,
      lawyer_email: input.lawyer_email ?? null,
      lawyer_name: input.lawyer_name ?? null,
      allow_download: !!input.allow_download,
      expires_at: expires.toISOString(),
      used_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    logger.warn("lawyer_share.create_failed", { error: error?.message });
    return { ok: false, error: error?.message ?? "create_failed" };
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/share/${raw}`;
  return { ok: true, token: raw, share_id: data.id, url, expires_at: expires.toISOString() };
}

export async function verifyLawyerShare(
  rawToken: string,
): Promise<
  | { ok: true; share: ShareTokenRecord }
  | { ok: false; reason: "not_found" | "expired" | "revoked" }
> {
  const supabase = getSupabaseAdmin();
  const hash = hashToken(rawToken);
  const { data, error } = await supabase
    .from("lawyer_share_tokens")
    .select("*")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error || !data) return { ok: false, reason: "not_found" };
  if (data.revoked_at) return { ok: false, reason: "revoked" };
  if (new Date(data.expires_at).getTime() < Date.now()) return { ok: false, reason: "expired" };

  // Bump usage counter (fire and forget)
  supabase
    .from("lawyer_share_tokens")
    .update({ last_used_at: new Date().toISOString(), used_count: (data.used_count ?? 0) + 1 })
    .eq("id", data.id)
    .then(() => {}, () => {});

  return { ok: true, share: data as ShareTokenRecord };
}

export async function revokeLawyerShare(userId: string, shareId: string): Promise<{ ok: boolean }> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("lawyer_share_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", shareId)
    .eq("user_id", userId);
  return { ok: !error };
}

export async function listUserShares(userId: string, caseId?: string): Promise<ShareTokenRecord[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("lawyer_share_tokens")
    .select("id, user_id, case_id, scopes, lawyer_email, lawyer_name, allow_download, expires_at, revoked_at, created_at, last_used_at, used_count")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (caseId) q = q.eq("case_id", caseId);
  const { data } = await q;
  return (data ?? []) as ShareTokenRecord[];
}

export function hasScope(share: { scopes: ShareScope[] }, scope: ShareScope): boolean {
  if (share.scopes.includes(scope)) return true;
  // full_read implies summary + documents_read
  if (share.scopes.includes("full_read") && (scope === "case_summary" || scope === "documents_read")) return true;
  return false;
}
