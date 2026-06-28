"use client";

/**
 * V5 Panel Shell — Agent 04: User Panel Redesign
 * --------------------------------------------------------------------------
 * Premium procedural workspace · infrastructure-grade dashboard.
 * Inspired by Linear, Vercel, Modal, Retool.
 */
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { V5LivePulse } from "@/components/v5/motion";

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  pill?: "AI" | "NEW" | "BETA";
};
type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const PANEL_NAV: NavGroup[] = [
  {
    id: "praca",
    label: "Praca",
    items: [
      { href: "/panel", label: "Pulpit" },
      { href: "/panel/sprawy", label: "Sprawy", badge: "12" },
      { href: "/panel/dokumenty", label: "Dokumenty" },
      { href: "/panel/ai-asystent", label: "Asystent AI", pill: "AI" },
      { href: "/panel/skaner", label: "Skaner nakazu" },
      { href: "/panel/kalendarz", label: "Kalendarz" },
      { href: "/panel/notatki", label: "Notatki" },
    ],
  },
  {
    id: "finanse",
    label: "Finanse",
    items: [
      { href: "/panel/moje-zadluzenie", label: "Moje zadłużenie" },
      { href: "/panel/plan-splaty", label: "Plan spłaty" },
      { href: "/panel/finanse", label: "Subskrypcja" },
      { href: "/panel/eksport", label: "Eksport danych" },
    ],
  },
  {
    id: "kontekst",
    label: "Kontekst",
    items: [
      { href: "/panel/baza-orzecznicza", label: "Baza orzecznicza" },
      { href: "/panel/firma", label: "Firma" },
      { href: "/panel/kancelaria", label: "Kancelaria" },
      { href: "/panel/partner", label: "Partner" },
      { href: "/panel/polecenia", label: "Polecenia" },
    ],
  },
  {
    id: "konto",
    label: "Konto",
    items: [
      { href: "/panel/profil", label: "Profil" },
      { href: "/panel/ustawienia", label: "Ustawienia" },
      { href: "/panel/wiadomosci", label: "Wiadomości", badge: "3" },
      { href: "/panel/wsparcie", label: "Wsparcie" },
      { href: "/panel/aktywnosc", label: "Aktywność" },
    ],
  },
];

export function V5PanelShell({
  children,
  activePath = "/panel",
  user = { name: "Jan Kowalski", org: "ORG-7821 · Pro" },
}: {
  children: React.ReactNode;
  activePath?: string;
  user?: { name: string; org: string };
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--v5-infra-25))]">
      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* ─── Sidebar ─── */}
        <aside className="hidden lg:flex flex-col border-r border-[hsl(var(--v5-infra-200))] bg-white">
          {/* Brand */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--v5-infra-200))]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-ink-900))] text-white">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V4L8 1z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-[0.875rem] font-semibold text-[hsl(var(--v5-ink-900))]">
                Mandatomat
              </div>
              <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">
                v5-infra · panel
              </div>
            </div>
          </div>

          {/* Org switcher */}
          <button className="mx-3 mt-3 flex items-center justify-between rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] px-3 py-2.5 hover:border-[hsl(var(--v5-violet-500))] transition-colors">
            <div className="text-left">
              <div className="text-[0.8125rem] font-semibold text-[hsl(var(--v5-ink-900))] truncate">
                {user.name}
              </div>
              <div className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))] truncate">
                {user.org}
              </div>
            </div>
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-[hsl(var(--v5-ink-500))]" fill="none">
              <path d="M3 4l3 3 3-3M3 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Search shortcut */}
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-infra-50))] px-3 py-2 text-[0.8125rem] text-[hsl(var(--v5-ink-500))]">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="flex-1">Szukaj…</span>
            <kbd className="rounded border border-[hsl(var(--v5-infra-200))] bg-white px-1.5 py-0.5 font-mono text-[0.625rem] text-[hsl(var(--v5-ink-500))]">
              ⌘K
            </kbd>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {PANEL_NAV.map((g) => (
              <div key={g.id} className="mb-6 last:mb-0">
                <div className="px-3 mb-2 text-[0.6875rem] font-semibold uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-400))]">
                  {g.label}
                </div>
                <ul className="space-y-px">
                  {g.items.map((item) => {
                    const isActive = activePath === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-[var(--v5-radius-sm)] px-3 py-1.5 text-[0.875rem] transition-colors",
                            isActive
                              ? "bg-[hsl(var(--v5-violet-100))] text-[hsl(var(--v5-violet-700))] font-semibold"
                              : "text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))]",
                          )}
                        >
                          <span className="truncate">{item.label}</span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {item.pill === "AI" && (
                              <span className="rounded-[var(--v5-radius-sm)] bg-[hsl(var(--v5-violet-500))] px-1.5 py-0.5 font-mono text-[0.5625rem] font-bold text-white">
                                AI
                              </span>
                            )}
                            {item.pill === "NEW" && (
                              <span className="rounded-[var(--v5-radius-sm)] bg-[hsl(var(--v5-ok))] px-1.5 py-0.5 font-mono text-[0.5625rem] font-bold text-white">
                                NEW
                              </span>
                            )}
                            {item.badge && (
                              <span className="font-mono text-[0.6875rem] text-[hsl(var(--v5-ink-500))]">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Status footer */}
          <div className="border-t border-[hsl(var(--v5-infra-200))] px-4 py-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">
              <V5LivePulse tone="ok" size={6} />
              wszystkie systemy
            </span>
            <span className="text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-400))]">
              eu-1
            </span>
          </div>
        </aside>

        {/* ─── Main ─── */}
        <main className="flex flex-col min-h-screen">{children}</main>
      </div>
    </div>
  );
}

/* ============================================================================
 * Panel TopBar — context bar above content
 * ============================================================================ */
export function V5PanelTopBar({
  title,
  breadcrumbs,
  actions,
}: {
  title: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-[var(--v5-z-sticky)] border-b border-[hsl(var(--v5-infra-200))] bg-white/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-6 px-8 py-5">
        <div>
          {breadcrumbs && (
            <div className="mb-1 flex items-center gap-1.5 text-[0.6875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span aria-hidden>/</span>}
                  <span>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="text-[1.5rem] font-semibold tracking-tight text-[hsl(var(--v5-ink-900))]">
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
