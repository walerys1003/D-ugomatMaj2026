"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ChevronDown,
  Scan,
  ShieldCheck,
  Hammer,
  ArrowRightLeft,
  FileText,
  HandCoins,
  Building2,
  Wallet,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * SiteHeader v4 — Tarcza "Stoic" / Operating System chrome.
 *
 * Zmiany vs v3 (audit V4 §3.3):
 *  - Mega-menu "Produkt" z 8 modułami (zamiast 1 płaskiego "Moduły")
 *  - "Skaner Nakazu" wyniesiony jako standalone link (najsilniejszy use-case)
 *  - Dropdown desktop: Radix-free, kontrolowany state, focus-visible OK,
 *    Escape zamyka, klik poza zamyka
 *  - Usunięty dekoracyjny Cmd+K (nie miał backendu, audit V4 §3.3)
 *  - Naprawione URL-e auth: /sign-in /sign-up (były /auth/sign-in)
 *  - Tighter: text-[13px] nav (Linear), chevron 12px, gap-1 między linkami
 *
 * Bez zmian z v3:
 *  - h-header (56px) sticky + backdrop-blur zawsze
 *  - Container max-w-[1200px]
 *  - border-ink-200 dolny
 *  - Mobile drawer z grupowaniem
 */

type IconType = React.ComponentType<{ className?: string }>;

interface ProductItem {
  href: string;
  label: string;
  description: string;
  icon: IconType;
}

const PRODUCT_ITEMS: ProductItem[] = [
  {
    href: "/skaner-nakazu",
    label: "Skaner Nakazu",
    description: "OCR + AI rozkłada nakaz na czynniki pierwsze",
    icon: Scan,
  },
  {
    href: "/moduly/sprzeciw-epu",
    label: "Sprzeciw od EPU",
    description: "14 dni — pełen tekst pisma w 12 minut",
    icon: ShieldCheck,
  },
  {
    href: "/moduly/komornik",
    label: "Skarga na komornika",
    description: "Egzekucja i kwota wolna pod kontrolą",
    icon: Hammer,
  },
  {
    href: "/moduly/cesja",
    label: "Cesja wierzytelności",
    description: "Identyfikacja funduszu i legitymacja",
    icon: ArrowRightLeft,
  },
  {
    href: "/moduly/bik",
    label: "BIK / KRD / Erif",
    description: "Korekta wpisów i czyszczenie historii",
    icon: FileText,
  },
  {
    href: "/moduly/ugoda",
    label: "Ugoda z wierzycielem",
    description: "Negocjacja z konkretnymi liczbami",
    icon: HandCoins,
  },
  {
    href: "/moduly/potracenia",
    label: "Potrącenia i odsetki",
    description: "Skarga, korekta, zwrot nadpłat",
    icon: Wallet,
  },
  {
    href: "/moduly/upadlosc",
    label: "Upadłość konsumencka",
    description: "Pełen wniosek z załącznikami",
    icon: Building2,
  },
];

interface ResourceItem {
  href: string;
  label: string;
  description: string;
}

