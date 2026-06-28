/**
 * Tier 13 — Role-based access control matrix for organizations.
 */
import type { OrgRole } from "./organizations";

export type Permission =
  | "org.read"
  | "org.update"
  | "org.delete"
  | "org.billing.manage"
  | "org.members.read"
  | "org.members.invite"
  | "org.members.remove"
  | "org.members.change_role"
  | "workspace.create"
  | "workspace.update"
  | "workspace.delete"
  | "case.read.all"
  | "case.read.own"
  | "case.create"
  | "case.update.all"
  | "case.update.own"
  | "case.delete.all"
  | "audit.read"
  | "policy.manage"
  | "sso.configure";

const MATRIX: Record<OrgRole, Permission[]> = {
  owner: [
    "org.read", "org.update", "org.delete",
    "org.billing.manage",
    "org.members.read", "org.members.invite", "org.members.remove", "org.members.change_role",
    "workspace.create", "workspace.update", "workspace.delete",
    "case.read.all", "case.read.own", "case.create", "case.update.all", "case.update.own", "case.delete.all",
    "audit.read", "policy.manage", "sso.configure",
  ],
  admin: [
    "org.read", "org.update",
    "org.members.read", "org.members.invite", "org.members.remove", "org.members.change_role",
    "workspace.create", "workspace.update", "workspace.delete",
    "case.read.all", "case.read.own", "case.create", "case.update.all", "case.update.own", "case.delete.all",
    "audit.read", "policy.manage",
  ],
  billing: ["org.read", "org.billing.manage", "audit.read"],
  member: ["org.read", "org.members.read", "case.read.own", "case.create", "case.update.own"],
  viewer: ["org.read", "case.read.own"],
};

export function hasPermission(role: OrgRole, permission: Permission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

export function listPermissionsForRole(role: OrgRole): Permission[] {
  return MATRIX[role] ?? [];
}

export function requirePermission(role: OrgRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`forbidden:${permission}`);
  }
}
