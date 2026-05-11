import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  ArrowLeft,
  LayoutDashboard,
  Activity,
  Bug,
  ToggleRight,
  UserCog,
  Gavel,
  KeyRound,
  Lock,
  FileShield,
} from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Panel administracyjny — Compliance",
  robots: { index: false, follow: false, nocache: true },
};

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fullAdminOnly?: boolean;
  group: "ops" | "compliance" | "security";
}

const ADMIN_NAV: AdminNavItem[] = [
  // Ops / monitoring
  { href: "/admin/dashboard", label: "KPI dashboard", icon: LayoutDashboard, group: "ops" },
  { href: "/admin/errors", label: "Błędy aplikacji", icon: Bug, group: "ops" },
  { href: "/admin/feature-flags", label: "Feature flags", icon: ToggleRight, group: "ops", fullAdminOnly: true },
  // Compliance
  { href: "/admin/compliance", label: "DPIA / RoPA / SOC2", icon: FileShield, group: "compliance", fullAdminOnly: true },
  { href: "/admin/legal-hold", label: "Legal hold + e-discovery", icon: Gavel, group: "compliance", fullAdminOnly: true },
  // Security
  { href: "/admin/rbac", label: "Polityki RBAC", icon: ShieldCheck, group: "security", fullAdminOnly: true },
  { href: "/admin/impersonate", label: "Impersonacja", icon: UserCog, group: "security", fullAdminOnly: true },
  { href: "/admin/secrets", label: "Secret vault", icon: Lock, group: "security", fullAdminOnly: true },
];

const GROUP_LABEL: Record<AdminNavItem["group"], string> = {
  ops: "Operations",
  compliance: "Compliance",
  security: "Security",
};

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminOrRedirect();
  const isFullAdmin = admin.role === "admin";
  const visible = ADMIN_NAV.filter((i) => !i.fullAdminOnly || isFullAdmin);
  const groups: AdminNavItem["group"][] = ["ops", "compliance", "security"];

  return (
    <div className="flex min-h-screen w-full bg-iron-50/60 dark:bg-dlugomat-950">
      <a href="#admin-main" className="sr-only sr-focusable">
        Przejdź do treści
      </a>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-iron-200 bg-white px-4 py-6 dark:border-dlugomat-800 dark:bg-dlugomat-900 lg:flex">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-dlugomat-700 dark:text-dlugomat-300" />
          <span className="font-serif text-fluid-lg font-semibold text-iron-900 dark:text-white">
            Compliance Console
          </span>
        </div>

        <nav aria-label="Nawigacja administracyjna" className="flex flex-col gap-4">
          {groups.map((group) => {
            const items = visible.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="flex flex-col gap-1">
                <span className="px-3 py-1 text-fluid-xs font-semibold uppercase tracking-wider text-iron-400 dark:text-iron-500">
                  {GROUP_LABEL[group]}
                </span>
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-fluid-sm font-medium text-iron-700 transition-colors hover:bg-iron-50 hover:text-dlugomat-700 dark:text-iron-200 dark:hover:bg-dlugomat-800 dark:hover:text-white"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-iron-200 pt-4 dark:border-dlugomat-800">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-fluid-xs text-iron-500" title={admin.email}>
              {admin.email}
            </span>
            <Badge tone={isFullAdmin ? "info" : "neutral"} withDot>
              {isFullAdmin ? "admin" : "moderator"}
            </Badge>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-fluid-xs text-iron-500 hover:text-dlugomat-700 dark:hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Operacyjny admin (legacy)
          </Link>
          <Link
            href="/panel"
            className="flex items-center gap-2 text-fluid-xs text-iron-500 hover:text-dlugomat-700 dark:hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Panel użytkownika
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-iron-200 bg-white px-6 py-4 dark:border-dlugomat-800 dark:bg-dlugomat-900 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-dlugomat-700 dark:text-dlugomat-300" />
              <span className="font-serif font-semibold text-iron-900 dark:text-white">
                Compliance
              </span>
            </Link>
            <Badge tone={isFullAdmin ? "info" : "neutral"} withDot>
              {admin.role}
            </Badge>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2" aria-label="Nawigacja administracyjna (mobile)">
            {visible.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-iron-200 px-2 py-1 text-fluid-xs text-iron-600 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700 dark:text-iron-300 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main id="admin-main" className="flex-1 px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
