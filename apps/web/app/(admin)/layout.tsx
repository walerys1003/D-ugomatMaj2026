import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  Activity,
  Bug,
  ToggleRight,
  UserCog,
  Gavel,
  KeyRound,
  Lock,
  Workflow,
  Sparkles,
  BarChart3,
  Gauge,
} from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

/**
 * Admin shell v2 (Tarcza Premium).
 *
 * Konsolidacja (Etap 4b dedup audit):
 *  - Canonical: app/(admin)/admin/* — 13 sekcji w bazie kodu.
 *  - Brak duplikatu (panel)/panel/admin — audit P3 wcześniej błędnie zakładał.
 *
 * Stary layout pokazywał tylko 8 z 13 sekcji — `analytics`, `prompts`,
 * `rate-limits`, `rum`, `workflows` były UI-nieosiągalne. Nowy układ:
 *
 *   OPERATIONS   — dashboard, analytics, rum, errors
 *   AI / WORKFLOWS — prompts, workflows
 *   ACCESS       — rbac, impersonate, rate-limits
 *   COMPLIANCE   — legal-hold, compliance, feature-flags, secrets
 *
 * Fixy:
 *  - lucide `FileShield` → `ShieldAlert` (P1.2 z audytu: FileShield nie istnieje)
 *  - Usunięto dead link "/admin" (Operacyjny admin legacy — nie istniał)
 *  - `requireAdminOrRedirect` zostaje jako gate (RBAC z lib/admin/rbac)
 */

export const metadata: Metadata = {
  title: "Panel administracyjny · Długomat",
  robots: { index: false, follow: false, nocache: true },
};

type AdminGroup = "operations" | "ai" | "access" | "compliance";

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: AdminGroup;
  /** Tylko dla `role=admin`; moderatorzy nie widzą */
  fullAdminOnly?: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
  // Operations
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "operations" },
  { href: "/admin/analytics", label: "Analityka", icon: BarChart3, group: "operations" },
  { href: "/admin/rum", label: "Real-user monitoring", icon: Gauge, group: "operations" },
  { href: "/admin/errors", label: "Błędy aplikacji", icon: Bug, group: "operations" },

  // AI / Workflows
  { href: "/admin/prompts", label: "Prompts (LLM)", icon: Sparkles, group: "ai", fullAdminOnly: true },
  { href: "/admin/workflows", label: "Workflows", icon: Workflow, group: "ai", fullAdminOnly: true },

  // Access
  { href: "/admin/rbac", label: "Polityki RBAC", icon: ShieldCheck, group: "access", fullAdminOnly: true },
  { href: "/admin/impersonate", label: "Impersonacja", icon: UserCog, group: "access", fullAdminOnly: true },
  { href: "/admin/rate-limits", label: "Rate limits", icon: Activity, group: "access" },

  // Compliance
  { href: "/admin/legal-hold", label: "Legal hold", icon: Gavel, group: "compliance", fullAdminOnly: true },
  { href: "/admin/compliance", label: "DPIA / RoPA", icon: ShieldAlert, group: "compliance", fullAdminOnly: true },
  { href: "/admin/feature-flags", label: "Feature flags", icon: ToggleRight, group: "compliance", fullAdminOnly: true },
  { href: "/admin/secrets", label: "Secret vault", icon: Lock, group: "compliance", fullAdminOnly: true },
];

const GROUPS: ReadonlyArray<{ id: AdminGroup; label: string }> = [
  { id: "operations", label: "Operations" },
  { id: "ai", label: "AI & Workflows" },
  { id: "access", label: "Access" },
  { id: "compliance", label: "Compliance" },
];

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminOrRedirect();
  const isFullAdmin = admin.role === "admin";
  const visible = ADMIN_NAV.filter((i) => !i.fullAdminOnly || isFullAdmin);

  return (
    <div className="flex min-h-screen w-full bg-iron-50/60 dark:bg-dlugomat-950">
      <a href="#admin-main" className="sr-only sr-focusable">
        Przejdź do treści
      </a>

      {/* SIDEBAR */}
      <aside
        aria-label="Nawigacja administracyjna"
        className="hidden w-64 shrink-0 flex-col border-r border-iron-200/80 bg-white dark:border-dlugomat-800/60 dark:bg-dlugomat-900 lg:flex"
      >
        <div className="flex h-16 items-center gap-2 border-b border-iron-200/80 px-5 dark:border-dlugomat-800/60">
          <ShieldCheck className="size-5 text-dlugomat-700 dark:text-dlugomat-300" aria-hidden />
          <span className="font-display text-fluid-base font-semibold text-iron-900 dark:text-white">
            Compliance Console
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => {
            const items = visible.filter((i) => i.group === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id} className="flex flex-col gap-0.5">
                <p className="px-3 pb-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-iron-500">
                  {group.label}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-md px-3 py-2 text-fluid-sm font-medium text-iron-700 transition-colors duration-base ease-shield-out hover:bg-iron-50 hover:text-dlugomat-700 focus-visible:shadow-shield-focus focus-visible:outline-none dark:text-iron-200 dark:hover:bg-dlugomat-850/70 dark:hover:text-white"
                    >
                      <Icon
                        className="size-4 shrink-0 text-iron-400 group-hover:text-dlugomat-600 dark:text-iron-500 dark:group-hover:text-white"
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-iron-200/80 p-4 dark:border-dlugomat-800/60">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span
              className="truncate text-fluid-xs text-iron-600 dark:text-iron-400"
              title={admin.email}
            >
              {admin.email}
            </span>
            <Badge tone={isFullAdmin ? "info" : "neutral"} withDot>
              {isFullAdmin ? "admin" : "moderator"}
            </Badge>
          </div>
          <Divider />
          <Link
            href="/panel"
            className="mt-3 flex items-center gap-2 text-fluid-xs font-medium text-iron-500 transition-colors hover:text-dlugomat-700 dark:hover:text-white"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Panel użytkownika
          </Link>
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header z listą tagów-skrótów */}
        <header className="border-b border-iron-200/80 bg-white px-6 py-4 dark:border-dlugomat-800/60 dark:bg-dlugomat-900 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-dlugomat-700 dark:text-dlugomat-300" aria-hidden />
              <span className="font-display font-semibold text-iron-900 dark:text-white">
                Compliance
              </span>
            </Link>
            <Badge tone={isFullAdmin ? "info" : "neutral"} withDot>
              {admin.role}
            </Badge>
          </div>
          <nav
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label="Nawigacja administracyjna (mobile)"
          >
            {visible.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-iron-200 px-2 py-1 text-fluid-xs text-iron-600 transition-colors hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700 dark:text-iron-300 dark:hover:text-white"
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
