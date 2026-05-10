import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Shield, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kontakt — Długomat",
  description:
    "Skontaktuj się z zespołem Długomatu. Wsparcie użytkowników, pytania o moduły, sprawy RODO. Odpowiadamy w ciągu 24h roboczych.",
  alternates: { canonical: "/kontakt" },
};

interface ContactChannel {
  icon: typeof Mail;
  title: string;
  email: string;
  desc: string;
  sla: string;
}

const CHANNELS: readonly ContactChannel[] = [
  {
    icon: Mail,
    title: "Wsparcie użytkowników",
    email: "pomoc@dlugomat.pl",
    desc: "Pytania o moduły, problemy z generowaniem pism, sprawy płatności i faktur. Najczęstszy kanał.",
    sla: "Odpowiedź w 24h roboczych",
  },
  {
    icon: Shield,
    title: "Inspektor Ochrony Danych (IOD)",
    email: "iod@dlugomat.pl",
    desc: "Sprawy RODO: dostęp do danych (art. 15), sprostowanie (art. 16), usunięcie (art. 17), portowalność (art. 20), sprzeciw (art. 21).",
    sla: "Odpowiedź w 30 dni (RODO)",
  },
  {
    icon: MessageCircle,
    title: "Współpraca i partnerstwa",
    email: "kontakt@dlugomat.pl",
    desc: "Kancelarie, fundacje pomocowe, programy edukacyjne, integracje API. Zapraszamy do rozmowy.",
    sla: "Odpowiedź w 3-5 dni roboczych",
  },
] as const;

