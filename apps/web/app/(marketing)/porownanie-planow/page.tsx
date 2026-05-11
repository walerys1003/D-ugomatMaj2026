import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Porównanie planów Długomat | Sprawdź, który plan dla Ciebie",
  description:
    "Szczegółowe porównanie planów Free, Solo, Pro i Enterprise — wszystkie funkcje w jednej tabeli.",
};

interface PlanFeature {
  category: string;
  items: Array<{
    name: string;
    description?: string;
    plans: {
      free: boolean | string;
      solo: boolean | string;
      pro: boolean | string;
      enterprise: boolean | string;
    };
  }>;
}

const PLANS = [
  { id: "free", name: "Free", price: "0 zł", period: "" },
  { id: "solo", name: "Solo", price: "49 zł", period: "/mc" },
  { id: "pro", name: "Pro", price: "149 zł", period: "/mc", highlight: true },
  { id: "enterprise", name: "Enterprise", price: "od 999 zł", period: "/mc" },
] as const;

const FEATURES: PlanFeature[] = [
  {
    category: "Generowanie pism",
    items: [
      {
        name: "Pisma procesowe miesięcznie",
        plans: { free: "1", solo: "10", pro: "Bez limitu", enterprise: "Bez limitu" },
      },
      {
        name: "Wszystkie moduły D1-D16",
        plans: { free: false, solo: true, pro: true, enterprise: true },
      },
      {
        name: "AI Asystent (chat + RAG)",
        plans: { free: false, solo: "100 zapytań/mc", pro: "Bez limitu", enterprise: "Bez limitu" },
      },
      {
        name: "Personalizacja szablonów",
        plans: { free: false, solo: false, pro: true, enterprise: true },
      },
    ],
  },
  {
    category: "Sprawy i terminy",
    items: [
      {
        name: "Aktywne sprawy",
        plans: { free: "1", solo: "5", pro: "Bez limitu", enterprise: "Bez limitu" },
      },
      {
        name: "Kalendarz terminów + przypomnienia",
        plans: { free: true, solo: true, pro: true, enterprise: true },
      },
      {
        name: "Skaner pism (OCR)",
        plans: { free: "2/mc", solo: "20/mc", pro: "Bez limitu", enterprise: "Bez limitu" },
      },
      {
        name: "Eksport .ics do kalendarza",
        plans: { free: false, solo: true, pro: true, enterprise: true },
      },
    ],
  },
  {
    category: "Współpraca i organizacja",
    items: [
      {
        name: "Liczba użytkowników",
        plans: { free: "1", solo: "1", pro: "5", enterprise: "Bez limitu" },
      },
      {
        name: "Wielofirmowość (organizacje)",
        plans: { free: false, solo: false, pro: true, enterprise: true },
      },
      {
        name: "Role i uprawnienia (RBAC)",
        plans: { free: false, solo: false, pro: "Podstawowe", enterprise: "Fine-grained" },
      },
      {
        name: "Audit log",
        plans: { free: false, solo: false, pro: "90 dni", enterprise: "7 lat" },
      },
    ],
  },
  {
    category: "Integracje i API",
    items: [
      {
        name: "API publiczne (REST)",
        plans: { free: false, solo: false, pro: "1000 req/dzień", enterprise: "Bez limitu" },
      },
      {
        name: "Webhooki",
        plans: { free: false, solo: false, pro: "5", enterprise: "Bez limitu" },
      },
      {
        name: "SSO (SAML 2.0 / OIDC)",
        plans: { free: false, solo: false, pro: false, enterprise: true },
      },
      {
        name: "SCIM provisioning",
        plans: { free: false, solo: false, pro: false, enterprise: true },
      },
    ],
  },
  {
    category: "Wsparcie i SLA",
    items: [
      {
        name: "Wsparcie",
        plans: {
          free: "E-mail",
          solo: "E-mail (24h)",
          pro: "Priorytet (8h)",
          enterprise: "Dedykowany CSM",
        },
      },
      {
        name: "Telefon",
        plans: { free: false, solo: false, pro: false, enterprise: true },
      },
      {
        name: "Onboarding",
        plans: { free: false, solo: "Self-serve", pro: "Webinar", enterprise: "Custom" },
      },
      {
        name: "SLA gwarantowane",
        plans: { free: false, solo: false, pro: "99,5%", enterprise: "99,95%" },
      },
    ],
  },
];

