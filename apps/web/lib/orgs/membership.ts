/**
 * Tier 36 — Multi-tenant organisations: membership + roles + invitations.
 *
 * Logika członkostwa, ról i zaproszeń w organizacjach Długomat (B2B).
 * Wszystkie funkcje są lekkie i sieciowe — pobierają dane z naszego API.
 */

export type OrgRole = "owner" | "admin" | "member" | "viewer" | "billing";

export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: "starter" | "growth" | "enterprise";
  seats_used: number;
  seats_total: number;
  domain?: string;
  sso_enabled: boolean;
  scim_enabled: boolean;
  created_at: string;
}

export interface OrgMembership {
  id: string;
  org_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: OrgRole;
  joined_at: string;
  last_active_at: string | null;
}

export interface OrgInvitation {
  id: string;
  org_id: string;
  email: string;
  role: OrgRole;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  status: "pending" | "accepted" | "expired" | "revoked";
}

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Właściciel",
  admin: "Administrator",
  member: "Członek",
  viewer: "Obserwator",
  billing: "Rozliczenia",
};

export const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: "Pełny dostęp, zarządzanie planem i likwidacja konta",
  admin: "Zarządzanie zespołem, integracjami, ustawieniami",
  member: "Praca operacyjna w sprawach i dokumentach",
  viewer: "Tylko podgląd danych",
  billing: "Dostęp do faktur i ustawień rozliczeń",
};

export async function fetchCurrentOrg(): Promise<Organization | null> {
  try {
    const res = await fetch("/api/orgs/current", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Organization;
  } catch {
    return null;
  }
}

export async function fetchUserOrgs(): Promise<Organization[]> {
  try {
    const res = await fetch("/api/orgs/mine", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orgs ?? [];
  } catch {
    return [];
  }
}

export async function fetchMembers(orgId: string): Promise<OrgMembership[]> {
  try {
    const res = await fetch(`/api/orgs/${orgId}/members`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.members ?? [];
  } catch {
    return [];
  }
}

export async function fetchInvitations(orgId: string): Promise<OrgInvitation[]> {
  try {
    const res = await fetch(`/api/orgs/${orgId}/invitations`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.invitations ?? [];
  } catch {
    return [];
  }
}

export function canManageOrg(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageBilling(role: OrgRole): boolean {
  return role === "owner" || role === "billing";
}
