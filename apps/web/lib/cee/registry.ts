/**
 * Długomat — Tier 9 — CEE case-type registry.
 *
 * Unified interface dla wszystkich case_types per locale.
 * Każdy locale ma swoje case_types (PL ma 25 D1-D16, CZ/SK/HU/RO mają po 5).
 *
 * Wybór case_types per locale jest oddzielnym schematem niż PL `caseTypeMeta`
 * — celowo zwykła type-isolation, by błędy w nowych marketach nie wpływały
 * na PL produkcję.
 */
import type { Locale } from "@/lib/i18n/locales";
import { czCaseTypeMeta, type CzCaseMeta } from "./case-types-cz";
import { skCaseTypeMeta, type SkCaseMeta } from "./case-types-sk";
import { huCaseTypeMeta, type HuCaseMeta } from "./case-types-hu";
import { roCaseTypeMeta, type RoCaseMeta } from "./case-types-ro";

export interface UnifiedCaseMeta {
  locale: Locale;
  type: string;
  title: string;
  description: string;
  legalBasis: string;
  deadlineDays: number | null;
  priceGroszeEquiv: number;
  urlSlug: string;
}

function toUnified<T extends { type: string; title: string; description: string; legalBasis: string; deadlineDays: number | null; priceGroszeEquiv: number; urlSlug: string }>(
  meta: T,
  locale: Locale,
): UnifiedCaseMeta {
  return {
    locale,
    type: meta.type,
    title: meta.title,
    description: meta.description,
    legalBasis: meta.legalBasis,
    deadlineDays: meta.deadlineDays,
    priceGroszeEquiv: meta.priceGroszeEquiv,
    urlSlug: meta.urlSlug,
  };
}

export function listCaseTypesForLocale(locale: Locale): UnifiedCaseMeta[] {
  switch (locale) {
    case "cs":
      return Object.values(czCaseTypeMeta).map((m: CzCaseMeta) => toUnified(m, "cs"));
    case "sk":
      return Object.values(skCaseTypeMeta).map((m: SkCaseMeta) => toUnified(m, "sk"));
    case "hu":
      return Object.values(huCaseTypeMeta).map((m: HuCaseMeta) => toUnified(m, "hu"));
    case "ro":
      return Object.values(roCaseTypeMeta).map((m: RoCaseMeta) => toUnified(m, "ro"));
    case "pl":
    case "en":
    default:
      // PL handled by existing apps/web/lib/cases/case-types.ts (caseTypeMeta)
      return [];
  }
}

export function getCaseMetaForLocale(
  locale: Locale,
  type: string,
): UnifiedCaseMeta | null {
  const list = listCaseTypesForLocale(locale);
  return list.find((m) => m.type === type) ?? null;
}
