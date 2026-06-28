/**
 * Tier 11 — Hallucination guardrail. Combines citation validator + retrieval grounding score.
 */
import { hasHallucinatedCitations, validateCitations } from "./citation-validator";
import { searchSimilar } from "../rag/vector-store";
import { embed, cosineSim } from "../rag/embeddings";

export interface GuardrailReport {
  passed: boolean;
  citation_issues: number;
  grounding_score: number; // 0..1
  warnings: string[];
}

export async function checkOutput(answer: string, opts?: { corpus?: string }): Promise<GuardrailReport> {
  const cites = validateCitations(answer);
  const citationIssues = cites.filter((c) => !c.valid).length;
  let groundingScore = 1;
  const warnings: string[] = [];
  if (citationIssues > 0) {
    warnings.push(`${citationIssues} podejrzane cytaty prawne`);
  }
  try {
    const top = await searchSimilar(answer.slice(0, 1500), { corpus: opts?.corpus, topK: 3 });
    if (top.length > 0) {
      const ansVec = (await embed(answer.slice(0, 1500))).vector;
      const sims: number[] = [];
      for (const d of top) {
        const dVec = (await embed(d.text.slice(0, 1500))).vector;
        sims.push(cosineSim(ansVec, dVec));
      }
      groundingScore = sims.length ? Math.max(...sims) : 0;
      if (groundingScore < 0.6) warnings.push("niska podstawa źródłowa odpowiedzi");
    }
  } catch {
    warnings.push("nie udało się zweryfikować grounding");
  }
  const passed = citationIssues === 0 && groundingScore >= 0.55 && !hasHallucinatedCitations(answer);
  return { passed, citation_issues: citationIssues, grounding_score: groundingScore, warnings };
}
