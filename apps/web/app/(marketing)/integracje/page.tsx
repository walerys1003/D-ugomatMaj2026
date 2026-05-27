import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Integracje Długomat | Połącz z 30+ narzędziami",
  description:
    "API REST, webhooki, Zapier, SSO. Połącz Długomat z systemami CRM, ERP, kalendarzami i kancelarią online.",
};

interface Integration {
  slug: string;
  name: string;
  category: "crm" | "auth" | "calendar" | "storage" | "communication" | "billing" | "automation";
  description: string;
  status: "available" | "beta" | "soon";
  logo_letter: string;
}

const CATEGORY_LABELS: Record<Integration["category"], string> = {
  crm: "CRM i sprzedaż",
  auth: "Tożsamość (SSO)",
  calendar: "Kalendarze",
  storage: "Pliki i dokumenty",
  communication: "Komunikacja",
  billing: "Płatności i fakturowanie",
  automation: "Automatyzacja",
};

const INTEGRATIONS: Integration[] = [
  { slug: "salesforce", name: "Salesforce", category: "crm", description: "Synchronizacja kontaktów, leadów i spraw.", status: "available", logo_letter: "S" },
  { slug: "hubspot", name: "HubSpot", category: "crm", description: "Tworzenie deal'ów z konwersji.", status: "available", logo_letter: "H" },
  { slug: "pipedrive", name: "Pipedrive", category: "crm", description: "Lead routing i status spraw.", status: "available", logo_letter: "P" },
  { slug: "okta", name: "Okta", category: "auth", description: "SSO via SAML 2.0 + SCIM provisioning.", status: "available", logo_letter: "O" },
  { slug: "azure-ad", name: "Azure AD", category: "auth", description: "SSO Microsoft + Conditional Access.", status: "available", logo_letter: "A" },
  { slug: "google-workspace", name: "Google Workspace", category: "auth", description: "Logowanie OIDC + dyrektoria.", status: "available", logo_letter: "G" },
  { slug: "google-calendar", name: "Google Calendar", category: "calendar", description: "Eksport terminów rozpraw.", status: "available", logo_letter: "G" },
  { slug: "outlook-calendar", name: "Outlook Calendar", category: "calendar", description: "Microsoft Graph + przypomnienia.", status: "available", logo_letter: "O" },
  { slug: "google-drive", name: "Google Drive", category: "storage", description: "Archiwizacja dokumentów.", status: "available", logo_letter: "G" },
  { slug: "onedrive", name: "OneDrive", category: "storage", description: "Synchronizacja dokumentów z M365.", status: "available", logo_letter: "O" },
  { slug: "dropbox", name: "Dropbox", category: "storage", description: "Backup pism i orzeczeń.", status: "beta", logo_letter: "D" },
  { slug: "slack", name: "Slack", category: "communication", description: "Powiadomienia o terminach do kanału.", status: "available", logo_letter: "S" },
  { slug: "teams", name: "MS Teams", category: "communication", description: "Boty i adaptive cards.", status: "available", logo_letter: "T" },
  { slug: "gmail", name: "Gmail", category: "communication", description: "Wysyłka pism z konta firmowego.", status: "beta", logo_letter: "G" },
  { slug: "stripe", name: "Stripe", category: "billing", description: "Płatności w EU + Tax automation.", status: "available", logo_letter: "S" },
  { slug: "tpay", name: "Tpay", category: "billing", description: "BLIK i przelewy PL.", status: "available", logo_letter: "T" },
  { slug: "ifirma", name: "iFirma", category: "billing", description: "Sync faktur do księgowej.", status: "available", logo_letter: "i" },
  { slug: "fakturownia", name: "Fakturownia", category: "billing", description: "Automatyczne wystawianie faktur.", status: "available", logo_letter: "F" },
  { slug: "zapier", name: "Zapier", category: "automation", description: "5000+ aplikacji bez kodu.", status: "available", logo_letter: "Z" },
  { slug: "make", name: "Make (Integromat)", category: "automation", description: "Wizualne scenariusze.", status: "available", logo_letter: "M" },
  { slug: "n8n", name: "n8n", category: "automation", description: "Self-hosted automation.", status: "beta", logo_letter: "n" },
  { slug: "webhooks", name: "Webhooki", category: "automation", description: "HTTP POST + HMAC-SHA256.", status: "available", logo_letter: "W" },
  { slug: "api-rest", name: "REST API", category: "automation", description: "OpenAPI 3.1, OAuth2, rate-limits.", status: "available", logo_letter: "R" },
  { slug: "bik", name: "BIK", category: "automation", description: "Raport zdolności + monitorowanie.", status: "soon", logo_letter: "B" },
];

const STATUS_LABEL = {
  available: "Dostępna",
  beta: "Beta",
  soon: "Wkrótce",
};

const STATUS_BADGE = {
  available: "bg-accent-50 text-accent-700 border-accent-200",
  beta: "bg-warn-50 text-warn-700 border-warn-200",
  soon: "bg-ink-100 text-ink-600 border-ink-200",
};

export default function IntegracjePage() {
  const grouped = new Map<Integration["category"], Integration[]>();
  for (const i of INTEGRATIONS) {
    if (!grouped.has(i.category)) grouped.set(i.category, []);
    grouped.get(i.category)!.push(i);
  }

  return (
    <main className="bg-ink-50 dark:bg-ink-950 pb-20">
      <section className="bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">Integracje</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 dark:text-ink-50">
            Połącz z narzędziami, których już używasz
          </h1>
          <p className="text-lg text-ink-600 dark:text-ink-300 mt-3">
            {INTEGRATIONS.filter((i) => i.status === "available").length} natywnych integracji,
            REST API i webhooki. Brakuje czegoś? Napisz —{" "}
            <Link href="/kontakt?temat=integracja" className="text-accent-700 hover:underline">
              dodamy
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 space-y-10">
        {Array.from(grouped.entries()).map(([cat, items]) => (
          <div key={cat}>
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50 mb-4">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {items.map((i) => (
                <Link key={i.slug} href={`/integracje/${i.slug}`}>
                  <Card
                    elevation="subtle"
                    className="hover:border-accent-400 transition cursor-pointer h-full"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-md bg-ink-100 dark:bg-ink-800 flex items-center justify-center font-display font-semibold text-ink-700 dark:text-ink-300">
                          {i.logo_letter}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[i.status]}`}
                        >
                          {STATUS_LABEL[i.status]}
                        </span>
                      </div>
                      <CardTitle className="text-base">{i.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-ink-600 dark:text-ink-400 line-clamp-2">
                        {i.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
