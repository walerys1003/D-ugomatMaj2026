"use server";

/**
 * OCR server actions (Tier 3.3).
 *
 * Flow:
 *   1. Klient robi Tesseract w przeglądarce (lib/ocr/tesseract-client.ts)
 *   2. Klient woła `submitOcrResultAction` z raw_text + parsed + fileHash
 *   3. Server akceptuje wynik, persistuje do `ocr_results`, zwraca id
 *
 * Alternatywnie (gdy klient nie potrafi zrobić Tesseract — np. Safari iOS
 * blokuje Web Worker): klient woła `runServerOcrAction(fileBytes, intent)`
 * który robi Textract → parser → DB.
 *
 * Bezpieczeństwo:
 *   - Wszystkie akcje walidują `auth.uid()`
 *   - Storage path: `<auth.uid()>/<date>/<filename>` — RLS w Tier 2 pilnuje
 *   - Limit pliku 20MB (bucket policy w Tier 2)
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { assertCsrfFromFormData } from "@/lib/security/csrf";
import { findCachedOcrByHash } from "./ocr-cache";
import { dispatchParser, sniffIntent } from "./parsers/dispatcher";
import {
  ocrFileWithTextract,
  TextractUnavailableError,
  isTextractAvailable,
} from "./textract-client";
import type {
  OcrIntent,
  OcrPipelineResult,
  ParsedDocument,
} from "./ocr-types";

// -----------------------------------------------------------------------------
// Submit-from-client (Tesseract path)
// -----------------------------------------------------------------------------
const submitSchema = z.object({
  fileHash: z.string().regex(/^[a-f0-9]{64}$/),
  fileName: z.string().min(1).max(200),
  fileSize: z.number().int().positive().max(20 * 1024 * 1024),
  mimeType: z.string().min(3).max(100),
  fileUrl: z.string().min(1).max(500), // path w bucket lub signed URL
  rawText: z.string().min(1).max(500_000),
  confidence: z.number().min(0).max(100),
  durationMs: z.number().int().min(0),
  intentHint: z
    .enum([
      "nakaz_zaplaty",
      "pismo_komornika",
      "raport_bik",
      "umowa_pozyczki",
      "pismo_sadowe",
      "unknown",
    ])
    .optional(),
  caseId: z.string().uuid().nullable().optional(),
  /** Tier 5 zad. 203 — CSRF token z cookie. */
  csrf: z.string().min(40),
});

export type SubmitOcrInput = z.infer<typeof submitSchema>;

/**
 * Akceptuje wynik klienckiego OCR (Tesseract). Server uruchamia parser,
 * persistuje row, zwraca pełny `OcrPipelineResult`.
 */
export async function submitOcrResultAction(
  input: SubmitOcrInput,
): Promise<OcrPipelineResult> {
  // Tier 5 zad. 203 — CSRF check przed parsowaniem (DoS protection).
  await assertCsrfFromFormData({ csrf: input.csrf });

  const parsed = submitSchema.parse(input);

  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Sesja wygasła — zaloguj się ponownie.");
  }
  const userId = userResult.user.id;

  // Cache check (24h)
  const cached = await findCachedOcrByHash(userId, parsed.fileHash);
  if (cached) {
    return {
      ocrResultId: cached.id,
      provider: cached.provider,
      rawText: cached.raw_text ?? "",
      confidence: cached.confidence ?? 0,
      parsed: (cached.extracted_data as { parsed?: ParsedDocument })?.parsed ?? {
        intent: "unknown",
        hints: ["Z cache — brak parsed."],
        completeness: 0,
      },
      durationMs: cached.processing_time_ms ?? 0,
      fileHash: parsed.fileHash,
    };
  }

  // Parse domeny
  const intent: OcrIntent = parsed.intentHint ?? sniffIntent(parsed.rawText);
  const parsedDoc = dispatchParser(parsed.rawText, intent);

  // Persist
  const insertResult = await supabase
    .from("ocr_results")
    .insert({
      case_id: parsed.caseId ?? null,
      user_id: userId,
      original_filename: parsed.fileName,
      file_url: parsed.fileUrl,
      file_size_bytes: parsed.fileSize,
      mime_type: parsed.mimeType,
      raw_text: parsed.rawText,
      extracted_data: {
        file_hash: parsed.fileHash,
        intent,
        parsed: parsedDoc,
      } as unknown as Record<string, unknown>,
      confidence: parsed.confidence,
      provider: "tesseract",
      processing_time_ms: parsed.durationMs,
      status: "completed",
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    throw new Error(
      `Nie udało się zapisać OCR: ${insertResult.error?.message ?? "nieznany błąd"}`,
    );
  }

  if (parsed.caseId) {
    revalidatePath(`/panel/sprawa/${parsed.caseId}`);
  }
  revalidatePath("/panel/skaner");

  return {
    ocrResultId: insertResult.data.id,
    provider: "tesseract",
    rawText: parsed.rawText,
    confidence: parsed.confidence,
    parsed: parsedDoc,
    durationMs: parsed.durationMs,
    fileHash: parsed.fileHash,
  };
}