function renderCell(value: boolean | string) {
  if (value === true) {
    return (
      <span className="inline-flex items-center text-accent-700">
        <Check className="w-4 h-4" aria-label="Tak" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center text-iron-300 dark:text-iron-700">
        <Minus className="w-4 h-4" aria-label="Nie" />
      </span>
    );
  }
  return <span className="text-iron-700 dark:text-iron-300">{value}</span>;
}

export default function PorownaniePlanowPage() {
  return (
    <main className="bg-iron-50 dark:bg-iron-950 pb-20">
      <section className="bg-white dark:bg-iron-900 border-b border-iron-200 dark:border-iron-800">
        <div className="container mx-auto px-4 py-12 text-center max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-iron-500 mb-2">Cennik</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-iron-900 dark:text-iron-50">
            Porównanie planów
          </h1>
          <p className="text-lg text-iron-600 dark:text-iron-300 mt-3">
            Wszystkie funkcje w jednej tabeli. Bez gwiazdek, bez ukrytych opłat.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <Card elevation="pop" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white dark:bg-iron-900">
                <tr className="border-b border-iron-200 dark:border-iron-800">
                  <th className="text-left py-4 px-4 w-1/3 text-iron-500 text-xs uppercase tracking-wider font-medium">
                    Funkcja
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className={`text-center py-4 px-4 ${
                        plan.highlight
                          ? "bg-accent-50 dark:bg-accent-700/10 border-x border-accent-200 dark:border-accent-700/30"
                          : ""
                      }`}
                    >
                      <div className="font-display text-lg font-semibold text-iron-900 dark:text-iron-50">
                        {plan.name}
                      </div>
                      <div className="text-xs text-iron-500 mt-0.5">
                        <span className="font-medium text-iron-900 dark:text-iron-50">
                          {plan.price}
                        </span>
                        {plan.period}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((group) => (
                  <>
                    <tr key={`${group.category}-header`} className="bg-iron-50 dark:bg-iron-950">
                      <td
                        colSpan={5}
                        className="py-2 px-4 text-xs uppercase tracking-wider text-iron-600 dark:text-iron-400 font-medium"
                      >
                        {group.category}
                      </td>
                    </tr>
                    {group.items.map((item, i) => (
                      <tr
                        key={`${group.category}-${i}`}
                        className="border-b border-iron-100 dark:border-iron-900"
                      >
                        <td className="py-3 px-4 text-iron-700 dark:text-iron-300">
                          {item.name}
                          {item.description && (
                            <div className="text-xs text-iron-500 mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </td>
                        {PLANS.map((plan) => (
                          <td
                            key={plan.id}
                            className={`text-center py-3 px-4 ${
                              plan.highlight
                                ? "bg-accent-50/50 dark:bg-accent-700/5 border-x border-accent-200/50 dark:border-accent-700/20"
                                : ""
                            }`}
                          >
                            {renderCell(item.plans[plan.id as keyof typeof item.plans])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
                <tr>
                  <td className="py-4 px-4"></td>
                  {PLANS.map((plan) => (
                    <td
                      key={plan.id}
                      className={`text-center py-4 px-3 ${
                        plan.highlight
                          ? "bg-accent-50 dark:bg-accent-700/10 border-x border-accent-200 dark:border-accent-700/30"
                          : ""
                      }`}
                    >
                      <Link
                        href={plan.id === "enterprise" ? "/kontakt?temat=enterprise" : "/rejestracja"}
                      >
                        <Button
                          variant={plan.highlight ? "primary" : "secondary"}
                          className="w-full text-xs"
                        >
                          {plan.id === "free"
                            ? "Zacznij"
                            : plan.id === "enterprise"
                              ? "Porozmawiajmy"
                              : "Wybierz"}
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card elevation="subtle" className="mt-6">
          <CardContent className="pt-6 text-center text-sm text-iron-600 dark:text-iron-400 space-y-2">
            <p>
              Wszystkie plany zawierają: szyfrowanie AES-256, kopię zapasową, zgodność z RODO.
              Możesz zmienić plan w dowolnej chwili — rozliczenie pro rata.
            </p>
            <p className="text-xs text-iron-500">
              Pytania? Zobacz <Link href="/cennik" className="text-accent-700 hover:underline">cennik</Link> lub
              napisz na <a href="mailto:sprzedaz@dlugomat.pl" className="text-accent-700 hover:underline">sprzedaz@dlugomat.pl</a>.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
