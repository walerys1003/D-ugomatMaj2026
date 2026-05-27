import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IntegrationDetail {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  status: "available" | "beta" | "soon";
  setup_steps: string[];
  features: string[];
  required_plan: "solo" | "pro" | "enterprise";
  docs_url?: string;
  logo_letter: string;
}

const DETAILS: Record<string, IntegrationDetail> = {
  salesforce: {
    slug: "salesforce",
    name: "Salesforce",
    category: "CRM i sprzedaż",
    tagline: "Sprawy z Długomat trafiają jako Cases do Salesforce.",
    description:
      "Dwukierunkowa synchronizacja kontaktów, leadów i spraw. Status pisma w Długomat aktualizuje pole Case Status w Salesforce. Pełna mapa pól konfigurowalna w panelu administracyjnym.",
    status: "available",
    setup_steps: [
      "Zaloguj się jako administrator Salesforce.",
      "W panelu Długomat: Organizacja → Integracje → Salesforce → Połącz.",
      "Autoryzuj dostęp przez OAuth 2.0.",
      "Wybierz obiekty do synchronizacji (Account, Contact, Case, Opportunity).",
      "Zmapuj pola Długomat ↔ Salesforce w wizardzie.",
      "Przetestuj na sandboxie, następnie włącz w produkcji.",
    ],
    features: [
      "Mapowanie pól w UI bez kodu",
      "Push-to-Salesforce w czasie rzeczywistym",
      "Pull okresowy (co 15 min) dla pól z SF",
      "Conflict resolution: SF wygrywa / DŁ wygrywa / merge",
      "Audit log każdej operacji",
    ],
    required_plan: "pro",
    docs_url: "/dokumentacja/integracje/salesforce",
    logo_letter: "S",
  },
  okta: {
    slug: "okta",
    name: "Okta",
    category: "Tożsamość (SSO)",
    tagline: "Zerowe hasła. SSO przez SAML 2.0 + SCIM provisioning.",
    description:
      "Pełna integracja z Okta jako Identity Provider. Logowanie SAML 2.0, automatyczne tworzenie i wyłączanie kont przez SCIM 2.0, mapowanie grup Okta na role Długomat.",
    status: "available",
    setup_steps: [
      "W Okta Admin Console utwórz aplikację SAML 2.0.",
      "Pobierz metadane SP z Długomat: Organizacja → SSO.",
      "Wgraj metadane IdP do Długomat.",
      "Włącz SCIM provisioning w Okta (URL + bearer token z Długomat).",
      "Zmapuj grupy Okta → role Długomat (owner/admin/member/viewer).",
      "Test logowania na koncie testowym.",
    ],
    features: [
      "SAML 2.0 + Just-in-Time provisioning",
      "SCIM 2.0 — tworzenie, aktualizacja, dezaktywacja",
      "Group-to-role mapping",
      "Conditional Access support",
      "Audit logs w obu systemach",
    ],
    required_plan: "enterprise",
    docs_url: "/dokumentacja/integracje/okta",
    logo_letter: "O",
  },
  zapier: {
    slug: "zapier",
    name: "Zapier",
    category: "Automatyzacja",
    tagline: "5000+ aplikacji bez kodu.",
    description:
      "Triggery i akcje Długomat w Zapier: nowa sprawa, podpisane pismo, terminowe ostrzeżenie. Twórz zaps łączące Długomat z Notion, Airtable, Trello i tysiącami innych aplikacji.",
    status: "available",
    setup_steps: [
      "Wygeneruj API key w Długomat: Ustawienia → API.",
      "W Zapier kliknij 'Create Zap' i wybierz Długomat jako Trigger lub Action.",
      "Wklej API key i autoryzuj.",
      "Skonfiguruj filtr zdarzeń i pola.",
      "Włącz Zap i testuj.",
    ],
    features: [
      "12 triggerów (case.created, document.signed, payment.succeeded, ...)",
      "8 akcji (create_case, send_letter, update_status, ...)",
      "Filtry i transformacje danych",
      "Multi-step Zaps",
      "Rate limit: 1000 zaps/dzień",
    ],
    required_plan: "pro",
    docs_url: "/dokumentacja/integracje/zapier",
    logo_letter: "Z",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DETAILS[slug];
  if (!d) return { title: "Integracja | Długomat" };
  return {
    title: `Integracja ${d.name} | Długomat`,
    description: d.tagline,
  };
}

const STATUS_LABEL = { available: "Dostępna", beta: "Beta", soon: "Wkrótce" };

const PLAN_LABEL = { solo: "Solo", pro: "Pro", enterprise: "Enterprise" };

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = DETAILS[slug];
  if (!d) notFound();

  return (
    <main className="bg-ink-50 dark:bg-ink-950 pb-20">
      <section className="bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/integracje"
            className="text-xs text-ink-500 hover:text-ink-700"
          >
            ← Wszystkie integracje
          </Link>
          <div className="flex items-start gap-4 mt-3">
            <div className="w-14 h-14 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center font-display text-2xl font-semibold text-ink-700 dark:text-ink-300 flex-shrink-0">
              {d.logo_letter}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                {d.category}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 dark:text-ink-50">
                {d.name}
              </h1>
              <p className="text-lg text-ink-600 dark:text-ink-300 mt-2">{d.tagline}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                  {STATUS_LABEL[d.status]}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                  Plan {PLAN_LABEL[d.required_plan]}+
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>O integracji</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-700 dark:text-ink-300">{d.description}</p>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>Funkcje</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-ink-700 dark:text-ink-300">
                {d.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-600 mt-1">●</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>Instalacja krok po kroku</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-ink-700 dark:text-ink-300">
                {d.setup_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 dark:bg-accent-700/20 text-accent-700 flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card elevation="pop">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50">
                Włącz integrację
              </h3>
              <Link href={`/panel/organizacja?integracja=${d.slug}`}>
                <Button variant="primary" className="w-full">
                  Połącz w panelu
                </Button>
              </Link>
              {d.docs_url && (
                <Link href={d.docs_url}>
                  <Button variant="secondary" className="w-full">
                    Dokumentacja
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardContent className="pt-5 text-xs text-ink-600 dark:text-ink-400 space-y-2">
              <div>
                <strong className="text-ink-700 dark:text-ink-300">Plan:</strong>{" "}
                {PLAN_LABEL[d.required_plan]} i wyższe
              </div>
              <div>
                <strong className="text-ink-700 dark:text-ink-300">Status:</strong>{" "}
                {STATUS_LABEL[d.status]}
              </div>
              <div>
                <strong className="text-ink-700 dark:text-ink-300">Wsparcie:</strong>{" "}
                wsparcie@dlugomat.pl
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
