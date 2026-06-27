import { Card } from "@/components/ui/card";

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
    value: "5–10×",
    label: "Taniej niż prawnik",
    context: "Wobec średnio 1 500–3 000 PLN za sprzeciw od kancelarii",
  },
  {
    value: "0 PLN",
    label: "Skaner nakazu",
    context: "Sprawdź sytuację bez zakładania konta",
  },
];

const LOGOS = ["Gazeta Prawna", "Rzeczpospolita", "Puls Biznesu", "Money.pl", "Forbes Polska"];

/**
 * SocialProof v3 — Corporate Blue Light (01-DLUGOMAT-corporate-blue §8).
 *
 * Vs v2:
 *  - Dodany blok testimonial (Magdalena K., production copy 1:1 ze spec):
 *    gradientowa karta blue-tint, znak cudzysłowu (serif, blue/20%),
 *    cytat Inter 600 z frazą "w 90 sekund" w blue, avatar z inicjałami.
 *  - Naprawione polskie znaki (Średni / Skuteczność / Sprawdź).
 *  - KPI strip + press logos zachowane, tokeny --dlugomat-* / --ink-*.
 */
export function SocialProof() {
  return (
    <section aria-labelledby="proof-title" className="bg-ink-50/60 py-16">
      <div className="container px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span className="dlu-eyebrow mb-3">Zaufanie</span>
          <h2 id="proof-title" className="dlu-h2 mt-2">
            Liczby, które dają spokój
          </h2>
        </header>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Card key={stat.label} elevation="subtle" className="p-6">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <p className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink-800">{stat.label}</p>
                <p className="mt-1 text-xs text-ink-500">{stat.context}</p>
              </dd>
            </Card>
          ))}
        </dl>

        {/* Testimonial — production copy 1:1 (spec §8 / Treści) */}
        <figure className="relative mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border border-dlugomat-200/70 bg-gradient-to-br from-dlugomat-50 to-white px-8 py-12 text-center shadow-[0_16px_40px_-12px_hsl(var(--ink-900)/0.10)] sm:px-14 sm:py-14 dark:from-ink-100 dark:to-background">
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 top-2 select-none font-serif text-[120px] leading-none text-dlugomat-500/20"
          >
            &ldquo;
          </span>
          <blockquote className="relative">
            <p className="text-balance text-xl font-semibold leading-relaxed tracking-[-0.01em] text-ink-900 sm:text-2xl dark:text-white">
              Dostałam nakaz na 8 000 zł za pożyczkę sprzed siedmiu lat. Prawnik chciał
              1 200 zł za sprzeciw. Długomat zrobił to{" "}
              <span className="text-dlugomat-600">w 90 sekund</span> — i wygrałam.
            </p>
          </blockquote>
          <figcaption className="relative mt-8 flex items-center justify-center gap-3">
            <span
              aria-hidden
              className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-dlugomat-500 to-dlugomat-700 text-sm font-bold text-white shadow-md"
            >
              MK
            </span>
            <span className="text-left">
              <span className="block text-[15px] font-bold text-ink-900 dark:text-white">
                Magdalena K.
              </span>
              <span className="block text-[13px] text-ink-500">
                Sprawa wygrana · Sąd Rejonowy Wrocław · Marzec 2026
              </span>
            </span>
          </figcaption>
        </figure>

        <div className="mt-14 border-t border-ink-200 pt-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Cytowani przez
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-ink-600">
            {LOGOS.map((logo) => (
              <li key={logo} className="font-display text-base text-ink-700">
                {logo}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
