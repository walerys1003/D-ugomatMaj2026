import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CaseStatus } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel firmy - dashboard wierzyciela | Dlugomat",
  description: "Dashboard wierzyciela z portfelem spraw i podsumowaniem naleznosci.",
};

const statusLabel: Record<CaseStatus, string> = {
  draft: "Szkice",
  analysis: "Analiza",
  generated: "Wygenerowane",
  paid: "Oplacone",
  downloaded: "Pobrane",
  completed: "Zakonczone",
  archived: "Zarchiwizowane",
};

const ACTIVE_STATUSES: CaseStatus[] = ["draft", "analysis", "generated", "paid", "downloaded"];

const currency = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FirmaDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/panel/firma");
  }

  const org = await getActiveOrgForUser(user.id);

  if (!org) {
    return (
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <header className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - wierzyciel
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Dashboard wierzyciela</h1>
        </header>
        <EmptyState
          title="Brak organizacji"
          description="Twoje konto nie jest przypisane do zadnej organizacji firmowej. Dashboard wierzyciela jest dostepny po dolaczeniu do organizacji."
        />
      </div>
    );
  }

  const { data: casesData } = await supabase
    .from("cases")
    .select("id, title, type, status, pozwany_nazwa, kwota_razem, updated_at")
    .eq("org_id", org.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  const cases = casesData ?? [];

  const totalBalance = cases.reduce((acc, c) => acc + (c.kwota_razem ?? 0), 0) / 100;
  const activeCount = cases.filter((c) => ACTIVE_STATUSES.includes(c.status)).length;
  const completedCount = cases.filter((c) => c.status === "completed").length;

  const byStatus = new Map<CaseStatus, number>();
  for (const c of cases) {
    byStatus.set(c.status, (byStatus.get(c.status) ?? 0) + 1);
  }
  const statusRows = (Object.keys(statusLabel) as CaseStatus[])
    .map((s) => ({ status: s, count: byStatus.get(s) ?? 0 }))
    .filter((r) => r.count > 0);

  const topDebtors = [...cases]
    .filter((c) => c.kwota_razem != null && c.kwota_razem > 0)
    .sort((a, b) => (b.kwota_razem ?? 0) - (a.kwota_razem ?? 0))
    .slice(0, 5);

  const recent = cases.slice(0, 6);

  const kpis = [
    { label: "Saldo portfela", value: currency.format(totalBalance) },
    { label: "Sprawy aktywne", value: String(activeCount) },
    { label: "Sprawy zakonczone", value: String(completedCount) },
    { label: "Sprawy lacznie", value: String(cases.length) },
  ];

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - wierzyciel
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Dashboard wierzyciela</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Obraz portfela naleznosci organizacji <strong>{org.name}</strong> - saldo, struktura statusow
            i najwieksze ekspozycje. Dane pochodza z rejestru spraw firmy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="md" asChild>
            <Link href="/panel/firma/portfel">Otworz portfel</Link>
          </Button>
        </div>
      </header>

      {cases.length === 0 ? (
        <EmptyState
          title="Brak spraw w organizacji"
          description="Ta organizacja nie ma jeszcze zadnych spraw. Utworz pierwsza sprawe w kreatorze, aby zobaczyc dane portfela."
        />
      ) : (
        <>
          <section
            aria-label="Wskazniki portfela"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {kpis.map((kpi) => (
              <Card key={kpi.label} elevation="subtle" className="p-5">
                <p className="text-xs uppercase tracking-wide text-dlugomat-500">{kpi.label}</p>
                <p className="mt-2 font-display text-2xl text-dlugomat-900">{kpi.value}</p>
              </Card>
            ))}
          </section>

          <section
            aria-label="Struktura portfela"
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <Card elevation="subtle" className="lg:col-span-2 p-6">
              <header className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-lg text-dlugomat-900">Struktura wedlug statusu</h2>
                  <p className="text-xs text-dlugomat-500">Podzial spraw portfela wedlug etapu.</p>
                </div>
                <Badge tone="neutral">{cases.length} spraw</Badge>
              </header>
              <ul className="space-y-3">
                {statusRows.map((row) => {
                  const share = Math.round((row.count / cases.length) * 100);
                  return (
                    <li key={row.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dlugomat-700">{statusLabel[row.status]}</span>
                        <span className="font-mono text-dlugomat-900">{row.count}</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={share}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 w-full overflow-hidden rounded-full bg-dlugomat-100"
                      >
                        <div
                          className="h-full rounded-full bg-accent-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
            <Card elevation="subtle" className="p-6">
              <h2 className="font-display text-lg text-dlugomat-900">Najwieksze ekspozycje</h2>
              <p className="mt-1 text-xs text-dlugomat-500">Top 5 spraw wedlug salda.</p>
              <ul className="mt-4 space-y-3 text-sm">
                {topDebtors.length === 0 ? (
                  <li className="text-dlugomat-500">Brak spraw z saldem.</li>
                ) : (
                  topDebtors.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3">
                      <span className="truncate text-dlugomat-700">{c.pozwany_nazwa ?? c.title}</span>
                      <span className="font-mono text-dlugomat-900">
                        {currency.format((c.kwota_razem ?? 0) / 100)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </section>

          <section aria-label="Aktywnosc operacyjna">
            <Card elevation="subtle" className="p-6">
              <h2 className="font-display text-lg text-dlugomat-900">Ostatnia aktywnosc</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {recent.map((c) => (
                  <li key={c.id} className="flex items-start gap-4">
                    <span className="font-mono text-xs text-dlugomat-500">{fmtDate(c.updated_at)}</span>
                    <span className="text-dlugomat-700">
                      {c.title || "Sprawa"} - {statusLabel[c.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
