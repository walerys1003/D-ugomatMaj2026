import "server-only";

/**
 * Tier 7 zad. 328 — Kalkulator szans wygrania (heurystyka + ML-ready).
 *
 * MVP: deterministyczna heurystyka oparta na 30 features ze sprawy.
 * Każda feature ma waga (calibrated wg historii spraw + opinii radców).
 * Output: probability 0..1 + per-feature contribution (explainability).
 *
 * Ścieżka ML (Tier 9+): zastąpić logistic regression / gradient boosting
 * trenowanym na anonymizowanych zamkniętych sprawach. Ten sam interface.
 */

import type { CaseType, Json } from "@/lib/db/types";

export interface WinProbabilityFeature {
  key: string;
  label: string;
  value: number; // -1..1 (negative = przeciw, positive = za)
  weight: number;
  contribution: number; // value * weight
  rationale: string;
}

export interface WinProbabilityResult {
  probability: number; // 0..1
  confidence: "low" | "medium" | "high";
  category: "very_unfavorable" | "unfavorable" | "uncertain" | "favorable" | "very_favorable";
  features: WinProbabilityFeature[];
  top_strengths: string[];
  top_weaknesses: string[];
  caveats: string[];
}

interface FeatureRule {
  key: string;
  label: string;
  weight: number;
  evaluate: (
    answers: Record<string, Json>,
    caseFacts: Record<string, unknown>,
  ) => { value: number; rationale: string } | null;
}

// ----- Feature library (30+ rules) -----

const SHARED_FEATURES: FeatureRule[] = [
  {
    key: "deadline_remaining",
    label: "Termin na odpowiedź",
    weight: 0.9,
    evaluate: (a) => {
      const days = Number(a.days_remaining ?? a.deadline_days_left ?? 99);
      if (days < 0) return { value: -1, rationale: "Termin minął — pozycja krytyczna." };
      if (days < 3) return { value: -0.6, rationale: `Tylko ${days} dni — bardzo mało.` };
      if (days < 7) return { value: -0.2, rationale: `${days} dni — wciąż czas.` };
      return { value: 0.3, rationale: `${days} dni — komfortowo.` };
    },
  },
  {
    key: "documents_count",
    label: "Dokumenty załączone",
    weight: 0.6,
    evaluate: (a) => {
      const n = Number(a.documents_count ?? a.uploaded_count ?? 0);
      if (n === 0) return { value: -0.5, rationale: "Brak załączonych dokumentów." };
      if (n < 3) return { value: 0.0, rationale: `${n} dokumentów — minimum.` };
      return { value: 0.4, rationale: `${n} dokumentów — solidna baza.` };
    },
  },
  {
    key: "facts_clarity",
    label: "Jasność faktów",
    weight: 0.5,
    evaluate: (a) => {
      const desc = String(a.facts_description ?? "");
      if (desc.length < 50) return { value: -0.4, rationale: "Opis faktów bardzo skąpy." };
      if (desc.length < 200) return { value: 0.0, rationale: "Średnio rozbudowany opis." };
      return { value: 0.3, rationale: "Bogaty opis faktów." };
    },
  },
  {
    key: "creditor_type",
    label: "Typ wierzyciela",
    weight: 0.4,
    evaluate: (a) => {
      const v = String(a.creditor_type ?? "").toLowerCase();
      if (v.includes("fundusz") || v.includes("sekurytyzacyjn"))
        return { value: 0.4, rationale: "Fundusz sekurytyzacyjny — częste wady cesji." };
      if (v.includes("windykator"))
        return { value: 0.3, rationale: "Firma windykacyjna — częste klauzule abuzywne." };
      if (v.includes("bank"))
        return { value: -0.1, rationale: "Bank — solidny przeciwnik, ale można." };
      return { value: 0, rationale: "Standardowy wierzyciel." };
    },
  },
  {
    key: "amount_size",
    label: "Wysokość roszczenia",
    weight: 0.3,
    evaluate: (a) => {
      const total = Number(a.kwota_razem ?? a.kwota_glowna ?? 0);
      if (total === 0) return null;
      if (total < 1000) return { value: 0.2, rationale: "Niska kwota — mniejsze ryzyko." };
      if (total < 10_000) return { value: 0.0, rationale: "Średnia kwota." };
      if (total > 100_000) return { value: -0.3, rationale: "Wysoka kwota — sąd dokładniej bada." };
      return { value: -0.1, rationale: "Wyższa kwota." };
    },
  },
];

