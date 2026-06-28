import "server-only";

/**
 * Prompt template loader — czyta `prompt_templates` per case_type/variant
 * i zwraca aktywny template gotowy do renderowania.
 *
 * Caching: in-memory na 60 s (każdy region serverless cache'uje osobno),
 * dzięki czemu wywołanie generacji nie wymaga round-tripu do DB.
 */
import type { CaseType, PromptTemplateRow } from "@/lib/db/types";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

interface CacheEntry {
  template: PromptTemplateRow;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

export class PromptNotFoundError extends Error {
  override name = "PromptNotFoundError" as const;
}

export async function loadActivePromptTemplate(
  caseType: CaseType,
  variant: string = "default",
): Promise<PromptTemplateRow> {
  const key = `${caseType}::${variant}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.template;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("case_type", caseType)
    .eq("variant", variant)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load prompt template: ${error.message}`);
  }
  if (!data) {
    throw new PromptNotFoundError(
      `Brak aktywnego promptu dla ${caseType}/${variant}.`,
    );
  }

  const template = data as PromptTemplateRow;
  cache.set(key, { template, expiresAt: now + CACHE_TTL_MS });
  return template;
}

/**
 * Renderuje user_prompt_template przez prosty {{key}} substitutor.
 *
 * Reguły:
 *   - {{key}} zastępujemy stringową reprezentacją variables[key]
 *   - undefined / null → pusty string
 *   - dla bezpieczeństwa NIE wykonujemy żadnej logiki / arytmetyki
 *     w template'ach (to nie jest mustache / liquid)
 */
export function renderPrompt(
  template: string,
  variables: Record<string, unknown>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) return "";
    if (Array.isArray(value)) return value.map(String).join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  });
}

/**
 * Sprawdza, czy wszystkie required_variables są obecne (i niepuste).
 * Caller (generation pipeline) wywołuje to przed wywołaniem LLM, by
 * fail-fast na brakujących polach z kreatora.
 */
export function validateRequiredVariables(
  template: PromptTemplateRow,
  variables: Record<string, unknown>,
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const key of template.required_variables ?? []) {
    const v = variables[key];
    if (v === undefined || v === null || v === "") {
      missing.push(key);
    }
  }
  return { ok: missing.length === 0, missing };
}

/** Test-only utility — clear cache between unit tests. */
export function _clearPromptCache(): void {
  cache.clear();
}
