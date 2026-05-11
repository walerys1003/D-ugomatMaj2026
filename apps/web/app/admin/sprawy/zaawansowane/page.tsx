import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Filter, Save, Search } from "lucide-react";

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
  title: "Sprawy — zaawansowane filtry",
  robots: { index: false, follow: false },
};

interface CaseRow {
  id: string;
  user: string;
  type: string;
  status: "new" | "in_progress" | "waiting" | "closed_won" | "closed_lost";
  amount_pln: number;
  lawyer: string;
  created_at: string;
  sla_hours_left: number;
}

const ROWS: CaseRow[] = [
  { id: "case_004", user: "anna.kowalska@example.pl", type: "Korekta BIK", status: "in_progress", amount_pln: 12400, lawyer: "A. Sieradzka", created_at: "2026-05-04", sla_hours_left: 18 },
  { id: "case_007", user: "marek.lis@example.pl", type: "Egzekucja komornicza", status: "waiting", amount_pln: 36800, lawyer: "P. Nowak", created_at: "2026-04-28", sla_hours_left: 4 },
  { id: "case_011", user: "ewa.szczęsna@example.pl", type: "Sprzeciw od nakazu", status: "new", amount_pln: 22400, lawyer: "—", created_at: "2026-05-10", sla_hours_left: 47 },
  { id: "case_009", user: "tomasz.bak@example.pl", type: "Reklamacja bankowa", status: "in_progress", amount_pln: 4800, lawyer: "A. Sieradzka", created_at: "2026-05-02", sla_hours_left: 32 },
  { id: "case_013", user: "kasia.nowak@example.pl", type: "Upadłość konsumencka", status: "in_progress", amount_pln: 0, lawyer: "M. Olszewski", created_at: "2026-04-22", sla_hours_left: 124 },
  { id: "case_002", user: "piotr.wieczorek@example.pl", type: "Pismo do Rzecznika", status: "closed_won", amount_pln: 8200, lawyer: "P. Nowak", created_at: "2026-04-08", sla_hours_left: 0 },
];

const STATUS_TONE: Record<CaseRow["status"], "info" | "warning" | "danger" | "success" | "neutral"> = {
  new: "info",
  in_progress: "warning",
  waiting: "danger",
  closed_won: "success",
  closed_lost: "neutral",
};

const STATUS_LABEL: Record<CaseRow["status"], string> = {
  new: "nowa",
  in_progress: "w trakcie",
  waiting: "czeka",
  closed_won: "wygrana",
  closed_lost: "przegrana",
};

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(n);
}

interface PageProps {
  searchParams?: Promise<Record<string, string | undefined>>;
}

export default async function SprawyZaawansowanePage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const totalAmount = ROWS.reduce((s, r) => s + r.amount_pln, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/sprawy"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Admin · sprawy · zaawansowane filtry
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Wyszukiwarka spraw
          </h1>
          <p className="max-w-2xl text-iron-600">
            Kombinacja filtrów: typ sprawy, status, prawnik, SLA, zakres kwoty
            i dat. Zapisz preset, aby szybko wracać do tego widoku.
          </p>
        </div>
        <Button variant="secondary">
          <Save className="mr-2 h-4 w-4" aria-hidden />
          Zapisz preset
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <Filter className="mr-2 inline h-4 w-4" aria-hidden />
            Filtry
          </CardTitle>
          <CardDescription>Wszystkie filtry łączone operatorem AND</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 lg:grid-cols-6">
            <label className="block lg:col-span-2">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Szukaj (ID, e-mail, opis)</span>
              <input type="search" name="q" defaultValue={sp.q ?? ""} className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" placeholder="np. case_004 lub @example.pl" />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Typ sprawy</span>
              <select name="type" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus">
                <option value="">Wszystkie</option>
                <option>Korekta BIK</option>
                <option>Egzekucja komornicza</option>
                <option>Sprzeciw od nakazu</option>
                <option>Reklamacja bankowa</option>
                <option>Upadłość konsumencka</option>
                <option>Pismo do Rzecznika</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Status</span>
              <select name="status" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus">
                <option value="">Każdy</option>
                <option value="new">Nowa</option>
                <option value="in_progress">W trakcie</option>
                <option value="waiting">Czeka</option>
                <option value="closed_won">Wygrana</option>
                <option value="closed_lost">Przegrana</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Prawnik</span>
              <select name="lawyer" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus">
                <option value="">Każdy</option>
                <option>A. Sieradzka</option>
                <option>P. Nowak</option>
                <option>M. Olszewski</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">SLA</span>
              <select name="sla" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus">
                <option value="">Każde</option>
                <option value="breached">Naruszone</option>
                <option value="at_risk">Zagrożone (&lt; 24h)</option>
                <option value="ok">OK</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Kwota od (PLN)</span>
              <input type="number" name="amount_from" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" min={0} step={100} />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Kwota do (PLN)</span>
              <input type="number" name="amount_to" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" min={0} step={100} />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Od daty</span>
              <input type="date" name="from" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Do daty</span>
              <input type="date" name="to" className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" />
            </label>
            <div className="lg:col-span-6 flex justify-end gap-2">
              <Button variant="ghost" type="reset">Wyczyść</Button>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" aria-hidden />
                Szukaj
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-4" aria-label="Podsumowanie">
        <Card>
          <CardHeader>
            <CardDescription>Wyniki</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">{ROWS.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Suma kwot</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{fmtPLN(totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency="warning">
          <CardHeader>
            <CardDescription>Zagrożone SLA</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-warn">{ROWS.filter((r) => r.sla_hours_left > 0 && r.sla_hours_left < 24).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Wygrane</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-accent-700">{ROWS.filter((r) => r.status === "closed_won").length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Wyniki ({ROWS.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-iron-200 text-sm">
              <thead className="bg-iron-50 text-xs uppercase tracking-wide text-iron-600">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Użytkownik</th>
                  <th className="px-4 py-2 text-left">Typ</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Kwota</th>
                  <th className="px-4 py-2 text-left">Prawnik</th>
                  <th className="px-4 py-2 text-left">SLA</th>
                  <th className="px-4 py-2 text-left">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 bg-white">
                {ROWS.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2">
                      <Link href={`/admin/sprawy/${r.id}`} className="font-mono text-xs text-dlugomat-700 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded">
                        {r.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-iron-700">{r.user}</td>
                    <td className="px-4 py-2 text-dlugomat-900">{r.type}</td>
                    <td className="px-4 py-2">
                      <Badge tone={STATUS_TONE[r.status]} withDot>{STATUS_LABEL[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-dlugomat-900">{fmtPLN(r.amount_pln)}</td>
                    <td className="px-4 py-2 text-iron-700">{r.lawyer}</td>
                    <td className="px-4 py-2">
                      {r.sla_hours_left === 0 ? (
                        <Badge tone="neutral">—</Badge>
                      ) : r.sla_hours_left < 24 ? (
                        <Badge tone="danger" withDot>{r.sla_hours_left}h</Badge>
                      ) : (
                        <Badge tone="success">{r.sla_hours_left}h</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-iron-500">{r.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
