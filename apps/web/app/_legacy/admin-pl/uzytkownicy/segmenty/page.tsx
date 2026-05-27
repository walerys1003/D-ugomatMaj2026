import * as React from "react";
import Link from "next/link";
import { Users, Plus, Filter, TrendingUp, Edit3, Copy, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Segmenty uzytkownikow - Dlugomat Admin",
  description: "Definiowanie i zarzadzanie segmentami uzytkownikow do targetowania kampanii.",
};

type Segment = {
  id: string;
  name: string;
  description: string;
  rule: string;
  size: number;
  growth7d: number;
  campaigns: number;
  owner: string;
  updatedAt: string;
  isDynamic: boolean;
};

const SEGMENTS: Segment[] = [
  {
    id: "seg-001",
    name: "Aktywni dluznicy z planem splaty",
    description: "Uzytkownicy z aktywna sprawa i planem splaty platnym w ostatnich 30 dniach",
    rule: "status = active AND plan_status = active AND last_payment < 30d",
    size: 8420,
    growth7d: 124,
    campaigns: 6,
    owner: "Zespol Produktu",
    updatedAt: "2026-05-10",
    isDynamic: true,
  },
  {
    id: "seg-002",
    name: "Zalegli z platnoscia 7+ dni",
    description: "Uzytkownicy z opoznieniem w splacie raty powyzej 7 dni",
    rule: "overdue_days > 7 AND overdue_days < 30",
    size: 234,
    growth7d: 18,
    campaigns: 3,
    owner: "Zespol Windykacji",
    updatedAt: "2026-05-09",
    isDynamic: true,
  },
  {
    id: "seg-003",
    name: "Beta testerzy",
    description: "Uzytkownicy zapisani do programu beta nowych funkcji",
    rule: "beta_program = true",
    size: 1240,
    growth7d: 45,
    campaigns: 12,
    owner: "Zespol Produktu",
    updatedAt: "2026-05-08",
    isDynamic: false,
  },
  {
    id: "seg-004",
    name: "Premium aktywni",
    description: "Uzytkownicy z aktywna subskrypcja Premium ostatnie 90 dni",
    rule: "plan = premium AND subscription_active = true",
    size: 567,
    growth7d: 23,
    campaigns: 8,
    owner: "Zespol Sprzedazy",
    updatedAt: "2026-05-07",
    isDynamic: true,
  },
  {
    id: "seg-005",
    name: "Onboarding nieukonczony",
    description: "Uzytkownicy ktorzy nie ukonczyli onboardingu w ciagu 14 dni od rejestracji",
    rule: "onboarding_complete = false AND days_since_signup > 14",
    size: 892,
    growth7d: -34,
    campaigns: 4,
    owner: "Zespol Produktu",
    updatedAt: "2026-05-05",
    isDynamic: true,
  },
  {
    id: "seg-006",
    name: "Wysokie ryzyko bankowe",
    description: "Uzytkownicy z BIK score ponizej 350 i 2+ aktywnymi sprawami",
    rule: "bik_score < 350 AND active_cases >= 2",
    size: 156,
    growth7d: 8,
    campaigns: 2,
    owner: "Zespol Risk",
    updatedAt: "2026-05-03",
    isDynamic: true,
  },
  {
    id: "seg-007",
    name: "Dluznik osoba prywatna - Warszawa",
    description: "Osoby prywatne z aktywna sprawa z wojewodztwa mazowieckiego",
    rule: "type = individual AND region = mazowieckie",
    size: 3450,
    growth7d: 67,
    campaigns: 5,
    owner: "Zespol Marketingu",
    updatedAt: "2026-05-02",
    isDynamic: true,
  },
  {
    id: "seg-008",
    name: "Klienci enterprise - banki",
    description: "Konta bankowe enterprise z umowa zawarta przed 2025",
    rule: "account_type = enterprise AND industry = banking",
    size: 8,
    growth7d: 0,
    campaigns: 0,
    owner: "Customer Success",
    updatedAt: "2026-04-28",
    isDynamic: false,
  },
];

