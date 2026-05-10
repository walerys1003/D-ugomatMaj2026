/**
 * Tier 22 — Agent tool registry.
 *
 * Zbiór narzędzi, których agent może użyć w pętli ReAct.
 * Każde narzędzie ma:
 *  - name (kanoniczny identyfikator wywołania)
 *  - description (po polsku — pokazywane LLM-owi w system prompt)
 *  - schema (JSON Schema lite — dla LLM-a i walidacji)
 *  - invoke (impl) — async, dostaje {args, ctx:{userId}}
 *  - costGrosze (estymacja kosztu wywołania — do budget tracking)
 *  - permissions (lista wymaganych scopes — TBD w T23)
 */

import { searchSimilar } from "../../rag/vector-store";
import { computeDeadline, type DeadlineKind } from "@/lib/deadlines/deadline-engine";
import { computeVat, type VatLine } from "@/lib/payments/vat-pl/vat-calculator";
import { fetchByNumber as krsFetchByNumber, fetchByNip as krsFetchByNip, extractCompanyProfile } from "@/lib/court/krs/krs-client";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type ToolName =
  | "search_law"
  | "search_cases"
  | "calc_deadline"
  | "calc_vat"
  | "query_krs"
  | "list_user_deadlines"
  | "draft_summary"
  | "generate_report";

export interface ToolContext {
  userId: string;
}

export interface AgentTool {
  name: ToolName;
  description: string;
  schema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  costGrosze?: number;
  invoke: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
}

// ---------------------------------------------------------------------
// Implementacje narzędzi
// ---------------------------------------------------------------------

const SEARCH_LAW: AgentTool = {
  name: "search_law",
  description:
    "Wyszukuje przepisy prawa polskiego (KC, KPC, KK, KP, ustawy specjalne). Zwraca top 5 fragmentów z cytatem źródła.",
  schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Zapytanie w języku naturalnym, np. 'sprzeciw od nakazu zapłaty termin'" },
      corpus: { type: "string", description: "Opcjonalnie: 'kpc' | 'kc' | 'kk' | 'kp' | 'all'" },
    },
    required: ["query"],
  },
  costGrosze: 5,
  invoke: async (args) => {
    const query = String(args.query ?? "");
    const corpus = typeof args.corpus === "string" ? args.corpus : undefined;
    const docs = await searchSimilar(query, { corpus, topK: 5 });
    return docs.map((d, i) => `[${i + 1}] ${d.source_ref}\n${d.text.slice(0, 600)}`).join("\n\n---\n\n");
  },
};

