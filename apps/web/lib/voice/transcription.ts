/**
 * Voice-to-text for open-ended wizard answers — zad. 333
 *
 * Two providers, fallback chain:
 *  1. Browser-native Web Speech API (SpeechRecognition) — handled client-side
 *  2. Server-side: OpenAI Whisper compatible API via apipod or direct
 *
 * This module provides only the server-side transcription helper.
 */

import { logger } from "@/lib/observability/logger";

export interface TranscribeInput {
  /** Raw audio bytes (webm, mp3, m4a, ogg, wav). */
  audio: Buffer | ArrayBuffer | Blob;
  /** Original filename — important for content-type detection. */
  filename: string;
  /** Language hint, default "pl" */
  language?: string;
  /** Optional text prompt to guide recognition (proper nouns). */
  prompt?: string;
}

export interface TranscribeResult {
  text: string;
  language: string;
  duration_ms: number;
  provider: "whisper" | "stub";
  confidence?: number;
  word_count: number;
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB (Whisper limit)

export async function transcribeAudio(input: TranscribeInput): Promise<TranscribeResult> {
  const startedAt = Date.now();
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.WHISPER_API_KEY;
  const apiBase = process.env.OPENAI_API_BASE ?? "https://api.openai.com/v1";

  if (!apiKey) {
    logger.warn("voice.no_api_key");
    return {
      text: "",
      language: input.language ?? "pl",
      duration_ms: Date.now() - startedAt,
      provider: "stub",
      word_count: 0,
    };
  }

  // Normalize to Blob for FormData
  let blob: Blob;
  if (input.audio instanceof Blob) {
    blob = input.audio;
  } else if (input.audio instanceof ArrayBuffer) {
    blob = new Blob([input.audio]);
  } else {
    blob = new Blob([input.audio]);
  }
  if (blob.size > MAX_AUDIO_BYTES) {
    throw new Error(`audio_too_large: ${blob.size} > ${MAX_AUDIO_BYTES}`);
  }

  const form = new FormData();
  form.append("file", blob, input.filename);
  form.append("model", "whisper-1");
  form.append("language", input.language ?? "pl");
  form.append("response_format", "verbose_json");
  if (input.prompt) form.append("prompt", input.prompt.slice(0, 1000));

  const resp = await fetch(`${apiBase}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    logger.warn("voice.whisper_failed", { status: resp.status, body: errText.slice(0, 500) });
    throw new Error(`whisper_failed: ${resp.status}`);
  }
  const data = (await resp.json()) as { text?: string; language?: string; duration?: number };
  const text = (data.text ?? "").trim();
  return {
    text,
    language: data.language ?? input.language ?? "pl",
    duration_ms: Date.now() - startedAt,
    provider: "whisper",
    word_count: text.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Light post-processing: capitalize first letter, ensure sentence-ending punctuation.
 */
export function tidyTranscript(text: string): string {
  let t = text.trim();
  if (!t) return "";
  t = t[0].toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += ".";
  return t;
}
