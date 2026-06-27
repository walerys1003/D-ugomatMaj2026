/**
 * Tier 13 — Organizations (multi-tenant). Each org is a billable workspace
 * containing members, workspaces, and policies.
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { randomUUID } from "crypto";

export type OrgPlan = "team" | "business" | "enterprise";

export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: OrgPlan;
  seats_purchased: number;
  data_residency: "eu-warsaw" | "eu-frankfurt" | "us-east";
  domain?: string | null;
  created_at: string;
}

export type OrgRole = "owner" | "admin" | "member" | "billing" | "viewer";

export interface OrgMembership {
  org_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  last_active_at?: string | null;
}

export async function createOrganization(input: { ownerUserId: string; name: string; plan?: OrgPlan; seats?: number }): Promise<Organization> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const slug = baseSlug(input.name);
  const finalSlug = await ensureUniqueSlug(slug);
  const org: Organization = {
    id: randomUUID(),
    slug: finalSlug,
    name: input.name,
    plan: input.plan ?? "team",
    seats_purchased: input.seats ?? 5,
    data_residency: "eu-warsaw",
    created_at: new Date().toISOString(),
  };
  await sb.from("organizations").insert(org);
  await sb.from("org_memberships").insert({
    org_id: org.id,
    user_id: input.ownerUserId,
    role: "owner",
    joined_at: new Date().toISOString(),
  });
  return org;
}

export async function listUserOrganizations(userId: string): Promise<{ org: Organization; role: OrgRole }[]> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data } = await sb
    .from("org_memberships")
    .select("role, org:organizations(*)")
    .eq("user_id", userId);
  return ((data as any[]) ?? []).map((r) => ({ org: r.org as Organization, role: r.role as OrgRole }));
}

export async function inviteMember(orgId: string, email: string, role: OrgRole, invitedBy: string): Promise<{ token: string }> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const token = randomUUID().replace(/-/g, "");
  await sb.from("org_invitations").insert({
    org_id: orgId,
    email: email.toLowerCase(),
    role,
    token,
    invited_by: invitedBy,
    expires_at: new Date(Date.now() + 7 * 86400_000).toISOString(),
    created_at: new Date().toISOString(),
  });
  return { token };
}

export async function acceptInvitation(token: string, userId: string): Promise<{ org_id: string; role: OrgRole }> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: inv } = await sb.from("org_invitations").select("*").eq("token", token).maybeSingle();
  if (!inv) throw new Error("invalid_token");
  if (new Date(inv.expires_at).getTime() < Date.now()) throw new Error("expired");
  await sb.from("org_memberships").upsert(
    {
      org_id: inv.org_id,
      user_id: userId,
      role: inv.role,
      joined_at: new Date().toISOString(),
    },
    { onConflict: "org_id,user_id" },
  );
  await sb.from("org_invitations").update({ accepted_at: new Date().toISOString() }).eq("token", token);
  return { org_id: inv.org_id, role: inv.role };
}

export async function setMemberRole(orgId: string, userId: string, role: OrgRole): Promise<void> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  await sb.from("org_memberships").update({ role }).eq("org_id", orgId).eq("user_id", userId);
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  await sb.from("org_memberships").delete().eq("org_id", orgId).eq("user_id", userId);
}

function baseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => "acelnoszz"["ąćęłńóśźż".indexOf(c)] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function ensureUniqueSlug(base: string): Promise<string> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  let candidate = base || "org";
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const { data } = await sb.from("organizations").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    n++;
    candidate = `${base}-${n}`;
  }
  return `${base}-${randomUUID().slice(0, 6)}`;
}
