import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Cennik Długomatu — od 0 zł, bez abonamentu, bez ukrytych kosztów",
  description:
    "Skaner nakazu DARMOWY. Pisma od 79 zł do 249 zł. Pakiet komorniczy 199 zł (4 pisma). Bez abonamentu, bez subskrypcji. Faktura VAT na życzenie.",
  alternates: { canonical: "/cennik" },
};

interface PriceItem {
  code: string;
  title: string;
  href: string;
  price: number | "free";
  cadence?: string;
  highlight?: "free" | "popular" | "best-value";
  desc: string;
  includes: ReadonlyArray<string>;
}

const ITEMS: readonly PriceItem[] = [
  {
    code: "D1",
    title: "Skaner Nakazu",
    href: "/skaner-nakazu",
    price: "free",
    highlight: "free",
    desc: "Diagnoza pisma + ocena przedawnienia + plan działania.",
    includes: [
      "OCR pisma (do 10 stron)",
      "Rozpoznanie typu (EPU / komornik / BIK)",
      "Detekcja przedawnienia",
      "Liczenie terminów procesowych",
      "Mapa rekomendowanych modułów",
      "Bez konta z karty",
    ],
  },
  {
    code: "D3",
    title: "Pakiet Komorniczy",
    href: "/moduly/komornik",
    price: 199,
    highlight: "best-value",
    desc: "Skarga + ograniczenie + wyłączenie + zażalenie. 4 pisma w cenie 2.",
    includes: [
      "Skarga na czynność komornika (art. 767 KPC)",
      "Wniosek o ograniczenie egzekucji (art. 833)",
      "Wniosek o wyłączenie spod egzekucji (art. 829)",
      "Zażalenie na postanowienie",
      "Walidacja Haiku 4.5",
      "PDF gotowy do złożenia",
    ],
  },
  {
    code: "D2",
    title: "Sprzeciwomat EPU",
    href: "/moduly/sprzeciw-epu",
    price: 159,
    highlight: "popular",
    desc: "Sprzeciw od nakazu z e-Sądu z kompletem zarzutów.",
    includes: [
      "Sprzeciw zgodny z art. 503 KPC",
      "Zarzut przedawnienia (art. 117 KC)",
      "Zarzut braku legitymacji (cesja)",
      "Zarzuty klauzul abuzywnych",
      "Wniosek dowodowy",
      "Wniosek o zwolnienie z kosztów (jeśli zasadny)",
    ],
  },
  {
    code: "D6",
    title: "CesjaCheck",
    href: "/moduly/cesja",
    price: 149,
    desc: "Weryfikacja umowy cesji + zarzut braku legitymacji procesowej.",
    includes: [
      "Zarzut braku legitymacji",
      "Wniosek o pełną dokumentację cesji",
      "Zarzut braku zawiadomienia (art. 512 KC)",
      "Zarzut przedawnienia",
      "Mapa orzecznictwa SN",
      "Powołania konkretnych sygnatur",
    ],
  },
  {
    code: "D5",
    title: "BIK-Fix",
    href: "/moduly/bik",
    price: 129,
    desc: "Korekta wpisu w BIK + reklamacja do banku.",
    includes: [
      "Reklamacja do banku (art. 105a PB)",
      "Wniosek do BIK (RODO art. 16)",
      "Skarga do Rzecznika Finansowego",
      "Wniosek o usunięcie po 5 latach",
      "Pakiet RODO (art. 15-17)",
      "Średnio 30 dni do skutku",
    ],
  },
  {
    code: "D7",
    title: "UgodoMat",
    href: "/moduly/ugoda",
    price: 119,
    desc: "Propozycja ugody + harmonogram spłaty + klauzule ochronne.",
    includes: [
      "Pismo z propozycją ugody",
      "Harmonogram spłaty w PDF",
      "Klauzula umorzenia odsetek",
      "Klauzula 'satisfactio'",
      "Wniosek o aktualizację BIK po ugodzie",
      "3 wzory odpowiedzi na kontroferty",
    ],
  },
  {
    code: "D4",
    title: "PotrąceniaStop",
    href: "/moduly/potracenia",
    price: 79,
    desc: "Pismo do pracodawcy / banku o kwotę wolną od egzekucji.",
    includes: [
      "Pismo do pracodawcy (art. 87 KP)",
      "Pismo do banku (art. 54 PB)",
      "Wniosek o ochronę 500+ / alimentów",
      "Korekta błędnego potrącenia",
      "Pismo do komornika ws. świadczeń chronionych",
      "Wzór do podpisu i archiwum HR",
    ],
  },
  {
    code: "D8",
    title: "Upadłość-Lite",
    href: "/moduly/upadlosc",
    price: 249,
    desc: "Wniosek o upadłość konsumencką + komplet dokumentów.",
    includes: [
      "Formularz urzędowy",
      "Uzasadnienie niewypłacalności",
      "Spis wierzytelności",
      "Spis majątku",
      "Propozycja planu spłaty (12-36 mies.)",
      "Wniosek o zwolnienie z kosztów (jeśli zasadny)",
    ],
  },
] as const;

