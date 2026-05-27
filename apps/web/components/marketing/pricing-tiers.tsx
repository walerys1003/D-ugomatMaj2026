import Link from "next/link";
import { ArrowRight, Check, Sparkles, Scale, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Display,
  Eyebrow,
  Heading,
  Text,
} from "@/components/ui/typography";

/**
 * PricingTiers v4-γ — orientation-level 3-tier matrix.
 *
 * Pokazuje strategię cenową w 3 warstwach (nie 8 modułów):
 *   1. Sprawdź sytuację (free) — D1 skaner
 *   2. Złóż pismo (pay-per-piece) — D2-D7
 *   3. Pakiet sprawy (bundle) — D3+D4 / D5+D6
 *
 * Architektura: tier-matrix → szczegółowy grid 8 modułów (niżej).
 * Daje użytkownikowi "where do I start" zanim zobaczy 8 kart.
 *
 * Tiery oparte na faktycznym cenniku produktu — nie wymyślone na nowo,
 * tylko zgrupowane na poziomie strategii decyzyjnej.
 */

interface Tier {
  icon: typeof Sparkles;
  eyebrow: string;
  title: string;
  description: string;
  price: { value: string; suffix?: string; note?: string };
  features: readonly string[];
  cta: { href: string; label: string };
  highlight?: boolean;
}

const TIERS: readonly Tier[] = [
  {
    icon: Sparkles,
    eyebrow: "Krok 1",
    title: "Sprawdź sytuację",
    description:
      "Wczytaj pismo, sprawdź czy roszczenie jest przedawnione, otrzymaj plan działania. Bez konta, bez karty.",
    price: { value: "0 zł", note: "Skaner i analiza AI — darmowe" },
    features: [
      "OCR pisma (do 10 stron)",
      "Detekcja typu (EPU / komornik / BIK)",
      "Ocena przedawnienia (KC art. 118)",
      "Mapa rekomendowanych modułów",
    ],
    cta: { href: "/skaner-nakazu", label: "Zeskanuj pismo" },
  },
  {
    icon: Scale,
    eyebrow: "Krok 2",
    title: "Złóż pismo procesowe",
    description:
      "Pełne pismo sądowe gotowe do wysyłki — sprzeciw EPU, skarga komornicza, wniosek o ograniczenie potrąceń, korekta BIK, ugoda.",
    price: { value: "od 79 zł", suffix: "/ pismo", note: "Bez abonamentu" },
    features: [
      "Wszystkie 32 typy pism",
      "Walidacja AI (Haiku 4.5)",
      "PDF z miejscem na podpis",
      "Kalkulator terminów + przypomnienia",
      "Edytor pełnotekstowy przed pobraniem",
    ],
    cta: { href: "/moduly", label: "Zobacz moduły" },
    highlight: true,
  },
  {
    icon: Package,
    eyebrow: "Krok 3",
    title: "Pakiet pism — cała sprawa",
    description:
      "Komplet pism dla jednej sytuacji — np. 4 pisma komornicze albo zestaw przeciw potrąceniom z wynagrodzenia.",
    price: { value: "199 zł", suffix: "/ pakiet", note: "4 pisma w cenie 2,5" },
    features: [
      "KomornikShield (D3 — 4 pisma)",
      "PotrąceniaStop (D4 — 3 pisma)",
      "Wszystkie pisma z historią sprawy",
      "Wsparcie zespołu dla pakietu",
      "Faktura VAT lub bez VAT",
    ],
    cta: { href: "/moduly", label: "Wybierz pakiet" },
  },
];

export function PricingTiers() {
  return (
    <section className="container py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow tone="brand" tracking="wide" withDot>
            Jak to działa
          </Eyebrow>
        </div>
        <Display level={2} className="mt-4">
          Trzy kroki, dokładnie te które potrzebujesz.
        </Display>
        <Text size="lg" tone="default" className="mt-4">
          Nie kupujesz pakietu, którego nie potrzebujesz. Płacisz tylko za pisma,
          które wygenerujesz.
        </Text>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card
              key={tier.title}
              elevation={tier.highlight ? "pop" : "subtle"}
              className={
                "relative flex h-full flex-col p-6 " +
                (tier.highlight
                  ? "ring-2 ring-ink-900 ring-offset-0"
                  : "")
              }
            >
              {tier.highlight ? (
                <div className="absolute -top-3 left-6">
                  <Badge tone="info" withDot>
                    Najczęściej wybierane
                  </Badge>
                </div>
              ) : null}

              <div className="flex items-start gap-3">
                <span
                  className={
                    "flex size-10 shrink-0 items-center justify-center rounded-md " +
                    (tier.highlight
                      ? "bg-ink-900 text-white"
                      : "bg-ink-100 text-ink-700")
                  }
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-1">
                  <Eyebrow tone="neutral" tracking="wide">
                    {tier.eyebrow}
                  </Eyebrow>
                  <Heading level={3} as="h3">
                    {tier.title}
                  </Heading>
                </div>
              </div>

              <Text size="sm" tone="default" className="mt-4">
                {tier.description}
              </Text>

              <div className="mt-6 flex items-baseline gap-1.5 border-t border-ink-150 pt-5">
                <span
                  className={
                    "font-display text-4xl font-semibold tabular-nums tracking-tight " +
                    (tier.price.value === "0 zł"
                      ? "text-accent-600"
                      : "text-ink-900")
                  }
                >
                  {tier.price.value}
                </span>
                {tier.price.suffix ? (
                  <span className="text-[15px] font-medium text-ink-500">
                    {tier.price.suffix}
                  </span>
                ) : null}
              </div>
              {tier.price.note ? (
                <Text size="xs" tone="muted" className="mt-1">
                  {tier.price.note}
                </Text>
              ) : null}

              <ul className="mt-5 flex flex-col gap-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-accent-600"
                      aria-hidden
                    />
                    <span className="text-[14px] leading-snug text-ink-700">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.cta.href}
                className={
                  "group mt-auto pt-6 inline-flex items-center justify-center gap-2 rounded-md h-11 px-5 text-[14px] font-semibold transition-all " +
                  (tier.highlight
                    ? "bg-ink-900 text-white hover:bg-ink-800"
                    : "border border-ink-200 bg-background text-ink-900 hover:border-ink-300 hover:bg-ink-50")
                }
                style={{
                  // override the auto margin's effect on padding-top — link is its own row
                }}
              >
                {tier.cta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Card>
          );
        })}
      </div>

      <Text size="xs" tone="muted" className="mt-8 text-center">
        Pełny rozpis 8 modułów i ich indywidualnych cen — poniżej w grupie „Wszystkie moduły".
      </Text>
    </section>
  );
}
