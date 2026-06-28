/**
 * Tier 12 — Make.com (Integromat) blueprint module descriptor.
 */
export interface MakeModule {
  name: string;
  label: string;
  description: string;
  type: "trigger" | "action" | "search";
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  parameters?: { name: string; label: string; type: string; required?: boolean }[];
}

export const MAKE_MODULES: MakeModule[] = [
  {
    name: "watchCases",
    label: "Watch new cases",
    description: "Wyzwala scenariusz przy utworzeniu nowej sprawy.",
    type: "trigger",
    url: "/api/integrations/make/poll/cases",
    method: "GET",
  },
  {
    name: "watchDocuments",
    label: "Watch generated documents",
    description: "Wyzwala scenariusz przy generacji dokumentu.",
    type: "trigger",
    url: "/api/integrations/make/poll/documents",
    method: "GET",
  },
  {
    name: "createCase",
    label: "Create case",
    description: "Tworzy nową sprawę.",
    type: "action",
    url: "/api/public/v1/cases",
    method: "POST",
    parameters: [
      { name: "case_type", label: "Case type", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
    ],
  },
  {
    name: "searchCases",
    label: "Search cases",
    description: "Wyszukuje sprawy po słowach kluczowych.",
    type: "search",
    url: "/api/public/v1/cases",
    method: "GET",
    parameters: [{ name: "q", label: "Query", type: "text" }],
  },
];

export function buildMakeBlueprint(baseUrl: string): Record<string, unknown> {
  return {
    blueprint: {
      name: "Długomat",
      description: "Polish legal-tech automation",
      version: 1,
      base_url: baseUrl,
      modules: MAKE_MODULES,
      api: { authentication: "header", header_name: "X-API-Key" },
    },
  };
}