const COMPARISON = [
  {
    feature: "Pierwsza diagnoza pisma",
    dlugomat: "DARMOWE — 2 minuty",
    lawyer: "100-300 zł — wizyta",
    diy: "Sam musisz wiedzieć, czego szukać",
  },
  {
    feature: "Sprzeciw od nakazu EPU",
    dlugomat: "159 zł — 12 minut",
    lawyer: "1500-3000 zł — 1-3 dni",
    diy: "Bez gwarancji jakości",
  },
  {
    feature: "Skarga na komornika",
    dlugomat: "od 79 zł — 12 minut",
    lawyer: "500-1500 zł — 1-3 dni",
    diy: "Termin 7 dni — bez prawnika ryzyko duże",
  },
  {
    feature: "Walidacja jakości",
    dlugomat: "AI Haiku 4.5 + szablon ekspercki",
    lawyer: "Doświadczenie kancelarii",
    diy: "Brak",
  },
  {
    feature: "Aktualizacje wzorów",
    dlugomat: "Co kwartał + przy zmianie KPC",
    lawyer: "Zależy od kancelarii",
    diy: "Wzory z internetu — często nieaktualne",
  },
  {
    feature: "Czas na pisemną reakcję",
    dlugomat: "12 minut średnio",
    lawyer: "1-7 dni",
    diy: "Twoje wieczory",
  },
] as const;

const FAQ = [
  {
    q: "Czy są ukryte koszty?",
    a: "Nie. Cena modułu jest pełną ceną — obejmuje generowanie pisma, walidację AI, PDF do pobrania i ewentualną korektę za darmo (gwarancja 30 dni przy braku formalnym). Faktura VAT bez dopłat. Brak abonamentu — płacisz tylko, gdy generujesz konkretne pismo.",
  },
  {
    q: "Mogę dostać fakturę VAT?",
    a: "Tak — automatycznie. Po opłaceniu modułu Fakturownia wystawi fakturę w ciągu 24h i wyśle na podany e-mail. Dla firm z ważnym numerem VAT-UE stosujemy reverse-charge (faktura bez VAT, z adnotacją). Korekty faktur — bezpłatnie w ciągu 14 dni od wystawienia.",
  },
  {
    q: "Czy mogę dostać zwrot pieniędzy?",
    a: "Tak. W ciągu 14 dni od zakupu możesz odstąpić od umowy bez podawania przyczyny — pod warunkiem, że pismo nie zostało jeszcze pobrane w wersji finalnej. Zwrot na konto w ciągu 14 dni roboczych. Zgodnie z prawem konsumenckim UE.",
  },
  {
    q: "Co znaczy 'gwarancja korekty 30 dni'?",
    a: "Jeśli sąd zwróci pismo z powodu braku formalnego (np. brakuje podpisu, brak załącznika, błąd w sygnaturze), generujemy korektę za darmo w ciągu 30 dni od zakupu pierwotnego pisma. Gwarancja nie obejmuje błędów merytorycznych ani odrzucenia ze względów merytorycznych.",
  },
  {
    q: "Czy jest pakiet 'wszystko'?",
    a: "Nie. Z premedytacją — bo większość użytkowników potrzebuje 1-2 modułów, a nie 8. Pakiet komorniczy (199 zł) to wyjątek, bo skarga + ograniczenie + wyłączenie + zażalenie idą zwykle razem. Reszta — kupujesz pojedynczo, jak potrzebujesz.",
  },
  {
    q: "Czy płatność jest bezpieczna?",
    a: "Tak — pełna obsługa Stripe. Karta nigdy nie trafia do naszych serwerów. Akceptujemy Visa, Mastercard, BLIK i Apple/Google Pay. Wszystkie transakcje 3D Secure. Cennik w PLN brutto (zawiera 23% VAT). Faktura w ciągu 24h przez Fakturownię.",
  },
] as const;