export default function KontaktPage() {
  return (
    <>
      {/* HERO */}
      <section className="tarcza-hero-gradient relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[40rem] w-[40rem] rounded-full bg-dlugomat-500/20 blur-3xl"
        />
        <div className="container relative py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="info" withDot className="bg-white/10 text-white border-white/20">
              Kontakt
            </Badge>
            <h1 className="mt-4 text-balance text-fluid-5xl font-bold tracking-tight text-white">
              Słuchamy. Czytamy. Odpowiadamy.
            </h1>
            <p className="mt-4 text-fluid-lg text-iron-200">
              Jeden zespół, trzy adresy, jasne SLA. Wybierz kanał odpowiedni do
              Twojej sprawy — odpowiemy szybciej niż średnia branżowa.
            </p>
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="container py-16 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.email} elevation="subtle" className="flex h-full flex-col">
                <CardHeader>
                  <span className="inline-flex size-10 items-center justify-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle className="mt-3 text-fluid-lg">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                    {c.desc}
                  </p>
                  <div className="mt-auto flex flex-col gap-2 border-t border-iron-100 pt-4 dark:border-dlugomat-800">
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-2 rounded-md text-fluid-base font-semibold text-dlugomat-700 transition-colors hover:text-dlugomat-600 focus-visible:shadow-shield-focus focus-visible:outline-none dark:text-dlugomat-200"
                    >
                      <Mail className="size-4" aria-hidden />
                      {c.email}
                    </a>
                    <span className="inline-flex items-center gap-1.5 text-fluid-xs text-iron-500">
                      <Clock className="size-3.5" aria-hidden />
                      {c.sla}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* COMPANY DETAILS */}
      <section className="bg-iron-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container max-w-3xl">
          <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Dane rejestrowe
          </h2>
          <div className="mt-8 rounded-xl border border-iron-200 bg-card p-6 sm:p-8 dark:border-dlugomat-800">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Podmiot prowadzący serwis
                </dt>
                <dd className="mt-1 text-fluid-base text-iron-800 dark:text-iron-100">
                  Długomat sp. z o.o.
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Adres
                </dt>
                <dd className="mt-1 text-fluid-base text-iron-800 dark:text-iron-100">
                  ul. Przykładowa 1<br />
                  00-001 Warszawa
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  NIP
                </dt>
                <dd className="mt-1 font-mono text-fluid-base text-iron-800 dark:text-iron-100">
                  000-000-00-00
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  KRS
                </dt>
                <dd className="mt-1 font-mono text-fluid-base text-iron-800 dark:text-iron-100">
                  0000000000
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  REGON
                </dt>
                <dd className="mt-1 font-mono text-fluid-base text-iron-800 dark:text-iron-100">
                  000000000
                </dd>
              </div>
              <div>
                <dt className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                  Kapitał zakładowy
                </dt>
                <dd className="mt-1 text-fluid-base text-iron-800 dark:text-iron-100">
                  5 000 zł
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-lg border border-iron-100 bg-iron-50 p-4 text-fluid-sm text-iron-600 dark:border-dlugomat-800 dark:bg-dlugomat-900/40 dark:text-iron-300">
              <strong className="text-dlugomat-900 dark:text-iron-50">
                Uwaga:
              </strong>{" "}
              Długomat nie jest kancelarią prawną w rozumieniu Prawa o adwokaturze
              ani ustawy o radcach prawnych. Świadczymy usługi technologiczne —
              generujemy wzory pism procesowych przy użyciu AI. Każde pismo
              weryfikujesz osobiście przed wysyłką.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ MINI */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Zanim napiszesz
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Najszybsze odpowiedzi.
            </h2>
          </div>

          <div className="space-y-5 text-fluid-base leading-relaxed text-iron-700 dark:text-iron-200">
            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Mam pytanie o moduł lub generowanie pisma
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Najszybciej —{" "}
                <a
                  href="mailto:pomoc@dlugomat.pl"
                  className="font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                >
                  pomoc@dlugomat.pl
                </a>
                . Dołącz numer sprawy z panelu (jeśli już ją rozpocząłeś) i
                dokładny opis problemu.
              </p>
            </div>

            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Chcę usunąć konto / pobrać swoje dane
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Najszybciej — w panelu, zakładka{" "}
                <Link
                  href="/panel/ustawienia/rodo"
                  className="font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                >
                  Ustawienia → RODO
                </Link>
                . Eksport danych (art. 20) i usunięcie konta (art. 17) odbywa się
                tam jednym kliknięciem. Pisemnie:{" "}
                <a
                  href="mailto:iod@dlugomat.pl"
                  className="font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                >
                  iod@dlugomat.pl
                </a>
                .
              </p>
            </div>

            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Mam fakturę z błędnymi danymi
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Korekty faktur — w ciągu 14 dni od wystawienia, bezpłatnie.
                Napisz na{" "}
                <a
                  href="mailto:pomoc@dlugomat.pl"
                  className="font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                >
                  pomoc@dlugomat.pl
                </a>{" "}
                z numerem faktury i poprawnymi danymi.
              </p>
            </div>

            <div className="rounded-xl border border-iron-200 bg-card p-5 dark:border-dlugomat-800">
              <h3 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                Sprawa pilna — termin sądowy w ciągu 48h
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                Pełen proces w Długomacie to średnio 12 minut. W większości
                przypadków zdążysz bez kontaktu z nami. Jeżeli coś blokuje
                generowanie — wpisz w temat maila "PILNE — termin DD.MM" na adres{" "}
                <a
                  href="mailto:pomoc@dlugomat.pl"
                  className="font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
                >
                  pomoc@dlugomat.pl
                </a>
                . Maile z tym oznaczeniem czytamy z najwyższym priorytetem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 sm:py-24">
        <div className="tarcza-hero-gradient relative overflow-hidden rounded-2xl px-6 py-12 sm:px-12 sm:py-16">
          <div className="relative mx-auto max-w-2xl text-center text-white">
            <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-white sm:text-fluid-4xl">
              Może wystarczy zacząć od skanu?
            </h2>
            <p className="mt-3 text-fluid-base text-iron-200">
              D1 Skaner Nakazu — DARMOWE. Zwykle to wystarcza, żeby wiedzieć,
              jaką ścieżką iść — albo czy w ogóle czegoś potrzebujesz.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="success">
                <Link href="/skaner-nakazu">
                  Wczytaj pismo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
