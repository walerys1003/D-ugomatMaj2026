import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileDown, Trash2, Eye, Edit, Ban, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingPageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "RODO — Twoje prawa w Długomacie",
  description:
    "Pełna lista praw przysługujących Ci na podstawie RODO: dostęp (art. 15), sprostowanie (art. 16), usunięcie (art. 17), ograniczenie (art. 18), portowalność (art. 20), sprzeciw (art. 21).",
  alternates: { canonical: "/rodo" },
};

interface RodoRight {
  icon: typeof Shield;
  article: string;
  title: string;
  desc: string;
  action: string;
  href?: string;
}

const RIGHTS: readonly RodoRight[] = [
  {
    icon: Eye,
    article: "Art. 15",
    title: "Prawo dostępu",
    desc: "Możesz zażądać kopii wszystkich danych, które o Tobie przetwarzamy: dane konta, sprawy, pisma, płatności, logi.",
    action: "Pobierz JSON z panelu",
    href: "/panel/ustawienia/rodo",
  },
  {
    icon: Edit,
    article: "Art. 16",
    title: "Prawo do sprostowania",
    desc: "Jeżeli Twoje dane są nieprawidłowe lub niekompletne — możesz je poprawić w panelu lub żądać korekty od IOD.",
    action: "Edytuj w panelu",
    href: "/panel/ustawienia",
  },
  {
    icon: Trash2,
    article: "Art. 17",
    title: "Prawo do usunięcia ('bycia zapomnianym')",
    desc: "Możesz w każdej chwili usunąć konto i wszystkie powiązane dane. Wyjątek: dokumenty księgowe (5 lat — wymóg podatkowy).",
    action: "Usuń konto",
    href: "/panel/ustawienia/rodo",
  },
  {
    icon: Ban,
    article: "Art. 18",
    title: "Prawo do ograniczenia przetwarzania",
    desc: "Możesz zażądać oznaczenia danych jako 'spornych' na czas weryfikacji ich prawidłowości.",
    action: "Napisz do IOD",
  },
  {
    icon: FileDown,
    article: "Art. 20",
    title: "Prawo do przenoszenia danych",
    desc: "Otrzymasz swoje dane w ustrukturyzowanym, powszechnie używanym formacie (JSON) — możesz je przenieść do innego administratora.",
    action: "Eksportuj JSON",
    href: "/panel/ustawienia/rodo",
  },
  {
    icon: Shield,
    article: "Art. 21",
    title: "Prawo sprzeciwu",
    desc: "Możesz wnieść sprzeciw wobec przetwarzania na podstawie uzasadnionego interesu administratora (art. 6 ust. 1 lit. f RODO).",
    action: "Napisz do IOD",
  },
] as const;

