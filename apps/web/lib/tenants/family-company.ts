/**
 * Family / company tenant model — zad. 347
 *
 * A "tenant" is a shared workspace where multiple users (family members, co-owners,
 * partners) can collaborate on cases. Each user belongs to >= 1 tenant.
 *
 * Roles within a tenant:
 *  - owner — billing + admin
 *  - admin — manage members + cases
 *  - member — create + edit own cases, view shared
 *  - viewer — read-only access to shared cases
 *  - lawyer — co-pilot mode (commenting, drafts)
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export type TenantKind = "personal" | "family" | "company";
export type TenantRole = "owner" | "admin" | "member" | "viewer" | "lawyer";

export interface Tenant {
  id: string;
  kind: TenantKind;
  name: string;
  owner_user_id: string;
  /** Tax info for companies */
  nip?: string;
  regon?: string;
  /** Max member count per plan */
  member_limit: number;
  created_at: string;
}

export interface TenantMember {
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  joined_at: string;
  invited_by_user_id?: string;
}

const ROLE_PERMISSIONS: Record<TenantRole, string[]> = {
  owner: ["*"],
  admin: ["tenant.read", "tenant.update", "members.manage", "cases.read", "cases.write", "cases.delete"],
  member: ["tenant.read", "cases.read", "cases.write"],
  viewer: ["tenant.read", "cases.read"],
  lawyer: ["tenant.read", "cases.read", "documents.comment", "documents.draft"],
};

export function hasPermission(role: TenantRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes("*") || perms.includes(permission);
}

export async function createTenant(input: {
  kind: TenantKind;
  name: string;
  owner_user_id: string;
  nip?: string;
  regon?: string;
}): Promise<{ ok: true; tenant: Tenant } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  const memberLimit = input.kind === "personal" ? 1 : input.kind === "family" ? 6 : 50;

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      kind: input.kind,
      name: input.name,
      owner_user_id: input.owner_user_id,
      nip: input.nip ?? null,
      regon: input.regon ?? null,
      member_limit: memberLimit,
    })
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "create_failed" };

  // Add owner as member
  await supabase.from("tenant_members").insert({
    tenant_id: data.id,
    user_id: input.owner_user_id,
    role: "owner",
  });
  return { ok: true, tenant: data as Tenant };
}

export async function inviteToTenant(
  tenantId: string,
  inviterId: string,
  inviteeEmail: string,
  role: TenantRole = "member",
): Promise<{ ok: true; invitation_id: string; token: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  // Verify inviter has admin or owner role
  const { data: membership } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", inviterId)
    .maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { ok: false, error: "insufficient_role" };
  }

  // Check member limit
  const { data: tenant } = await supabase.from("tenants").select("member_limit").eq("id", tenantId).maybeSingle();
  const { count } = await supabase.from("tenant_members").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId);
  if (tenant && count !== null && count >= tenant.member_limit) {
    return { ok: false, error: "member_limit_reached" };
  }

  const token = await import("node:crypto").then((c) => c.randomBytes(24).toString("base64url"));
  const expires = new Date(Date.now() + 7 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("tenant_invitations")
    .insert({
      tenant_id: tenantId,
      invitee_email: inviteeEmail.toLowerCase(),
      role,
      invited_by_user_id: inviterId,
      token,
      expires_at: expires,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "invite_failed" };
  return { ok: true, invitation_id: data.id, token };
}

export async function acceptInvitation(
  token: string,
  userId: string,
): Promise<{ ok: true; tenant_id: string; role: TenantRole } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  const { data: invitation } = await supabase
    .from("tenant_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .maybeSingle();
  if (!invitation) return { ok: false, error: "invitation_not_found" };
  if (new Date(invitation.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };

  // Add as member
  const { error } = await supabase.from("tenant_members").insert({
    tenant_id: invitation.tenant_id,
    user_id: userId,
    role: invitation.role,
    invited_by_user_id: invitation.invited_by_user_id,
  });
  if (error) {
    logger.warn("tenant.accept_invite_failed", { error: error.message });
    return { ok: false, error: error.message };
  }
  await supabase.from("tenant_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", invitation.id);
  return { ok: true, tenant_id: invitation.tenant_id, role: invitation.role };
}

export async function listUserTenants(userId: string): Promise<Array<Tenant & { role: TenantRole }>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tenant_members")
    .select("role, tenants!inner(id, kind, name, owner_user_id, nip, regon, member_limit, created_at)")
    .eq("user_id", userId);
  if (error || !data) return [];
  return data.map((row: any) => ({ ...(row.tenants as Tenant), role: row.role as TenantRole }));
}

export async function removeMember(
  tenantId: string,
  actingUserId: string,
  removeUserId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  // Acting user must be owner or admin
  const { data: actingMembership } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", actingUserId)
    .maybeSingle();
  if (!actingMembership || !["owner", "admin"].includes(actingMembership.role)) {
    return { ok: false, error: "insufficient_role" };
  }
  // Can't remove owner
  const { data: targetMembership } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", removeUserId)
    .maybeSingle();
  if (targetMembership?.role === "owner") return { ok: false, error: "cannot_remove_owner" };

  const { error } = await supabase.from("tenant_members").delete().eq("tenant_id", tenantId).eq("user_id", removeUserId);
  return { ok: !error, error: error?.message };
}