const RESOURCE_ITEMS: ResourceItem[] = [
  { href: "/baza-wiedzy", label: "Baza wiedzy", description: "20+ przewodników po pismach procesowych" },
  { href: "/jak-to-dziala", label: "Jak to działa", description: "Cztery kroki — bez prawnika" },
  { href: "/precedensy", label: "Precedensy", description: "Wyroki SN i SO które mają wpływ" },
  { href: "/case-studies", label: "Case studies", description: "Konkretne sprawy, konkretne wygrane" },
  { href: "/kalkulatory", label: "Kalkulatory", description: "Odsetki, przedawnienie, koszty" },
  { href: "/bezpieczenstwo", label: "Bezpieczeństwo", description: "RODO, audyt, infrastruktura" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<null | "product" | "resources">(null);
  const headerRef = React.useRef<HTMLElement | null>(null);

  // Scroll → subtle shadow
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click outside + Escape closes dropdown
  React.useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [openDropdown]);

  // Mobile lock
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 w-full",
        "border-b border-ink-200 dark:border-dlugomat-800/80",
        "bg-background/85 backdrop-blur-xl backdrop-saturate-150",
        "transition-shadow duration-150 ease-out",
        scrolled && "shadow-[0_1px_0_0_hsl(220_15%_92%)]"
      )}
    >
      <div className="mx-auto flex h-header w-full max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-7">
          <Link
            href="/"
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            aria-label="Długomat — strona główna"
          >
            <Logo />
          </Link>

          <nav aria-label="Główna" className="hidden items-center gap-1 lg:flex">
            {/* Mega-menu trigger: Produkt */}
            <DropdownTrigger
              label="Produkt"
              isOpen={openDropdown === "product"}
              onToggle={() => setOpenDropdown((v) => (v === "product" ? null : "product"))}
            />

            <NavLink href="/skaner-nakazu">Skaner</NavLink>
            <NavLink href="/cennik">Cennik</NavLink>

            {/* Mega-menu trigger: Zasoby */}
            <DropdownTrigger
              label="Zasoby"
              isOpen={openDropdown === "resources"}
              onToggle={() => setOpenDropdown((v) => (v === "resources" ? null : "resources"))}
            />

            <NavLink href="/dla-firm">Dla firm</NavLink>
          </nav>
        </div>

        {/* Right: Auth + CTA */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle className="hidden sm:inline-flex" />

          <Link
            href="/sign-in"
            className="hidden h-8 items-center rounded-sm px-2.5 text-[13px] font-medium text-ink-600 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 sm:inline-flex"
          >
            Zaloguj
          </Link>
          <Link
            href="/sign-up"
            className="group hidden h-8 items-center gap-1.5 rounded-sm bg-ink-900 px-3 text-[13px] font-medium text-white shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12)] transition-colors duration-100 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 sm:inline-flex"
          >
            Zacznij za darmo
            <ArrowRight className="size-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden />
          </Link>

          {/* Mobile burger */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Desktop mega-menu: Produkt */}
      {openDropdown === "product" ? (
        <div className="absolute left-0 right-0 top-full hidden border-b border-ink-200 bg-background/95 backdrop-blur-xl shadow-[0_8px_24px_-12px_hsl(220_40%_8%/0.12)] dark:border-dlugomat-800 dark:bg-dlugomat-950/95 lg:block">
          <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">Osiem narzędzi</p>
                <p className="mt-0.5 text-sm font-medium text-ink-900 dark:text-white">Jedna tarcza — od skanu do gotowego pisma</p>
              </div>
              <Link
                href="/moduly"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-700 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                onClick={() => setOpenDropdown(null)}
              >
                Wszystkie moduły
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-1 lg:grid-cols-4">
              {PRODUCT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenDropdown(null)}
                    className="group flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-ink-50 dark:hover:bg-dlugomat-900"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sm border border-ink-200 bg-white text-ink-700 transition-colors group-hover:border-ink-300 group-hover:bg-ink-900 group-hover:text-white dark:border-dlugomat-700 dark:bg-dlugomat-900 dark:text-ink-300">
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-500 dark:text-ink-600">{item.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-md border border-ink-200 bg-ink-50 px-4 py-3 dark:border-dlugomat-800 dark:bg-dlugomat-900">
              <Sparkles className="size-3.5 shrink-0 text-ink-700 dark:text-ink-300" aria-hidden />
              <p className="text-[13px] text-ink-700 dark:text-ink-300">
                Nie wiesz od czego zacząć? <Link href="/skaner-nakazu" className="font-medium text-ink-900 underline-offset-2 hover:underline dark:text-white" onClick={() => setOpenDropdown(null)}>Wrzuć skan nakazu</Link> — AI dobierze właściwy moduł.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop mega-menu: Zasoby */}
      {openDropdown === "resources" ? (
        <div className="absolute left-0 right-0 top-full hidden border-b border-ink-200 bg-background/95 backdrop-blur-xl shadow-[0_8px_24px_-12px_hsl(220_40%_8%/0.12)] dark:border-dlugomat-800 dark:bg-dlugomat-950/95 lg:block">
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-1 lg:grid-cols-3">
              {RESOURCE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenDropdown(null)}
                  className="group rounded-md p-3 transition-colors hover:bg-ink-50 dark:hover:bg-dlugomat-900"
                >
                  <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-500 dark:text-ink-600">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          id="site-mobile-menu"
          className="fixed inset-x-0 top-[56px] z-50 max-h-[calc(100dvh-56px)] overflow-y-auto border-t border-ink-200 bg-background dark:border-dlugomat-800 dark:bg-dlugomat-950 lg:hidden"
        >
          <nav aria-label="Mobilne" className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-5 sm:px-6">
            {/* Produkt */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">Produkt</p>
              <div className="flex flex-col gap-px">
                {PRODUCT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-sm px-3 py-2.5 hover:bg-ink-50 dark:hover:bg-dlugomat-900"
                    >
                      <Icon className="size-4 shrink-0 text-ink-500" aria-hidden />
                      <span className="text-[15px] font-medium text-ink-900 dark:text-white">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Zasoby */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">Zasoby</p>
              <div className="flex flex-col gap-px">
                {RESOURCE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-sm px-3 py-2.5 text-[15px] font-medium text-ink-900 hover:bg-ink-50 dark:text-white dark:hover:bg-dlugomat-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pozostałe */}
            <div className="flex flex-col gap-px">
              <Link href="/cennik" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2.5 text-[15px] font-medium text-ink-900 hover:bg-ink-50 dark:text-white">
                Cennik
              </Link>
              <Link href="/dla-firm" onClick={() => setMobileOpen(false)} className="rounded-sm px-3 py-2.5 text-[15px] font-medium text-ink-900 hover:bg-ink-50 dark:text-white">
                Dla firm
              </Link>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 border-t border-ink-200 pt-4 dark:border-dlugomat-800">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 flex-1 items-center justify-center rounded-sm border border-ink-200 px-3 text-[14px] font-medium text-ink-900 hover:bg-ink-50 dark:border-dlugomat-700 dark:text-white"
              >
                Zaloguj
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-sm bg-ink-900 px-3 text-[14px] font-medium text-white shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12)] hover:bg-ink-800"
              >
                Zacznij za darmo
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

/* ─── helpers ────────────────────────────────────────────────────── */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm px-2.5 py-1.5 text-[13px] font-medium text-ink-600 transition-colors duration-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 dark:text-ink-700 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

function DropdownTrigger({
  label,
  isOpen,
  onToggle,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-sm px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2",
        isOpen
          ? "text-ink-900 dark:text-white"
          : "text-ink-600 hover:text-ink-900 dark:text-ink-700 dark:hover:text-white"
      )}
    >
      {label}
      <ChevronDown
        className={cn("size-3 transition-transform duration-150 ease-out", isOpen && "rotate-180")}
        aria-hidden
      />
    </button>
  );
}