const SEARCH_CASES: AgentTool = {
  name: "search_cases",
  description:
    "Wyszukuje sprawy bieżącego użytkownika po pełnotekstowym query (numer, strona, opis). Zwraca top 10.",
  schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Fraza do wyszukania" },
      status: { type: "string", description: "Opcjonalnie filtr statusu" },
    },
    required: ["query"],
  },
  costGrosze: 1,
  invoke: async (args, ctx) => {
    const supabase = await createSupabaseServerClient();
    const query = String(args.query ?? "");
    let q = supabase
      .from("cases")
      .select("id, signature, title, status, case_type, created_at")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (query) q = q.or(`signature.ilike.%${query}%,title.ilike.%${query}%`);
    if (typeof args.status === "string") q = q.eq("status", args.status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};

const CALC_DEADLINE: AgentTool = {
  name: "calc_deadline",
  description:
    "Oblicza termin procesowy wg KPC z uwzględnieniem dni wolnych i świąt. Zwraca {dueDate, businessDays}.",
  schema: {
    type: "object",
    properties: {
      ruleId: {
        type: "string",
        description:
          "Identyfikator reguły: 'sprzeciw_epu' | 'zarzuty_nakaz' | 'zazalenie' | 'apelacja' | 'skarga_kasacyjna' | 'skarga_komornicza' | 'odpowiedz_pozew' | 'wniosek_o_uzasadnienie' | 'rps_termin' | 'custom'",
      },
      startDate: { type: "string", description: "ISO date (np. data doręczenia)" },
      customDays: { type: "number", description: "Wymagane tylko dla ruleId='custom'" },
    },
    required: ["ruleId", "startDate"],
  },
  costGrosze: 0,
  invoke: async (args) => {
    const kind = String(args.ruleId ?? "") as DeadlineKind;
    const startDate = new Date(String(args.startDate ?? ""));
    if (isNaN(startDate.getTime())) throw new Error("Invalid startDate");
    const daysOverride = typeof args.customDays === "number" ? args.customDays : undefined;
    const result = computeDeadline({ kind, startDate, daysOverride });
    return result;
  },
};

const CALC_VAT: AgentTool = {
  name: "calc_vat",
  description:
    "Oblicza VAT PL dla kwoty netto. Stawki: '23' | '8' | '5' | '0' | 'zw' | 'np'. Obsługuje MPP i reverse charge B2B EU.",
  schema: {
    type: "object",
    properties: {
      netAmount: { type: "number", description: "Kwota netto w PLN (grosze nie wymagane)" },
      rate: { type: "string", description: "Stawka VAT: '23'|'8'|'5'|'0'|'zw'|'np'" },
      mpp: { type: "boolean", description: "Czy mechanizm podzielonej płatności" },
      reverseCharge: { type: "boolean", description: "Reverse charge (B2B EU)" },
    },
    required: ["netAmount", "rate"],
  },
  costGrosze: 0,
  invoke: async (args) => {
    const netAmount = Number(args.netAmount);
    if (!Number.isFinite(netAmount)) throw new Error("Invalid netAmount");
    // Convert PLN to grosze (cents) for computeVat
    const netCents = Math.round(netAmount * 100);
    const line: VatLine = {
      netCents,
      rate: String(args.rate) as VatLine["rate"],
    };
    return computeVat([line], {
      buyerCountryCode: typeof args.buyerCountryCode === "string" ? args.buyerCountryCode : undefined,
      buyerVatId: typeof args.buyerVatId === "string" ? args.buyerVatId : undefined,
      hasAppendix15Item: Boolean(args.mpp),
    });
  },
};

const QUERY_KRS: AgentTool = {
  name: "query_krs",
  description:
    "Pobiera dane podmiotu z KRS po numerze KRS lub NIP. Zwraca działy 1/2/6 (dane podstawowe, organ, sytuacja finansowa).",
  schema: {
    type: "object",
    properties: {
      krs: { type: "string", description: "Numer KRS (10 cyfr)" },
      nip: { type: "string", description: "NIP (10 cyfr) — alternatywa do KRS" },
    },
  },
  costGrosze: 2,
  invoke: async (args) => {
    let raw: unknown = null;
    if (typeof args.krs === "string" && args.krs.length > 0) {
      raw = await krsFetchByNumber(args.krs);
    } else if (typeof args.nip === "string" && args.nip.length > 0) {
      raw = await krsFetchByNip(args.nip);
    } else {
      throw new Error("Provide either 'krs' or 'nip'");
    }
    const profile = extractCompanyProfile(raw);
    return { profile, raw };
  },
};

const LIST_USER_DEADLINES: AgentTool = {
  name: "list_user_deadlines",
  description:
    "Lista terminów bieżącego usera w zakresie czasu (domyślnie najbliższe 30 dni). Zwraca id, due_at, rule, case_id, status.",
  schema: {
    type: "object",
    properties: {
      withinDays: { type: "number", description: "Ile dni naprzód (default 30)" },
      caseId: { type: "string", description: "Opcjonalnie: filtr sprawy" },
    },
  },
  costGrosze: 1,
  invoke: async (args, ctx) => {
    const supabase = await createSupabaseServerClient();
    const days = typeof args.withinDays === "number" ? args.withinDays : 30;
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 86_400_000).toISOString();
    let q = supabase
      .from("deadlines")
      .select("id, due_at, rule_id, case_id, status")
      .eq("user_id", ctx.userId)
      .lte("due_at", cutoff)
      .gte("due_at", now.toISOString())
      .is("completed_at", null)
      .order("due_at", { ascending: true })
      .limit(50);
    if (typeof args.caseId === "string") q = q.eq("case_id", args.caseId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};

const DRAFT_SUMMARY: AgentTool = {
  name: "draft_summary",
  description:
    "Generuje krótkie streszczenie (max 300 słów) podanego tekstu. Używać do kompresji długich wyników innych narzędzi.",
  schema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Tekst do streszczenia" },
      maxWords: { type: "number", description: "Max słów (default 300)" },
    },
    required: ["text"],
  },
  costGrosze: 3,
  invoke: async (args) => {
    const text = String(args.text ?? "");
    if (text.length < 400) return text; // za krótko żeby streszczać
    // Heurystyka offline (bez kolejnego LLM call): wyciągnij zdania z największą liczbą
    // sygnałów (cytaty art./§/pkt + terminy + kwoty).
    const sentences = text.split(/(?<=[.!?])\s+/);
    const scored = sentences.map((s) => ({
      s,
      score:
        (s.match(/art\.|§|ust\.|pkt|KPC|KC|KK/g)?.length ?? 0) * 3 +
        (s.match(/\d{1,3}[\.,]?\d*\s*(zł|PLN|EUR)/g)?.length ?? 0) * 2 +
        (s.match(/\d{4}-\d{2}-\d{2}|termin|dni/g)?.length ?? 0) * 2 +
        s.length / 200,
    }));
    scored.sort((a, b) => b.score - a.score);
    const maxWords = typeof args.maxWords === "number" ? args.maxWords : 300;
    const picked: string[] = [];
    let wordCount = 0;
    for (const { s } of scored) {
      const w = s.split(/\s+/).length;
      if (wordCount + w > maxWords) break;
      picked.push(s);
      wordCount += w;
    }
    return picked.join(" ");
  },
};

