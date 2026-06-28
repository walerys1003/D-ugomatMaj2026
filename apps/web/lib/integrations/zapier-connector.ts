/**
 * Tier 12 — Zapier/Make connector descriptor + REST hooks endpoints.
 * Exposes triggers (REST hooks) and actions for the no-code platforms.
 */
export interface ZapierTrigger {
  key: string;
  noun: string;
  display_label: string;
  sample: Record<string, unknown>;
  event: string; // matches WebhookEvent
}

export interface ZapierAction {
  key: string;
  noun: string;
  display_label: string;
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  fields: { key: string; label: string; type: "string" | "number" | "boolean"; required?: boolean }[];
}

export const ZAPIER_TRIGGERS: ZapierTrigger[] = [
  {
    key: "new_case",
    noun: "Case",
    display_label: "Nowa sprawa utworzona",
    event: "case.created",
    sample: { id: "case_abc", case_type: "sprzeciw", title: "Sprawa testowa", created_at: "2026-05-14T10:00:00Z" },
  },
  {
    key: "document_generated",
    noun: "Document",
    display_label: "Dokument wygenerowany",
    event: "document.generated",
    sample: { id: "doc_abc", case_id: "case_abc", kind: "sprzeciw_pismo", pdf_url: "https://..." },
  },
  {
    key: "deadline_approaching",
    noun: "Deadline",
    display_label: "Zbliża się termin",
    event: "deadline.approaching",
    sample: { case_id: "case_abc", deadline_kind: "sprzeciw", due_at: "2026-05-20T23:59:59Z", days_left: 6 },
  },
  {
    key: "payment_succeeded",
    noun: "Payment",
    display_label: "Płatność powiodła się",
    event: "payment.succeeded",
    sample: { id: "pay_abc", amount_grosze: 9900, currency: "PLN" },
  },
];

export const ZAPIER_ACTIONS: ZapierAction[] = [
  {
    key: "create_case",
    noun: "Case",
    display_label: "Utwórz sprawę",
    endpoint: "/api/public/v1/cases",
    method: "POST",
    fields: [
      { key: "case_type", label: "Typ sprawy", type: "string", required: true },
      { key: "title", label: "Tytuł", type: "string", required: true },
      { key: "metadata", label: "Metadane (JSON)", type: "string" },
    ],
  },
  {
    key: "generate_document",
    noun: "Document",
    display_label: "Wygeneruj dokument",
    endpoint: "/api/public/v1/documents",
    method: "POST",
    fields: [
      { key: "case_id", label: "ID sprawy", type: "string", required: true },
      { key: "template", label: "Szablon", type: "string", required: true },
    ],
  },
];

export function buildZapierManifest(baseUrl: string): Record<string, unknown> {
  return {
    version: "1.0.0",
    platform_version: "15.0.0",
    title: "Długomat",
    description: "Polski AI legal-tech — automatyzacja spraw, terminów i dokumentów.",
    base_url: baseUrl,
    auth: {
      type: "custom",
      test_endpoint: `${baseUrl}/api/public/v1/billing/subscriptions`,
      fields: [{ key: "api_key", label: "API Key", required: true }],
      headers: { "X-API-Key": "{{api_key}}" },
    },
    triggers: ZAPIER_TRIGGERS,
    actions: ZAPIER_ACTIONS,
  };
}