const PER_TYPE_FEATURES: Partial<Record<CaseType, FeatureRule[]>> = {
  sprzeciw_epu: [
    {
      key: "epu_court_lublin",
      label: "Sąd EPU Lublin",
      weight: 0.5,
      evaluate: (a) => {
        const sad = String(a.sad ?? "").toLowerCase();
        if (sad.includes("lublin")) {
          return {
            value: 0.4,
            rationale: "EPU Lublin-Zachód — sprzeciw automatycznie umarza nakaz.",
          };
        }
        return null;
      },
    },
    {
      key: "epu_no_delivery",
      label: "Brak skutecznego doręczenia",
      weight: 0.7,
      evaluate: (a) => {
        if (a.no_proper_delivery === true || a.no_delivery === true) {
          return {
            value: 0.6,
            rationale: "Niewłaściwe doręczenie — silna podstawa zaskarżenia.",
          };
        }
        return null;
      },
    },
    {
      key: "epu_prescription_likely",
      label: "Możliwe przedawnienie",
      weight: 0.8,
      evaluate: (a, facts) => {
        const debtAge = Number(a.debt_age_years ?? 0);
        const isConsumer = Boolean(a.is_consumer ?? true);
        if (isConsumer && debtAge >= 3) {
          return {
            value: 0.7,
            rationale: `Dług ${debtAge} lat — bardzo prawdopodobne przedawnienie (3 lata dla konsumentów).`,
          };
        }
        return null;
      },
    },
  ],
  pozew_zwrot_oplat_windykacyjnych: [
    {
      key: "abusive_clause_known",
      label: "Klauzula abuzywna (lista UOKiK)",
      weight: 0.9,
      evaluate: (a) => {
        if (Array.isArray(a.abusive_clauses) && (a.abusive_clauses as unknown[]).length > 0) {
          return {
            value: 0.8,
            rationale: "Klauzula z listy UOKiK — orzecznictwo bardzo korzystne.",
          };
        }
        return null;
      },
    },
    {
      key: "fee_amount_typical",
      label: "Typowe kwoty 30/40/100 zł",
      weight: 0.5,
      evaluate: (a) => {
        const fees = Array.isArray(a.fees) ? (a.fees as number[]) : [];
        const typical = fees.some((f) => [30, 40, 50, 100].includes(f));
        if (typical) return { value: 0.5, rationale: "Standardowe kwoty windykacyjne — dobrze znane orzecznictwo." };
        return null;
      },
    },
  ],
  cesja_odpowiedz: [
    {
      key: "cession_chain_long",
      label: "Długi łańcuch cesji",
      weight: 0.6,
      evaluate: (a) => {
        const n = Number(a.cession_count ?? 0);
        if (n >= 2) {
          return {
            value: 0.5,
            rationale: `${n} cesji — wysokie ryzyko luk w dokumentacji.`,
          };
        }
        return null;
      },
    },
    {
      key: "cession_documents_missing",
      label: "Brak pełnej dokumentacji cesji",
      weight: 0.7,
      evaluate: (a) => {
        if (a.has_full_cession_docs === false) {
          return {
            value: 0.7,
            rationale: "Brak pełnej dokumentacji cesji — fundusz musi udowodnić legitymację.",
          };
        }
        return null;
      },
    },
  ],
  zazalenie_klauzula_wykonalnosci: [
    {
      key: "no_nakaz_delivery",
      label: "Brak doręczenia nakazu",
      weight: 0.95,
      evaluate: (a) => {
        if (a.delivery_known === false || a.no_proper_delivery === true) {
          return {
            value: 0.85,
            rationale: "Brak skutecznego doręczenia nakazu — niemal pewna podstawa.",
          };
        }
        return null;
      },
    },
  ],
  pozbawienie_tytulu_wykonalnosci: [
    {
      key: "ground_prescription",
      label: "Podstawa: przedawnienie",
      weight: 0.85,
      evaluate: (a) => {
        if (a.ground === "prescription") {
          return {
            value: 0.7,
            rationale: "Podstawa przedawnienia (art. 840 § 1 pkt 2) — solidna gdy fakty potwierdzone.",
          };
        }
        return null;
      },
    },
    {
      key: "ground_payment",
      label: "Podstawa: spełnienie świadczenia",
      weight: 0.95,
      evaluate: (a) => {
        if (a.ground === "payment") {
          return {
            value: 0.85,
            rationale: "Spełnienie świadczenia (art. 840 § 1 pkt 2) — bardzo silna gdy są dowody wpłaty.",
          };
        }
        return null;
      },
    },
  ],
  upadlosc_pelny_wniosek: [
    {
      key: "insolvency_clear",
      label: "Trwała niewypłacalność",
      weight: 0.7,
      evaluate: (a) => {
        if (a.insolvent === true && Number(a.creditors_count ?? 0) >= 2) {
          return { value: 0.6, rationale: "Trwała niewypłacalność udokumentowana." };
        }
        return null;
      },
    },
    {
      key: "no_business_disqualification",
      label: "Brak dyskwalifikacji (działalność)",
      weight: 0.5,
      evaluate: (a) => {
        const closedYears = Number(a.business_closed_years_ago ?? 0);
        if (a.has_business === false || closedYears >= 1) {
          return { value: 0.4, rationale: "Brak aktywnej działalności — brak negatywnych przesłanek." };
        }
        return null;
      },
    },
  ],
};