// -----------------------------------------------------------------------------
// Server-side OCR fallback (Textract)
// -----------------------------------------------------------------------------
const serverOcrSchema = z.object({
  fileHash: z.string().regex(/^[a-f0-9]{64}$/),
  fileName: z.string().min(1).max(200),
  fileBase64: z.string().min(1), // base64 (max 10MB)
  mimeType: z.string().min(3).max(100),
  fileUrl: z.string().min(1).max(500),
  intentHint: z
    .enum([
      "nakaz_zaplaty",
      "pismo_komornika",
      "raport_bik",
      "umowa_pozyczki",
      "pismo_sadowe",
      "unknown",
    ])
    .optional(),
  caseId: z.string().uuid().nullable().optional(),
  /** Tier 5 zad. 203 — CSRF token. */
  csrf: z.string().min(40),
});

export type RunServerOcrInput = z.infer<typeof serverOcrSchema>;

/**
 * Server-side OCR przez Textract — używany gdy:
 *   - Tesseract zwrócił niski confidence (<60)
 *   - User ma starszą przeglądarkę bez Web Worker
 *   - Plik jest skanem o dziwnej orientacji
 *
 * Limit: <= 10MB (sync API). Większe → user dostaje komunikat.
 */
export async function runServerOcrAction(
  input: RunServerOcrInput,
): Promise<OcrPipelineResult> {
  // Tier 5 zad. 203 — CSRF check (akcja drogie: Textract = $).
  await assertCsrfFromFormData({ csrf: input.csrf });

  const parsed = serverOcrSchema.parse(input);

  if (!isTextractAvailable()) {
    throw new TextractUnavailableError(
      "Server-side OCR niedostępne (brak AWS credentials). Spróbuj ponownie później.",
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Sesja wygasła — zaloguj się ponownie.");
  }
  const userId = userResult.user.id;

  // Cache check
  const cached = await findCachedOcrByHash(userId, parsed.fileHash);
  if (cached) {
    return {
      ocrResultId: cached.id,
      provider: cached.provider,
      rawText: cached.raw_text ?? "",
      confidence: cached.confidence ?? 0,
      parsed: (cached.extracted_data as { parsed?: ParsedDocument })?.parsed ?? {
        intent: "unknown",
        hints: ["Z cache — brak parsed."],
        completeness: 0,
      },
      durationMs: cached.processing_time_ms ?? 0,
      fileHash: parsed.fileHash,
    };
  }

  // Decode base64 → bytes
  const bytes = Buffer.from(parsed.fileBase64, "base64");
  if (bytes.byteLength > 10 * 1024 * 1024) {
    throw new Error("Plik większy niż 10MB — Textract sync nie obsługuje.");
  }

  // OCR
  const raw = await ocrFileWithTextract(bytes, parsed.fileName);

  // Parse
  const intent: OcrIntent = parsed.intentHint ?? sniffIntent(raw.text);
  const parsedDoc = dispatchParser(raw.text, intent);

  // Persist
  const insertResult = await supabase
    .from("ocr_results")
    .insert({
      case_id: parsed.caseId ?? null,
      user_id: userId,
      original_filename: parsed.fileName,
      file_url: parsed.fileUrl,
      file_size_bytes: bytes.byteLength,
      mime_type: parsed.mimeType,
      raw_text: raw.text,
      extracted_data: {
        file_hash: parsed.fileHash,
        intent,
        parsed: parsedDoc,
      } as unknown as Record<string, unknown>,
      confidence: raw.confidence,
      provider: "textract",
      processing_time_ms: raw.durationMs,
      status: "completed",
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    throw new Error(
      `Nie udało się zapisać OCR (Textract): ${insertResult.error?.message ?? "nieznany błąd"}`,
    );
  }

  if (parsed.caseId) {
    revalidatePath(`/panel/sprawa/${parsed.caseId}`);
  }
  revalidatePath("/panel/skaner");

  return {
    ocrResultId: insertResult.data.id,
    provider: "textract",
    rawText: raw.text,
    confidence: raw.confidence,
    parsed: parsedDoc,
    durationMs: raw.durationMs,
    fileHash: parsed.fileHash,
  };
}

// -----------------------------------------------------------------------------
// Upload helper — zwraca signed upload URL do bucketa `ocr-uploads`
// -----------------------------------------------------------------------------
const uploadUrlSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(3).max(100),
  /** Tier 5 zad. 203 — CSRF token. */
  csrf: z.string().min(40),
});

