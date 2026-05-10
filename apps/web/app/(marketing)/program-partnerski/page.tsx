import type { Metadata } from "next";
import Link from "next/link";
import {
  Handshake,
  PiggyBank,
  Megaphone,
  CheckCircle2,
  Clock,
  Mail,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Program partnerski — poleć Długomat i zarabiaj",
  description:
    "Polecaj Długomat swoim klientom, czytelnikom, znajomym. 20% prowizji z każdego pierwszego zakupu, transparentne rozliczenia, panel partnera w przygotowaniu.",
  alternates: { canonical: "/program-partnerski" },
};

const TARGETS = [
  {
    Icon: Handshake,
    title: "Doradcy i prawnicy",
    desc: "Polecasz Długomat klientom, którzy nie chcą / nie mogą wynająć kancelarii za każdym razem. Ty zostawiasz sobie sprawy złożone — nasi użytkownicy generują typowe pisma sami.",
  },
  {
    Icon: Megaphone,
    title: "Twórcy treści",
    desc: "Prowadzisz blog, podcast, kanał YouTube o finansach osobistych, długach, prawie konsumenckim? Twoja publika to nasza grupa docelowa.",
  },
  {
    Icon: TrendingUp,
    title: "Organizacje pomocowe",
    desc: "Fundacje, NGO, miejskie punkty doradztwa obywatelskiego. Długomat jako narzędzie self-service uzupełniające Wasze konsultacje.",
  },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Zarejestruj się jako partner",
    desc: "Wypełnisz krótki formularz — wymagamy NIP / numeru organizacji + maila kontaktowego.",
  },
  {
    n: "02",
    title: "Dostajesz unikalny link",
    desc: "Wygenerujemy link tracking-aware (cookie 30 dni) + materiały marketingowe (banery, treść do mailingów).",
  },
  {
    n: "03",
    title: "Polecasz",
    desc: "Każda osoba, która kliknie link i opłaci pismo w ciągu 30 dni, jest przypisana do Ciebie.",
  },
  {
    n: "04",
    title: "Zarabiasz",
    desc: "20% od pierwszego zakupu każdego nowego klienta. Wypłaty miesięczne, faktura wystawiana przez Ciebie (B2B) lub umowa o dzieło.",
  },
];

const FAQ = [
  {
    q: "Ile dokładnie wynosi prowizja?",
    a: "20% od pierwszego zakupu każdego polecanego klienta. Przy średnim koszyku ~120 zł netto to ok. 24 zł netto za jedną konwersję.",
  },
  {
    q: "Czy prowizja dotyczy tylko pierwszego zakupu?",
    a: "W modelu MVP — tak. Po Tier 6 wprowadzimy revenue share (procent od kolejnych pism tego samego klienta przez 12 miesięcy).",
  },
  {
    q: "Jak długo żyje cookie polecenia?",
    a: "30 dni od kliknięcia w link partnerski. Jeśli klient w tym czasie założy konto i opłaci pismo — prowizja przypada Tobie.",
  },
  {
    q: "Jak wypłacane są środki?",
    a: "Miesięcznie, po zakończeniu okresu rozliczeniowego, po wystawieniu faktury / rachunku. Minimalna wypłata: 100 zł netto.",
  },
  {
    q: "Czy mogę reklamować Długomat w Google Ads?",
    a: "Tak, ale nie na hasłach brandowych (\"Długomat\", \"dlugomat.pl\") — to kanibalizuje nasz własny ruch. Na hasłach generic (np. \"sprzeciw od nakazu zapłaty\") — proszę bardzo.",
  },
];

