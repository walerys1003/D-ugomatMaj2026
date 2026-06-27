import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, ShieldAlert, ArrowLeft, LayoutDashboard, Activity, Bug, ToggleRight, UserCog, Gavel, Lock, Workflow, Sparkles, BarChart3, Gauge } from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";

/**
 * Admin shell v3 ("Stoic" — Operations Console look).
 *
 * Etap 7 redesignu Tarcza Stoic. Admin shell dostaje tighter chrome
 * (Linear / Vercel admin / Retool inspiracje):
 *  - bg ink-50 zamiast iron-50/60 (true neutral, brak navy tintu)
 *  - h-header (56px) zamiast h-16 — gęstsza chroma
 *  - text-[13px] nav items (Linear-grade)
 *  - tighter h-8 nav linki z inset 1px ringiem na aktywnym (bez state na server component — hover only)
 *  - ink-200 borders, ink-50 hover, ink-700 text
 *  - max-w-[1400px] wrapper dla density operations console
 *
 * IA (4 grupy × 13 sekcji) bez zmian — to po v2:
 *   OPERATIONS    — dashboard, analytics, rum, errors
 *   AI/WORKFLOWS  — prompts, workflows
 *   ACCESS        — rbac, impersonate, rate-limits
 *   COMPLIANCE    — legal-hold, compliance, feature-flags, secrets
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
    <div className="flex min-h-screen w-full bg-ink-50 dark:bg-dlugomat-950">
      <a href="#admin-main" className="sr-only sr-focusable">
        Przejdź do treści
      </a>

      {/* SIDEBAR — operations console */}
      <aside
        aria-label="Nawigacja administracyjna"
        className="hidden w-sidebar shrink-0 flex-col border-r border-ink-200 bg-white dark:border-dlugomat-800/60 dark:bg-dlugomat-900 lg:flex"
      >
        {/* Brand header — h-header (56px) */}
        <div className="flex h-header items-center gap-2 border-b border-ink-200 px-5 dark:border-dlugomat-800/60">
          <div className="flex size-6 items-center justify-center rounded-sm bg-ink-900 text-white dark:bg-white dark:text-ink-900">
            <ShieldCheck className="size-3.5" aria-hidden />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight text-ink-900 dark:text-white">
            Compliance Console
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => {
            const items = visible.filter((i) => i.group === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id} className="flex flex-col gap-px">
                <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                  {group.label}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex h-8 items-center gap-2.5 rounded-sm px-2.5 text-[13px] font-medium text-ink-700 transition-colors duration-base ease-shield-out hover:bg-ink-50 hover:text-ink-900 focus-visible:shadow-shield-focus focus-visible:outline-none dark:text-ink-200 dark:hover:bg-dlugomat-850/70 dark:hover:text-white"
                    >
                      <Icon
                        className="size-3.5 shrink-0 text-ink-400 group-hover:text-ink-700 dark:text-ink-500 dark:group-hover:text-white"
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

        {/* Footer — admin context */}
        <div className="border-t border-ink-200 p-4 dark:border-dlugomat-800/60">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span
              className="truncate text-xs text-ink-600 dark:text-ink-400"
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
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-500 transition-colors hover:text-ink-900 dark:hover:text-white"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Panel użytkownika
          </Link>
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header — tighter chrome */}
        <header className="border-b border-ink-200 bg-white px-6 py-3 dark:border-dlugomat-800/60 dark:bg-dlugomat-900 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-sm bg-ink-900 text-white">
                <ShieldCheck className="size-3.5" aria-hidden />
              </div>
              <span className="font-display text-sm font-semibold text-ink-900 dark:text-white">
                Compliance
              </span>
            </Link>
            <Badge tone={isFullAdmin ? "info" : "neutral"} withDot>
              {admin.role}
            </Badge>
          </div>
          <nav
            className="mt-3 flex flex-wrap gap-1"
            aria-label="Nawigacja administracyjna (mobile)"
          >
            {visible.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-900 dark:border-dlugomat-700 dark:text-ink-300 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main id="admin-main" className="flex-1 px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
