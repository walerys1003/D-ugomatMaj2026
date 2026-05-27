import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoiB2BCalculator } from "./calculator-client";

export const metadata: Metadata = {
  title: "ROI Długomat dla firm | Policz oszczędność dla swojej organizacji",
  description:
    "Kalkulator ROI dla kancelarii, działów windykacji i działów prawnych. Oszczędność czasu i kosztów na podstawie Twoich danych.",
};

export default function RoiB2BPage() {
  return (
    <main className="bg-ink-50 dark:bg-ink-950 pb-20">
      <section className="bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">Dla firm</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 dark:text-ink-50">
            Policz, ile zaoszczędzi Twoja firma
          </h1>
          <p className="text-lg text-ink-600 dark:text-ink-300 mt-3 max-w-2xl">
            Konkretna oszczędność czasu prawników i kosztów obsługi. Wprowadź swoje dane —
            dostaniesz raport e-mailem (PDF) z wyceną dedykowaną.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <RoiB2BCalculator />
      </section>

      <section className="container mx-auto px-4 max-w-5xl space-y-4">
        <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50 mb-4">
          Co dostaniesz w planie Enterprise
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Dedykowany CSM",
              desc: "Customer Success Manager z doświadczeniem w legaltech, dostępny w godzinach biznesowych.",
            },
            {
              title: "SSO + SCIM",
              desc: "Pełna integracja z Okta, Azure AD, Google Workspace. Provisioning automatyczny.",
            },
            {
              title: "SLA 99,95%",
              desc: "Gwarantowana dostępność z karami umownymi. Status publiczny i transparentny.",
            },
            {
              title: "Custom workflow",
              desc: "Automatyzacja procesów dopasowana do Twojego sposobu pracy.",
            },
            {
              title: "White-label",
              desc: "Możliwość brandingu pod własną marką dla klientów końcowych.",
            },
            {
              title: "Audit log 7 lat",
              desc: "Pełna historia zmian zgodna z wymogami compliance i RODO.",
            },
          ].map((f, i) => (
            <Card key={i} elevation="subtle">
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink-600 dark:text-ink-400">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card elevation="pop" className="mt-6">
          <CardContent className="pt-6 text-center space-y-3">
            <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
              Porozmawiajmy o wycenie dedykowanej
            </h3>
            <p className="text-sm text-ink-600 dark:text-ink-400 max-w-xl mx-auto">
              Dla firm powyżej 10 użytkowników przygotowujemy ofertę indywidualną
              wraz z proof-of-concept przeprowadzonym na Twoich danych testowych.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/kontakt?temat=enterprise">
                <Button variant="primary">Umów rozmowę</Button>
              </Link>
              <Link href="/porownanie-planow">
                <Button variant="secondary">Porównanie planów</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