export default function SegmentyUzytkownikowPage() {
  const numFmt = new Intl.NumberFormat("pl-PL");
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  const totalUsers = SEGMENTS.reduce((acc, s) => acc + s.size, 0);
  const dynamicCount = SEGMENTS.filter((s) => s.isDynamic).length;

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-accent-600" aria-hidden />
              <h1 className="font-display text-3xl text-dlugomat-950">Segmenty uzytkownikow</h1>
            </div>
            <p className="text-dlugomat-700 max-w-2xl">
              Definiuj grupy uzytkownikow na podstawie atrybutow i zachowan. Segmenty sluza do targetowania kampanii,
              testow A/B i analiz.
            </p>
          </div>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nowy segment
          </Button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wszystkie segmenty</div>
              <div className="font-display text-3xl text-dlugomat-950">{SEGMENTS.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Dynamiczne</div>
              <div className="font-display text-3xl text-emerald-700">{dynamicCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Statyczne</div>
              <div className="font-display text-3xl text-dlugomat-950">{SEGMENTS.length - dynamicCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Uzytkownikow lacznie</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(totalUsers)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="search"
                placeholder="Szukaj po nazwie segmentu..."
                className="flex-1 px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Szukaj segmentu"
              />
              <select
                className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Filtr wlasciciela"
              >
                <option>Wszyscy wlasciciele</option>
                <option>Zespol Produktu</option>
                <option>Zespol Windykacji</option>
                <option>Zespol Sprzedazy</option>
                <option>Customer Success</option>
              </select>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-900 text-sm font-medium hover:bg-dlugomat-50 focus-visible:shadow-shield-focus focus-visible:outline-none"
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filtry zaawansowane
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-dlugomat-600 border-b border-iron-200">
                    <th className="py-3 pr-3">Nazwa segmentu</th>
                    <th className="py-3 pr-3">Regula</th>
                    <th className="py-3 pr-3">Rozmiar</th>
                    <th className="py-3 pr-3">Trend 7d</th>
                    <th className="py-3 pr-3">Kampanie</th>
                    <th className="py-3 pr-3">Wlasciciel</th>
                    <th className="py-3 pr-3">Edycja</th>
                    <th className="py-3">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {SEGMENTS.map((seg) => (
                    <tr key={seg.id} className="border-b border-iron-100 last:border-0 hover:bg-dlugomat-50">
                      <td className="py-3 pr-3">
                        <Link
                          href={`/admin/uzytkownicy/segmenty/${seg.id}`}
                          className="block focus-visible:shadow-shield-focus rounded"
                        >
                          <div className="font-medium text-dlugomat-950 flex items-center gap-2">
                            {seg.name}
                            {seg.isDynamic && <Badge tone="info">Dynamiczny</Badge>}
                          </div>
                          <div className="text-xs text-dlugomat-600 mt-0.5 max-w-md truncate">{seg.description}</div>
                        </Link>
                      </td>
                      <td className="py-3 pr-3">
                        <code className="font-mono text-xs bg-iron-100 px-1.5 py-0.5 rounded text-dlugomat-800">
                          {seg.rule.length > 32 ? `${seg.rule.slice(0, 32)}...` : seg.rule}
                        </code>
                      </td>
                      <td className="py-3 pr-3 font-medium text-dlugomat-950">{numFmt.format(seg.size)}</td>
                      <td className="py-3 pr-3">
                        {seg.growth7d > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-sm">
                            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                            +{seg.growth7d}
                          </span>
                        ) : seg.growth7d < 0 ? (
                          <span className="text-rose-700 text-sm">{seg.growth7d}</span>
                        ) : (
                          <span className="text-dlugomat-500 text-sm">0</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-dlugomat-800">{seg.campaigns}</td>
                      <td className="py-3 pr-3 text-dlugomat-700 text-xs">{seg.owner}</td>
                      <td className="py-3 pr-3 text-dlugomat-700 text-xs">{dateFmt.format(new Date(seg.updatedAt))}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Edytuj segment"
                            className="p-1.5 rounded text-dlugomat-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            aria-label="Duplikuj segment"
                            className="p-1.5 rounded text-dlugomat-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                          >
                            <Copy className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            aria-label="Usun segment"
                            className="p-1.5 rounded text-danger hover:bg-rose-50 focus-visible:shadow-shield-focus focus-visible:outline-none"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
