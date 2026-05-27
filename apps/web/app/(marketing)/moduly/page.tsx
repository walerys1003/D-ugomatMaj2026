import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MarketingPageHero,
  MarketingCtaBanner,
} from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Moduły Długomatu — 8 narzędzi dla osób zadłużonych",
  description:
    "Wszystkie moduły D1-D8: skaner nakazu, sprzeciw EPU, skarga komornicza, ochrona wynagrodzenia, korekta BIK, weryfikacja cesji, propozycja ugody, upadłość konsumencka.",
  alternates: { canonical: "/moduly" },
};

interface ModuleEntry {
  code: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  title: string;
  href: string;
  price: string;
  oneliner: string;
  longDesc: string;
  highlight?: "free" | "popular";
  category: "Diagnoza" | "Sąd" | "Egzekucja" | "Rejestry" | "Negocjacja" | "Upadłość";
}

const MODULES: readonly ModuleEntry[] = [
  {
    code: "D1",
    title: "Skaner Nakazu",
    href: "/skaner-nakazu",
    price: "DARMOWE",
    highlight: "free",
    category: "Diagnoza",
    oneliner: "Wczytaj pismo, sprawdź przedawnienie, dowiedz się co masz zrobić jako pierwsze.",
    longDesc:
      "OCR pisma + rozpoznanie typu (nakaz EPU, list komornika, raport BIK). Wskazanie terminu reakcji, ocena przedawnienia, mapa modułów.",
  },
  {
    code: "D2",
    title: "Sprzeciwomat EPU",
    href: "/moduly/sprzeciw-epu",
    price: "159 zł",
    highlight: "popular",
    category: "Sąd",
    oneliner: "Sprzeciw od nakazu zapłaty z e-Sądu — 14 dni na reakcję.",
    longDesc:
      "Pełen sprzeciw z zarzutami: przedawnienie, brak legitymacji, klauzule abuzywne. Wniosek dowodowy + zwolnienie z kosztów.",
  },
  {
    code: "D3",
    title: "KomornikShield",
    href: "/moduly/komornik",
    price: "od 79 zł",
    category: "Egzekucja",
    oneliner: "Skarga na czynności komornika i wniosek o ograniczenie egzekucji.",
    longDesc:
      "Skarga (7 dni), wniosek o ograniczenie (art. 833 KPC), wyłączenie spod egzekucji (art. 829), zażalenia.",
  },
  {
    code: "D4",
    title: "PotrąceniaStop",
    href: "/moduly/potracenia",
    price: "od 79 zł",
    category: "Egzekucja",
    oneliner: "Wstrzymaj zajęcie wynagrodzenia, odblokuj kwotę wolną na koncie.",
    longDesc:
      "Pisma do pracodawcy (art. 87 KP) i banku (art. 54 PB). Ochrona 500+, alimentów, świadczenia pielęgnacyjnego.",
  },
  {
    code: "D5",
    title: "BIK-Fix",
    href: "/moduly/bik",
    price: "129 zł",
    category: "Rejestry",
    oneliner: "Wniosek o korektę negatywnego wpisu w BIK.",
    longDesc:
      "Reklamacja do banku (art. 105a PB) + wniosek do BIK (RODO art. 16) + skarga do Rzecznika Finansowego.",
  },
  {
    code: "D6",
    title: "CesjaCheck",
    href: "/moduly/cesja",
    price: "149 zł",
    category: "Sąd",
    oneliner: "Weryfikacja umowy cesji i zarzut braku legitymacji procesowej.",
    longDesc:
      "Zarzut braku legitymacji + wniosek dowodowy + zarzut przedawnienia. Mapa orzecznictwa SN.",
  },
  {
    code: "D7",
    title: "UgodoMat",
    href: "/moduly/ugoda",
    price: "119 zł",
    category: "Negocjacja",
    oneliner: "Propozycja ugody z wierzycielem + harmonogram spłaty.",
    longDesc:
      "Pismo z propozycją kwot, dat i klauzul ochronnych. Kalkulator zdolności spłaty + 'satisfactio'.",
  },
  {
    code: "D8",
    title: "Upadłość-Lite",
    href: "/moduly/upadlosc",
    price: "249 zł",
    category: "Upadłość",
    oneliner: "Wniosek o upadłość konsumencką — formularz + uzasadnienie + spis majątku.",
    longDesc:
      "Komplet dokumentów: formularz urzędowy, uzasadnienie niewypłacalności, spis wierzytelności i majątku, plan spłaty.",
  },
] as const;

