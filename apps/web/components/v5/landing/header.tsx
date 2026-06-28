"use client";

/**
 * V5 Site Header — Agent 02
 * --------------------------------------------------------------------------
 * Floating, blurred, ambient, premium, infrastructural, cinematic.
 * Inspired by Modal, Linear, OpenAI.
 */
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { V5LivePulse } from "@/components/v5/motion";

const PRODUCT_ITEMS = [
  { href: "/skaner-nakazu", label: "Skaner Nakazu", kbd: "01" },
  { href: "/moduly/sprzeciw-epu", label: "Sprzeciw od EPU", kbd: "02" },
  { href: "/moduly/komornik", label: "Skarga na komornika", kbd: "03" },
  { href: "/moduly/cesja", label: "Cesja wierzytelności", kbd: "04" },
  { href: "/moduly/bik", label: "BIK / KRD / Erif", kbd: "05" },
  { href: "/moduly/ugoda", label: "Ugoda z wierzycielem", kbd: "06" },
  { href: "/moduly/potracenia", label: "Potrącenia i odsetki", kbd: "07" },
  { href: "/moduly/upadlosc", label: "Upadłość konsumencka", kbd: "08" },
];

const RESOURCE_ITEMS = [
  { href: "/baza-wiedzy", label: "Baza wiedzy" },
  { href: "/jak-to-dziala", label: "Jak to działa" },
  { href: "/precedensy", label: "Precedensy" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/kalkulatory", label: "Kalkulatory" },
  { href: "/bezpieczenstwo", label: "Bezpieczeństwo" },
];

export function V5Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState<null | "product" | "resources">(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--v5-z-sticky)] transition-all duration-[var(--v5-dur-base)]",
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-[hsl(var(--v5-infra-200))]"
          : "bg-transparent",
      )}
      onMouseLeave={() => setOpen(null)}
    >
      {/* Status strip */}
      <div className="border-b border-[hsl(var(--v5-infra-200))]/40 bg-[hsl(var(--v5-infra-25))]/60 backdrop-blur-sm">
        <div className="v5-container-wide flex items-center justify-between gap-4 py-1.5 text-[0.6875rem] font-mono text-[hsl(var(--v5-ink-500))]">
          <span className="flex items-center gap-2">
            <V5LivePulse tone="ok" size={5} />
            wszystkie systemy operacyjne
          </span>
          <span className="hidden sm:flex items-center gap-4">
            <span>v5.0.1</span>
            <span>·</span>
            <span>eu-warsaw-1</span>
            <span>·</span>
            <span>p95: 412ms</span>
          </span>
        </div>
      </div>

      <div className="v5-container-wide flex h-16 lg:h-20 items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-ink-900))] text-white group-hover:bg-[hsl(var(--v5-violet-500))] transition-colors">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V4L8 1z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="text-[0.9375rem] font-semibold text-[hsl(var(--v5-ink-900))] leading-tight">
              Mandatomat
            </div>
            <div className="text-[0.625rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-violet-500))] leading-tight">
              Procedural OS
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0">
          <button
            onMouseEnter={() => setOpen("product")}
            className={cn(
              "flex items-center gap-1 rounded-[var(--v5-radius-sm)] px-2.5 py-2 text-[0.875rem] xl:text-[0.9375rem] text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))] transition-colors whitespace-nowrap",
              open === "product" && "bg-[hsl(var(--v5-infra-50))]",
            )}
          >
            Produkt
            <svg viewBox="0 0 12 12" className="h-3 w-3 opacity-50" fill="none">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          <button
            onMouseEnter={() => setOpen("resources")}
            className={cn(
              "flex items-center gap-1 rounded-[var(--v5-radius-sm)] px-2.5 py-2 text-[0.875rem] xl:text-[0.9375rem] text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))] transition-colors whitespace-nowrap",
              open === "resources" && "bg-[hsl(var(--v5-infra-50))]",
            )}
          >
            Zasoby
            <svg viewBox="0 0 12 12" className="h-3 w-3 opacity-50" fill="none">
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          {[
            { href: "/cennik", label: "Cennik" },
            { href: "/dla-firm", label: "Dla firm" },
            { href: "/moduly", label: "Moduły" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onMouseEnter={() => setOpen(null)}
              className="rounded-[var(--v5-radius-sm)] px-2.5 py-2 text-[0.875rem] xl:text-[0.9375rem] text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))] transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2 lg:gap-3">
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex items-center rounded-[var(--v5-radius-sm)] px-3 py-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))] transition-colors"
          >
            Zaloguj
          </Link>
          <Link
            href="/skaner-nakazu"
            className="v5-focus-ring inline-flex h-10 items-center gap-2 rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] px-4 lg:px-5 text-[0.9375rem] font-medium text-white shadow-[var(--v5-shadow-1)] hover:bg-[hsl(var(--v5-violet-600))] transition-colors"
          >
            <span className="hidden sm:inline">Skanuj nakaz</span>
            <span className="sm:hidden">Skaner</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Megamenu — Product */}
      {open === "product" && (
        <div className="absolute inset-x-0 top-full border-t border-[hsl(var(--v5-infra-200))] bg-white/95 backdrop-blur-md shadow-[var(--v5-shadow-3)]">
          <div className="v5-container-wide py-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] font-semibold text-[hsl(var(--v5-violet-500))]">
                8 procedural modules
              </span>
              <Link href="/moduly" className="text-[0.8125rem] font-mono text-[hsl(var(--v5-ink-500))] hover:text-[hsl(var(--v5-violet-500))]">
                wszystkie moduły →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PRODUCT_ITEMS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group rounded-[var(--v5-radius-md)] border border-[hsl(var(--v5-infra-200))] bg-white p-4 hover:border-[hsl(var(--v5-violet-500))] hover:shadow-[var(--v5-shadow-2)] transition-all"
                >
                  <div className="font-mono text-[0.625rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] group-hover:text-[hsl(var(--v5-violet-500))] mb-2">
                    MODULE/{p.kbd}
                  </div>
                  <div className="text-[0.9375rem] font-medium text-[hsl(var(--v5-ink-900))]">{p.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Megamenu — Resources */}
      {open === "resources" && (
        <div className="absolute inset-x-0 top-full border-t border-[hsl(var(--v5-infra-200))] bg-white/95 backdrop-blur-md shadow-[var(--v5-shadow-3)]">
          <div className="v5-container-wide py-8">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {RESOURCE_ITEMS.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="rounded-[var(--v5-radius-sm)] px-4 py-3 text-[0.9375rem] text-[hsl(var(--v5-ink-700))] hover:bg-[hsl(var(--v5-infra-50))] hover:text-[hsl(var(--v5-violet-500))] transition-colors"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * V5 Footer — Enterprise infrastructure terminal
 * ─────────────────────────────────────────────────────────────────── */
export function V5Footer() {
  return (
    <footer className="border-t border-[hsl(var(--v5-infra-200))] bg-[hsl(var(--v5-system-800))] text-white">
      <div className="v5-container-wide py-16">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* Brand + status */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--v5-radius-md)] bg-[hsl(var(--v5-violet-500))] text-white">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                  <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V4L8 1z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <div className="text-[1rem] font-semibold">Mandatomat</div>
                <div className="text-[0.625rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-white/40">
                  Procedural Intelligence OS
                </div>
              </div>
            </div>
            <p className="text-[0.875rem] text-white/60 max-w-sm leading-relaxed mb-6">
              Procedural reasoning engine, audit-native AI i infrastructure-grade
              automation. Polski legal-tech, ale w skali enterprise.
            </p>
            {/* Status terminal */}
            <div className="rounded-[var(--v5-radius-md)] border border-white/10 bg-black/30 p-3 font-mono text-[0.75rem]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40">SYSTEM STATUS</span>
                <span className="flex items-center gap-1.5 text-[hsl(var(--v5-ok))]">
                  <V5LivePulse tone="ok" size={5} />
                  operational
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-white/60">
                <span>api:</span><span className="text-[hsl(var(--v5-ok))]">99.97%</span>
                <span>ai:</span><span className="text-[hsl(var(--v5-ok))]">99.92%</span>
                <span>p95:</span><span className="text-white">412ms</span>
                <span>build:</span><span className="text-white">v5.0.1</span>
              </div>
            </div>
          </div>

          <FooterColumn
            title="Produkt"
            links={[
              { label: "Skaner nakazu", href: "/skaner-nakazu" },
              { label: "Moduły", href: "/moduly" },
              { label: "Cennik", href: "/cennik" },
              { label: "Dla firm", href: "/dla-firm" },
              { label: "API & SDK", href: "/docs/openapi" },
            ]}
          />
          <FooterColumn
            title="Zasoby"
            links={[
              { label: "Baza wiedzy", href: "/baza-wiedzy" },
              { label: "Jak to działa", href: "/jak-to-dziala" },
              { label: "Precedensy", href: "/precedensy" },
              { label: "Case studies", href: "/case-studies" },
              { label: "Kalkulatory", href: "/kalkulatory" },
            ]}
          />
          <FooterColumn
            title="Compliance"
            links={[
              { label: "Bezpieczeństwo", href: "/bezpieczenstwo" },
              { label: "RODO + DPIA", href: "/rodo" },
              { label: "SOC 2 status", href: "/soc2" },
              { label: "Audit chain", href: "/audyt" },
              { label: "Status systemu", href: "/status" },
            ]}
          />
          <FooterColumn
            title="Firma"
            links={[
              { label: "O nas", href: "/o-nas" },
              { label: "Kariera", href: "/kariera" },
              { label: "Partnerzy", href: "/partnerzy" },
              { label: "Kontakt", href: "/kontakt" },
              { label: "Blog", href: "/blog" },
            ]}
          />
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="font-mono text-[0.75rem] text-white/40">
            © 2026 Mandatomat sp. z o.o. · KRS 0000000000 · NIP 0000000000
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-[0.75rem] text-white/60">
            <Link href="/regulamin" className="hover:text-white">Regulamin</Link>
            <Link href="/polityka-prywatnosci" className="hover:text-white">Polityka prywatności</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
            <Link href="/legal" className="hover:text-white">Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-[0.6875rem] font-semibold uppercase tracking-[var(--v5-tracking-uppercase)] text-white/40 mb-4">
        {title}
      </div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[0.875rem] text-white/70 hover:text-white transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
