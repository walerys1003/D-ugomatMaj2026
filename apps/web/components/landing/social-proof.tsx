import { Card } from "@/components/ui/card";

interface Stat {
  value: string;
  label: string;
  context: string;
}

const STATS: readonly Stat[] = [
  { value: "12 min", label: "Sredni czas wygenerowania pisma", context: "Od wczytania dokumentu do gotowego PDF" },
  { value: "94%", label: "Skutecznosc walidacji", context: "Pism przyjetych do akt bez brakow formalnych" },
  { value: "5-10x", label: "Taniej niz prawnik", context: "Wobec srednio 1 500-3 000 PLN za sprzeciw od kancelarii" },
  { value: "0 PLN", label: "Skaner nakazu", context: "Sprawdz sytuacje bez zakladania konta" },
];

const LOGOS = ["Gazeta Prawna", "Rzeczpospolita", "Puls Biznesu", "Money.pl", "Forbes Polska"];

/**
 * SocialProof v2 - premium minimalist (Design System Tarcza)
 * KPI strip + logos grid w jednej sekcji, neutralna paleta.
 */
export function SocialProof() {
  return (
    <section aria-labelledby="proof-title" className="bg-ink-50/60 py-16">
      <div className="container px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Zaufanie</p>
          <h2 id="proof-title" className="mt-2 font-display text-3xl text-dlugomat-900">
            Liczby, ktore daja spokoj
          </h2>
        </header>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.label} elevation="subtle" className="p-6">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <p className="font-display text-3xl text-dlugomat-900">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-dlugomat-800">{stat.label}</p>
                <p className="mt-1 text-xs text-dlugomat-500">{stat.context}</p>
              </dd>
            </Card>
          ))}
        </dl>

        <div className="mt-12 border-t border-dlugomat-100 pt-8">
          <p className="text-center text-xs uppercase tracking-wide text-dlugomat-500">
            Cytowani przez
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-dlugomat-600">
            {LOGOS.map((logo) => (
              <li key={logo} className="font-display text-base text-dlugomat-700">
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
