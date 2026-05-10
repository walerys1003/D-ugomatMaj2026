"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/jak-to-dziala", label: "Jak to działa" },
  { href: "/moduly", label: "Moduły" },
  { href: "/cennik", label: "Cennik" },
  { href: "/baza-wiedzy", label: "Baza wiedzy" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Subtle elevation appears once the user has scrolled — keeps the
  // hero feeling weightless on first paint.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-base ease-shield-out",
        scrolled
          ? "border-iron-200/80 bg-background/85 backdrop-blur-md shadow-subtle dark:border-dlugomat-800/80 dark:bg-dlugomat-950/75"
          : "border-transparent bg-background/0"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="rounded-md focus-visible:shadow-shield-focus">
          <Logo />
        </Link>

        <nav aria-label="Główna" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-fluid-sm font-medium",
                "text-iron-700 dark:text-iron-200",
                "transition-colors duration-base hover:text-dlugomat-700 dark:hover:text-white",
                "focus-visible:shadow-shield-focus focus-visible:outline-none"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/sign-in">Zaloguj</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/sign-up">Rozpocznij</Link>
          </Button>
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

      {mobileOpen ? (
        <div
          id="site-mobile-menu"
          className="border-t border-iron-200 bg-background dark:border-dlugomat-800 md:hidden"
        >
          <nav aria-label="Mobilne" className="container flex flex-col gap-1 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-fluid-base font-medium text-iron-800 hover:bg-iron-100 dark:text-iron-100 dark:hover:bg-dlugomat-850"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-iron-200 pt-3 dark:border-dlugomat-800">
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
