import Link from "next/link";
import { ShieldCheck, Lock, Server, FileCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Eyebrow, Text } from "@/components/ui/typography";

/**
 * Tarcza v4-θ SiteFooter — rebuild w stylu Linear/Stripe/Anthropic.
 *
 * Reguły:
 *  - 5 kolumn navigation (zamiast 3 grupy + brand): explicit hierarchy
 *  - Brand kolumna z logo + tagline + compliance chips (visible trust)
 *  - Compliance strip: 4 hard facts (AES-256, RODO, UE, audit)
 *  - Signature row: copyright + disclaimer + version stamp
 *  - Typography z primitives v4 (Eyebrow, Text)
 *  - Surface ink-50 (jasna stopka, top-tier SaaS pattern), nie navy
 */

const NAV_GROUPS = [
  {
    title: "Produkt",
    items: [
      { href: "/funkcje-ai", label: "Funkcje AI" },
      { href: "/jak-to-dziala", label: "Jak działa" },
      { href: "/cennik", label: "Cennik" },
      { href: "/api-kancelarie", label: "API dla kancelarii" },
      { href: "/baza-wiedzy", label: "Baza wiedzy" },
      { href: "/moduly", label: "Wszystkie moduły" },
    ],
  },
  {
    title: "Firma",
    items: [
      { href: "/o-lexmate24", label: "O LexMate24" },
      { href: "/misja", label: "Misja" },
      { href: "/o-dlugomacie", label: "O Długomacie" },
      { href: "/blog", label: "Blog" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/status", label: "Status systemu" },
    ],
  },
  {
    title: "Zgodność",
    items: [
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/regulamin", label: "Regulamin" },
      { href: "/rodo", label: "RODO" },
      { href: "/iso-27001", label: "ISO 27001" },
      { href: "/cookies", label: "Cookies" },
      { href: "/dpa", label: "DPA" },
    ],
  },
];

/** Ekosystem LexMate24 — siostrzane produkty (pill links). */
const ECOSYSTEM = [
  { href: "https://mandatomat.pl", label: "Mandatomat" },
  { href: "https://rozwodomat.pl", label: "Rozwodomat" },
  { href: "https://alimentomat.pl", label: "Alimentomat" },
];

const COMPLIANCE_FACTS = [
  {
    icon: Lock,
    label: "AES-256",
    hint: "End-to-end encryption",
  },
  {
    icon: ShieldCheck,
    label: "RODO compliant",
    hint: "Art. 6 ust. 1 lit. b",
  },
  {
    icon: Server,
    label: "EU-only data",
    hint: "Supabase eu-central-1",
  },
  {
    icon: FileCheck,
    label: "SOC 2 in progress",
    hint: "Audit Type II 2026",
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-150 bg-ink-50">
      <div className="container py-16 sm:py-20">
        {/* TOP: Brand + 3 nav columns */}
        <div className="grid gap-12 lg:grid-cols-[2fr_repeat(3,1fr)] lg:gap-8">
          {/* Brand column */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <Logo />
            <Text size="sm" tone="default" className="max-w-xs">
              Tarcza dla osób zadłużonych. AI legal-tech budowany w Polsce,
              zgodny z KPC i RODO. Część ekosystemu LexMate24.
            </Text>
            <div className="flex flex-col gap-2 text-[13px] text-ink-500">
              <a
                href="mailto:pomoc@dlugomat.pl"
                className="hover:text-dlugomat-700 transition-colors"
              >
                pomoc@dlugomat.pl
              </a>
              <a
                href="mailto:iod@dlugomat.pl"
                className="hover:text-dlugomat-700 transition-colors"
              >
                iod@dlugomat.pl
              </a>
            </div>

            {/* Ekosystem LexMate24 — pill links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-500">
                Ekosystem
              </span>
              {ECOSYSTEM.map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-ink-100 px-2.5 py-1 text-[13px] font-medium text-ink-800 transition-colors hover:bg-dlugomat-50 hover:text-dlugomat-700"
                >
                  {p.label}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <Eyebrow tone="neutral" tracking="wide">
                {group.title}
              </Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-ink-700 transition-colors hover:text-dlugomat-700 focus-visible:shadow-shield-focus focus-visible:outline-none rounded-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* MIDDLE: Compliance facts strip */}
        <div className="mt-16 border-t border-ink-200 pt-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMPLIANCE_FACTS.map(({ icon: Icon, label, hint }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-ink-700 ring-1 ring-ink-200">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-ink-900">
                    {label}
                  </span>
                  <span className="text-[13px] text-ink-500">{hint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Signature row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-200 pt-8 text-[13px] text-ink-500 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-1">
            <span>© {year} Długomat. Wszelkie prawa zastrzeżone.</span>
            <span className="text-ink-400">
              Długomat nie jest kancelarią prawną. Generowane pisma podlegają
              weryfikacji przez użytkownika przed wysyłką.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="font-mono text-ink-400">v4.0 · build {year}</span>
            <span className="size-1 rounded-full bg-ink-300" aria-hidden />
            <Link
              href="/status"
              className="flex items-center gap-1.5 text-ink-700 transition-colors hover:text-ink-900"
            >
              <span className="size-1.5 rounded-full bg-accent-500" aria-hidden />
              All systems normal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