export default function ProgramPartnerskiPage() {
  return (
    <article className="container py-16 lg:py-24">
      {/* Hero */}
      <header className="mx-auto max-w-3xl text-center">
        <Badge tone="warning" withDot>
          Program w przygotowaniu
        </Badge>
        <h1 className="mt-4 text-fluid-h1 font-semibold tracking-tight text-iron-900 dark:text-white">
          Program partnerski Długomatu
        </h1>
        <p className="mt-4 text-fluid-md text-iron-600 dark:text-iron-300">
          Polecasz Długomat — dostajesz 20% od pierwszego zakupu każdego polecanego klienta.
          Bez ukrytych warunków, bez minimalnych wolumenów, bez exclusivity.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-fluid-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
          <Clock className="h-3.5 w-3.5" />
          Start programu: czerwiec 2026. Zostaw e-mail — odezwiemy się jako pierwszy.
        </div>
      </header>

      {/* Wstępne zapisy CTA */}
      <section className="mx-auto mt-12 max-w-2xl">
        <Card elevation="pop">
          <CardHeader>
            <CardTitle>Zapisz się na listę pre-launch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
              Wyślij wiadomość na{" "}
              <a className="font-semibold text-dlugomat-700 underline dark:text-dlugomat-300" href="mailto:partnerstwa@dlugomat.pl?subject=Program%20partnerski%20%E2%80%94%20zapis%20na%20pre-launch">
                partnerstwa@dlugomat.pl
              </a>{" "}
              z tematem &bdquo;Program partnerski&rdquo; i krótkim opisem (kim jesteś,
              jaką masz publikę / klientelę). Odpowiadamy w ciągu 3 dni roboczych.
            </p>
            <p className="mt-4 text-fluid-xs text-iron-500">
              Zapisanie na listę nie jest jeszcze umową — formalne warunki dostaniesz
              w momencie startu programu.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="mailto:partnerstwa@dlugomat.pl?subject=Program%20partnerski%20%E2%80%94%20zapis%20na%20pre-launch">
                  <Mail className="mr-2 h-4 w-4" />
                  Napisz do nas
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/jak-to-dziala">Jak działa Długomat</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dla kogo */}
      <section className="mt-20">
        <h2 className="text-center text-fluid-h2 font-semibold text-iron-900 dark:text-white">
          Dla kogo to ma sens
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TARGETS.map(({ Icon, title, desc }) => (
            <Card key={title} elevation="subtle">
              <CardHeader>
                <Icon className="h-6 w-6 text-dlugomat-700 dark:text-dlugomat-300" />
                <CardTitle className="mt-3 text-fluid-h4">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fluid-sm text-iron-600 dark:text-iron-300">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Jak to działa */}
      <section className="mt-20">
        <h2 className="text-center text-fluid-h2 font-semibold text-iron-900 dark:text-white">
          Jak to działa
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ n, title, desc }) => (
            <Card key={n} elevation="flat" className="border-iron-200 dark:border-dlugomat-800">
              <CardHeader>
                <span className="font-mono text-fluid-h2 text-dlugomat-300 dark:text-dlugomat-700">
                  {n}
                </span>
                <CardTitle className="text-fluid-h4">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-fluid-sm text-iron-600 dark:text-iron-300">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Warunki */}
      <section className="mt-20 mx-auto max-w-3xl">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-dlugomat-700 dark:text-dlugomat-300" />
              Warunki finansowe (wstępne)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-fluid-sm text-iron-700 dark:text-iron-200">
              {[
                "Prowizja: 20% netto od pierwszego zakupu każdego polecanego klienta.",
                "Cookie attribution: 30 dni od kliknięcia w link partnerski.",
                "Rozliczenia miesięczne, po zakończeniu okresu (do 15. dnia kolejnego miesiąca).",
                "Minimalna wypłata: 100 zł netto. Środki poniżej kumulują się do następnego okresu.",
                "Forma rozliczenia: faktura B2B / rachunek do umowy o dzieło — ustalamy indywidualnie.",
                "Brak exclusivity — możesz równolegle polecać konkurencyjne narzędzia.",
                "Zakaz reklamy na hasłach brandowych Długomatu (kanibalizacja własnego ruchu).",
                "Zakaz spamu — naruszenie skutkuje natychmiastowym zakończeniem współpracy bez wypłaty.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mt-20 mx-auto max-w-3xl">
        <h2 className="text-center text-fluid-h2 font-semibold text-iron-900 dark:text-white">
          Najczęstsze pytania
        </h2>
        <div className="mt-10 space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-iron-200 bg-white p-5 transition-colors open:bg-iron-50 dark:border-dlugomat-800 dark:bg-dlugomat-950 dark:open:bg-dlugomat-900/40"
            >
              <summary className="cursor-pointer list-none text-fluid-md font-semibold text-iron-900 marker:hidden dark:text-white">
                <span className="flex items-start justify-between gap-3">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 h-5 w-5 shrink-0 rounded-full border border-iron-300 text-center text-iron-500 transition-transform group-open:rotate-45 dark:border-dlugomat-700 dark:text-iron-300"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-fluid-sm text-iron-600 dark:text-iron-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-20 rounded-xl bg-dlugomat-900 p-10 text-center text-white">
        <h2 className="text-fluid-h2 font-semibold">Gotowy/a, żeby polecać Długomat?</h2>
        <p className="mx-auto mt-3 max-w-xl text-fluid-sm text-iron-300">
          Zostaw nam e-mail z krótkim opisem siebie — odpowiemy w 3 dni roboczych
          i wyślemy formalne warunki, kiedy program ruszy.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" asChild>
            <a href="mailto:partnerstwa@dlugomat.pl?subject=Program%20partnerski%20%E2%80%94%20zapis%20na%20pre-launch">
              <Mail className="mr-2 h-4 w-4" />
              partnerstwa@dlugomat.pl
            </a>
          </Button>
        </div>
      </section>
    </article>
  );
}
