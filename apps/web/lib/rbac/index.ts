import "server-only";

/**
 * Wave 6 / T003-007 — Central RBAC facade.
 *
 * Re-exports the canonical helpers from `lib/admin/rbac` and adds a
 * generic `requireRole(...roles)` helper that any API route or
 * server action can use. The aim is to remove inline `role === "admin"`
 * checks scattered around the codebase (audit found 6 such sites).
 *
 * Roles ladder (from least to most privileged):
 *   user → member → org_admin → owner → moderator → admin
 *
 * Notes:
 * - `member` / `org_admin` / `owner` are *organization-scoped* roles
 *   (resolved against `org_members.role` for a given org_id).
 * - `admin` / `moderator` / `user` come from `profiles.role`.
 * - The two ladders are deliberately decoupled: an `org_admin` for one
 *   organization can be a plain `user` globally.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type GlobalRole = "user" | "moderator" | "admin";
export type OrgRole = "member" | "org_admin" | "owner";
export type AnyRole = GlobalRole | OrgRole;

export class RbacAccessDeniedError extends Error {
  public readonly required: readonly AnyRole[];
  public readonly actual: AnyRole | "anonymous" | "unknown";

  constructor(required: readonly AnyRole[], actual: AnyRole | "anonymous" | "unknown") {
    super(
      actual === "anonymous"
        ? "Wymagane zalogowanie."
        : `Brak uprawnień. Wymagane role: ${required.join(", ")}. Twoja rola: ${actual}.`,
    );
    this.name = "RbacAccessDeniedError";
    this.required = required;
    this.actual = actual;
  }
}

export interface RbacContext {
  userId: string;
  email: string;
  globalRole: GlobalRole;
}

/**
 * Resolve the *global* role of the currently authenticated user.
 * Returns null when not signed in.
 */
export async function resolveGlobalRole(): Promise<RbacContext | null> {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;
  const user = userData.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as GlobalRole | null) ?? "user";
  return {
    userId: user.id,
    email: user.email ?? "",
    globalRole: role,
  };
}

/**
 * Generic guard. Throws RbacAccessDeniedError if user is not signed in
 * or does not satisfy any of the required roles.
 *
 * Usage in API route handler:
 *
 *   const ctx = await requireRole("admin", "moderator");
 *
 * Usage in server action with redirect on failure:
 *
 *   const ctx = await requireRoleOrRedirect(["admin"], "/panel");
 */
export async function requireRole(
  ...roles: readonly GlobalRole[]
): Promise<RbacContext> {
  const ctx = await resolveGlobalRole();
  if (!ctx) throw new RbacAccessDeniedError(roles, "anonymous");
  if (!roles.includes(ctx.globalRole)) {
    throw new RbacAccessDeniedError(roles, ctx.globalRole);
  }
  return ctx;
}

export async function requireRoleOrRedirect(
  roles: readonly GlobalRole[],
  redirectTo = "/panel",
): Promise<RbacContext> {
  try {
    return await requireRole(...roles);
  } catch {
    redirect(redirectTo);
  }
}

/**
 * Non-throwing check — for navigation / UI menu rendering.
 */
export async function hasRole(
  ...roles: readonly GlobalRole[]
): Promise<boolean> {
  const ctx = await resolveGlobalRole();
  return !!ctx && roles.includes(ctx.globalRole);
}

/**
 * Shorthand for the most common case.
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Shorthand for org-scoped permission. Resolves the user's role within
 * a specific organization. Returns null when not signed in or not a
 * member of that org.
 *
 * Audyt #15 — kanoniczną tabelą członkostwa jest `org_memberships`
 * (20260516000000_tier13_enterprise_multitenant.sql), NIE nieistniejące
 * `org_members`. Wcześniej zapytanie do `org_members` zawsze zwracało błąd
 * (brak tabeli) → `resolveOrgRole` po cichu zwracało null, więc każdy
 * org-scoped check RBAC był nieaktywny. Dodatkowo normalizujemy nazwę roli:
 * w DB owner/admin/member, w kodzie owner/org_admin/member.
 */
function normalizeOrgRole(dbRole: string | null | undefined): OrgRole | null {
  if (!dbRole) return null;
  if (dbRole === "owner") return "owner";
  if (dbRole === "admin" || dbRole === "org_admin") return "org_admin";
  if (dbRole === "member") return "member";
  return null;
}

export async function resolveOrgRole(orgId: string): Promise<OrgRole | null> {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const { data, error } = await supabase
    .from("org_memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) return null;
  return normalizeOrgRole((data as { role?: string } | null)?.role);
}

export async function requireOrgRole(
  orgId: string,
  ...roles: readonly OrgRole[]
): Promise<{ ctx: RbacContext; orgRole: OrgRole }> {
  const ctx = await resolveGlobalRole();
  if (!ctx) throw new RbacAccessDeniedError(roles, "anonymous");

  // Global admins bypass org-scoped checks.
  if (ctx.globalRole === "admin") {
    return { ctx, orgRole: "owner" };
  }

  const orgRole = await resolveOrgRole(orgId);
  if (!orgRole) throw new RbacAccessDeniedError(roles, "unknown");
  if (!roles.includes(orgRole)) throw new RbacAccessDeniedError(roles, orgRole);
  return { ctx, orgRole };
}

/* Re-exports for backwards compatibility with existing call sites. */
export {
  requireAdmin,
  requireAdminOrRedirect,
  requireFullAdmin,
  isCurrentUserAdmin,
  AdminAccessDeniedError,
} from "@/lib/admin/rbac";
export type { AdminContext } from "@/lib/admin/rbac";

/**
 * Wave 8 / W8-3 — Platform admin gate for API routes.
 *
 * Replaces 6 inline `(user.app_metadata as ...).role === "admin"` checks
 * scattered across admin & compliance route handlers. Returns BOTH the
 * boolean + the `userId` (which downstream code typically needs to pass
 * to audit-log writers, impersonation, secret-vault, etc.).
 *
 * Defense-in-depth: checks JWT `app_metadata.role` (synced via Supabase
 * triggers on `profiles.role` change) AND falls back to `profiles.role`
 * directly — so a freshly-promoted admin doesn't have to wait for token
 * refresh.
 *
 * Returns:
 *   { ok: true,  userId: "<uuid>" } — when admin
 *   { ok: false }                   — anonymous or insufficient role
 */
export async function requirePlatformAdmin(): Promise<
  { ok: true; userId: string; email: string } | { ok: false }
> {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { ok: false };
  const user = userData.user;

  // 1) Fast path — JWT app_metadata.role
  const jwtRole = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (jwtRole === "admin") {
    return { ok: true, userId: user.id, email: user.email ?? "" };
  }

  // 2) Fallback — profiles.role (defense-in-depth, handles stale tokens)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role === "admin") {
    return { ok: true, userId: user.id, email: user.email ?? "" };
  }

  return { ok: false };
}