export async function createOcrUploadUrlAction(input: {
  fileName: string;
  contentType: string;
  csrf: string;
}): Promise<{ uploadUrl: string; path: string; token: string }> {
  // Tier 5 zad. 203 — CSRF check przed wystawieniem signed URL.
  await assertCsrfFromFormData({ csrf: input.csrf });

  const parsed = uploadUrlSchema.parse(input);

  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Sesja wygasła — zaloguj się ponownie.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const safeName = parsed.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const path = `${userResult.user.id}/${today}/${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from("ocr-uploads")
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(
      `Nie udało się utworzyć URL uploadu: ${error?.message ?? "nieznany błąd"}`,
    );
  }

  return {
    uploadUrl: data.signedUrl,
    path,
    token: data.token,
  };
}

/**
 * Utwórz nową sprawę z OCR result (D1 Skaner Nakazu — darmowy use case).
 *
 * Bierze `ocr_results.id`, czyta `parsed`, mapuje na case_type + wizard_state,
 * wstawia case przez startCaseAction-style flow, łączy ocr_result.case_id.
 */
const createCaseFromOcrSchema = z.object({
  ocrResultId: z.string().uuid(),
  forceCaseType: z
    .enum(["sprzeciw_epu", "komornik_skarga", "bik_reklamacja_bank"])
    .optional(),
  /** Tier 5 zad. 203 — CSRF token. */
  csrf: z.string().min(40),
});

export async function createCaseFromOcrAction(input: {
  ocrResultId: string;
  forceCaseType?: "sprzeciw_epu" | "komornik_skarga" | "bik_reklamacja_bank";
  csrf: string;
}): Promise<{ caseId: string; caseType: string; redirectTo: string }> {
  // Tier 5 zad. 203 — CSRF check przed utworzeniem sprawy.
  await assertCsrfFromFormData({ csrf: input.csrf });

  const parsed = createCaseFromOcrSchema.parse(input);

  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Sesja wygasła — zaloguj się ponownie.");
  }
  const userId = userResult.user.id;

  // 1) Pobierz OCR result
  const { data: ocr, error: ocrErr } = await supabase
    .from("ocr_results")
    .select("*")
    .eq("id", parsed.ocrResultId)
    .eq("user_id", userId)
    .single();

  if (ocrErr || !ocr) {
    throw new Error("Nie znaleziono wyniku OCR.");
  }

  const extracted = (ocr.extracted_data as {
    parsed?: ParsedDocument;
    intent?: OcrIntent;
  }) ?? {};
  const parsedDoc = extracted.parsed;
  const intent = extracted.intent ?? "unknown";

  // 2) Dobierz case_type
  const caseType =
    parsed.forceCaseType ?? mapIntentToCaseType(intent);

  // 3) Mapuj parsed → wizard answers
  const answers = mapParsedToWizardAnswers(parsedDoc, caseType);

  // 4) Wstaw case
  const insertResult = await supabase
    .from("cases")
    .insert({
      user_id: userId,
      type: caseType,
      status: "draft",
      sygnatura: (answers.sygnatura as string | undefined) ?? null,
      sad: (answers.sad as string | undefined) ?? null,
      data_nakazu: (answers.data_nakazu as string | undefined) ?? null,
      data_doreczenia: (answers.data_doreczenia as string | undefined) ?? null,
      powod_nazwa: (answers.powod_nazwa as string | undefined) ?? null,
      powod_adres: (answers.powod_adres as string | undefined) ?? null,
      pozwany_nazwa: (answers.pozwany_nazwa as string | undefined) ?? null,
      pozwany_adres: (answers.pozwany_adres as string | undefined) ?? null,
      kwota_glowna: (answers.kwota_glowna as number | undefined) ?? null,
      kwota_odsetki: (answers.kwota_odsetki as number | undefined) ?? null,
      kwota_koszty: (answers.kwota_koszty as number | undefined) ?? null,
      wizard_state: {
        currentStep: 0,
        answers,
        completedSteps: [],
      } as unknown as Record<string, unknown>,
      metadata: {
        prefilled_from_ocr: parsed.ocrResultId,
        ocr_provider: ocr.provider,
        ocr_confidence: ocr.confidence,
      } as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    throw new Error(
      `Nie udało się utworzyć sprawy: ${insertResult.error?.message ?? "nieznany błąd"}`,
    );
  }
  const caseId = insertResult.data.id;

  // 5) Połącz ocr_result.case_id
  await supabase
    .from("ocr_results")
    .update({ case_id: caseId })
    .eq("id", parsed.ocrResultId);

  revalidatePath("/panel");
  revalidatePath("/panel/skaner");

  return {
    caseId,
    caseType,
    redirectTo: `/panel/sprawa/${caseId}`,
  };
}

function mapIntentToCaseType(
  intent: OcrIntent,
): "sprzeciw_epu" | "komornik_skarga" | "bik_reklamacja_bank" {
  switch (intent) {
    case "nakaz_zaplaty":
      return "sprzeciw_epu";
    case "pismo_komornika":
      return "komornik_skarga";
    case "raport_bik":
      return "bik_reklamacja_bank";
    default:
      return "sprzeciw_epu"; // bezpieczny default — najczęstszy use-case
  }
}

function mapParsedToWizardAnswers(
  parsedDoc: ParsedDocument | undefined,
  caseType: string,
): Record<string, unknown> {
  if (!parsedDoc) return {};
  if (caseType === "sprzeciw_epu" && parsedDoc.intent === "nakaz_zaplaty") {
    return {
      sygnatura: parsedDoc.sygnatura ?? "",
      sad: parsedDoc.sad ?? "",
      data_nakazu: parsedDoc.data_nakazu ?? "",
      data_doreczenia: parsedDoc.data_doreczenia ?? "",
      powod_nazwa: parsedDoc.powod_nazwa ?? "",
      powod_adres: parsedDoc.powod_adres ?? "",
      pozwany_nazwa: parsedDoc.pozwany_nazwa ?? "",
      pozwany_adres: parsedDoc.pozwany_adres ?? "",
      pozwany_pesel: parsedDoc.pozwany_pesel ?? "",
      kwota_glowna: parsedDoc.kwota_glowna ?? 0,
      kwota_odsetki: parsedDoc.kwota_odsetki ?? 0,
      kwota_koszty: parsedDoc.kwota_koszty ?? 0,
      zarzuty: [],
      okolicznosci: "",
    };
  }
  if (caseType === "bik_reklamacja_bank" && parsedDoc.intent === "raport_bik") {
    return {
      bank_nazwa: parsedDoc.bank_nazwa ?? "",
      numer_umowy: parsedDoc.numer_umowy ?? "",
      kwota_kredytu: parsedDoc.kwota_kredytu ?? 0,
      data_wpisu: parsedDoc.data_wpisu ?? "",
      rodzaj_nieprawidlowosci: parsedDoc.rodzaj_nieprawidlowosci ?? "",
      zarzuty: [],
      okolicznosci: "",
    };
  }
  return {};
}
