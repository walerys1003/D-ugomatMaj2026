/**
 * Tier 13 — SCIM 2.0 provisioning endpoints (RFC 7644 subset: Users + Groups).
 */
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface ScimUser {
  id: string;
  userName: string;
  active: boolean;
  emails: { value: string; primary?: boolean }[];
  name?: { givenName?: string; familyName?: string };
  externalId?: string;
}

interface ScimPayload {
  userName?: string;
  active?: boolean;
  externalId?: string;
  emails?: { value: string; primary?: boolean }[];
  name?: { givenName?: string; familyName?: string };
}

/** Wiersz `profiles` w zakresie potrzebnym do SCIM (osadzony join + upsert). */
interface ScimProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  external_id: string | null;
  active: boolean | null;
}

export async function createScimUser(orgId: string, payload: ScimPayload): Promise<ScimUser> {
  const sb = await createSupabaseServerClient();
  const email = (payload.emails?.find((e) => e.primary)?.value ?? payload.emails?.[0]?.value ?? payload.userName)?.toLowerCase();
  if (!email) throw new Error("missing_email");
  const { data: profile } = await sb
    .from("profiles")
    // upsert wymaga `id`; przy onConflict=email Postgres zignoruje przy istnieniu.
    .upsert(
      {
        id: randomUUID(),
        email,
        full_name: [payload.name?.givenName, payload.name?.familyName].filter(Boolean).join(" ") || null,
        provisioned_via: "scim",
        external_id: payload.externalId ?? null,
        active: payload.active ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id, email, full_name, external_id, active")
    .single();
  if (!profile) throw new Error("scim_upsert_failed");
  await sb.from("org_memberships").upsert(
    { org_id: orgId, user_id: profile.id, role: "member", joined_at: new Date().toISOString() },
    { onConflict: "org_id,user_id" },
  );
  return toScimUser(profile);
}

export async function listScimUsers(orgId: string, opts?: { startIndex?: number; count?: number; filter?: string }): Promise<{ Resources: ScimUser[]; totalResults: number; itemsPerPage: number; startIndex: number }> {
  const sb = await createSupabaseServerClient();
  const start = opts?.startIndex ?? 1;
  const count = Math.min(opts?.count ?? 50, 200);
  const { data, count: total } = await sb
    .from("org_memberships")
    .select("user:profiles(*)", { count: "exact" })
    .eq("org_id", orgId)
    .range(start - 1, start - 1 + count - 1);
  // Osadzony join `user:profiles(*)` nie jest statycznie typowany — lokalny kształt.
  type Joined = { user: ScimProfileRow | ScimProfileRow[] | null };
  const users = ((data ?? []) as unknown as Joined[]).map((r) => {
    const u = Array.isArray(r.user) ? r.user[0] : r.user;
    return toScimUser(u);
  });
  return { Resources: users, totalResults: total ?? users.length, itemsPerPage: count, startIndex: start };
}

export async function deactivateScimUser(orgId: string, userId: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  // REALNY BUG: poprzednio zapisywano do nieistniejących kolumn `suspended` /
  // `suspended_at` (maskowane przez `as any`). Tabela `profiles` ma jedynie
  // kolumnę `active` (20260516000000_tier13) — dezaktywacja = active:false.
  await sb.from("profiles").update({ active: false, updated_at: new Date().toISOString() }).eq("id", userId);
  await sb.from("org_memberships").delete().eq("org_id", orgId).eq("user_id", userId);
}

function toScimUser(profile: ScimProfileRow | null): ScimUser {
  const fullName = profile?.full_name ?? "";
  const [given, ...rest] = fullName.split(" ");
  const email = profile?.email ?? "";
  return {
    id: profile?.id ?? "",
    userName: email,
    // REALNY BUG: poprzednio czytano `profile.suspended` (kolumna nie istnieje).
    // Aktywność wynika z kolumny `active`.
    active: profile?.active ?? false,
    emails: [{ value: email, primary: true }],
    name: { givenName: given, familyName: rest.join(" ") || undefined },
    externalId: profile?.external_id ?? undefined,
  };
}
