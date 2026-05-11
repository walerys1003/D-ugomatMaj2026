import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CalendarClock,
  Gavel,
  Scale,
  TrendingDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listCasesForCurrentUser } from "@/lib/cases/case-repository";
import { caseStatusLabel, caseTypeMeta } from "@/lib/cases/case-types";
import { formatDatePL, urgencyFromDays, daysUntil } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Moje zadłużenie · Długomat",
  description:
    "Pełny obraz Twoich spraw długowych: suma roszczeń, koszty postępowania, terminy procesowe i rekomendowane działania.",
};

type DebtRow = {
  id: string;
  creditor: string;
  caseSignature: string;
  type: string;
  principal_pln: number;
  interest_pln: number;
  costs_pln: number;
  status: string;
  next_deadline?: string;
  next_action?: string;
};

// Mock-like aggregation; in real run this is driven by listCasesForCurrentUser().
// We keep the function pure so it can be swapped later for repository-driven data.
function pln(amount: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function MojeZadluzeniePage() {
  const cases = await listCasesForCurrentUser();

  // Derive a simplified debt overview from cases. We keep it conservative —
  // we never invent amounts; only render placeholders when the case has them.
  const rows: DebtRow[] = cases.map((c, idx) => ({
    id: c.id,
    creditor: c.title.split("·")[0]?.trim() ?? c.title,
    caseSignature: `${(caseTypeMeta[c.type]?.module ?? "D?")}-${String(idx + 1).padStart(3, "0")}`,
    type: caseTypeMeta[c.type]?.module ?? "—",
    principal_pln: 0,
    interest_pln: 0,
    costs_pln: 0,
    status: caseStatusLabel[c.status],
  }));

  const totalPrincipal = rows.reduce((s, r) => s + r.principal_pln, 0);
  const totalInterest = rows.reduce((s, r) => s + r.interest_pln, 0);
  const totalCosts = rows.reduce((s, r) => s + r.costs_pln, 0);
  const totalAll = totalPrincipal + totalInterest + totalCosts;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Moje finanse
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Moje zadłużenie
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Aktualny obraz Twoich spraw długowych. Wszystkie kwoty są wyliczane na
          dzień:{" "}
          <span className="font-semibold tabular-nums text-iron-900 dark:text-iron-100">
            {formatDatePL(new Date())}
          </span>
          . Pamiętaj — odsetki naliczają się codziennie.
        </p>
      </header>

      {/* KPI strip */}
      <section
        aria-label="Podsumowanie zadłużenia"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          icon={<Banknote className="size-5" aria-hidden />}
          label="Suma roszczeń"
          value={pln(totalAll)}
          hint="Kapitał + odsetki + koszty"
          tone="iron"
        />
        <KpiCard
          icon={<Scale className="size-5" aria-hidden />}
          label="Kapitał"
          value={pln(totalPrincipal)}
          hint="Sama wartość główna"
          tone="iron"
        />
        <KpiCard
          icon={<TrendingDown className="size-5" aria-hidden />}
          label="Odsetki"
          value={pln(totalInterest)}
          hint="Ustawowe od opóźnienia"
          tone="warn"
        />
        <KpiCard
          icon={<Gavel className="size-5" aria-hidden />}
          label="Koszty postępowania"
          value={pln(totalCosts)}
          hint="Sądowe + zastępstwo"
          tone="iron"
        />
      </section>

      {/* Risk callout */}
      <Card urgency="warning" elevation="subtle">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-100 text-warn-600 dark:bg-warn-500/15"
            >
              <AlertCircle className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-fluid-lg">
                Liczy się każdy dzień
              </CardTitle>
              <CardDescription>
                Odsetki ustawowe za opóźnienie naliczają się codziennie. Jeśli
                widzisz nakaz zapłaty — termin na sprzeciw to{" "}
                <span className="font-semibold text-iron-900 dark:text-iron-50">
                  14 dni
                </span>{" "}
                od doręczenia (EPU) lub{" "}
                <span className="font-semibold text-iron-900 dark:text-iron-50">
                  2 tygodnie
                </span>{" "}
                w postępowaniu zwykłym.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/panel/sprawy/nowa">
                Zacznij sprzeciw
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/panel/plan-splaty">Zaproponuj ugodę</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debts table */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white">
            Twoje sprawy długowe
          </h2>
          <Link
            href="/panel/sprawy/nowa"
            className="text-fluid-sm font-semibold text-dlugomat-600 hover:underline dark:text-dlugomat-300"
          >
            Dodaj sprawę
          </Link>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<Scale className="size-5" aria-hidden />}
            title="Brak aktywnych spraw długowych"
            description="Gdy zeskanujesz nakaz lub uzupełnisz dane wierzyciela, zadłużenie pojawi się tutaj wraz z terminami i rekomendacjami."
            action={
              <Button asChild>
                <Link href="/panel/skaner">Zeskanuj nakaz</Link>
              </Button>
            }
          />
        ) : (
          <Card elevation="subtle" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-fluid-sm">
                <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                  <tr className="text-left text-iron-600 dark:text-iron-300">
                    <th className="px-5 py-3 font-semibold">Wierzyciel</th>
                    <th className="px-5 py-3 font-semibold">Sygnatura</th>
                    <th className="px-5 py-3 text-right font-semibold">Kapitał</th>
                    <th className="px-5 py-3 text-right font-semibold">Odsetki</th>
                    <th className="px-5 py-3 text-right font-semibold">Koszty</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-iron-50/40 dark:hover:bg-dlugomat-900/30"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/panel/sprawa/${r.id}`}
                          className="font-semibold text-iron-900 hover:text-dlugomat-700 dark:text-iron-50 dark:hover:text-dlugomat-300"
                        >
                          {r.creditor}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-mono text-fluid-xs text-iron-500">
                        {r.caseSignature}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {pln(r.principal_pln)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-warn-600">
                        {pln(r.interest_pln)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {pln(r.costs_pln)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone="info">{r.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/panel/sprawa/${r.id}`}>
                            Otwórz
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                  <tr className="text-iron-900 dark:text-iron-50">
                    <td colSpan={2} className="px-5 py-3 font-semibold">
                      Razem
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {pln(totalPrincipal)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {pln(totalInterest)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">
                      {pln(totalCosts)}
                    </td>
                    <td colSpan={2} className="px-5 py-3 text-right font-semibold tabular-nums">
                      {pln(totalAll)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Next steps */}
      <section
        aria-labelledby="next-steps"
        className="grid gap-3 md:grid-cols-3"
      >
        <h2 id="next-steps" className="sr-only">
          Rekomendowane kolejne kroki
        </h2>
        <NextStep
          icon={<CalendarClock className="size-5" aria-hidden />}
          title="Zobacz oś czasu pism"
          desc="Wszystkie pisma w sprawie w jednym widoku."
          href="/panel/moje-pisma"
        />
        <NextStep
          icon={<Banknote className="size-5" aria-hidden />}
          title="Zaproponuj plan spłaty"
          desc="Generator ugody z wierzycielem w 5 minut."
          href="/panel/plan-splaty"
        />
        <NextStep
          icon={<Gavel className="size-5" aria-hidden />}
          title="Sprawdź przedawnienie"
          desc="Skaner OCR + ocena terminu w 2 minuty."
          href="/panel/skaner"
        />
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: "iron" | "warn";
}) {
  const ring =
    tone === "warn"
      ? "bg-warn-100 text-warn-600 dark:bg-warn-500/15"
      : "bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300";
  return (
    <Card elevation="subtle">
      <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className={`grid size-9 place-items-center rounded-lg ${ring}`}>
            {icon}
          </span>
          <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
            {label}
          </span>
        </div>
        <div className="text-fluid-2xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
          {value}
        </div>
        <p className="text-fluid-xs text-iron-500">{hint}</p>
      </CardContent>
    </Card>
  );
}

function NextStep({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-iron-200 bg-white p-4 transition hover:border-dlugomat-400 hover:shadow-card dark:border-iron-800 dark:bg-iron-950"
    >
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-fluid-sm font-semibold text-iron-900 dark:text-iron-50">
          {title}
        </span>
        <span className="text-fluid-xs text-iron-500">{desc}</span>
      </span>
      <ArrowRight className="ml-auto size-4 self-center text-iron-400 transition group-hover:translate-x-0.5 group-hover:text-dlugomat-600" />
    </Link>
  );
}
