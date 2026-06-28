/**
 * Tier 11 — Structured legal reasoning chain.
 * Decomposes a question into: facts → issues → rule → application → conclusion (IRAC).
 */
import { callWithFallback, LlmMessage } from "../llm-client";
import { selectModel } from "../model-router";

export interface IracAnalysis {
  facts: string;
  issues: string[];
  rule: string;
  application: string;
  conclusion: string;
  confidence: number;
  model_id: string;
  cost_grosze: number;
}

export async function runIracAnalysis(question: string, facts: string): Promise<IracAnalysis> {
  const route = selectModel({ taskType: "legal_reasoning", qualityHint: "premium" });
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        "Jesteś polskim prawnikiem stosującym metodę IRAC (Issue/Rule/Application/Conclusion). " +
        'Zawsze odpowiadaj jako JSON: {"facts":"","issues":["",""],"rule":"","application":"","conclusion":"","confidence":0.0-1.0}.',
    },
    { role: "user", content: `Stan faktyczny:\n${facts}\n\nPytanie prawne:\n${question}` },
  ];
  const res = await callWithFallback(route.primary, route.fallbacks, messages, { temperature: 0.1, max_tokens: 3000 });
  let parsed: any = {};
  try {
    parsed = JSON.parse(extractJson(res.text));
  } catch {
    parsed = { facts, issues: [question], rule: "", application: res.text, conclusion: "", confidence: 0.4 };
  }
  return {
    facts: String(parsed.facts ?? facts),
    issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
    rule: String(parsed.rule ?? ""),
    application: String(parsed.application ?? ""),
    conclusion: String(parsed.conclusion ?? ""),
    confidence: clamp(Number(parsed.confidence ?? 0.5), 0, 1),
    model_id: res.model_id,
    cost_grosze: res.cost_grosze,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, isFinite(n) ? n : lo));
}

function extractJson(s: string): string {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start < 0 || end < 0) return s;
  return s.slice(start, end + 1);
}