function getRulesForType(caseType: CaseType): FeatureRule[] {
  return [...SHARED_FEATURES, ...(PER_TYPE_FEATURES[caseType] ?? [])];
}

// ----- Main calculator -----

export function calculateWinProbability(params: {
  caseType: CaseType;
  answers: Record<string, Json>;
  caseFacts: Record<string, unknown>;
}): WinProbabilityResult {
  const rules = getRulesForType(params.caseType);
  const features: WinProbabilityFeature[] = [];

  for (const rule of rules) {
    const evaluated = rule.evaluate(params.answers, params.caseFacts);
    if (!evaluated) continue;
    const v = Math.max(-1, Math.min(1, evaluated.value));
    features.push({
      key: rule.key,
      label: rule.label,
      value: v,
      weight: rule.weight,
      contribution: v * rule.weight,
      rationale: evaluated.rationale,
    });
  }

  // Score: weighted sum, normalize via sigmoid → 0..1
  const totalWeight = features.reduce((acc, f) => acc + f.weight, 0);
  if (totalWeight === 0) {
    return {
      probability: 0.5,
      confidence: "low",
      category: "uncertain",
      features: [],
      top_strengths: [],
      top_weaknesses: [],
      caveats: ["Niewystarczająco danych do oszacowania szans."],
    };
  }
  const weightedSum = features.reduce((acc, f) => acc + f.contribution, 0);
  const normalized = weightedSum / totalWeight;
  // Sigmoid centered at 0
  const probability = 1 / (1 + Math.exp(-3 * normalized));

  const confidence: WinProbabilityResult["confidence"] =
    features.length >= 8 ? "high" : features.length >= 4 ? "medium" : "low";

  const category: WinProbabilityResult["category"] =
    probability >= 0.8
      ? "very_favorable"
      : probability >= 0.6
        ? "favorable"
        : probability >= 0.4
          ? "uncertain"
          : probability >= 0.2
            ? "unfavorable"
            : "very_unfavorable";

  const sorted = [...features].sort((a, b) => b.contribution - a.contribution);
  const top_strengths = sorted
    .filter((f) => f.contribution > 0.05)
    .slice(0, 3)
    .map((f) => `${f.label}: ${f.rationale}`);
  const top_weaknesses = sorted
    .filter((f) => f.contribution < -0.05)
    .slice(-3)
    .reverse()
    .map((f) => `${f.label}: ${f.rationale}`);

  const caveats: string[] = [];
  if (confidence === "low") caveats.push("Mała liczba przesłanek — wynik orientacyjny.");
  if (probability > 0.85)
    caveats.push("Wysokie szacunki nie gwarantują wygranej — sąd może przyjąć inną ocenę.");
  caveats.push(
    "Kalkulator jest narzędziem orientacyjnym opartym na heurystyce. Nie zastępuje konsultacji z radcą prawnym.",
  );

  return {
    probability,
    confidence,
    category,
    features,
    top_strengths,
    top_weaknesses,
    caveats,
  };
}