export default function RodoPage() {
  return (
    <>
      {/* HERO — Tarcza v4 unified */}
      <MarketingPageHero
        eyebrow="RODO"
        title="Twoje dane są Twoje. Bez gwiazdek."
        subtitle="Pełna lista uprawnień, które przysługują Ci na mocy Rozporządzenia 2016/679 (RODO) — i dokładnie pokazane miejsce, gdzie z każdego z nich skorzystasz."
      />

      {/* RIGHTS */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Twoje prawa
          </p>
          <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Sześć praw — każde w panelu albo jednym mailem.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RIGHTS.map((right) => {
            const Icon = right.icon;
            return (
              <Card
                key={right.article}
                elevation="subtle"
                className="flex h-full flex-col"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <Badge tone="neutral">{right.article}</Badge>
                  </div>
                  <CardTitle className="mt-3 text-fluid-lg">{right.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                    {right.desc}
                  </p>
                  <div className="mt-auto">
                    {right.href ? (
                      <Button asChild size="sm" variant="secondary" className="w-full">
                        <Link href={right.href}>
                          {right.action}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="secondary" className="w-full">
                        <a href="mailto:iod@dlugomat.pl">
                          {right.action}
                          <ArrowRight className="size-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* IOD CONTACT */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container max-w-3xl">
          <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Inspektor Ochrony Danych (IOD)
          </h2>
          <p className="mt-3 text-fluid-base text-iron-700 dark:text-iron-200">
            We wszystkich sprawach dotyczących przetwarzania danych osobowych
            możesz kontaktować się bezpośrednio z naszym Inspektorem Ochrony
            Danych. IOD odpowiada w terminie maksymalnie 30 dni — wymóg z art.
            12 ust. 3 RODO.
          </p>

          <div className="mt-8 rounded-xl border border-iron-200 bg-card p-6 dark:border-dlugomat-800">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Adres e-mail
                </dt>
                <dd className="mt-1">
                  <a
                    href="mailto:iod@dlugomat.pl"
                    className="text-fluid-base font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                  >
                    iod@dlugomat.pl
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Adres korespondencyjny
                </dt>
                <dd className="mt-1 text-fluid-base text-iron-800 dark:text-iron-100">
                  Długomat sp. z o.o.
                  <br />
                  IOD
                  <br />
                  ul. Przykładowa 1, 00-001 Warszawa
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* SUPERVISORY AUTHORITY */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Skarga do organu nadzorczego
          </h2>
          <p className="mt-3 text-fluid-base text-iron-700 dark:text-iron-200">
            Jeżeli uważasz, że przetwarzamy Twoje dane z naruszeniem przepisów —
            masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych
            (PUODO). Procedura jest bezpłatna, a UODO ma kompetencje do
            nakazania korekty oraz nałożenia kary administracyjnej.
          </p>

          <div className="mt-8 rounded-xl border border-iron-200 bg-card p-6 dark:border-dlugomat-800">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Urząd
                </dt>
                <dd className="mt-1 text-fluid-base text-iron-800 dark:text-iron-100">
                  Urząd Ochrony Danych Osobowych
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Strona
                </dt>
                <dd className="mt-1">
                  <a
                    href="https://uodo.gov.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fluid-base font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                  >
                    uodo.gov.pl
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Adres
                </dt>
                <dd className="mt-1 text-fluid-base text-iron-800 dark:text-iron-100">
                  ul. Stawki 2<br />
                  00-193 Warszawa
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Telefon
                </dt>
                <dd className="mt-1 font-mono text-fluid-base text-iron-800 dark:text-iron-100">
                  +48 22 531 03 00
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* BASICS */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container max-w-3xl">
          <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Najważniejsze fakty
          </h2>

          <div className="mt-8 space-y-5 text-fluid-base leading-relaxed text-iron-700 dark:text-iron-200">
            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Gdzie są moje dane?
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                W całości na serwerach Supabase w regionie Frankfurt
                (eu-central-1). Bez transferu poza Europejski Obszar
                Gospodarczy. Wyjątek: zapytania do modeli AI Anthropic
                przekazywane są na serwery USA na podstawie standardowych
                klauzul umownych (SCC) i programu Data Privacy Framework.
              </p>
            </div>

            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Jak są chronione?
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Szyfrowanie TLS 1.3 in-transit, AES-256 at-rest. Row-Level
                Security z trybem FORCE — ani inny użytkownik, ani my (bez
                Twojej zgody) nie mamy dostępu do Twoich pism. PESEL maskowany
                w logach i audycie (XXX*****1234).
              </p>
            </div>

            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Jak długo są przechowywane?
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Dane konta — przez okres istnienia konta. Dokumenty (skany,
                pisma) — domyślnie 30 dni od ostatniej aktywności w sprawie,
                potem automatycznie usuwane. Dokumenty księgowe (faktury) — 5
                lat zgodnie z prawem podatkowym. Po usunięciu konta wszystkie
                pozostałe dane są nieodwracalnie usuwane.
              </p>
            </div>

            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Czy używacie cookies?
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Tylko niezbędne (sesja, CSRF, ustawienia bezpieczeństwa).
                Cookies analityczne i marketingowe — wyłącznie po Twojej
                wyraźnej zgodzie (opt-in, nie opt-out). Pełna lista i kontrola
                w banerze cookies przy pierwszej wizycie.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/polityka-prywatnosci">
                Pełna Polityka Prywatności
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
