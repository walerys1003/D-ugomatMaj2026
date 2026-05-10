/**
 * Tier 13 — Data Processing Agreement (DPA) and ISO 27001 compliance helpers.
 */
export interface DpaTemplate {
  version: string;
  effective_date: string;
  controller_name: string;
  processor_name: string;
  data_categories: string[];
  retention_days: number;
  sub_processors: string[];
  transfer_safeguards: "scc" | "binding_corporate_rules" | "adequacy_decision";
}

export const DEFAULT_DPA_TEMPLATE: Omit<DpaTemplate, "controller_name"> = {
  version: "2026.05",
  effective_date: "2026-05-15",
  processor_name: "Długomat sp. z o.o.",
  data_categories: ["dane identyfikacyjne", "dane kontaktowe", "dane spraw sądowych", "dane finansowe", "metadane techniczne"],
  retention_days: 1825, // 5 years (PL VAT obligations)
  sub_processors: ["Supabase Inc.", "Anthropic PBC", "OpenAI LLC", "Stripe Inc.", "Cloudflare Inc."],
  transfer_safeguards: "scc",
};

export function generateDpaPdfMarkdown(input: { controller_name: string }): string {
  const t = { ...DEFAULT_DPA_TEMPLATE, controller_name: input.controller_name };
  return [
    "# Umowa powierzenia przetwarzania danych osobowych (DPA)",
    `**Wersja:** ${t.version}`,
    `**Data obowiązywania:** ${t.effective_date}`,
    "",
    "## 1. Strony",
    `**Administrator (Klient):** ${t.controller_name}`,
    `**Procesor:** ${t.processor_name}`,
    "",
    "## 2. Kategorie danych",
    ...t.data_categories.map((c) => `- ${c}`),
    "",
    "## 3. Okres przechowywania",
    `${t.retention_days} dni od zakończenia świadczenia usługi.`,
    "",
    "## 4. Podprocesorzy",
    ...t.sub_processors.map((s) => `- ${s}`),
    "",
    "## 5. Transfer poza EOG",
    `Zabezpieczenie: ${t.transfer_safeguards.toUpperCase()} (Standardowe Klauzule Umowne KE 2021/914).`,
    "",
    "## 6. Środki bezpieczeństwa (zgodne z ISO 27001)",
    "- Szyfrowanie at-rest (AES-256) i in-transit (TLS 1.3)",
    "- Kontrola dostępu RBAC + SCIM provisioning",
    "- Audit log z hash-chain (tamper-evident)",
    "- Coroczny audyt SOC 2 Type II",
    "- DPO@dlugomat.pl",
  ].join("\n");
}

export interface Iso27001Control {
  id: string;
  category: "A.5" | "A.6" | "A.7" | "A.8";
  name: string;
  description: string;
  implemented: boolean;
}

export const ISO_27001_CONTROLS: Iso27001Control[] = [
  { id: "A.5.1", category: "A.5", name: "Polityki bezpieczeństwa informacji", description: "Udokumentowane polityki", implemented: true },
  { id: "A.5.7", category: "A.5", name: "Threat intelligence", description: "Monitoring zagrożeń", implemented: true },
  { id: "A.6.3", category: "A.6", name: "Świadomość bezpieczeństwa", description: "Szkolenia pracowników", implemented: true },
  { id: "A.7.2", category: "A.7", name: "Bezpieczeństwo fizyczne", description: "Data center compliance", implemented: true },
  { id: "A.8.5", category: "A.8", name: "Bezpieczna autentykacja", description: "MFA + SSO", implemented: true },
  { id: "A.8.16", category: "A.8", name: "Monitoring", description: "SIEM + alerty", implemented: true },
  { id: "A.8.24", category: "A.8", name: "Kryptografia", description: "AES-256 + TLS 1.3", implemented: true },
  { id: "A.8.28", category: "A.8", name: "Bezpieczne kodowanie", description: "SAST + dependency scanning", implemented: true },
];
