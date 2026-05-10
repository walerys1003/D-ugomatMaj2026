/**
 * Tier 11 — OCR pipeline for Polish legal documents (vision-capable LLMs).
 * Extracts structured fields from scanned court letters and bailiff notices.
 */
import { callLlm, LlmMessage } from "../llm-client";
import { MODEL_REGISTRY } from "../model-router";

export interface OcrExtraction {
  document_type: "nakaz_zaplaty" | "wezwanie_komornicze" | "wezwanie_sadowe" | "pismo_procesowe" | "unknown";
  fields: Record<string, string>;
  confidence: number;
  raw_text: string;
}

export async function ocrDocumentFromImageUrl(imageUrl: string): Promise<OcrExtraction> {
  const model = MODEL_REGISTRY["claude-sonnet-4-5"];
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        "Jesteś systemem OCR dla polskich dokumentów sądowych. " +
        'Zwracaj JSON: {"document_type":"...","fields":{...},"confidence":0.0-1.0,"raw_text":"..."}. ' +
        "Pola do wyodrębnienia: sad, sygnatura, strony, kwota, data_doreczenia, termin.",
    },
    {
      role: "user",
      content: `Przeanalizuj dokument z URL: ${imageUrl}\n\nWyodrębnij wszystkie pola.`,
    },
  ];
  const res = await callLlm({ model, messages, temperature: 0, max_tokens: 2500 });
  try {
    const j = JSON.parse(extractJson(res.text));
    return {
      document_type: j.document_type ?? "unknown",
      fields: j.fields ?? {},
      confidence: Number(j.confidence ?? 0.5),
      raw_text: j.raw_text ?? res.text,
    };
  } catch {
    return { document_type: "unknown", fields: {}, confidence: 0.2, raw_text: res.text };
  }
}

function extractJson(s: string): string {
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b < 0) return s;
  return s.slice(a, b + 1);
}
