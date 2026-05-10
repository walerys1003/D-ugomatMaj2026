import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  ScanLine,
  Sparkles,
  FileDown,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Jak działa Długomat — od skanu do gotowego pisma w 12 minut",
  description:
    "Cztery kroki: wczytaj pismo, OCR rozpozna treść, AI zbuduje pismo procesowe, pobierz PDF. Zgodność z KPC, walidacja Haiku 4.5, dane w UE.",
  alternates: { canonical: "/jak-to-dziala" },
};

const STEPS = [
  {
    icon: Upload,
    n: 1,
    title: "Wczytaj dokument",
    short: "Zdjęcie aparatem albo PDF — plik nigdy nie opuszcza serwerów w UE.",
    long: "Akceptujemy zdjęcia z telefonu (JPG, HEIC), skany (PDF) i pisma elektroniczne. Plik trafia do zaszyfrowanego storage'u Supabase w regionie eu-central-1. Po 30 dniach od ostatniej aktywności jest automatycznie usuwany. Limit rozmiaru: 10 MB. Dla pism wielostronicowych — pełen plik PDF z OCR-em każdej strony.",
  },
  {
    icon: ScanLine,
    n: 2,
    title: "OCR rozpozna treść",
    short: "Wyciągniemy sygnaturę, kwotę, datę, wierzyciela i podstawę roszczenia.",
    long: "Tesseract dla skanów dobrej jakości i AWS Textract dla pism trudniejszych. Algorytm rozpoznaje: typ pisma (nakaz EPU / nakaz upominawczy / pismo komornika / raport BIK), strony procesu, kwoty (kapitał / odsetki / koszty), terminy procesowe, sygnatury akt. Po OCR widzisz wszystkie wyciągnięte dane i możesz je skorygować w jednym kroku.",
  },
  {
    icon: Sparkles,
    n: 3,
    title: "AI zbuduje pismo",
    short: "Claude Sonnet 4.5 z bazą orzeczeń SN przygotuje pismo zgodne z KPC.",
    long: "Generator pracuje na podstawie Twoich odpowiedzi z kreatora i wyciągniętych danych. Każde pismo wykorzystuje aktualne orzecznictwo Sądu Najwyższego i sądów apelacyjnych. Walidator Haiku 4.5 sprawdza kompletność i spójność — przy niskim wyniku następuje automatyczny retry z korektami. Średni czas generowania: 90-120 sekund.",
  },
  {
    icon: FileDown,
    n: 4,
    title: "Pobierz PDF i wyślij",
    short: "Pismo z miejscem na podpis, listą załączników i adresem sądu.",
    long: "Dokument w formacie sądowym A4 z odpowiednią czcionką, marginesami i strukturą. Załączniki listowane numerycznie. Adres sądu / komornika / banku wpisany automatycznie z bazy. Pismo wysyłasz pocztą (list polecony) lub przez ePUAP — instrukcja dołączona do PDF.",
  },
] as const;

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Zgodność z KPC i orzecznictwem",
    desc: "Wzory pism aktualizowane przy każdej zmianie przepisów. Powołania na konkretne sygnatury SN i SA. Walidacja merytoryczna w bazie wiedzy aktualizowanej co kwartał.",
  },
  {
    icon: CheckCircle2,
    title: "Walidacja na trzech poziomach",
    desc: "Generator (Claude Sonnet 4.5) → walidator (Haiku 4.5) → szablon ekspercki jako fallback. Nigdy nie wygenerujesz pustego ani niekompletnego pisma.",
  },
  {
    icon: Clock,
    title: "Mierzony czas, znany rezultat",
    desc: "12 minut średnio od pierwszego kliknięcia do PDF. 5 minut OCR + formularz, 90 sekund generowanie, 5 minut weryfikacja przez Ciebie.",
  },
] as const;

const FAQ = [
  {
    q: "Czy AI może popełnić błąd?",
    a: "Każdy model AI może. Dlatego mamy trzy poziomy zabezpieczeń: walidator (drugi model), automatyczny retry przy niskim wyniku oraz szablon ekspercki jako fallback. Co więcej — każde pismo weryfikujesz przed wysyłką osobiście. Pełna kontrola po Twojej stronie.",
  },
  {
    q: "Jakie modele AI używacie i dlaczego?",
    a: "Claude Sonnet 4.5 do generowania (najwyższa jakość argumentacji prawnej w językach europejskich), Claude Haiku 4.5 do walidacji (szybki i tani — sprawdza kompletność), Claude Opus 4.5 do trudnych przypadków (analiza skomplikowanej cesji, ustalenie momentu wymagalności w pożyczkach pakietowych).",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Tak. TLS 1.3 in-transit, AES-256 at-rest. Storage w UE (Supabase eu-central-1). Row-Level Security z FORCE — żaden inny użytkownik (ani my) nie ma dostępu do Twoich dokumentów bez Twojej zgody. PESEL maskowany w logach. Pełna zgodność z RODO — możesz w każdej chwili pobrać swoje dane (art. 20) lub usunąć konto (art. 17).",
  },
  {
    q: "Dlaczego tak tanio?",
    a: "Bo automatyzujemy 90% pracy, którą wcześniej robił prawnik. AI generuje pismo w 90 sekund. My płacimy za API kilka groszy. Zostaje wartość naszej bazy wiedzy, walidacji i wzorów. Adwokat za sprzeciw EPU bierze 1500-3000 zł — my 159 zł. Różnica nie jest w jakości pisma, tylko w kosztach struktury.",
  },
  {
    q: "Co jeśli pismo zostanie odrzucone przez sąd?",
    a: "Walidator sprawdza kompletność każdego pisma — sygnatury, daty, kwoty, podpisy, załączniki. Jeśli sąd zwróci pismo z powodu braku formalnego, wygenerujemy korektę za darmo (gwarancja 30 dni). Jeżeli odrzucenie wynika z merytoryki — to oznacza, że spór wymagał innego podejścia, a nie błędu w piśmie. W takich sytuacjach kierujemy do współpracującej kancelarii.",
  },
  {
    q: "Czy potrzebuję komputera?",
    a: "Nie. 70% naszych użytkowników kończy proces na telefonie. Aparat zastępuje skaner, formularz jest mobile-first, PDF pobierasz na telefon i drukujesz w punkcie ksero (lub wysyłasz mailem do sądu). Dla osób bez drukarki dostępna jest też wysyłka przez ePUAP.",
  },
] as const;

