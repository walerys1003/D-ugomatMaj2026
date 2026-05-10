/**
 * /cennik/subskrypcje — strona z planami subskrypcyjnymi (Tier 8 — Pricing v2).
 *
 * Komplementarna do `/cennik` (per-pismo). Ta strona promuje plany subskrypcyjne
 * dla power-userów / rodziny / kancelarii.
 */
import type { Metadata } from "next";
import Link from "next/link";
import PricingTableClient from "./PricingTableClient";

export const metadata: Metadata = {
  title: "Plany subskrypcyjne Długomat — Starter, Pro, Family, Company",
  description:
    "Wybierz plan subskrypcyjny Długomat: Starter (49 zł/m-c), Pro (99 zł/m-c), Family (149 zł/m-c) lub Company (499 zł/m-c). 20% zniżki przy rozliczeniu rocznym.",
  alternates: { canonical: "/cennik/subskrypcje" },
};

export default function SubscriptionPricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Plany subskrypcyjne</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Dla osób z wieloma sprawami, rodzin i kancelarii. Anuluj kiedy chcesz.
          Pierwsze 7 dni z planem Pro lub Starter — darmowe.
        </p>
      </header>

      <PricingTableClient />

      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Pytania i odpowiedzi</h2>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <details key={i} className="rounded-md border p-4">
              <summary className="font-semibold cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 text-center">
        <p className="text-gray-600">
          Wolisz płacić raz za jedno pismo?{" "}
          <Link href="/cennik" className="text-blue-600 underline">
            Zobacz cennik per pismo →
          </Link>
        </p>
      </section>
    </main>
  );
}

const FAQS = [
  {
    q: "Czy mogę anulować subskrypcję w każdej chwili?",
    a: "Tak. Anulujesz w Stripe Customer Portal — dostęp masz do końca opłaconego okresu. Brak prowizji za anulowanie.",
  },
  {
    q: "Jak działa zmiana planu (upgrade/downgrade)?",
    a: "Upgrade jest natychmiastowy (Stripe nalicza proration — płacisz tylko za różnicę). Downgrade wchodzi w życie na koniec bieżącego okresu rozliczeniowego.",
  },
  {
    q: "Czy mam fakturę VAT?",
    a: "Tak. Każda płatność = automatyczna faktura PDF wystawiona zgodnie z polskimi przepisami (Ustawa o VAT, art. 106e). Faktury są dostępne w sekcji 'Faktury' w panelu.",
  },
  {
    q: "Co się dzieje z moimi sprawami po anulowaniu?",
    a: "Sprawy pozostają w bazie przez 12 miesięcy (zgodnie z RODO). Możesz je nadal odczytywać i pobierać PDF-y. Generacja AI wymaga aktywnej subskrypcji lub jednorazowej opłaty.",
  },
  {
    q: "Plan Family — jak działa współdzielenie?",
    a: "Tworzysz tenant 'Family' i zapraszasz do 5 osób (każda z własnym kontem). Wspólny dashboard, ale każdy widzi tylko swoje sprawy. Płacisz jedną opłatę za wszystkich.",
  },
  {
    q: "Plan Company — co dostaje kancelaria?",
    a: "Pełne REST API + webhooks (zad. 348-349), nieograniczeni członkowie tenanta, marketplace szablonów, RAG z LEX/LegalMind, white-label opcja i dedykowany SLA.",
  },
];
