import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Porownanie planow — Dlugomat",
  description:
    "Pelna macierz funkcji we wszystkich planach Dlugomatu: Solo, Pro, Kancelaria, Enterprise. Bez ukrytych roznic.",
  alternates: { canonical: "/cennik/porownanie" },
};

type PlanKey = "solo" | "pro" | "kancelaria" | "enterprise";

interface Plan {
  key: PlanKey;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  cta: string;
  ctaHref: string;
  highlight: boolean;
}

const PLANS: readonly Plan[] = [
  {
    key: "solo",
    name: "Solo",
    tagline: "Dla osob fizycznych w sporze.",
    price: "0 zl",
    priceNote: "skaner + 1 pismo gratis",
    cta: "Zaczynam za darmo",
    ctaHref: "/rejestracja?plan=solo",
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Dla aktywnych dluznikow i biur.",
    price: "79 zl",
    priceNote: "za pismo, bez abonamentu",
    cta: "Wybieram Pro",
    ctaHref: "/rejestracja?plan=pro",
    highlight: true,
  },
  {
    key: "kancelaria",
    name: "Kancelaria",
    tagline: "Dla zespolow prawniczych.",
    price: "od 1 290 zl",
    priceNote: "miesiecznie, 5 prawnikow",
    cta: "Umow demo",
    ctaHref: "/kontakt?temat=kancelaria",
    highlight: false,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "Dla bankow i windykacji.",
    price: "Wycena",
    priceNote: "SLA 99,95% + dedykowany CSM",
    cta: "Porozmawiajmy",
    ctaHref: "/kontakt?temat=enterprise",
    highlight: false,
  },
];

type Cell = boolean | string;

interface FeatureRow {
  group: string;
  features: ReadonlyArray<{
    name: string;
    note?: string;
    cells: Record<PlanKey, Cell>;
  }>;
}

const MATRIX: readonly FeatureRow[] = [
  {
    group: "Analiza i diagnoza",
    features: [
      {
        name: "Skaner nakazu zaplaty",
        cells: { solo: true, pro: true, kancelaria: true, enterprise: true },
      },
      {
        name: "OCR dokumentow",
        note: "Stron miesiecznie",
        cells: { solo: "10", pro: "200", kancelaria: "2 000", enterprise: "bez limitu" },
      },
      {
        name: "Detekcja przedawnienia",
        cells: { solo: true, pro: true, kancelaria: true, enterprise: true },
      },
      {
        name: "Liczenie terminow procesowych",
        cells: { solo: true, pro: true, kancelaria: true, enterprise: true },
      },
    ],
  },
  {
    group: "Pisma i automatyzacja",
    features: [
      {
        name: "Generator pism",
        cells: { solo: "1 / m-c", pro: "bez limitu", kancelaria: "bez limitu", enterprise: "bez limitu" },
      },
      {
        name: "Pakiety tematyczne",
        cells: { solo: false, pro: true, kancelaria: true, enterprise: true },
      },
      {
        name: "Wysylka rejestrowana (e-Doreczenia)",
        cells: { solo: false, pro: true, kancelaria: true, enterprise: true },
      },
      {
        name: "Automaty workflow",
        cells: { solo: false, pro: "5", kancelaria: "50", enterprise: "bez limitu" },
      },
    ],
  },
  {
    group: "Zespol i RBAC",
    features: [
      {
        name: "Uzytkownicy",
        cells: { solo: "1", pro: "3", kancelaria: "5+", enterprise: "bez limitu" },
      },
      {
        name: "Role i uprawnienia",
        cells: { solo: false, pro: "podstawowe", kancelaria: "RBAC pelne", enterprise: "RBAC + SSO" },
      },
      {
        name: "SSO (Okta, Azure AD)",
        cells: { solo: false, pro: false, kancelaria: true, enterprise: true },
      },
      {
        name: "Audit log",
        cells: { solo: false, pro: "30 dni", kancelaria: "365 dni", enterprise: "7 lat" },
      },
    ],
  },
  {
    group: "Integracje",
    features: [
      {
        name: "API publiczne",
        cells: { solo: false, pro: true, kancelaria: true, enterprise: true },
      },
      {
        name: "Salesforce / HubSpot",
        cells: { solo: false, pro: false, kancelaria: true, enterprise: true },
      },
      {
        name: "Webhooks",
        cells: { solo: false, pro: "5", kancelaria: "50", enterprise: "bez limitu" },
      },
    ],
  },
  {
    group: "Wsparcie i SLA",
    features: [
      {
        name: "Email support",
        cells: { solo: "48 h", pro: "24 h", kancelaria: "4 h", enterprise: "1 h" },
      },
      {
        name: "Dedykowany CSM",
        cells: { solo: false, pro: false, kancelaria: false, enterprise: true },
      },
      {
        name: "SLA dostepnosci",
        cells: { solo: "99,5%", pro: "99,9%", kancelaria: "99,9%", enterprise: "99,95%" },
      },
    ],
  },
];

function renderCell(value: Cell): React.ReactNode {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Tak" />;
  }
  if (value === false) {
    return <Minus className="mx-auto h-5 w-5 text-slate-300" aria-label="Nie" />;
  }
  return <span className="text-sm text-slate-700">{value}</span>;
}

export default function PricingComparisonPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            Porownanie planow
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Cztery plany. Jedna macierz. Zero gwiazdek.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Wszystko, co dostajesz w kazdym planie, na jednej stronie. Bez ukrytych roznic,
            bez "skontaktuj sie z handlowcem" przy podstawowych funkcjach.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.key}
              elevation={plan.highlight ? "pop" : "subtle"}
              urgency={plan.highlight ? "success" : "none"}
              className="flex flex-col"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.highlight && (
                    <Badge tone="success" withDot>
                      Polecany
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <p className="font-display text-3xl text-slate-900">{plan.price}</p>
                  <p className="mt-1 text-xs text-slate-500">{plan.priceNote}</p>
                </div>
                <Button asChild variant={plan.highlight ? "primary" : "secondary"} block>
                  <Link href={plan.ctaHref}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Funkcja</th>
                {PLANS.map((plan) => (
                  <th key={plan.key} className="px-4 py-3 text-center font-medium text-slate-700">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((group) => (
                <React.Fragment key={group.group}>
                  <tr className="bg-slate-100">
                    <td colSpan={5} className="px-4 py-2 font-display text-sm text-slate-700">
                      {group.group}
                    </td>
                  </tr>
                  {group.features.map((feat) => (
                    <tr key={feat.name} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-900">{feat.name}</span>
                        {feat.note && (
                          <span className="ml-2 text-xs text-slate-500">({feat.note})</span>
                        )}
                      </td>
                      {PLANS.map((plan) => (
                        <td key={plan.key} className="px-4 py-3 text-center align-middle">
                          {renderCell(feat.cells[plan.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Potrzebujesz czegos, czego nie ma na liscie?{" "}
          <Link href="/kontakt" className="text-slate-900 underline underline-offset-4">
            Napisz do nas
          </Link>{" "}
          — wycenimy w 24 h.
        </p>
      </section>
    </div>
  );
}