const GENERATE_REPORT: AgentTool = {
  name: "generate_report",
  description:
    "Buduje raport markdown na podstawie struktury danych. Args: {title, sections: [{heading, content}]}.",
  schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Tytuł raportu" },
      sections: { type: "array", description: "Tablica {heading, content}" },
    },
    required: ["title", "sections"],
  },
  costGrosze: 0,
  invoke: async (args) => {
    const title = String(args.title ?? "Raport");
    const sections = Array.isArray(args.sections) ? args.sections : [];
    const md: string[] = [`# ${title}`, ""];
    md.push(`*Wygenerowano: ${new Date().toISOString()}*`, "");
    for (const sec of sections as Array<{ heading?: string; content?: string }>) {
      if (sec.heading) md.push(`## ${sec.heading}`, "");
      if (sec.content) md.push(sec.content, "");
    }
    return md.join("\n");
  },
};

// ---------------------------------------------------------------------
// Rejestr
// ---------------------------------------------------------------------

const REGISTRY: Record<ToolName, AgentTool> = {
  search_law: SEARCH_LAW,
  search_cases: SEARCH_CASES,
  calc_deadline: CALC_DEADLINE,
  calc_vat: CALC_VAT,
  query_krs: QUERY_KRS,
  list_user_deadlines: LIST_USER_DEADLINES,
  draft_summary: DRAFT_SUMMARY,
  generate_report: GENERATE_REPORT,
};

export function getTool(name: string): AgentTool | null {
  return (REGISTRY as Record<string, AgentTool>)[name] ?? null;
}

export function listAllTools(): AgentTool[] {
  return Object.values(REGISTRY);
}

/** Buduje opis tools dla system prompt LLM-a. */
export function listToolsForLlm(filter?: ToolName[]): string {
  const tools = listAllTools().filter((t) => !filter || filter.includes(t.name));
  return tools
    .map((t) => {
      const props = Object.entries(t.schema.properties)
        .map(([k, v]) => `    ${k} (${v.type}): ${v.description}`)
        .join("\n");
      const required = t.schema.required?.join(", ") ?? "(none)";
      return `- ${t.name}: ${t.description}\n  args:\n${props}\n  required: ${required}`;
    })
    .join("\n\n");
}
