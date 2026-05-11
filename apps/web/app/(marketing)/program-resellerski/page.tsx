/**
 * Tier 35 — Program resellerski Długomata.
 *
 * Strona dla firm chcących sprzedawać Długomata pod własną marką
 * lub w pakiecie z usługami kancelaryjnymi. Source: POST /api/marketplace/reseller.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Program resellerski — Długomat",
  description:
    "Sprzedawaj Długomata pod własną marką. White-label, revenue share 50/50, dedykowany account manager, customizacja UI.",
  alternates: { canonical: "/program-resellerski" },
};

const TIERS = [
  {
    name: "Starter",
    revenueShare: "30%",
    minVolume: "10 kont",
    features: [
      "Standardowy branding Długomata",
      "Co-marketing materials",
      "Wspólny dashboard sprzedażowy",
      "Email support priority",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    revenueShare: "40%",
    minVolume: "50 kont",
    features: [
      "Custom subdomena (klient.dlugomat.pl)",
      "Twoje logo w nagłówku panelu",
      "Dedykowany account manager",
      "Priorytetowy onboarding klientów",
      "Materiały szkoleniowe pod marką partnera",
    ],
    highlight: true,
  },
  {
    name: "Enterprise White-Label",
    revenueShare: "50%",
    minVolume: "200 kont",
    features: [
      "Pełny white-label (Twoja domena + branding)",
      "Custom color scheme i typografia",
      "Własna domena email do powiadomień",
      "API revenue share dla Twoich integracji",
      "SLA 99.95% + dedykowany SRE",
      "Roadmap influence",
    ],
    highlight: false,
  },
];

export default function ResellerProgramPage() {
  return (
    <div className="bg-white pb-20 dark:bg-dlugomat-950">
      {/* Hero */}
      <section className="container py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
            <span className="h-px w-8 bg-dlugomat-600" />
            Program resellerski · White-label
          </p>
          <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-iron-50">
            Sprzedawaj Długomata. Pod własną marką.
          </h1>
          <p className="mt-5 text-fluid-lg leading-relaxed text-iron-700 dark:text-iron-200">
            Dla kancelarii, software houses i agencji prawnych, które chcą zaoferować
            klientom premium narzędzie do pism procesowych — bez budowania własnego
            zespołu dev i bez wydatku 2-3 milionów na R&D.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="primary">
              <Link href="#zgloszenie">Wyślij zgłoszenie</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/kontakt?temat=reseller">Umów demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dlaczego */}
      <section className="container py-12">
        <h2 className="mb-10 font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
          Dlaczego resellerzy wybierają Długomata
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card elevation="subtle">
            <CardContent className="space-y-3 p-6">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-700 dark:text-dlugomat-400">
                3 lata
              </p>
              <h3 className="font-display text-fluid-lg font-semibold">Time-to-market: 0</h3>
              <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                Tyle czasu i ~2,5 mln PLN zaoszczędzasz, nie budując własnego silnika
                AI do pism procesowych. Aktywacja u Ciebie w 14 dni.
              </p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="space-y-3 p-6">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-700 dark:text-dlugomat-400">
                50/50
              </p>
              <h3 className="font-display text-fluid-lg font-semibold">Najwyższy revenue share w branży</h3>
              <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                Enterprise White-Label = 50% z każdej subskrypcji. Konkurencja oferuje
                15-25%. Skalujesz biznes, nie hostowanie.
              </p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="space-y-3 p-6">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-700 dark:text-dlugomat-400">
                100%
              </p>
              <h3 className="font-display text-fluid-lg font-semibold">Pełna zgodność RODO + AI Act</h3>
              <p className="text-fluid-sm text-iron-600 dark:text-iron-300">
                Hosting wyłącznie w UE. Audyt SOC 2 Type II. AI Act compliance pełna —
                jesteś chroniony, klienci mogą polegać.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tiers */}
      <section className="container py-16">
        <h2 className="mb-10 font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
          Trzy poziomy współpracy
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              elevation={tier.highlight ? "pop" : "subtle"}
              className={
                tier.highlight
                  ? "relative border-dlugomat-700 ring-2 ring-dlugomat-700/30"
                  : ""
              }
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-dlugomat-700 text-white">Najpopularniejszy</Badge>
                </div>
              )}
              <CardContent className="space-y-5 p-8">
                <div>
                  <h3 className="font-display text-fluid-2xl font-bold text-dlugomat-900 dark:text-iron-50">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-fluid-xs uppercase tracking-wider text-iron-500">
                    Minimalny wolumen
                  </p>
                  <p className="font-medium text-iron-700 dark:text-iron-200">{tier.minVolume}</p>
                </div>

                <div className="rounded-lg bg-dlugomat-50 p-4 dark:bg-dlugomat-900">
                  <p className="text-fluid-xs uppercase tracking-wider text-iron-500">Revenue share</p>
                  <p className="font-display text-fluid-4xl font-bold text-dlugomat-900 dark:text-iron-50">
                    {tier.revenueShare}
                  </p>
                  <p className="text-fluid-xs text-iron-500">z każdej subskrypcji klienta</p>
                </div>

                <ul className="space-y-2 text-fluid-sm text-iron-700 dark:text-iron-200">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-accent-500"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={tier.highlight ? "primary" : "ghost"}
                  className="w-full"
                  size="lg"
                >
                  <Link href={`#zgloszenie?tier=${encodeURIComponent(tier.name)}`}>
                    Wybierz {tier.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="zgloszenie" className="container py-16">
        <Card elevation="pop" className="overflow-hidden">
          <CardContent className="grid gap-10 p-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
                Wyślij zgłoszenie
              </h2>
              <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
                Odzywamy się w 48h roboczych. Pierwsze spotkanie online, bez zobowiązań,
                z naszym Head of Partnerships.
              </p>
              <dl className="mt-8 space-y-4 text-fluid-sm">
                <div>
                  <dt className="font-semibold text-iron-800 dark:text-iron-100">Co przygotujemy na demo</dt>
                  <dd className="text-iron-600 dark:text-iron-300">
                    Mock-up white-label pod Twoją domeną, kalkulator ROI, draft umowy.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-iron-800 dark:text-iron-100">Onboarding</dt>
                  <dd className="text-iron-600 dark:text-iron-300">
                    14 dni od podpisania umowy do produkcyjnego startu.
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-iron-800 dark:text-iron-100">Pierwsza wypłata</dt>
                  <dd className="text-iron-600 dark:text-iron-300">
                    30 dni od pierwszej zafakturowanej subskrypcji klienta.
                  </dd>
                </div>
              </dl>
            </div>

            <form
              action="/api/marketplace/reseller"
              method="POST"
              className="space-y-4"
            >
              <div>
                <label htmlFor="company" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                  Firma / kancelaria
                </label>
                <input
                  id="company"
                  name="company"
                  required
                  className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                />
              </div>
              <div>
                <label htmlFor="nip" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                  NIP
                </label>
                <input
                  id="nip"
                  name="nip"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="contact_name" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                    Osoba kontaktowa
                  </label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    required
                    className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="tier" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                  Interesujący Cię poziom
                </label>
                <select
                  id="tier"
                  name="tier"
                  className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                >
                  <option value="">Wybierz…</option>
                  {TIERS.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {t.revenueShare}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="volume" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                  Szacowany wolumen klientów / rok
                </label>
                <input
                  id="volume"
                  name="volume_yearly"
                  inputMode="numeric"
                  placeholder="np. 200"
                  className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                />
              </div>
              <div>
                <label htmlFor="notes" className="text-fluid-sm font-medium text-iron-800 dark:text-iron-100">
                  Dodatkowe informacje
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
                />
              </div>
              <label className="flex items-start gap-2 text-fluid-xs text-iron-600 dark:text-iron-300">
                <input type="checkbox" name="rodo_consent" required className="mt-0.5" />
                <span>
                  Wyrażam zgodę na przetwarzanie danych w celu kontaktu w sprawie programu
                  resellerskiego (art. 6 ust. 1 lit. b i f RODO).
                </span>
              </label>
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Wyślij zgłoszenie
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
