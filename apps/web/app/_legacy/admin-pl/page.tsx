import type { Metadata } from "next";
import Link from "next/link";
import {
  ListChecks,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import {
  getAdminStats,
  getKpiTimeSeries,
  getFunnelMetrics,
} from "@/lib/admin/admin-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pulpit administracyjny",
  robots: { index: false, follow: false },
};

// Tier 5.3 — krótki revalidate, dane się zmieniają, ale dashboard nie
// musi być w 100% real-time.
export const revalidate = 60;

function formatPLN(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(grosze / 100);
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "info" | "success" | "warning" | "neutral";
}

function StatCard({ label, value, hint, icon: Icon, tone = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-iron-400" />
      </CardHeader>
      <CardContent>
        <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          {value}
        </div>
        {hint ? (
          <p className="mt-1 text-fluid-xs text-iron-500">
            <Badge tone={tone}>{hint}</Badge>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const admin = await requireAdminOrRedirect();
  const [stats, timeSeries, funnel] = await Promise.all([
    getAdminStats(),
    getKpiTimeSeries(30),
    getFunnelMetrics(30),
  ]);

  // Maks dziennego revenue dla skalowania słupków sparkline.
  const maxRevenue = Math.max(
    1,
    ...timeSeries.map((b) => b.revenue_grosze),
  );
  const maxCases = Math.max(1, ...timeSeries.map((b) => b.cases_created));

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Panel administracyjny
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Witaj, {admin.email.split("@")[0]}.
        </h1>
        <p className="mt-2 max-w-2xl text-fluid-sm text-iron-600 dark:text-iron-300">
          Przegląd kluczowych metryk Długomat. Dane odświeżane co 60 sekund.
          Kolejka spraw i audit log dostępne w nawigacji bocznej.
        </p>
      </header>

      <section aria-labelledby="stats-heading" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <h2 id="stats-heading" className="sr-only">
          Statystyki
        </h2>
        <StatCard
          label="Sprawy łącznie"
          value={stats.cases_total.toLocaleString("pl-PL")}
          hint={`+${stats.cases_24h} (24h)`}
          icon={ListChecks}
          tone="info"
        />
        <StatCard
          label="Wygenerowane pisma"
          value={stats.documents_total.toLocaleString("pl-PL")}
          hint={`+${stats.documents_24h} (24h)`}
          icon={FileText}
          tone="info"
        />
        <StatCard
          label="Płatności (zakończone)"
          value={stats.payments_completed_total.toLocaleString("pl-PL")}
          hint={formatPLN(stats.revenue_total_grosze)}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Użytkownicy"
          value={stats.users_total.toLocaleString("pl-PL")}
          icon={Users}
          tone="neutral"
        />
      </section>

      <section aria-labelledby="quality-heading" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <h2 id="quality-heading" className="sr-only">
          Jakość AI (30 dni)
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fluid-base">
              <TrendingUp className="h-4 w-4 text-dlugomat-600" />
              Średni score walidacji (30d)
            </CardTitle>
            <CardDescription className="text-fluid-xs">
              Average score z <code>validation_runs</code> z ostatnich 30 dni.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.validation_avg_score_30d?.toFixed(2) ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fluid-base">
              <ShieldCheck className="h-4 w-4 text-accent-600" />
              Pass rate walidacji (30d)
            </CardTitle>
            <CardDescription className="text-fluid-xs">
              Odsetek dokumentów które przeszły walidację bez wymaganej korekty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.validation_pass_rate_30d !== null
                ? `${stats.validation_pass_rate_30d}%`
                : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Rozkład statusów spraw</CardTitle>
            <CardDescription className="text-fluid-xs">
              Aktywne sprawy (z wyłączeniem usuniętych).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-fluid-sm">
              {Object.entries(stats.cases_by_status).length === 0 ? (
                <li className="text-iron-500">Brak danych.</li>
              ) : (
                Object.entries(stats.cases_by_status)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <li
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <code className="text-iron-600 dark:text-iron-300">
                        {status}
                      </code>
                      <span className="font-semibold text-iron-900 dark:text-white">
                        {count}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="trend-heading" className="grid gap-4 lg:grid-cols-2">
        <h2 id="trend-heading" className="sr-only">
          Trend 30 dni
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fluid-base">
              <TrendingUp className="h-4 w-4 text-dlugomat-600" />
              Sprawy / dzień (30d)
            </CardTitle>
            <CardDescription className="text-fluid-xs">
              Liczba nowych spraw per dzień — proxy dla wolumenu ruchu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end gap-[2px]">
              {timeSeries.map((b) => {
                const h = Math.max(2, (b.cases_created / maxCases) * 96);
                return (
                  <div
                    key={b.bucket}
                    className="flex-1 rounded-t bg-dlugomat-500/70 dark:bg-dlugomat-400/70"
                    style={{ height: `${h}px` }}
                    title={`${b.bucket}: ${b.cases_created} spraw`}
                    aria-label={`${b.bucket}: ${b.cases_created} spraw`}
                  />
                );
              })}
            </div>
            <p className="mt-2 text-fluid-xs text-iron-500">
              Suma 30d:{" "}
              <strong>
                {timeSeries
                  .reduce((acc, b) => acc + b.cases_created, 0)
                  .toLocaleString("pl-PL")}
              </strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fluid-base">
              <CreditCard className="h-4 w-4 text-accent-600" />
              Przychód / dzień (30d)
            </CardTitle>
            <CardDescription className="text-fluid-xs">
              Suma <code>amount</code> dla zakończonych płatności per dzień.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end gap-[2px]">
              {timeSeries.map((b) => {
                const h = Math.max(2, (b.revenue_grosze / maxRevenue) * 96);
                return (
                  <div
                    key={b.bucket}
                    className="flex-1 rounded-t bg-accent-500/70 dark:bg-accent-400/70"
                    style={{ height: `${h}px` }}
                    title={`${b.bucket}: ${formatPLN(b.revenue_grosze)}`}
                    aria-label={`${b.bucket}: ${formatPLN(b.revenue_grosze)}`}
                  />
                );
              })}
            </div>
            <p className="mt-2 text-fluid-xs text-iron-500">
              Suma 30d:{" "}
              <strong>
                {formatPLN(
                  timeSeries.reduce((acc, b) => acc + b.revenue_grosze, 0),
                )}
              </strong>
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="funnel-heading" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <h2 id="funnel-heading" className="sr-only">
          Lejek konwersji (30d)
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Unikalni użytkownicy (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {funnel.cases_created_users.toLocaleString("pl-PL")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Zapłacone sprawy (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {funnel.cases_paid.toLocaleString("pl-PL")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Konwersja → płatność
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {funnel.conversion_paid_pct !== null
                ? `${funnel.conversion_paid_pct}%`
                : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Średni czas do płatności
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {funnel.avg_hours_to_payment !== null
                ? `${funnel.avg_hours_to_payment} h`
                : "—"}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="quick-heading" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <h2 id="quick-heading" className="sr-only">
          Szybkie akcje
        </h2>
        <Card className="hover:border-dlugomat-300">
          <CardHeader>
            <CardTitle className="text-fluid-base">Kolejka spraw</CardTitle>
            <CardDescription>
              Filtruj po statusie i typie. Ręczne odblokowanie pobrania,
              archiwizacja zalegających szkiców.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/sprawy"
              className="text-fluid-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
            >
              Otwórz kolejkę →
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-dlugomat-300">
          <CardHeader>
            <CardTitle className="text-fluid-base">Audit log</CardTitle>
            <CardDescription>
              Wszystkie zdarzenia ze sprawy: utworzenie, generacja AI,
              płatność, zmiana statusu, zmiany RODO.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/audyt"
              className="text-fluid-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
            >
              Otwórz audit log →
            </Link>
          </CardContent>
        </Card>

        {admin.role === "admin" ? (
          <Card className="hover:border-dlugomat-300">
            <CardHeader>
              <CardTitle className="text-fluid-base">Prompty AI</CardTitle>
              <CardDescription>
                Edytor system prompt + user prompt template. Wersjonowanie,
                aktywacja, snapshot historii.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/prompty"
                className="text-fluid-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
              >
                Zarządzaj promptami →
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
