import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    price: "0 zł",
    desc: "Sprawdź czy Twój nakaz lub list komorniczy zawiera podstawy do zaskarżenia.",
    features: [
      "Skan nakazu z OCR",
      "Wstępna ocena przedawnienia",
      "3 darmowe skany dziennie",
      "Bez rejestracji",
    ],
    cta: { href: "/skaner-nakazu", label: "Zeskanuj teraz" },
  },
  {
    name: "Pismo",
    price: "od 119 zł",
    priceSuffix: "/ pismo",
    desc: "Pełne pismo procesowe gotowe do wysyłki — sprzeciw, skarga, wniosek, ugoda.",
    features: [
      "Wszystkie 32 typy pism",
      "Walidacja AI (Haiku 4.5)",
      "PDF z miejscem na podpis",
      "Kalkulator terminów",
      "Przypomnienia e-mail i SMS",
    ],
    cta: { href: "/cennik", label: "Zobacz cennik" },
    highlight: true,
  },
  {
    name: "Pakiet",
    price: "199 zł",
    priceSuffix: "/ pakiet",
    desc: "Komplet pism dla jednej sytuacji — np. 4 pisma komornicze albo zestaw przeciw potrąceniom.",
    features: [
      "Pakiet KomornikShield (4 pisma)",
      "Pakiet PotrąceniaStop",
      "Wsparcie dla całej sprawy",
      "Faktura VAT lub bez VAT",
    ],
    cta: { href: "/cennik", label: "Wybierz pakiet" },
  },
];

export function PricingTeaser() {
  return (
    <section aria-labelledby="pricing-title" className="container py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Cennik
        </p>
        <h2
          id="pricing-title"
          className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white"
        >
          Płacisz raz, za konkretne pismo.
        </h2>
        <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
          Bez subskrypcji. Bez ukrytych kosztów. Faktura w 24 godziny.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((t) => (
          <Card
            key={t.name}
            elevation={t.highlight ? "pop" : "subtle"}
            className={
              t.highlight
                ? "border-dlugomat-500/40 ring-1 ring-dlugomat-500/30"
                : undefined
            }
          >
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between">
                <CardTitle>{t.name}</CardTitle>
                {t.highlight ? <Badge tone="info">Najczęściej wybierane</Badge> : null}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-fluid-3xl font-bold text-dlugomat-900 dark:text-white">
                  {t.price}
                </span>
                {t.priceSuffix ? (
                  <span className="text-fluid-sm text-iron-500">{t.priceSuffix}</span>
                ) : null}
              </div>
              <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-fluid-sm text-iron-700 dark:text-iron-200">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={t.highlight ? "primary" : "secondary"} block>
                <Link href={t.cta.href}>{t.cta.label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
