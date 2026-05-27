/**
 * Tier 13 — SCIM 2.0 provisioning endpoints (RFC 7644 subset: Users + Groups).
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface ScimUser {
  id: string;
  userName: string;
  active: boolean;
  emails: { value: string; primary?: boolean }[];
  name?: { givenName?: string; familyName?: string };
  externalId?: string;
}

export async function createScimUser(orgId: string, payload: any): Promise<ScimUser> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const email = (payload.emails?.find((e: any) => e.primary)?.value ?? payload.emails?.[0]?.value ?? payload.userName)?.toLowerCase();
  if (!email) throw new Error("missing_email");
  const { data: profile } = await sb
    .from("profiles")
    .upsert(
      {
        email,
        full_name: [payload.name?.givenName, payload.name?.familyName].filter(Boolean).join(" ") || null,
        provisioned_via: "scim",
        external_id: payload.externalId,
        active: payload.active ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select()
    .single();
  await sb.from("org_memberships").upsert(
    { org_id: orgId, user_id: profile.id, role: "member", joined_at: new Date().toISOString() },
    { onConflict: "org_id,user_id" },
  );
  return toScimUser(profile);
}

export async function listScimUsers(orgId: string, opts?: { startIndex?: number; count?: number; filter?: string }): Promise<{ Resources: ScimUser[]; totalResults: number; itemsPerPage: number; startIndex: number }> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const start = opts?.startIndex ?? 1;
  const count = Math.min(opts?.count ?? 50, 200);
  const { data, count: total } = await sb
    .from("org_memberships")
    .select("user:profiles(*)", { count: "exact" })
    .eq("org_id", orgId)
    .range(start - 1, start - 1 + count - 1);
  const users = ((data as any[]) ?? []).map((r) => toScimUser(r.user));
  return { Resources: users, totalResults: total ?? users.length, itemsPerPage: count, startIndex: start };
}

export async function deactivateScimUser(orgId: string, userId: string): Promise<void> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  await sb.from("profiles").update({ active: false, suspended: true, suspended_at: new Date().toISOString() }).eq("id", userId);
  await sb.from("org_memberships").delete().eq("org_id", orgId).eq("user_id", userId);
}

function toScimUser(profile: any): ScimUser {
  const [given, ...rest] = (profile.full_name ?? "").split(" ");
  return {
    id: profile.id,
    userName: profile.email,
    active: !profile.suspended,
    emails: [{ value: profile.email, primary: true }],
    name: { givenName: given, familyName: rest.join(" ") || undefined },
    externalId: profile.external_id ?? undefined,
  };
}
