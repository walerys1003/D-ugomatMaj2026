/**
 * Tier 11 — Retrieval-augmented generation orchestrator.
 */
import { searchSimilar, RetrievedDoc } from "./vector-store";
import { callWithFallback, LlmMessage } from "../llm-client";
import { selectModel } from "../model-router";

export interface RagAnswer {
  answer: string;
  citations: { source_ref: string; title: string; score: number }[];
  model_id: string;
  input_tokens: number;
  output_tokens: number;
  cost_grosze: number;
}

export async function answerWithRag(question: string, opts?: { corpus?: string; topK?: number }): Promise<RagAnswer> {
  const docs = await searchSimilar(question, { corpus: opts?.corpus, topK: opts?.topK ?? 5 });
  const context = buildContext(docs);
  const route = selectModel({ taskType: "legal_reasoning", qualityHint: "premium" });
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        "Jesteś polskim prawnikiem. Odpowiadasz wyłącznie na podstawie dostarczonego kontekstu. " +
        "Cytuj źródła w nawiasach kwadratowych [źródło]. Jeśli kontekst nie zawiera odpowiedzi, " +
        "powiedz 'Brak wystarczających informacji w bazie wiedzy'.",
    },
    {
      role: "user",
      content: `Kontekst:\n${context}\n\nPytanie: ${question}`,
    },
  ];
  const res = await callWithFallback(route.primary, route.fallbacks, messages, { temperature: 0.1 });
  return {
    answer: res.text,
    citations: docs.map((d) => ({ source_ref: d.source_ref, title: d.title, score: d.score })),
    model_id: res.model_id,
    input_tokens: res.input_tokens,
    output_tokens: res.output_tokens,
    cost_grosze: res.cost_grosze,
  };
}

function buildContext(docs: RetrievedDoc[]): string {
  return docs
    .map((d, i) => `[${i + 1}] (${d.source_ref}) ${d.title}\n${d.text}`)
    .join("\n\n");
}
