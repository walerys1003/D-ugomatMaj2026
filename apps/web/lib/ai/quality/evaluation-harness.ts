/**
 * Tier 11 — Evaluation harness for legal AI outputs.
 * Runs golden test set against the current model chain and records per-metric scores.
 */
import { callWithFallback, LlmMessage } from "../llm-client";
import { selectModel } from "../model-router";

export interface GoldenCase {
  id: string;
  category: "sprzeciw" | "upadlosc" | "exekucja" | "classification";
  input: string;
  expected_keywords: string[];
  expected_min_length?: number;
  expected_citations?: string[];
}

export interface EvalResult {
  case_id: string;
  passed: boolean;
  score: number; // 0..1
  details: {
    keywords_found: number;
    keywords_total: number;
    length_ok: boolean;
    citations_found: number;
    citations_total: number;
  };
  output_excerpt: string;
}

export const GOLDEN_SET: GoldenCase[] = [
  {
    id: "sprzeciw-basic",
    category: "sprzeciw",
    input: "Otrzymałem nakaz zapłaty w postępowaniu upominawczym na kwotę 5000 zł od dnia 12.04.2026. Wskaż termin i podstawę sprzeciwu.",
    expected_keywords: ["dwóch tygodni", "art. 503", "k.p.c.", "sprzeciw"],
    expected_min_length: 150,
    expected_citations: ["art. 503", "k.p.c."],
  },
  {
    id: "upadlosc-basic",
    category: "upadlosc",
    input: "Mam 80 000 zł długu, 2800 zł dochodu, brak majątku. Czy mogę ogłosić upadłość?",
    expected_keywords: ["upadłość konsumencka", "niewypłacalność", "sąd"],
    expected_min_length: 200,
  },
  {
    id: "exekucja-skarga",
    category: "exekucja",
    input: "Komornik zajął rachunek bez zawiadomienia. Jaki środek zaskarżenia?",
    expected_keywords: ["skarga na czynności komornika", "art. 767", "k.p.c."],
    expected_min_length: 120,
    expected_citations: ["art. 767"],
  },
];

export async function runEvaluation(): Promise<{ results: EvalResult[]; pass_rate: number; avg_score: number }> {
  const route = selectModel({ taskType: "legal_reasoning", qualityHint: "premium" });
  const results: EvalResult[] = [];
  for (const c of GOLDEN_SET) {
    const messages: LlmMessage[] = [
      { role: "system", content: "Odpowiadaj zwięźle jako polski prawnik. Cytuj podstawy prawne." },
      { role: "user", content: c.input },
    ];
    try {
      const res = await callWithFallback(route.primary, route.fallbacks, messages, { temperature: 0.1 });
      const lower = res.text.toLowerCase();
      const keywordsFound = c.expected_keywords.filter((k) => lower.includes(k.toLowerCase())).length;
      const citationsFound = (c.expected_citations ?? []).filter((k) => lower.includes(k.toLowerCase())).length;
      const lengthOk = c.expected_min_length ? res.text.length >= c.expected_min_length : true;
      const keywordScore = keywordsFound / Math.max(1, c.expected_keywords.length);
      const citationScore = c.expected_citations?.length ? citationsFound / c.expected_citations.length : 1;
      const score = (keywordScore * 0.6 + citationScore * 0.3 + (lengthOk ? 0.1 : 0));
      results.push({
        case_id: c.id,
        passed: score >= 0.7,
        score,
        details: {
          keywords_found: keywordsFound,
          keywords_total: c.expected_keywords.length,
          length_ok: lengthOk,
          citations_found: citationsFound,
          citations_total: c.expected_citations?.length ?? 0,
        },
        output_excerpt: res.text.slice(0, 200),
      });
    } catch (e) {
      results.push({
        case_id: c.id,
        passed: false,
        score: 0,
        details: { keywords_found: 0, keywords_total: c.expected_keywords.length, length_ok: false, citations_found: 0, citations_total: c.expected_citations?.length ?? 0 },
        output_excerpt: `error: ${String(e)}`,
      });
    }
  }
  const passRate = results.filter((r) => r.passed).length / results.length;
  const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
  return { results, pass_rate: passRate, avg_score: avgScore };
}
