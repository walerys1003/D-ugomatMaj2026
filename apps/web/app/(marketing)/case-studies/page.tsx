import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Case studies klientów Długomat | Realne wyniki, mierzalne KPI",
  description:
    "Historie kancelarii, działów windykacji i osób prywatnych, które odzyskały kontrolę dzięki Długomat.",
};

interface CaseStudy {
  slug: string;
  client_name: string;
  client_kind: "kancelaria" | "windykacja" | "osoba_prywatna" | "korporacja";
  industry?: string;
  headline: string;
  result_metric: string;
  result_label: string;
  summary: string;
  duration_months: number;
  published_at: string;
}

const CASES: CaseStudy[] = [
  {
    slug: "kancelaria-kowalska-warszawa",
    client_name: "Kowalska &amp; Partnerzy",
    client_kind: "kancelaria",
    industry: "Kancelaria prawna",
    headline: "60% więcej spraw bez nowych etatów",
    result_metric: "−72%",
    result_label: "czasu na sprzeciw EPU",
    summary:
      "Średniej wielkości kancelaria warszawska zwiększyła wolumen spraw w I kwartale o 60% przy tym samym zespole, dzięki automatyzacji szablonów sprzeciwów EPU.",
    duration_months: 6,
    published_at: "2026-02-10",
  },
  {
    slug: "best-recovery-portfel-konsumencki",
    client_name: "Best Recovery S.A.",
    client_kind: "windykacja",
    industry: "Zarządzanie wierzytelnościami",
    headline: "Cure rate +18 pp w pół roku",
    result_metric: "+18 pp",
    result_label: "wzrost cure rate",
    summary:
      "Firma zarządzająca portfelem 32 000 spraw konsumenckich wdrożyła Długomat z workflow zatwierdzania. Mierzalna poprawa skuteczności bez zmian w zespole.",
    duration_months: 8,
    published_at: "2025-12-15",
  },
  {
    slug: "ms-energy-dzial-prawny",
    client_name: "MS Energy",
    client_kind: "korporacja",
    industry: "Energetyka",
    headline: "Centralizacja windykacji 3 spółek",
    result_metric: "1,8 mln zł",
    result_label: "rocznych oszczędności",
    summary:
      "Grupa energetyczna połączyła procesy windykacyjne 3 spółek na jednej platformie Enterprise z SSO Okta. Pełny audit chain dla compliance.",
    duration_months: 4,
    published_at: "2025-10-08",
  },
  {
    slug: "pani-anna-sprzeciw-nakaz",
    client_name: "Anna J. (klient indywidualny)",
    client_kind: "osoba_prywatna",
    industry: "Osoba prywatna",
    headline: "Skutecznie odwołała się od nakazu zapłaty",
    result_metric: "47 320 zł",
    result_label: "oddalonego roszczenia",
    summary:
      "Osoba prywatna z Krakowa otrzymała nakaz zapłaty z EPU dotyczący przedawnionego długu. W 22 minuty wygenerowała sprzeciw — sąd umorzył postępowanie.",
    duration_months: 1,
    published_at: "2026-01-20",
  },
];

const KIND_LABELS: Record<CaseStudy["client_kind"], string> = {
  kancelaria: "Kancelaria",
  windykacja: "Windykacja",
  osoba_prywatna: "Osoba prywatna",
  korporacja: "Korporacja",
};

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Wszystkie" },
  { value: "kancelaria", label: "Kancelarie" },
  { value: "windykacja", label: "Windykacja" },
  { value: "korporacja", label: "Korporacje" },
  { value: "osoba_prywatna", label: "Osoby prywatne" },
];

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const sp = await searchParams;
  const filtered = sp.segment
    ? CASES.filter((c) => c.client_kind === sp.segment)
    : CASES;

  return (
    <main className="bg-ink-50 dark:bg-ink-950 pb-20">
      <section className="bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">
            Dowody, nie deklaracje
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 dark:text-ink-50">
            Case studies
          </h1>
          <p className="text-lg text-ink-600 dark:text-ink-300 mt-3 max-w-2xl">
            Realne wdrożenia, mierzalne KPI, weryfikowalne wyniki. Każde case study
            potwierdzone przez klienta.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => {
            const active = (sp.segment ?? "") === f.value;
            const href = f.value
              ? `/case-studies?segment=${f.value}`
              : "/case-studies";
            return (
              <Link
                key={f.value || "all"}
                href={href}
                className={`text-sm px-3 py-1.5 rounded-full border transition focus:outline-none focus-visible:shadow-shield-focus ${
                  active
                    ? "border-ink-900 dark:border-ink-50 bg-ink-900 dark:bg-ink-50 text-ink-50 dark:text-ink-900"
                    : "border-ink-300 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-ink-400"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Link key={c.slug} href={`/case-studies/${c.slug}`}>
              <Card
                elevation="subtle"
                className="hover:border-accent-400 transition cursor-pointer h-full"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                      {KIND_LABELS[c.client_kind]}
                    </span>
                    <span className="text-xs text-ink-500">{c.industry}</span>
                  </div>
                  <CardTitle className="text-lg" dangerouslySetInnerHTML={{ __html: c.client_name }} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-2 border-l-4 border-accent-600 pl-3">
                    <div className="font-display text-2xl font-semibold text-accent-700">
                      {c.result_metric}
                    </div>
                    <div className="text-xs text-ink-500 uppercase tracking-wider">
                      {c.result_label}
                    </div>
                  </div>
                  <p className="font-display text-base font-medium text-ink-900 dark:text-ink-50">
                    {c.headline}
                  </p>
                  <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2">
                    {c.summary}
                  </p>
                  <div className="text-xs text-ink-500 flex items-center justify-between pt-2 border-t border-ink-100 dark:border-ink-900">
                    <span>Wdrożenie: {c.duration_months} mies.</span>
                    <span>Czytaj →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <Card elevation="subtle">
            <CardContent className="pt-6 text-sm text-ink-500">
              Brak case studies w tej kategorii.
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
