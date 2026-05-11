import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Tier {
  name: string;
  price: string;
  priceSuffix?: string;
  desc: string;
  features: string[];
  cta: { href: string; label: string };
  highlight?: boolean;
}

const TIERS: readonly Tier[] = [
  {
    name: "Skaner",
    price: "0 PLN",
    desc: "Sprawdz czy Twoj nakaz lub list komorniczy zawiera podstawy do zaskarzenia.",
    features: ["Skan nakazu z OCR", "Wstepna ocena przedawnienia", "3 darmowe skany dziennie", "Bez rejestracji"],
    cta: { href: "/skaner-nakazu", label: "Zeskanuj teraz" },
  },
  {
    name: "Pismo",
    price: "od 119 PLN",
    priceSuffix: "/ pismo",
    desc: "Pelne pismo procesowe gotowe do wysylki - sprzeciw, skarga, wniosek, ugoda.",
    features: [
      "Wszystkie 32 typy pism",
      "Walidacja AI (Haiku 4.5)",
      "PDF z miejscem na podpis",
      "Kalkulator terminow",
      "Przypomnienia e-mail i SMS",
    ],
    cta: { href: "/cennik", label: "Zobacz cennik" },
    highlight: true,
  },
  {
    name: "Pakiet",
    price: "199 PLN",
    priceSuffix: "/ pakiet",
    desc: "Komplet pism dla jednej sytuacji - np. 4 pisma komornicze albo zestaw przeciw potraceniom.",
    features: [
      "Pakiet KomornikShield (4 pisma)",
      "Pakiet PotraceniaStop",
      "Wsparcie dla calej sprawy",
      "Faktura VAT lub bez VAT",
    ],
    cta: { href: "/cennik", label: "Wybierz pakiet" },
  },
];

/**
 * PricingTeaser v2 - premium minimalist (Design System Tarcza)
 * Card elevation pop dla wyroznionego planu, tone info dla badge.
 */
export function PricingTeaser() {
  return (
    <section aria-labelledby="pricing-title" className="bg-white py-20">
      <div className="container px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Cennik</p>
          <h2 id="pricing-title" className="mt-2 font-display text-3xl text-dlugomat-900 sm:text-4xl">
            Placisz raz, za konkretne pismo
          </h2>
          <p className="mt-3 text-sm text-dlugomat-600">
            Bez subskrypcji. Bez ukrytych kosztow. Faktura w 24 godziny.
          </p>
        </header>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((t) => (
            <li key={t.name}>
              <Card
                elevation={t.highlight ? "pop" : "subtle"}
                urgency={t.highlight ? "warning" : "none"}
                className="flex h-full flex-col p-6"
              >
                <header className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-dlugomat-900">{t.name}</h3>
                  {t.highlight ? <Badge tone="info" withDot>Najpopularniejsze</Badge> : null}
                </header>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-3xl text-dlugomat-900">{t.price}</span>
                  {t.priceSuffix ? (
                    <span className="text-sm text-dlugomat-500">{t.priceSuffix}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-dlugomat-600">{t.desc}</p>

                <ul className="mt-5 flex flex-col gap-2 text-sm text-dlugomat-700">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={t.highlight ? "primary" : "secondary"}
                  size="md"
                  block
                  className="mt-auto pt-2"
                >
                  <Link href={t.cta.href}>{t.cta.label}</Link>
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
