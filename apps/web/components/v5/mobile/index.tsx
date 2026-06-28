"use client";

/**
 * V5 Mobile System — Agent 09: Mobile & Responsive
 * --------------------------------------------------------------------------
 * Native AI infrastructure app feel — NOT mini desktop.
 * Adaptive nav, touch orchestration, mobile procedural cards.
 */
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { V5LivePulse } from "@/components/v5/motion";

/* ─────────────────────────────────────────────────────────────────────
 * Bottom Tab Bar — Mobile primary nav (5 destinations max)
 * ─────────────────────────────────────────────────────────────────── */
type MobileTab = {
  href: string;
  label: string;
  icon: "home" | "shield" | "ai" | "doc" | "user";
  pulse?: boolean;
};

const MOBILE_TABS: MobileTab[] = [
  { href: "/panel", label: "Pulpit", icon: "home" },
  { href: "/panel/sprawy", label: "Sprawy", icon: "shield" },
  { href: "/panel/ai-asystent", label: "AI", icon: "ai", pulse: true },
  { href: "/panel/dokumenty", label: "Pisma", icon: "doc" },
  { href: "/panel/profil", label: "Konto", icon: "user" },
];

export function V5MobileTabBar({ active = "/panel" }: { active?: string }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[var(--v5-z-sticky)] lg:hidden border-t border-[hsl(var(--v5-infra-200))] bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {MOBILE_TABS.map((tab) => {
          const isActive = active === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[0.625rem] font-medium tracking-wide transition-colors relative",
                isActive
                  ? "text-[hsl(var(--v5-violet-500))]"
                  : "text-[hsl(var(--v5-ink-500))]",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute top-0 inset-x-6 h-0.5 rounded-b-full bg-[hsl(var(--v5-violet-500))]"
                />
              )}
              <TabIcon icon={tab.icon} active={isActive} />
              <span className="flex items-center gap-1">
                {tab.label}
                {tab.pulse && <V5LivePulse tone="ai" size={5} />}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  const stroke = active ? "hsl(var(--v5-violet-500))" : "hsl(var(--v5-ink-500))";
  const fill = active ? "hsl(var(--v5-violet-500)/0.12)" : "none";
  switch (icon) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fill}>
          <path d="M3 11L12 4l9 7v9a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fill}>
          <path d="M12 3L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-3z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "ai":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fill}>
          <path d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fill}>
          <path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14 3v5h5" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={fill}>
          <circle cx="12" cy="9" r="3.5" stroke={stroke} strokeWidth="1.6" />
          <path d="M5 21c0-4 3.5-7 7-7s7 3 7 7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────
 * Mobile Top Bar — Compact header
 * ─────────────────────────────────────────────────────────────────── */
export function V5MobileTopBar({
  title,
  showSearch = true,
  onSearch,
  onMenu,
}: {
  title: string;
  showSearch?: boolean;
  onSearch?: () => void;
  onMenu?: () => void;
}) {
  return (
    <header
      className="sticky top-0 z-[var(--v5-z-sticky)] lg:hidden border-b border-[hsl(var(--v5-infra-200))] bg-white/95 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={onMenu}
          aria-label="Menu"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--v5-radius-sm)] hover:bg-[hsl(var(--v5-infra-50))]"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-[hsl(var(--v5-ink-900))]" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="text-[0.9375rem] font-semibold tracking-tight text-[hsl(var(--v5-ink-900))] truncate">
          {title}
        </h1>
        {showSearch ? (
          <button
            onClick={onSearch}
            aria-label="Szukaj"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--v5-radius-sm)] hover:bg-[hsl(var(--v5-infra-50))]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[hsl(var(--v5-ink-900))]" fill="none">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Mobile Compact Card — touch-optimized procedural unit
 * ─────────────────────────────────────────────────────────────────── */
export function V5MobileCard({
  title,
  meta,
  status,
  statusTone = "ai",
  href,
}: {
  title: string;
  meta: string;
  status?: string;
  statusTone?: "ai" | "ok" | "warn" | "err";
  href?: string;
}) {
  const toneClass =
    statusTone === "ai"
      ? "text-[hsl(var(--v5-violet-700))] bg-[hsl(var(--v5-violet-100))]"
      : statusTone === "ok"
        ? "text-[hsl(var(--v5-ok))] bg-[hsl(var(--v5-ok)/0.1)]"
        : statusTone === "warn"
          ? "text-[hsl(var(--v5-warn))] bg-[hsl(var(--v5-warn)/0.1)]"
          : "text-[hsl(var(--v5-err))] bg-[hsl(var(--v5-err)/0.1)]";

  const Wrap: React.ElementType = href ? Link : "div";
  return (
    <Wrap
      {...(href ? { href } : {})}
      className="block rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[0.9375rem] font-semibold text-[hsl(var(--v5-ink-900))] truncate">
            {title}
          </div>
          <div className="text-[0.75rem] font-mono text-[hsl(var(--v5-ink-500))] mt-1">
            {meta}
          </div>
        </div>
        {status && (
          <span className={cn("rounded-[var(--v5-radius-pill)] px-2 py-0.5 text-[0.625rem] font-mono", toneClass)}>
            {status}
          </span>
        )}
      </div>
    </Wrap>
  );
}