const CATEGORIES: ReadonlyArray<ModuleEntry["category"]> = [
  "Diagnoza",
  "Sąd",
  "Egzekucja",
  "Rejestry",
  "Negocjacja",
  "Upadłość",
] as const;

export default function ModulyPage() {
  return (
    <>
      {/* HERO — Tarcza v4 unified */}
      <MarketingPageHero
        eyebrow="8 modułów — jedna tarcza"
        title="Każdy moduł rozwiązuje jeden problem."
        subtitle="Nie kupujesz pakietu, którego nie potrzebujesz. Nie podpisujesz abonamentu. Płacisz tylko za pisma, które wygenerujesz — z gotowym PDF na końcu."
      />

      {/* MODULES GRID */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {MODULES.map((m) => (
            <Card
              key={m.code}
              elevation="subtle"
              className="group relative flex h-full flex-col transition-shadow duration-base hover:shadow-pop"
            >
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-dlugomat-100 px-2 py-0.5 font-mono text-fluid-xs font-bold uppercase tracking-wide text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
                      {m.code}
                    </span>
                    <Badge tone="neutral">{m.category}</Badge>
                  </div>
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
                <CardTitle className="text-fluid-2xl">{m.title}</CardTitle>
                <CardDescription className="text-fluid-base">
                  {m.oneliner}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                  {m.longDesc}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-iron-100 pt-4 dark:border-dlugomat-800">
                  <span className="text-fluid-lg font-bold text-dlugomat-800 dark:text-iron-100">
                    {m.price}
                  </span>
                  <Button asChild size="sm">
                    <Link href={m.href}>
                      Sprawdź {m.code}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CATEGORIES MAP */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container max-w-4xl">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Mapa pomocy
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Po prostu wskaż, gdzie jesteś.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const items = MODULES.filter((m) => m.category === cat);
              return (
                <div
                  key={cat}
                  className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800"
                >
                  <h3 className="text-fluid-base font-semibold text-dlugomat-900 dark:text-iron-50">
                    {cat}
                  </h3>
                  <ul className="mt-3 flex flex-col gap-2">
                    {items.map((m) => (
                      <li key={m.code}>
                        <Link
                          href={m.href}
                          className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-fluid-sm text-iron-700 transition-colors hover:bg-iron-100 hover:text-dlugomat-700 dark:text-iron-200 dark:hover:bg-dlugomat-850"
                        >
                          <span>
                            <span className="font-mono text-fluid-xs font-bold text-dlugomat-600">
                              {m.code}
                            </span>{" "}
                            {m.title}
                          </span>
                          <ArrowRight className="size-3.5 opacity-60" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA — Tarcza v4 unified */}
      <section className="container py-20 sm:py-24">
        <MarketingCtaBanner
          title="Nie wiesz, od czego zacząć? Zacznij od skanera."
          subtitle="D1 jest darmowy. Wczytasz pismo i sam algorytm wskaże, którego modułu potrzebujesz — albo czy w ogóle jakiegoś."
          primaryCta={{ href: "/skaner-nakazu", label: "Zeskanuj pismo — DARMOWE" }}
          secondaryCta={{ href: "/cennik", label: "Zobacz cennik" }}
        />
      </section>
    </>
  );
}
