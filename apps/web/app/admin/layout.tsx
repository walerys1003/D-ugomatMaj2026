import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  ListChecks,
  ScrollText,
  Wand2,
  Users,
  ArrowLeft,
  Bell,
  BookOpen,
  Tag,
} from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Panel administracyjny",
  robots: { index: false, follow: false, nocache: true },
};

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fullAdminOnly?: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Pulpit", icon: ShieldCheck },
  { href: "/admin/sprawy", label: "Kolejka spraw", icon: ListChecks },
  { href: "/admin/notyfikacje", label: "Notyfikacje", icon: Bell },
  { href: "/admin/wiedza", label: "Baza wiedzy", icon: BookOpen },
  { href: "/admin/promocje", label: "Kody promo", icon: Tag, fullAdminOnly: true },
  { href: "/admin/audyt", label: "Audit log", icon: ScrollText },
  { href: "/admin/prompty", label: "Prompty AI", icon: Wand2, fullAdminOnly: true },
  { href: "/admin/uzytkownicy", label: "Użytkownicy", icon: Users, fullAdminOnly: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tier 5.4 — RBAC gate; redirects to /panel if not admin/moderator.
  const admin = await requireAdminOrRedirect();
  const isFullAdmin = admin.role === "admin";

  return (
    <div className="flex min-h-screen w-full bg-iron-50/60 dark:bg-dlugomat-950">
      <a href="#admin-main" className="sr-only sr-focusable">
        Przejdź do treści
      </a>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-iron-200 bg-white px-4 py-6 dark:border-dlugomat-800 dark:bg-dlugomat-900 lg:flex">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-dlugomat-700 dark:text-dlugomat-300" />
          <span className="font-serif text-fluid-lg font-semibold text-iron-900 dark:text-white">
            Długomat · Admin
          </span>
        </div>

        <nav aria-label="Nawigacja administracyjna" className="flex flex-col gap-1">
          {ADMIN_NAV.filter((item) => !item.fullAdminOnly || isFullAdmin).map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-fluid-sm font-medium text-iron-700 transition-colors hover:bg-iron-50 hover:text-dlugomat-700 dark:text-iron-200 dark:hover:bg-dlugomat-800 dark:hover:text-white"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ),
          )}
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
            href="/panel"
            className="flex items-center gap-2 text-fluid-xs text-iron-500 hover:text-dlugomat-700 dark:hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Wróć do panelu użytkownika
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-iron-200 bg-white px-6 py-4 dark:border-dlugomat-800 dark:bg-dlugomat-900 lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-dlugomat-700 dark:text-dlugomat-300" />
              <span className="font-serif font-semibold text-iron-900 dark:text-white">
                Admin
              </span>
            </Link>
            <Badge tone={isFullAdmin ? "info" : "neutral"} withDot>
              {admin.role}
            </Badge>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2" aria-label="Nawigacja administracyjna (mobile)">
            {ADMIN_NAV.filter((item) => !item.fullAdminOnly || isFullAdmin).map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border border-iron-200 px-2 py-1 text-fluid-xs text-iron-600 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700 dark:text-iron-300 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </header>

        <main id="admin-main" className="flex-1 px-6 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
