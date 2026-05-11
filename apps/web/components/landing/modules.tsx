import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ModuleDef {
  code: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  title: string;
  href: string;
  price: string;
  highlight?: "free" | "popular";
  desc: string;
}

const MODULES: readonly ModuleDef[] = [
  { code: "D1", title: "Skaner Nakazu", href: "/skaner-nakazu", price: "DARMOWE", highlight: "free",
    desc: "Wczytaj nakaz, sprawdz czy roszczenie jest przedawnione i dowiedz sie jakie masz opcje." },
  { code: "D2", title: "Sprzeciwomat EPU", href: "/moduly/sprzeciw-epu", price: "159 PLN", highlight: "popular",
    desc: "Sprzeciw od nakazu zaplaty z e-Sadu. 14 dni na reakcje - my przygotujemy pismo w 12 minut." },
  { code: "D3", title: "KomornikShield", href: "/moduly/komornik", price: "od 79 PLN",
    desc: "Skarga na czynnosci komornika, wniosek o ograniczenie egzekucji, kwota wolna od zajecia." },
  { code: "D4", title: "PotraceniaStop", href: "/moduly/potracenia", price: "od 79 PLN",
    desc: "Wstrzymaj zajecie wynagrodzenia, odblokuj kwote wolna na koncie bankowym." },
  { code: "D5", title: "BIK-Fix", href: "/moduly/bik", price: "129 PLN",
    desc: "Wniosek o korekte negatywnego wpisu w BIK plus pismo do banku. Srednio 30 dni do skutku." },
  { code: "D6", title: "CesjaCheck", href: "/moduly/cesja", price: "149 PLN",
    desc: "Weryfikacja umowy cesji i zarzut braku legitymacji procesowej. Fundusz na bok." },
  { code: "D7", title: "UgodoMat", href: "/moduly/ugoda", price: "119 PLN",
    desc: "Propozycja ugody z wierzycielem - kapital, odsetki, raty. Harmonogram splaty w PDF." },
  { code: "D8", title: "Upadlosc-Lite", href: "/moduly/upadlosc", price: "249 PLN",
    desc: "Wniosek o upadlosc konsumencka - formularz urzedowy plus uzasadnienie i spis majatku." },
] as const;

/**
 * ModulesGrid v2 - premium minimalist (Design System Tarcza)
 * Card subtle/pop, badge tones success/info, ASCII text, focus-shield.
 */
export function ModulesGrid() {
  return (
    <section aria-labelledby="modules-title" className="bg-iron-50/60 py-20">
      <div className="container px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Moduly</p>
          <h2 id="modules-title" className="mt-2 font-display text-3xl text-dlugomat-900 sm:text-4xl">
            Osiem narzedzi - jedna tarcza
          </h2>
          <p className="mt-3 text-sm text-dlugomat-600">
            Kazdy modul rozwiazuje jeden problem. Placisz tylko za to, czego potrzebujesz.
          </p>
        </header>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <li key={m.code}>
              <Card
                elevation={m.highlight === "popular" ? "pop" : "subtle"}
                urgency={m.highlight === "popular" ? "warning" : "none"}
                className="flex h-full flex-col p-6"
              >
                <header className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-dlugomat-100 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wide text-dlugomat-700">
                    {m.code}
                  </span>
                  {m.highlight === "free" ? (
                    <Badge tone="success" withDot>DARMOWE</Badge>
                  ) : m.highlight === "popular" ? (
                    <Badge tone="info" withDot>Najpopularniejsze</Badge>
                  ) : null}
                </header>
                <h3 className="mt-4 font-display text-lg text-dlugomat-900">{m.title}</h3>
                <p className="mt-2 text-sm text-dlugomat-600">{m.desc}</p>
                <footer className="mt-auto flex items-center justify-between pt-5">
                  <span className="font-display text-base text-dlugomat-900">{m.price}</span>
                  <Link
                    href={m.href}
                    aria-label={`Dowiedz sie wiecej o module ${m.title}`}
                    className="rounded-md text-sm font-medium text-accent-600 transition hover:text-accent-700 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  >
                    Sprawdz
                  </Link>
                </footer>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
