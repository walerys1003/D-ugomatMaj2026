// Third-party app / integration directory — verified integrations to external services.
export interface IntegrationDirectoryEntry {
  slug: string;
  name: string;
  category: "crm" | "billing" | "storage" | "email" | "calendar" | "signature" | "court" | "ai";
  description: string;
  oauthRequired: boolean;
  documentationUrl: string;
  verified: boolean;
}

export const INTEGRATIONS: IntegrationDirectoryEntry[] = [
  {
    slug: "google-calendar",
    name: "Google Calendar",
    category: "calendar",
    description: "Synchronizacja terminów rozpraw i spotkań",
    oauthRequired: true,
    documentationUrl: "https://docs.dlugomat.pl/integrations/google-calendar",
    verified: true,
  },
  {
    slug: "microsoft-365",
    name: "Microsoft 365",
    category: "email",
    description: "Połączenie z Outlook + OneDrive",
    oauthRequired: true,
    documentationUrl: "https://docs.dlugomat.pl/integrations/microsoft-365",
    verified: true,
  },
  {
    slug: "dropbox-sign",
    name: "Dropbox Sign",
    category: "signature",
    description: "Podpis kwalifikowany dokumentów",
    oauthRequired: true,
    documentationUrl: "https://docs.dlugomat.pl/integrations/dropbox-sign",
    verified: true,
  },
  {
    slug: "ifirma",
    name: "iFirma",
    category: "billing",
    description: "Wystawianie faktur dla klientów",
    oauthRequired: false,
    documentationUrl: "https://docs.dlugomat.pl/integrations/ifirma",
    verified: true,
  },
  {
    slug: "fakturownia",
    name: "Fakturownia",
    category: "billing",
    description: "Integracja z księgowością",
    oauthRequired: false,
    documentationUrl: "https://docs.dlugomat.pl/integrations/fakturownia",
    verified: true,
  },
  {
    slug: "epuap",
    name: "ePUAP",
    category: "court",
    description: "Składanie pism przez Profil Zaufany",
    oauthRequired: false,
    documentationUrl: "https://docs.dlugomat.pl/integrations/epuap",
    verified: true,
  },
  {
    slug: "krs",
    name: "KRS Online",
    category: "court",
    description: "Pobieranie odpisów z KRS",
    oauthRequired: false,
    documentationUrl: "https://docs.dlugomat.pl/integrations/krs",
    verified: true,
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "Synchronizacja kontaktów i pipeline'u sprzedaży",
    oauthRequired: true,
    documentationUrl: "https://docs.dlugomat.pl/integrations/hubspot",
    verified: false,
  },
];

export function listIntegrations(category?: IntegrationDirectoryEntry["category"]): IntegrationDirectoryEntry[] {
  if (!category) return INTEGRATIONS;
  return INTEGRATIONS.filter((i) => i.category === category);
}

export function getIntegration(slug: string): IntegrationDirectoryEntry | null {
  return INTEGRATIONS.find((i) => i.slug === slug) ?? null;
}
