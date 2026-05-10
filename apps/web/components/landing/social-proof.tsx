import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  value: string;
  label: string;
  context: string;
}

const STATS: readonly Stat[] = [
  {
    value: "12 min",
    label: "Średni czas wygenerowania pisma",
    context: "Od wczytania dokumentu do gotowego PDF",
  },
  {
    value: "94%",
    label: "Skuteczność walidacji",
    context: "Pism przyjętych do akt bez braków formalnych",
  },
  {
    value: "5-10x",
    label: "Taniej niż prawnik",
    context: "Wobec średnio 1 500–3 000 zł za sprzeciw od kancelarii",
  },
  {
    value: "0 zł",
    label: "Skaner nakazu",
    context: "Sprawdź sytuację bez zakładania konta",
  },
];

export function SocialProof() {
  return (
    <section aria-labelledby="proof-title" className="container py-16">
      <h2 id="proof-title" className="sr-only">
        Liczby, które dają spokój
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} elevation="flat" className="bg-iron-50 dark:bg-dlugomat-900">
            <CardContent className="p-6">
              <p className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-fluid-sm font-semibold text-iron-800 dark:text-iron-200">
                {stat.label}
              </p>
              <p className="mt-1 text-fluid-xs text-iron-500 dark:text-iron-400">
                {stat.context}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