export default function CennikPage() {
  return (
    <>
      {/* HERO */}
      <section className="tarcza-hero-gradient relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-dlugomat-500/20 blur-3xl"
        />
        <div className="container relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="info" withDot className="bg-white/10 text-white border-white/20">
              Bez abonamentu • Bez ukrytych kosztów
            </Badge>
            <h1 className="mt-4 text-balance text-fluid-5xl font-bold tracking-tight text-white">
              Płacisz tylko za pisma, które generujesz.
            </h1>
            <p className="mt-4 text-fluid-lg text-iron-200">
              Skaner pism — DARMOWE. Pojedyncze pismo procesowe — od 79 zł.
              Pakiet komorniczy (4 pisma) — 199 zł. Bez subskrypcji, bez abonamentu,
              bez kart przy rejestracji.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING GRID */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ITEMS.map((item) => {
            const isFree = item.price === "free";
            return (
              <Card
                key={item.code}
                elevation={item.highlight ? "pop" : "subtle"}
                className="flex h-full flex-col"
              >
                <CardHeader className="gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-dlugomat-100 px-2 py-0.5 font-mono text-fluid-xs font-bold uppercase tracking-wide text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
                      {item.code}
                    </span>
                    {item.highlight === "free" ? (
                      <Badge tone="success" withDot>
                        DARMOWE
                      </Badge>
                    ) : item.highlight === "popular" ? (
                      <Badge tone="info" withDot>
                        Popularne
                      </Badge>
                    ) : item.highlight === "best-value" ? (
                      <Badge tone="warning" withDot>
                        Najlepsza wartość
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-fluid-xl">{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    {isFree ? (
                      <span className="text-fluid-3xl font-bold text-accent-600 dark:text-accent-400">
                        0 zł
                      </span>
                    ) : (
                      <>
                        <span className="text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
                          {item.price}
                        </span>
                        <span className="text-fluid-lg font-semibold text-iron-600 dark:text-iron-300">
                          zł
                        </span>
                        <span className="ml-1 text-fluid-xs text-iron-500">brutto</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul role="list" className="flex flex-col gap-2">
                    {item.includes.map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-accent-600 dark:text-accent-400"
                          aria-hidden
                        />
                        <span className="text-fluid-sm text-iron-700 dark:text-iron-200">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-auto w-full">
                    <Link href={item.href}>
                      {isFree ? "Wczytaj pismo" : "Wybierz moduł"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-6 text-center text-fluid-xs text-iron-500">
          Wszystkie ceny w PLN, brutto (zawierają 23% VAT). Faktura wystawiana
          automatycznie w ciągu 24h.
        </p>
      </section>

      {/* COMPARISON */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Porównanie
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Długomat • Adwokat • Sam
            </h2>
            <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
              Każda z tych opcji ma swoje miejsce. Pokazujemy uczciwie, czym
              różnimy się od pozostałych.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-iron-200 bg-card dark:border-dlugomat-800">
            <table className="w-full text-fluid-sm">
              <thead className="bg-iron-100 dark:bg-dlugomat-900/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-iron-700 dark:text-iron-200">
                    Element
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-dlugomat-700 dark:text-dlugomat-200">
                    Długomat
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-iron-700 dark:text-iron-200">
                    Adwokat
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-iron-700 dark:text-iron-200">
                    Sam (wzory z netu)
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-iron-200 dark:border-dlugomat-800"
                  >
                    <td className="px-4 py-3 font-medium text-iron-800 dark:text-iron-100">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-dlugomat-700 dark:text-dlugomat-200">
                      {row.dlugomat}
                    </td>
                    <td className="px-4 py-3 text-iron-600 dark:text-iron-300">
                      {row.lawyer}
                    </td>
                    <td className="px-4 py-3 text-iron-600 dark:text-iron-300">
                      {row.diy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-fluid-xs text-iron-500">
            Długomat nie zastępuje kancelarii w sprawach skomplikowanych — w
            takich przypadkach kierujemy do partnerów.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-20 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Pytania o cenę
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Bez gwiazdek, bez druku 'mała czcionka'.
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="leading-relaxed">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 sm:py-24">
        <div className="tarcza-hero-gradient relative overflow-hidden rounded-2xl px-6 py-12 sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-2xl text-center text-white">
            <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-white sm:text-fluid-4xl">
              Zacznij od zera złotych.
            </h2>
            <p className="mt-3 text-fluid-base text-iron-200">
              D1 Skaner Nakazu pokaże, czy potrzebujesz pisma — i którego.
              Często okazuje się, że roszczenie jest przedawnione i nie musisz
              kupować nic poza skanem.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="success">
                <Link href="/skaner-nakazu">
                  Zeskanuj pismo — DARMOWE
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Link href="/moduly">Zobacz moduły</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
