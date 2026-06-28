import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CaseStatus } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Raporty - panel firmy | Dlugomat",
  description: "Dashboard analityczny wierzyciela - struktura portfela i dynamika spraw.",
};

const RESOLVED: CaseStatus[] = ["paid", "downloaded", "completed"];

const currency = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

const MONTHS_PL = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Pazd", "Lis", "Gru"];

export default async function FirmaRaportyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/panel/firma/raporty");
  }

  const org = await getActiveOrgForUser(user.id);

  if (!org) {
    return (
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <header className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - analityka
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Raporty wierzyciela</h1>
        </header>
        <EmptyState
          title="Brak organizacji"
          description="Raporty wierzyciela sa dostepne dla organizacji firmowych. Dolacz do organizacji, aby zobaczyc analityke portfela."
        />
      </div>
    );
  }

  const { data: casesData } = await supabase
    .from("cases")
    .select("id, status, kwota_razem, created_at, updated_at")
    .eq("org_id", org.id)
    .is("deleted_at", null)
    .limit(2000);

  const cases = casesData ?? [];

  const resolved = cases.filter((c) => RESOLVED.includes(c.status));
  const recoveredTotal = resolved.reduce((acc, c) => acc + (c.kwota_razem ?? 0), 0) / 100;
  const openCases = cases.filter((c) => !RESOLVED.includes(c.status) && c.status !== "archived");
  const openTotal = openCases.reduce((acc, c) => acc + (c.kwota_razem ?? 0), 0) / 100;
  const resolutionRate = cases.length > 0 ? Math.round((resolved.length / cases.length) * 100) : 0;

  // Dynamika ostatnich 6 miesiecy: liczba rozwiazanych spraw wg updated_at.
  const now = new Date();
  const buckets: { key: string; label: string; recovered: number; count: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTHS_PL[d.getMonth()],
      recovered: 0,
      count: 0,
    });
  }
  const bucketIndex = new Map(buckets.map((b, i) => [b.key, i]));
  for (const c of resolved) {
    const d = new Date(c.updated_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const idx = bucketIndex.get(key);
    if (idx == null) continue;
    buckets[idx].recovered += (c.kwota_razem ?? 0) / 100;
    buckets[idx].count += 1;
  }
  const maxRecovered = Math.max(1, ...buckets.map((b) => b.recovered));

  const overview = [
    { label: "Odzyskano (sprawy rozwiazane)", value: currency.format(recoveredTotal) },
    { label: "Saldo otwarte", value: currency.format(openTotal) },
    { label: "Sprawy rozwiazane", value: String(resolved.length) },
    { label: "Wskaznik rozwiazania", value: `${resolutionRate}%` },
  ];

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - analityka
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Raporty wierzyciela</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Analityka portfela organizacji <strong>{org.name}</strong> - kwoty odzyskane, saldo otwarte
            i dynamika rozwiazywania spraw. Dane pochodza z rejestru spraw firmy.
          </p>
        </div>
      </header>

      {cases.length === 0 ? (
        <EmptyState
          title="Brak danych do raportu"
          description="Ta organizacja nie ma jeszcze zadnych spraw. Analityka pojawi sie po utworzeniu pierwszych spraw."
        />
      ) : (
        <>
          <section
            aria-label="Najwazniejsze wskazniki"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {overview.map((kpi) => (
              <Card key={kpi.label} elevation="subtle" className="p-5">
                <p className="text-xs uppercase tracking-wide text-dlugomat-500">{kpi.label}</p>
                <p className="mt-2 font-display text-2xl text-dlugomat-900">{kpi.value}</p>
              </Card>
            ))}
          </section>

          <section aria-label="Odzyskania miesiac do miesiaca">
            <Card elevation="subtle" className="p-6">
              <header className="mb-5 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-lg text-dlugomat-900">
                    Odzyskania miesiac do miesiaca
                  </h2>
                  <p className="text-xs text-dlugomat-500">
                    Suma kwot spraw rozwiazanych w danym miesiacu (ostatnie 6 miesiecy).
                  </p>
                </div>
              </header>
              <div className="flex h-48 items-end gap-6">
                {buckets.map((m) => (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(m.recovered)}
                      aria-valuemin={0}
                      aria-valuemax={Math.round(maxRecovered)}
                      aria-label={`Odzyskania w miesiacu ${m.label}: ${currency.format(m.recovered)}`}
                      className="flex w-full items-end justify-center rounded-md bg-accent-100"
                      style={{ height: `${(m.recovered / maxRecovered) * 100}%`, minHeight: "12px" }}
                    >
                      <span className="pb-2 font-mono text-xs text-dlugomat-700">{m.count}</span>
                    </div>
                    <span className="text-xs uppercase text-dlugomat-500">{m.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-dlugomat-500">
                Liczba na slupku oznacza liczbe spraw rozwiazanych w danym miesiacu.
              </p>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
