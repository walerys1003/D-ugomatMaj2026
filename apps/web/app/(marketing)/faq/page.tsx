import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ — najczestsze pytania",
  description:
    "Odpowiedzi na pytania o cennik, bezpieczenstwo, zgodnosc z RODO, integracje i wsparcie. Wszystko czego potrzebujesz przed startem.",
  alternates: { canonical: "/faq" },
};

interface FAQItem {
  q: string;
  a: string;
}

interface FAQGroup {
  group: string;
  description: string;
  items: ReadonlyArray<FAQItem>;
}

const GROUPS: ReadonlyArray<FAQGroup> = [
  {
    group: "Cennik i platnosci",
    description: "Plany, faktury, zwroty.",
    items: [
      { q: "Czy plan darmowy ma jakies limity?", a: "Tak — 1 skan dokumentu, 1 wygenerowane pismo i 1 uzytkownik. Skaner nakazu jest zawsze darmowy, bez limitu prob." },
      { q: "Czy musze podpisac umowe?", a: "Nie. Korzystasz pay-per-use lub w cyklu miesiecznym. Mozesz zrezygnowac w kazdej chwili." },
      { q: "Czy wystawiacie faktury VAT?", a: "Tak, automatycznie po platnosci. Faktura zawiera NIP nabywcy z konta organizacji." },
      { q: "Jak dziala zwrot?", a: "Wnioskuj o zwrot w 14 dni od zakupu — przy braku uzycia 100% zwrot, przy uzyciu czesciowym proporcjonalnie." },
    ],
  },
  {
    group: "Bezpieczenstwo i RODO",
    description: "Dane, szyfrowanie, zgodnosc.",
    items: [
      { q: "Gdzie sa przechowywane moje dane?", a: "Polska (OVHcloud Warszawa) jako primary, replika w Frankfurcie. Zerowy transfer poza EOG bez zgody." },
      { q: "Czy mozecie udostepnic moje dane policji/prokuraturze?", a: "Tylko na podstawie nakazu sadowego. Zawsze informujemy uzytkownika, chyba ze prawo na to nie pozwala." },
      { q: "Czy posiadacie certyfikat ISO 27001?", a: "Tak, certyfikat 27001:2022 wydany przez PCBC. Kopia dostepna w sekcji bezpieczenstwa." },
      { q: "Jak dlugo trzymacie moje dane po usunieciu konta?", a: "30 dni soft delete + 7 dni backup retencji = 37 dni. Po tym okresie dane sa nieodwracalnie usuniete." },
    ],
  },
  {
    group: "Funkcje i uzycie",
    description: "Co dokladnie potrafi Dlugomat.",
    items: [
      { q: "Czy skaner rozpoznaje wszystkie typy nakazow?", a: "Tak — EPU, nakaz zaplaty w postepowaniu upominawczym, nakaz w postepowaniu nakazowym, tytul wykonawczy, wezwanie do zaplaty." },
      { q: "Czy AI moze sie pomylic?", a: "AI to asystent, nie zastepca prawnika. Kazde pismo mozna przeslac do weryfikacji prawnikowi za 99 zl." },
      { q: "Czy moge eksportowac swoje dane?", a: "Tak — ZIP z dokumentami, CSV z transakcjami i historia spraw. Pelny eksport zgodny z art. 20 RODO." },
      { q: "Czy mozna korzystac na komorce?", a: "Tak — interfejs jest w pelni responsywny. Mamy tez PWA, ktore mozna doinstalowac jako aplikacje." },
    ],
  },
  {
    group: "Integracje i API",
    description: "Polaczenie z innymi systemami.",
    items: [
      { q: "Jakie sa dostepne integracje?", a: "Salesforce, HubSpot, Okta, Azure AD, Slack, Microsoft Teams, Comarch ERP Optima, Symfonia, Looker Studio. Lista rosnie." },
      { q: "Czy macie publiczne API?", a: "Tak — REST + webhooks, dostepne w planach Pro+. Dokumentacja: docs.dlugomat.pl." },
      { q: "Czy mozecie zbudowac niestandardowa integracje?", a: "Dla planow Enterprise — tak, wycena indywidualna. Sredni czas wdrozenia 4-8 tygodni." },
    ],
  },
  {
    group: "Wsparcie",
    description: "Kontakt, SLA, szkolenia.",
    items: [
      { q: "Jaki jest czas odpowiedzi supportu?", a: "Solo: 48 h, Pro: 24 h, Kancelaria: 4 h, Enterprise: 1 h. SLA w godzinach roboczych (8-17)." },
      { q: "Czy oferujecie szkolenia online?", a: "Tak — bezplatne webinary co tydzien (czwartki 11:00). Dla Enterprise: dedykowane szkolenia w siedzibie." },
      { q: "Czy macie polskojezyczna pomoc?", a: "Tak. Wszystkie kanaly (mail, czat, telefon, webinary) prowadzone sa po polsku." },
    ],
  },
];

export default function FAQPage() {
  const totalQuestions = GROUPS.reduce((s, g) => s + g.items.length, 0);

  return (
    <div className="bg-background">
      <section className="border-b border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <HelpCircle className="mr-1 h-3 w-3" />
            FAQ
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-dlugomat-950 sm:text-5xl">
            Najczestsze pytania.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-iron-600">
            {totalQuestions} odpowiedzi w {GROUPS.length} kategoriach. Wszystko, czego potrzebujesz
            przed pierwszym uzyciem.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-10">
          {GROUPS.map((group) => (
            <section key={group.group} aria-labelledby={`g-${group.group}`}>
              <h2 id={`g-${group.group}`} className="font-display text-2xl text-dlugomat-950">
                {group.group}
              </h2>
              <p className="mt-1 text-sm text-iron-600">{group.description}</p>
              <div className="mt-5 space-y-3">
                {group.items.map((item, idx) => (
                  <details
                    key={item.q}
                    className="group rounded-md border border-iron-200 bg-white open:shadow-card"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-3 px-5 py-4 text-left font-medium text-dlugomat-950 marker:hidden hover:bg-iron-50/50 focus-visible:outline-none focus-visible:shadow-shield-focus">
                      <span>
                        <span className="mr-2 font-mono text-xs text-iron-500">
                          {idx + 1}.
                        </span>
                        {item.q}
                      </span>
                      <span className="mt-1 flex-none text-iron-400 transition-transform group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <div className="border-t border-iron-100 px-5 py-4 text-sm text-iron-700">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-lg border border-iron-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-dlugomat-950">Nie ma Twojego pytania?</h2>
          <p className="mt-2 text-iron-600">
            Napisz na support@dlugomat.pl — odpowiadamy w 24 h roboczo.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/kontakt">
                Skontaktuj sie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dokumentacja">Dokumentacja techniczna</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