export default function JakToDzialaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* HERO */}
      <section className="tarcza-hero-gradient relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-dlugomat-500/20 blur-3xl"
        />
        <div className="container relative py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="info" withDot className="bg-white/10 text-white border-white/20">
              4 kroki — 12 minut średnio
            </Badge>
            <h1 className="mt-4 text-balance text-fluid-5xl font-bold tracking-tight text-white">
              Bez prawnika, bez kolejek, bez paniki.
            </h1>
            <p className="mt-4 text-fluid-lg text-iron-200">
              Każde pismo procesowe składa się z tych samych elementów: dane stron,
              opis sytuacji, zarzuty, wnioski, podpis, załączniki. Długomat
              automatyzuje 90% tej pracy — a Ty zachowujesz pełną kontrolę.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

      {/* STEPS — szczegóły */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Jak to działa
          </p>
          <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Cztery kroki, bez ukrytych etapów.
          </h2>
        </div>

        <div className="mt-12 flex flex-col gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.n} elevation="subtle">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-dlugomat-600 text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-fluid-xs font-bold uppercase tracking-wide text-dlugomat-600">
                        Krok {step.n}
                      </span>
                      <CardTitle className="text-fluid-2xl">{step.title}</CardTitle>
                      <p className="text-fluid-base text-iron-700 dark:text-iron-200">
                        {step.short}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-fluid-sm leading-relaxed text-iron-600 dark:text-iron-300">
                    {step.long}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Zasady
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Trzy zasady, których nie łamiemy.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => {
              const Icon = p.icon;
              return (
                <Card key={i} elevation="subtle">
                  <CardHeader>
                    <span className="inline-flex size-10 items-center justify-center rounded-md bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="mt-3 text-fluid-lg">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                      {p.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE — co dzieje się po wysyłce */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Po wysyłce
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Co się dzieje, kiedy pismo dotrze do sądu?
            </h2>
          </div>

          <ol className="mt-12 flex flex-col gap-6 border-l-2 border-dlugomat-200 pl-6 dark:border-dlugomat-800">
            {[
              {
                day: "Dzień 1-3",
                title: "Doręczenie pisma",
                desc: "List polecony lub ePUAP. W EPU sprzeciw można wnieść elektronicznie — system od razu generuje potwierdzenie.",
              },
              {
                day: "Dzień 7-14",
                title: "Zatwierdzenie wpływu",
                desc: "Sąd / komornik / bank wpisuje pismo do księgi pism wpływających i nadaje mu dalszy bieg.",
              },
              {
                day: "Tydzień 2-4",
                title: "Pierwsza reakcja",
                desc: "W sprzeciwie EPU: postanowienie o utracie mocy nakazu i przekazaniu sprawy do sądu rejonowego. W sprawach komorniczych: postanowienie o uwzględnieniu / oddaleniu skargi.",
              },
              {
                day: "Miesiąc 2-6",
                title: "Sprawa po stronie powoda",
                desc: "W EPU: powód (fundusz / bank) musi uzupełnić braki formalne pozwu. Często sprawa się tu zatrzymuje — bo fundusz nie ma pełnej dokumentacji.",
              },
              {
                day: "Miesiąc 6-18",
                title: "Rozprawa lub umorzenie",
                desc: "Jeśli powód uzupełni dokumentację — odbywa się rozprawa. Jeśli nie — sąd umarza postępowanie. Statystycznie ok. 35-40% spraw funduszy upada przed rozprawą.",
              },
            ].map((step, i) => (
              <li key={i} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[31px] top-2 size-3.5 rounded-full border-2 border-dlugomat-600 bg-background"
                />
                <p className="font-mono text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600">
                  {step.day}
                </p>
                <h3 className="mt-1 text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                  {step.title}
                </h3>
                <p className="mt-1 text-fluid-sm text-iron-600 dark:text-iron-300">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container max-w-3xl">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Pytania techniczne
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Pod maską — bez tajemnic.
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
              Wystarczy zeskanować pierwsze pismo.
            </h2>
            <p className="mt-3 text-fluid-base text-iron-200">
              D1 Skaner Nakazu jest darmowy. Bez konta z karty. Bez abonamentu.
              W 2 minuty wiesz, na czym stoisz.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="success">
                <Link href="/skaner-nakazu">
                  Rozpocznij teraz
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Link href="/moduly">Wszystkie moduły</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
