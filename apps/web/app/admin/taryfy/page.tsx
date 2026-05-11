import * as React from "react";
import Link from "next/link";
import { Receipt, Plus, Edit3, Copy, TrendingUp, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Taryfy i plany - Dlugomat Admin",
  description: "Zarzadzanie planami cenowymi, limitami uzycia i polityka rozliczeniowa.",
};

type Plan = {
  id: string;
  name: string;
  type: "free" | "premium" | "business" | "enterprise";
  monthlyPrice: number;
  yearlyPrice: number;
  activeSubscribers: number;
  growthMTD: number;
  mrr: number;
  features: string[];
  limits: { label: string; value: string }[];
  status: "active" | "deprecated" | "draft";
};

const PLANS: Plan[] = [
  {
    id: "p-001",
    name: "Free",
    type: "free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    activeSubscribers: 12450,
    growthMTD: 340,
    mrr: 0,
    features: ["1 sprawa aktywna", "Bazowy panel", "Wsparcie email"],
    limits: [
      { label: "Sprawy", value: "1" },
      { label: "Pisma AI / m-c", value: "3" },
      { label: "Storage", value: "100 MB" },
    ],
    status: "active",
  },
  {
    id: "p-002",
    name: "Premium",
    type: "premium",
    monthlyPrice: 49,
    yearlyPrice: 470,
    activeSubscribers: 3420,
    growthMTD: 167,
    mrr: 167580,
    features: ["Do 5 spraw", "Pelny generator AI", "Wsparcie 24/7", "Eksport danych"],
    limits: [
      { label: "Sprawy", value: "5" },
      { label: "Pisma AI / m-c", value: "50" },
      { label: "Storage", value: "5 GB" },
    ],
    status: "active",
  },
  {
    id: "p-003",
    name: "Business",
    type: "business",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    activeSubscribers: 287,
    growthMTD: 23,
    mrr: 57113,
    features: ["Do 50 spraw", "API dostep", "Branding", "Dedykowany doradca"],
    limits: [
      { label: "Sprawy", value: "50" },
      { label: "Pisma AI / m-c", value: "500" },
      { label: "Storage", value: "50 GB" },
    ],
    status: "active",
  },
  {
    id: "p-004",
    name: "Enterprise",
    type: "enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    activeSubscribers: 24,
    growthMTD: 2,
    mrr: 487000,
    features: ["Bez limitu", "SLA 99.95%", "mTLS, VPC", "Customer Success Manager"],
    limits: [
      { label: "Sprawy", value: "bez limitu" },
      { label: "Pisma AI / m-c", value: "bez limitu" },
      { label: "Storage", value: "negocjowane" },
    ],
    status: "active",
  },
  {
    id: "p-005",
    name: "Starter (legacy)",
    type: "premium",
    monthlyPrice: 29,
    yearlyPrice: 290,
    activeSubscribers: 145,
    growthMTD: -23,
    mrr: 4205,
    features: ["Stary plan - migracja do Premium"],
    limits: [
      { label: "Sprawy", value: "3" },
      { label: "Pisma AI / m-c", value: "20" },
      { label: "Storage", value: "1 GB" },
    ],
    status: "deprecated",
  },
];

const TYPE_LABEL = {
  free: "Free",
  premium: "Premium",
  business: "Business",
  enterprise: "Enterprise",
};

const TYPE_TONE = {
  free: "neutral" as const,
  premium: "info" as const,
  business: "warning" as const,
  enterprise: "success" as const,
};

const STATUS_TONE = {
  active: "success" as const,
  deprecated: "warning" as const,
  draft: "neutral" as const,
};

const STATUS_LABEL = {
  active: "Aktywny",
  deprecated: "Wycofywany",
  draft: "Szkic",
};

export default function TaryfyPage() {
  const numFmt = new Intl.NumberFormat("pl-PL");
  const currencyFmt = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

  const totalMRR = PLANS.reduce((acc, p) => acc + p.mrr, 0);
  const totalSubscribers = PLANS.reduce((acc, p) => acc + p.activeSubscribers, 0);
  const paidSubscribers = PLANS.filter((p) => p.type !== "free").reduce((acc, p) => acc + p.activeSubscribers, 0);

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="h-6 w-6 text-accent-600" aria-hidden />
              <h1 className="font-display text-3xl text-dlugomat-950">Taryfy i plany</h1>
            </div>
            <p className="text-dlugomat-700 max-w-2xl">
              Zarzadzanie strukrura cenowa, limitami i pakietami funkcji. Zmiany wymagaja akceptacji CFO.
            </p>
          </div>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nowy plan
          </Button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">MRR lacznie</div>
              <div className="font-display text-3xl text-emerald-700">{currencyFmt.format(totalMRR)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Aktywni subskrybenci</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(totalSubscribers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Platni subskrybenci</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(paidSubscribers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Konwersja free-paid</div>
              <div className="font-display text-3xl text-dlugomat-950">
                {((paidSubscribers / totalSubscribers) * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <Card key={plan.id} elevation="subtle">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge tone={TYPE_TONE[plan.type]}>{TYPE_LABEL[plan.type]}</Badge>
                      <Badge tone={STATUS_TONE[plan.status]} withDot>
                        {STATUS_LABEL[plan.status]}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Edytuj plan"
                      className="p-1.5 rounded text-dlugomat-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Duplikuj plan"
                      className="p-1.5 rounded text-dlugomat-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl text-dlugomat-950">
                    {plan.type === "enterprise" ? "Negocjowane" : currencyFmt.format(plan.monthlyPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-dlugomat-600">/ m-c netto</span>}
                </div>
                {plan.yearlyPrice > 0 && (
                  <div className="text-xs text-dlugomat-600">
                    Rocznie: {currencyFmt.format(plan.yearlyPrice)} (oszczednosc {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%)
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-iron-100">
                  {plan.limits.map((l) => (
                    <div key={l.label}>
                      <div className="text-xs uppercase tracking-wide text-dlugomat-600">{l.label}</div>
                      <div className="text-sm font-medium text-dlugomat-950 mt-0.5">{l.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" aria-hidden />
                    Funkcje
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-dlugomat-800">- {f}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-iron-100">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dlugomat-600 flex items-center gap-1">
                      <Users className="h-3 w-3" aria-hidden />
                      Subskr.
                    </div>
                    <div className="font-medium text-dlugomat-950">{numFmt.format(plan.activeSubscribers)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dlugomat-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" aria-hidden />
                      Trend MTD
                    </div>
                    <div
                      className={`font-medium ${
                        plan.growthMTD > 0 ? "text-emerald-700" : plan.growthMTD < 0 ? "text-rose-700" : "text-dlugomat-700"
                      }`}
                    >
                      {plan.growthMTD > 0 ? "+" : ""}
                      {plan.growthMTD}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dlugomat-600">MRR</div>
                    <div className="font-medium text-dlugomat-950">{currencyFmt.format(plan.mrr)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
