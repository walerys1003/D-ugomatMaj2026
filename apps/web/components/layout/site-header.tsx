"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * SiteHeader v3 — Tarcza "Stoic".
 *
 * Zmiany vs v2:
 *  - Wysokość 64 → 56 px (Linear/Vercel/Notion-grade dense chrome).
 *  - Zawsze backdrop-blur + 1px bottom border (separacja od hero nawet
 *    pre-scroll) zamiast transparent → blur on scroll (v2 niewidoczny pre).
 *  - Container width=lg (1200) zamiast bare .container.
 *  - Nav items: tighter font (text-sm), bez hover-bg (Linear: tylko text color).
 *  - Cmd+K hint w prawym slocie (sygnał "to jest aplikacja, nie strona").
 *  - Mobile drawer: cleaner, list-grouped.
 */

const NAV_ITEMS = [
  { href: "/jak-to-dziala", label: "Jak to działa" },
  { href: "/moduly", label: "Moduły" },
  { href: "/cennik", label: "Cennik" },
  { href: "/baza-wiedzy", label: "Baza wiedzy" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        // v3 — zawsze widoczny, zawsze blur. Border-bottom subtelny ale stały.
        "sticky top-0 z-40 w-full",
        "border-b border-ink-200 dark:border-dlugomat-800/80",
        "bg-background/80 backdrop-blur-xl backdrop-saturate-150",
        "transition-shadow duration-150 ease-out",
        scrolled ? "shadow-sm" : ""
      )}
    >
      <div className="mx-auto flex h-header w-full max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="rounded-sm focus-visible:shadow-shield-focus focus-visible:outline-none"
            aria-label="Długomat — strona główna"
          >
            <Logo />
          </Link>

          <nav aria-label="Główna" className="hidden items-center md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-sm px-2.5 py-1.5 text-sm font-medium",
                  "text-ink-600 hover:text-ink-900",
                  "dark:text-ink-700 dark:hover:text-white",
                  "transition-colors duration-100",
                  "focus-visible:shadow-shield-focus focus-visible:outline-none"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Cmd+K hint + ThemeToggle + Auth CTAs */}
        <div className="flex items-center gap-2">
          {/* Cmd+K hint — visual indicator że to jest aplikacja, nie strona */}
          <button
            type="button"
            className={cn(
              "hidden h-8 items-center gap-2 rounded border border-ink-200 bg-white px-2 text-xs text-ink-500",
              "transition-colors duration-100 hover:border-ink-300 hover:text-ink-700",
              "focus-visible:shadow-shield-focus focus-visible:outline-none",
              "dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-ink-700 dark:hover:border-dlugomat-700",
              "lg:inline-flex"
            )}
            aria-label="Wyszukaj (Cmd+K)"
          >
            <Command className="size-3.5" aria-hidden />
            <span>Wyszukaj</span>
            <Kbd className="ml-1.5">⌘K</Kbd>
          </button>

          <ThemeToggle className="hidden sm:inline-flex" />

          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/sign-in">Zaloguj</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/sign-up">Rozpocznij</Link>
          </Button>

          {/* Mobile burger */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          id="site-mobile-menu"
          className="border-t border-ink-200 bg-background dark:border-dlugomat-800 md:hidden"
        >
          <nav
            aria-label="Mobilne"
            className="mx-auto flex w-full max-w-[1200px] flex-col gap-0.5 px-4 py-3 sm:px-6"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded px-3 py-2.5 text-base font-medium text-ink-800 hover:bg-ink-100 dark:text-ink-800 dark:hover:bg-dlugomat-850"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t border-ink-200 pt-3 dark:border-dlugomat-800">
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>
                  Zaloguj
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)}>
                  Rozpocznij
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
