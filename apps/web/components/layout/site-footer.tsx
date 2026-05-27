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
      { href: "/moduly", label: "Wszystkie moduły" },
      { href: "/jak-to-dziala", label: "Jak to działa" },
      { href: "/cennik", label: "Cennik" },
      { href: "/skaner-nakazu", label: "Skaner nakazu" },
      { href: "/kalkulatory", label: "Kalkulatory KPC" },
    ],
  },
  {
    title: "Moduły",
    items: [
      { href: "/moduly/skaner-nakazu", label: "D1 Skaner Nakazu" },
      { href: "/moduly/sprzeciw-epu", label: "D2 Sprzeciw EPU" },
      { href: "/moduly/komornik", label: "D3 Skarga komornicza" },
      { href: "/moduly/potracenia", label: "D4 Ochrona wynagrodzenia" },
      { href: "/moduly/bik", label: "D5 Korekta BIK" },
      { href: "/moduly/cesja", label: "D6 Weryfikacja cesji" },
      { href: "/moduly/ugoda", label: "D7 Propozycja ugody" },
      { href: "/moduly/upadlosc", label: "D8 Upadłość konsumencka" },
    ],
  },
  {
    title: "Wiedza",
    items: [
      { href: "/baza-wiedzy", label: "Baza wiedzy" },
      { href: "/baza-wiedzy/sprzeciw-od-nakazu-zaplaty-epu", label: "Sprzeciw EPU" },
      { href: "/baza-wiedzy/skarga-na-czynnosci-komornika", label: "Skarga komornicza" },
      { href: "/baza-wiedzy/wniosek-o-korekte-bik", label: "Korekta BIK" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Firma",
    items: [
      { href: "/o-nas", label: "O nas" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/status", label: "Status systemu" },
      { href: "/program-partnerski", label: "Program partnerski" },
      { href: "/sign-in", label: "Zaloguj się" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { href: "/regulamin", label: "Regulamin" },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/rodo", label: "RODO i Twoje prawa" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
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
        {/* TOP: Brand + 5 nav columns */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(5,1fr)] lg:gap-8">
          {/* Brand column */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <Logo />
            <Text size="sm" tone="default" className="max-w-xs">
              Tarcza dla osób zadłużonych. AI legal-tech budowany w Polsce,
              zgodny z KPC i RODO.
            </Text>
            <div className="flex flex-col gap-2 text-[13px] text-ink-500">
              <a
                href="mailto:pomoc@dlugomat.pl"
                className="hover:text-ink-900 transition-colors"
              >
                pomoc@dlugomat.pl
              </a>
              <a
                href="mailto:iod@dlugomat.pl"
                className="hover:text-ink-900 transition-colors"
              >
                iod@dlugomat.pl
              </a>
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
                      className="text-[14px] text-ink-700 transition-colors hover:text-ink-900 focus-visible:shadow-shield-focus focus-visible:outline-none rounded-sm"
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
