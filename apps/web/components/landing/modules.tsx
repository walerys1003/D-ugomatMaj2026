import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModuleDef {
  code: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  title: string;
  href: string;
  price: string;
  highlight?: "free" | "popular";
  desc: string;
}

const MODULES: readonly ModuleDef[] = [
  {
    code: "D1",
    title: "Skaner Nakazu",
    href: "/skaner-nakazu",
    price: "DARMOWE",
    highlight: "free",
    desc: "Wczytaj nakaz, sprawdź czy roszczenie jest przedawnione, dowiedz się jakie masz opcje.",
  },
  {
    code: "D2",
    title: "Sprzeciwomat EPU",
    href: "/moduly/sprzeciw-epu",
    price: "159 zł",
    highlight: "popular",
    desc: "Sprzeciw od nakazu zapłaty z e-Sądu — 14 dni na reakcję, my przygotujemy pismo w 12 minut.",
  },
  {
    code: "D3",
    title: "KomornikShield",
    href: "/moduly/komornik",
    price: "od 79 zł",
    desc: "Skarga na czynności komornika, wniosek o ograniczenie egzekucji, kwota wolna od zajęcia.",
  },
  {
    code: "D4",
    title: "PotrąceniaStop",
    href: "/moduly/potracenia",
    price: "od 79 zł",
    desc: "Wstrzymaj zajęcie wynagrodzenia, odblokuj kwotę wolną na koncie bankowym.",
  },
  {
    code: "D5",
    title: "BIK-Fix",
    href: "/moduly/bik",
    price: "129 zł",
    desc: "Wniosek o korektę negatywnego wpisu w BIK + pismo do banku. Średnio 30 dni do skutku.",
  },
  {
    code: "D6",
    title: "CesjaCheck",
    href: "/moduly/cesja",
    price: "149 zł",
    desc: "Weryfikacja umowy cesji i zarzut braku legitymacji procesowej. Funduszu na bok.",
  },
  {
    code: "D7",
    title: "UgodoMat",
    href: "/moduly/ugoda",
    price: "119 zł",
    desc: "Propozycja ugody z wierzycielem — kapitał, odsetki, raty. Harmonogram spłaty w PDF.",
  },
  {
    code: "D8",
    title: "Upadłość-Lite",
    href: "/moduly/upadlosc",
    price: "249 zł",
    desc: "Wniosek o upadłość konsumencką — formularz urzędowy + uzasadnienie + spis majątku.",
  },
] as const;

export function ModulesGrid() {
  return (
    <section
      aria-labelledby="modules-title"
      className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Moduły
          </p>
          <h2
            id="modules-title"
            className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white"
          >
            Osiem narzędzi — jedna tarcza.
          </h2>
          <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
            Każdy moduł rozwiązuje jeden problem. Płacisz tylko za to, czego potrzebujesz.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Card
              key={m.code}
              elevation="subtle"
              className="group relative flex h-full flex-col transition-shadow duration-base hover:shadow-pop"
            >
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-dlugomat-100 px-2 py-0.5 font-mono text-fluid-xs font-bold uppercase tracking-wide text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
                    {m.code}
                  </span>
                  {m.highlight === "free" ? (
                    <Badge tone="success" withDot>
                      DARMOWE
                    </Badge>
                  ) : m.highlight === "popular" ? (
                    <Badge tone="info" withDot>
                      Najpopularniejsze
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-fluid-lg">{m.title}</CardTitle>
                <CardDescription>{m.desc}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-fluid-base font-semibold text-dlugomat-800 dark:text-iron-100">
                    {m.price}
                  </span>
                  <Link
                    href={m.href}
                    className="inline-flex items-center gap-1 rounded-md text-fluid-sm font-semibold text-dlugomat-600 transition-colors hover:text-dlugomat-700 focus-visible:shadow-shield-focus focus-visible:outline-none dark:text-dlugomat-300 dark:hover:text-white"
                    aria-label={`Dowiedz się więcej o ${m.title}`}
                  >
                    Sprawdź
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
