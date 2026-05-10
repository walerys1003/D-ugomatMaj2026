"use server";

/**
 * Document server actions.
 *
 * Tier 3 zakres (current):
 *   - generateDocumentFromWizardAction(caseId): pełen flow AI
 *       1. Spróbuj uruchomić runGenerationPipeline (Sonnet→Haiku→Opus + RAG)
 *       2. Persist documents row z metrykami (tokens, koszt, validation_score)
 *       3. Insert validation_runs (audyt Haiku)
 *       4. Fallback: jeśli AI niedostępne (AiUnavailableError / PromptNotFoundError /
 *          RAG/template/pipeline error) → Tier 2 static template (zawsze działa)
 *   - markDocumentDownloadedAction(documentId): bumpuje downloaded_at.
 *
 * Wszystkie błędy z pipeline są łapane lokalnie — user nigdy nie widzi
 * AI errora; w najgorszym wypadku dostaje pismo z static template
 * (Tarcza zawsze dostarcza dokument).
 */
import { revalidatePath } from "next/cache";
import { revalidateDocument } from "@/lib/cache/revalidation";
import { createHash } from "node:crypto";
import { assertCsrfFromFormData } from "@/lib/security/csrf";

import {
  getCaseById,
  logCaseEvent,
  patchCase,
} from "@/lib/cases/case-repository";
import { renderSprzeciwEpuMarkdown } from "@/lib/documents/templates/sprzeciw-epu";
import { renderBikFixMarkdown } from "@/lib/documents/templates/bik-fix";
import { renderKomornikMarkdown } from "@/lib/documents/templates/komornik";
import { renderPotraceniaMarkdown } from "@/lib/documents/templates/potracenia";
import { renderCesjaMarkdown } from "@/lib/documents/templates/cesja";
import { renderUgodaMarkdown } from "@/lib/documents/templates/ugoda";
import { renderUpadloscMarkdown } from "@/lib/documents/templates/upadlosc";
import type { SprzeciwEpuAnswers } from "@/lib/wizard/modules/sprzeciw-epu/schemas";
import type { BikFixAnswers } from "@/lib/wizard/modules/bik-fix/schemas";
import type { KomornikAnswers } from "@/lib/wizard/modules/komornik/schemas";
import type { PotraceniaAnswers } from "@/lib/wizard/modules/potracenia/schemas";
import type { CesjaAnswers } from "@/lib/wizard/modules/cesja/schemas";
import type { UgodaAnswers } from "@/lib/wizard/modules/ugoda/schemas";
import type {
  UpadloscAnswers,
  WierzycielItem,
} from "@/lib/wizard/modules/upadlosc/schemas";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { markdownToHtml } from "@/lib/documents/markdown-to-html";
import type { CaseRow, CaseType, Json } from "@/lib/db/types";
import {
  runGenerationPipeline,
  AiUnavailableError,
  PromptNotFoundError,
  type GenerationResult,
} from "@/lib/ai/generation-pipeline";
import {
  ActionRateLimitError,
  ActionUnauthenticatedError,
  guardAction,
} from "@/lib/security/server-action-guard";

export interface GeneratedDocumentSummary {
  documentId: string;
  caseId: string;
  pages?: number;
  /** 'ai' = AI pipeline; 'static' = Tier 2 static template fallback. */
  source: "ai" | "static";
  /** Wynik walidacji Haiku (0–100), undefined dla static fallbacku. */
  validationScore?: number;
}

export async function generateDocumentFromWizardAction(
  caseId: string,
  csrfToken: string,
): Promise<GeneratedDocumentSummary> {
  // Tier 5 zad. 203 — CSRF check pierwszy (najtańsza ochrona, fail fast).
  await assertCsrfFromFormData({ csrf: csrfToken });

  // Tier 5.1 — rate-limit + auth: 5 generacji / min per user.
  // Ochrona przed kosztownymi atakami DoS (każda generacja → AI tokens).
  let userId: string;
  try {
    const guard = await guardAction({
      profile: "documentGenerate",
      key: "document.generate",
    });
    userId = guard.userId!;
  } catch (e) {
    if (e instanceof ActionRateLimitError) {
      throw new Error(e.message);
    }
    if (e instanceof ActionUnauthenticatedError) {
      throw new Error(e.message);
    }
    throw e;
  }

  const caseRow = await getCaseById(caseId);
  if (!caseRow) throw new Error("Sprawa nie została znaleziona.");

  // Defense in depth — case musi należeć do zalogowanego usera.
  if (caseRow.user_id !== userId) {
    throw new Error("Brak dostępu do tej sprawy.");
  }

  const answers = caseRow.wizard_state.answers as Record<string, unknown>;
  if (!answers || Object.keys(answers).length === 0) {
    throw new Error("Brak danych z kreatora — wypełnij formularz.");
  }

  // Mark case as in-analysis (krótko, ale daje feedback w UI)
  await patchCase({ id: caseId, status: "analysis" });

  const supabase = createSupabaseServerClient();

  // -------------------------------------------------------------------------
  // 1) Spróbuj AI pipeline; jeśli niedostępny → static fallback
  // -------------------------------------------------------------------------
  const variables = composeVariables(caseRow.type, answers, caseRow);

  let aiResult: GenerationResult | null = null;
  let aiError: string | null = null;

  try {
    aiResult = await runGenerationPipeline({
      caseType: caseRow.type,
      variables,
      ragTags: ragTagsForCaseType(caseRow.type),
    });
  } catch (e) {
    if (e instanceof AiUnavailableError || e instanceof PromptNotFoundError) {
      // Spodziewane — przejdziemy na static fallback.
      aiError = e.message;
    } else {
      // Niespodziewane — logujemy, ale i tak fallbackujemy
      console.error("[generation-pipeline] unexpected error", e);
      aiError = e instanceof Error ? e.message : String(e);
    }
  }

  // -------------------------------------------------------------------------
  // 2) Wybór ścieżki: AI vs static
  // -------------------------------------------------------------------------
  let markdown: string;
  let promptHash: string;
  let aiModelUsed: string | null = null;
  let tokensInput: number | null = null;
  let tokensOutput: number | null = null;
  let aiCostUsd: number | null = null;
  let generationTimeMs: number | null = null;
  let validationScore: number | null = null;
  let validationIssues: Json = [];
  let isTemplate = true;
  let source: "ai" | "static" = "static";
  let changeSummary = "Wersja początkowa wygenerowana z szablonu (Tier 2 fallback).";

  if (aiResult) {
    markdown = aiResult.markdown;
    promptHash = aiResult.promptHash;
    aiModelUsed = aiResult.modelId;
    tokensInput = aiResult.tokensInput;
    tokensOutput = aiResult.tokensOutput;
    aiCostUsd = aiResult.costUsd;
    generationTimeMs = aiResult.durationMs;
    validationScore = aiResult.validation?.score ?? null;
    validationIssues = (aiResult.validation?.issues as unknown as Json) ?? [];
    isTemplate = false;
    source = "ai";
    changeSummary = `AI pipeline (${aiResult.finalRole}, model=${aiResult.modelId}, RAG=${aiResult.ragSource}).`;
  } else {
    const staticResult = renderForType(caseRow.type, answers, caseRow);
    markdown = staticResult.markdown;
    promptHash = staticResult.promptHash;
  }

  const html = markdownToHtml(markdown);

  // -------------------------------------------------------------------------
  // 3) Persist documents
  // -------------------------------------------------------------------------
  const insertResult = await supabase
    .from("documents")
    .insert({
      case_id: caseId,
      user_id: userId,
      type: caseRow.type,
      status: "generated",
      content_markdown: markdown,
      content_html: html,
      version: 1,
      is_template: isTemplate,
      ai_model_used: aiModelUsed,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      ai_cost_usd: aiCostUsd,
      generation_time_ms: generationTimeMs,
      validation_score: validationScore,
      validation_issues: validationIssues,
      prompt_hash: promptHash,
    })
    .select("id")
    .single();

  if (insertResult.error || !insertResult.data) {
    throw new Error(
      `Nie udało się zapisać pisma: ${insertResult.error?.message ?? "nieznany błąd"}`,
    );
  }
  const documentId = insertResult.data.id;

  // 4) Snapshot do document_versions (audyt)
  await supabase.from("document_versions").insert({
    document_id: documentId,
    version_number: 1,
    content_markdown: markdown,
    changed_by: source === "ai" ? "ai" : "system",
    change_summary: changeSummary,
  });

  // 5) Insert validation_runs (jeżeli AI walidacja zdarzyła się)
  if (aiResult?.validation) {
    const v = aiResult.validation;
    const { error: vErr } = await supabase.from("validation_runs").insert({
      document_id: documentId,
      case_id: caseId,
      user_id: userId,
      model: v.modelId,
      pass: v.pass,
      score: v.score,
      issues: (v.issues as unknown as Json) ?? [],
      raw_response: v.raw as unknown as Json,
      tokens_input: v.tokensInput,
      tokens_output: v.tokensOutput,
      cost_usd: v.costUsd,
      duration_ms: v.durationMs,
    });
    if (vErr) {
      // Nie blokujemy flow — audyt walidacji nie może wywrócić generacji.
      console.error("[validation_runs] insert failed", vErr.message);
    }
  }

  // 6) Bump case status
  const existingMeta = (caseRow.metadata as Record<string, unknown>) ?? {};
  await patchCase({
    id: caseId,
    status: "generated",
    metadata: {
      ...existingMeta,
      last_document_id: documentId,
      generated_via: source === "ai" ? "ai_pipeline" : "static_template",
      generated_at: new Date().toISOString(),
      ai_error: aiError ?? undefined,
      ai_model: aiModelUsed ?? undefined,
      ai_validation_score: validationScore ?? undefined,
    },
  });

  // 7) Audit event
  await logCaseEvent(caseId, "document_generated", {
    document_id: documentId,
    source,
    template_hash: promptHash,
    ai_model: aiModelUsed,
    validation_score: validationScore,
    fallback_reason: aiError,
  });

  // Tier 5.3 — tag-based invalidation (case + document + user list).
  revalidateDocument(caseId, documentId, userId);

  return {
    documentId,
    caseId,
    source,
    validationScore: validationScore ?? undefined,
  };
}

export async function markDocumentDownloadedAction(
  documentId: string,
  csrfToken: string,
): Promise<void> {
  // Tier 5 zad. 203 — CSRF check.
  await assertCsrfFromFormData({ csrf: csrfToken });

  // Tier 5.1 — generic API rate-limit (60/min) + auth check.
  // Mark download to akcja relatywnie tania, ale trzymamy spójność z resztą.
  let userId: string;
  try {
    const guard = await guardAction({
      profile: "api",
      key: "document.markDownloaded",
    });
    userId = guard.userId!;
  } catch (e) {
    if (e instanceof ActionRateLimitError) {
      throw new Error(e.message);
    }
    if (e instanceof ActionUnauthenticatedError) {
      throw new Error(e.message);
    }
    throw e;
  }

  const supabase = createSupabaseServerClient();
  // RLS i tak ogranicza widok do własnych dokumentów, ale dla pewności
  // używamy `.eq("user_id", userId)` — defense in depth.
  const { error } = await supabase
    .from("documents")
    .update({
      downloaded_at: new Date().toISOString(),
      status: "downloaded",
    })
    .eq("id", documentId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`Nie udało się oznaczyć pobrania: ${error.message}`);
  }
}

// -----------------------------------------------------------------------------
// Internal — variable composer (per case_type) — używany przez AI pipeline
// -----------------------------------------------------------------------------
function composeVariables(
  type: CaseType,
  answers: Record<string, unknown>,
  caseRow: CaseRow,
): Record<string, unknown> {
  switch (type) {
    case "sprzeciw_epu": {
      return {
        sygnatura: pick(answers.sygnatura, caseRow.sygnatura) ?? "",
        sad: pick(answers.sad, caseRow.sad) ?? "",
        data_nakazu: pick(answers.data_nakazu, caseRow.data_nakazu) ?? "",
        data_doreczenia:
          pick(answers.data_doreczenia, caseRow.data_doreczenia) ?? "",
        powod_nazwa: pick(answers.powod_nazwa, caseRow.powod_nazwa) ?? "",
        powod_adres: pick(answers.powod_adres, caseRow.powod_adres) ?? "",
        pozwany_nazwa: pick(answers.pozwany_nazwa, caseRow.pozwany_nazwa) ?? "",
        pozwany_adres: pick(answers.pozwany_adres, caseRow.pozwany_adres) ?? "",
        pozwany_pesel: (answers.pozwany_pesel as string) ?? "",
        kwota_glowna: Number(answers.kwota_glowna ?? caseRow.kwota_glowna ?? 0),
        kwota_odsetki: Number(
          answers.kwota_odsetki ?? caseRow.kwota_odsetki ?? 0,
        ),
        kwota_koszty: Number(answers.kwota_koszty ?? caseRow.kwota_koszty ?? 0),
        kwota_razem: Number(caseRow.kwota_razem ?? 0),
        zarzuty: (answers.zarzuty as string[]) ?? [],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    case "bik_reklamacja_bank":
    case "bik_reklamacja_bik":
    case "bik_skarga_uodo": {
      // BIK-Fix — wszystkie 3 warianty mają tę samą strukturę odpowiedzi.
      // Wariant decyduje o wybranym prompt template w loadActivePromptTemplate.
      const variantFromAnswers = answers.variant as string | undefined;
      const variantFromType: Record<string, string> = {
        bik_reklamacja_bank: "reklamacja_bank",
        bik_reklamacja_bik: "reklamacja_bik",
        bik_skarga_uodo: "skarga_uodo",
      };
      return {
        variant: variantFromAnswers ?? variantFromType[type] ?? "reklamacja_bank",
        powod_nazwa: (answers.powod_nazwa as string) ?? "",
        powod_adres: (answers.powod_adres as string) ?? "",
        pozwany_pesel: (answers.pozwany_pesel as string) ?? "",
        bank_nazwa: (answers.bank_nazwa as string) ?? "",
        bank_adres: (answers.bank_adres as string) ?? "",
        numer_umowy: (answers.numer_umowy as string) ?? "",
        kwota_kredytu: Number(answers.kwota_kredytu ?? 0),
        data_wpisu: (answers.data_wpisu as string) ?? "",
        status_wpisu: (answers.status_wpisu as string) ?? "",
        zarzuty: (answers.zarzuty as string[]) ?? [],
        rodzaj_nieprawidlowosci:
          (answers.rodzaj_nieprawidlowosci as string) ?? "",
        okolicznosci: (answers.okolicznosci as string) ?? "",
        data_reklamacji_bank: (answers.data_reklamacji_bank as string) ?? "",
        odpowiedz_banku: (answers.odpowiedz_banku as string) ?? "",
        data_reklamacji_bik: (answers.data_reklamacji_bik as string) ?? "",
        odpowiedz_bik: (answers.odpowiedz_bik as string) ?? "",
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    case "komornik_zwolnienie_konta":
    case "komornik_zwolnienie_swiadczen":
    case "komornik_skarga":
    case "komornik_ograniczenie":
    case "komornik_umorzenie":
    case "komornik_raty": {
      // D3 KomornikShield — 6 wariantów, wspólna struktura answers.
      // answers.variant pochodzi z kreatora (krok 1); fallback z case_type
      // gdy user wszedł bezpośrednio na konkretny typ sprawy.
      const variantFromType: Record<string, string> = {
        komornik_zwolnienie_konta: "zwolnienie_konta",
        komornik_zwolnienie_swiadczen: "zwolnienie_swiadczen",
        komornik_skarga: "skarga",
        komornik_ograniczenie: "ograniczenie",
        komornik_umorzenie: "umorzenie",
        komornik_raty: "raty",
      };
      const variant =
        (answers.variant as string | undefined) ?? variantFromType[type] ?? "skarga";
      return {
        variant,
        // Dłużnik (wnioskodawca)
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        // Komornik / kancelaria
        kancelaria_nazwa: (answers.kancelaria_nazwa as string) ?? "",
        kancelaria_adres: (answers.kancelaria_adres as string) ?? "",
        sygnatura_km:
          (answers.sygnatura_km as string) ?? caseRow.sygnatura ?? "",
        wierzyciel:
          (answers.wierzyciel as string) ?? caseRow.powod_nazwa ?? "",
        // Zajęcie
        zajecie_typ: (answers.zajecie_typ as string) ?? "inne",
        kwota_dochodzona: Number(
          answers.kwota_dochodzona ?? caseRow.kwota_glowna ?? 0,
        ),
        data_pisma: (answers.data_pisma as string) ?? "",
        // Uzasadnienie
        sytuacja: (answers.sytuacja as string[]) ?? [],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        // Skarga (warunkowo)
        czynnosc_komornika: (answers.czynnosc_komornika as string) ?? "",
        data_doreczenia: (answers.data_doreczenia as string) ?? "",
        // Raty (warunkowo)
        rata_miesieczna: Number(answers.rata_miesieczna ?? 0),
        liczba_rat: Number(answers.liczba_rat ?? 0),
        data_pierwszej_raty: (answers.data_pierwszej_raty as string) ?? "",
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    case "cesja_odpowiedz": {
      // D6 CesjaCheck — odpowiedź na wezwanie funduszu sekurytyzacyjnego.
      return {
        // Dłużnik (wnioskodawca)
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        // Fundusz / windykator
        fundusz_nazwa:
          (answers.fundusz_nazwa as string) ?? caseRow.powod_nazwa ?? "",
        fundusz_adres:
          (answers.fundusz_adres as string) ?? caseRow.powod_adres ?? "",
        fundusz_nip: (answers.fundusz_nip as string) ?? "",
        // Wezwanie
        data_wezwania: (answers.data_wezwania as string) ?? "",
        sygnatura_funduszu:
          (answers.sygnatura_funduszu as string) ?? caseRow.sygnatura ?? "",
        kwota_dochodzona: Number(
          answers.kwota_dochodzona ?? caseRow.kwota_glowna ?? 0,
        ),
        // Pierwotna wierzytelność
        pierwotny_wierzyciel:
          (answers.pierwotny_wierzyciel as string) ?? "",
        numer_umowy: (answers.numer_umowy as string) ?? "",
        data_umowy: (answers.data_umowy as string) ?? "",
        data_wymagalnosci: (answers.data_wymagalnosci as string) ?? "",
        // Zarzuty
        zarzuty: (answers.zarzuty as string[]) ?? [],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    case "potracenia_wniosek_pracodawca":
    case "potracenia_wniosek_komornik": {
      // D4 PotrąceniaStop — 2 warianty, wspólna struktura answers.
      const variantFromType: Record<string, string> = {
        potracenia_wniosek_pracodawca: "wniosek_pracodawca",
        potracenia_wniosek_komornik: "wniosek_komornik",
      };
      const variant =
        (answers.variant as string | undefined) ??
        variantFromType[type] ??
        "wniosek_pracodawca";
      return {
        variant,
        // Wnioskodawca
        wnioskodawca_nazwa:
          (answers.wnioskodawca_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        wnioskodawca_adres:
          (answers.wnioskodawca_adres as string) ?? caseRow.pozwany_adres ?? "",
        wnioskodawca_pesel: (answers.wnioskodawca_pesel as string) ?? "",
        // Zatrudnienie
        pracodawca_nazwa: (answers.pracodawca_nazwa as string) ?? "",
        pracodawca_adres: (answers.pracodawca_adres as string) ?? "",
        stanowisko: (answers.stanowisko as string) ?? "",
        forma_zatrudnienia:
          (answers.forma_zatrudnienia as string) ?? "umowa_o_prace",
        wynagrodzenie_netto: Number(answers.wynagrodzenie_netto ?? 0),
        // Potrącenie
        potracenie_typ:
          (answers.potracenie_typ as string) ?? "niealimentacyjne",
        kwota_potracenia: Number(answers.kwota_potracenia ?? 0),
        procent_wynagrodzenia:
          typeof answers.procent_wynagrodzenia === "number"
            ? answers.procent_wynagrodzenia
            : undefined,
        data_pierwszego_potracenia:
          (answers.data_pierwszego_potracenia as string) ?? "",
        // Sytuacja
        sytuacja: (answers.sytuacja as string[]) ?? [],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        // Komornik (warunkowo)
        kancelaria_nazwa: (answers.kancelaria_nazwa as string) ?? "",
        kancelaria_adres: (answers.kancelaria_adres as string) ?? "",
        sygnatura_km:
          (answers.sygnatura_km as string) ?? caseRow.sygnatura ?? "",
        wierzyciel:
          (answers.wierzyciel as string) ?? caseRow.powod_nazwa ?? "",
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    case "upadlosc_wniosek": {
      // D8 Upadłość-Lite — wniosek o ogłoszenie upadłości konsumenckiej.
      const wierzyciele = Array.isArray(answers.wierzyciele)
        ? (answers.wierzyciele as WierzycielItem[])
        : [];
      const sumaZobowiazan = wierzyciele.reduce(
        (acc, w) => acc + (Number(w.kwota) || 0),
        0,
      );
      return {
        // Dłużnik
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        dluznik_nip: (answers.dluznik_nip as string) ?? "",
        dluznik_email: (answers.dluznik_email as string) ?? "",
        dluznik_telefon: (answers.dluznik_telefon as string) ?? "",
        // Sąd
        sad_nazwa: (answers.sad_nazwa as string) ?? caseRow.sad ?? "",
        sad_adres: (answers.sad_adres as string) ?? "",
        // Sytuacja zawodowa
        status_zawodowy:
          (answers.status_zawodowy as string) ?? "konsument",
        data_zakonczenia_dzialalnosci:
          (answers.data_zakonczenia_dzialalnosci as string) ?? "",
        forma_dochodu:
          (answers.forma_dochodu as string) ?? "umowa_o_prace",
        dochod_miesieczny: Number(answers.dochod_miesieczny ?? 0),
        liczba_osob_na_utrzymaniu: Number(answers.liczba_osob_na_utrzymaniu ?? 0),
        // Majątek
        posiada_nieruchomosc: Boolean(answers.posiada_nieruchomosc),
        nieruchomosc_opis: (answers.nieruchomosc_opis as string) ?? "",
        posiada_pojazd: Boolean(answers.posiada_pojazd),
        pojazd_opis: (answers.pojazd_opis as string) ?? "",
        srodki_na_koncie: Number(answers.srodki_na_koncie ?? 0),
        inne_skladniki: (answers.inne_skladniki as string) ?? "",
        // Wierzyciele
        wierzyciele,
        suma_zobowiazan: sumaZobowiazan,
        liczba_wierzycieli: wierzyciele.length,
        // Niewypłacalność
        przyczyny: (answers.przyczyny as string[]) ?? [],
        data_powstania_niewyplacalnosci:
          (answers.data_powstania_niewyplacalnosci as string) ?? "",
        uzasadnienie: (answers.uzasadnienie as string) ?? "",
        // Załączniki
        zalaczniki: (answers.zalaczniki as string[]) ?? [],
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    case "ugoda_raty":
    case "ugoda_umorzenie":
    case "ugoda_propozycja": {
      // D7 UgodoMat — 3 warianty propozycji ugody, wspólna struktura answers.
      // answers.variant pochodzi z kreatora (krok 1); fallback z case_type
      // gdy user wszedł bezpośrednio na konkretny typ sprawy.
      const variantFromType: Record<string, string> = {
        ugoda_raty: "propozycja_raty",
        ugoda_umorzenie: "propozycja_umorzenie",
        ugoda_propozycja: "propozycja_indywidualna",
      };
      const variant =
        (answers.variant as string | undefined) ??
        variantFromType[type] ??
        "propozycja_raty";
      return {
        variant,
        // Dłużnik (wnioskodawca)
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        // Wierzyciel (bank / fundusz / windykator)
        wierzyciel_nazwa:
          (answers.wierzyciel_nazwa as string) ?? caseRow.powod_nazwa ?? "",
        wierzyciel_adres:
          (answers.wierzyciel_adres as string) ?? caseRow.powod_adres ?? "",
        // Zobowiązanie
        numer_umowy: (answers.numer_umowy as string) ?? "",
        sygnatura:
          (answers.sygnatura as string) ?? caseRow.sygnatura ?? "",
        kwota_zadluzenia: Number(
          answers.kwota_zadluzenia ?? caseRow.kwota_glowna ?? 0,
        ),
        data_wymagalnosci: (answers.data_wymagalnosci as string) ?? "",
        // Propozycja — raty (warunkowo)
        rata_miesieczna: Number(answers.rata_miesieczna ?? 0),
        liczba_rat: Number(answers.liczba_rat ?? 0),
        data_pierwszej_raty: (answers.data_pierwszej_raty as string) ?? "",
        // Propozycja — umorzenie (warunkowo)
        kwota_proponowana: Number(answers.kwota_proponowana ?? 0),
        procent_umorzenia: Number(answers.procent_umorzenia ?? 0),
        termin_zaplaty: (answers.termin_zaplaty as string) ?? "",
        // Sytuacja / uzasadnienie
        sytuacja: (answers.sytuacja as string[]) ?? [],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
    }
    default:
      // Generic fallback — przekazujemy answers + meta jako-tako; AI sobie poradzi
      // jeśli prompt template requires inaczej.
      return {
        ...answers,
        sygnatura: caseRow.sygnatura ?? answers.sygnatura ?? "",
        sad: caseRow.sad ?? answers.sad ?? "",
        powod_nazwa: caseRow.powod_nazwa ?? answers.powod_nazwa ?? "",
        pozwany_nazwa: caseRow.pozwany_nazwa ?? answers.pozwany_nazwa ?? "",
        kwota_glowna: Number(caseRow.kwota_glowna ?? answers.kwota_glowna ?? 0),
        data_dzisiejsza: new Date().toISOString().slice(0, 10),
      };
  }
}

/**
 * RAG tag filter — dla każdego case_type kierujemy retriever do
 * najbardziej istotnych chunków knowledge base (Tier 0 KB ma 15 tagów).
 */
function ragTagsForCaseType(type: CaseType): string[] {
  if (type === "sprzeciw_epu") return ["modules-d2", "modules"];
  if (type.startsWith("komornik_")) return ["modules-d3", "modules"];
  if (type.startsWith("potracenia_")) return ["modules-d4", "modules"];
  if (type.startsWith("bik_")) return ["modules-d5", "modules"];
  if (type === "cesja_odpowiedz") return ["modules-d6", "modules"];
  if (type.startsWith("ugoda_")) return ["modules-d7", "modules"];
  if (type === "upadlosc_wniosek") return ["modules-d8", "modules"];
  return ["modules"];
}

// -----------------------------------------------------------------------------
// Internal — per-case_type STATIC renderer dispatch (Tier 2 fallback)
// -----------------------------------------------------------------------------
function renderForType(
  type: CaseType,
  answers: Record<string, unknown>,
  caseRow: CaseRow,
): { markdown: string; promptHash: string } {
  switch (type) {
    case "sprzeciw_epu": {
      const sa: SprzeciwEpuAnswers = {
        sygnatura: pick(answers.sygnatura, caseRow.sygnatura) ?? "",
        sad: pick(answers.sad, caseRow.sad) ?? "",
        data_nakazu: pick(answers.data_nakazu, caseRow.data_nakazu) ?? "",
        data_doreczenia:
          pick(answers.data_doreczenia, caseRow.data_doreczenia) ?? "",
        powod_nazwa: pick(answers.powod_nazwa, caseRow.powod_nazwa) ?? "",
        powod_adres: pick(answers.powod_adres, caseRow.powod_adres) ?? "",
        pozwany_nazwa: pick(answers.pozwany_nazwa, caseRow.pozwany_nazwa) ?? "",
        pozwany_adres: pick(answers.pozwany_adres, caseRow.pozwany_adres) ?? "",
        pozwany_pesel: (answers.pozwany_pesel as string) ?? "",
        kwota_glowna: Number(answers.kwota_glowna ?? caseRow.kwota_glowna ?? 0),
        kwota_odsetki: Number(
          answers.kwota_odsetki ?? caseRow.kwota_odsetki ?? 0,
        ),
        kwota_koszty: Number(answers.kwota_koszty ?? caseRow.kwota_koszty ?? 0),
        zarzuty: (answers.zarzuty as string[]) ?? [],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        consent_truth: true,
      };
      const result = renderSprzeciwEpuMarkdown(sa);
      const dataDigest = createHash("sha256")
        .update(result.promptHash + ":" + sa.sygnatura)
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    case "bik_reklamacja_bank":
    case "bik_reklamacja_bik":
    case "bik_skarga_uodo": {
      // BIK-Fix — static fallback dla wszystkich 3 wariantów.
      // Wariant pochodzi z answers.variant (krok 1 wizarda), z fallbackiem na case_type.
      const variantFromType: Record<string, BikFixAnswers["variant"]> = {
        bik_reklamacja_bank: "reklamacja_bank",
        bik_reklamacja_bik: "reklamacja_bik",
        bik_skarga_uodo: "skarga_uodo",
      };
      const variant = ((answers.variant as BikFixAnswers["variant"]) ??
        variantFromType[type]) as BikFixAnswers["variant"];

      const ba: BikFixAnswers = {
        variant,
        powod_nazwa: (answers.powod_nazwa as string) ?? "",
        powod_adres: (answers.powod_adres as string) ?? "",
        pozwany_pesel: (answers.pozwany_pesel as string) ?? "",
        bank_nazwa: (answers.bank_nazwa as string) ?? "",
        bank_adres: (answers.bank_adres as string) ?? "",
        numer_umowy: (answers.numer_umowy as string) ?? "",
        kwota_kredytu: Number(answers.kwota_kredytu ?? 0),
        data_wpisu: (answers.data_wpisu as string) ?? "",
        status_wpisu: answers.status_wpisu as BikFixAnswers["status_wpisu"],
        zarzuty: ((answers.zarzuty as string[]) ?? []) as BikFixAnswers["zarzuty"],
        rodzaj_nieprawidlowosci:
          (answers.rodzaj_nieprawidlowosci as string) ?? "",
        okolicznosci: (answers.okolicznosci as string) ?? "",
        data_reklamacji_bank: (answers.data_reklamacji_bank as string) ?? "",
        odpowiedz_banku: (answers.odpowiedz_banku as string) ?? "",
        data_reklamacji_bik: (answers.data_reklamacji_bik as string) ?? "",
        odpowiedz_bik: (answers.odpowiedz_bik as string) ?? "",
        consent_truth: true,
      };
      const result = renderBikFixMarkdown(ba);
      const dataDigest = createHash("sha256")
        .update(result.promptHash + ":" + ba.numer_umowy)
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    case "komornik_zwolnienie_konta":
    case "komornik_zwolnienie_swiadczen":
    case "komornik_skarga":
    case "komornik_ograniczenie":
    case "komornik_umorzenie":
    case "komornik_raty": {
      // D3 KomornikShield — static fallback dla 6 wariantów.
      // Wariant pochodzi z answers.variant (krok 1), z fallbackiem na case_type.
      const variantFromType: Record<string, KomornikAnswers["variant"]> = {
        komornik_zwolnienie_konta: "zwolnienie_konta",
        komornik_zwolnienie_swiadczen: "zwolnienie_swiadczen",
        komornik_skarga: "skarga",
        komornik_ograniczenie: "ograniczenie",
        komornik_umorzenie: "umorzenie",
        komornik_raty: "raty",
      };
      const variant = ((answers.variant as KomornikAnswers["variant"]) ??
        variantFromType[type]) as KomornikAnswers["variant"];

      const ka: KomornikAnswers = {
        variant,
        // Dłużnik
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        // Komornik
        kancelaria_nazwa: (answers.kancelaria_nazwa as string) ?? "",
        kancelaria_adres: (answers.kancelaria_adres as string) ?? "",
        sygnatura_km:
          (answers.sygnatura_km as string) ?? caseRow.sygnatura ?? "",
        wierzyciel:
          (answers.wierzyciel as string) ?? caseRow.powod_nazwa ?? "",
        // Zajęcie
        zajecie_typ: (answers.zajecie_typ as KomornikAnswers["zajecie_typ"]) ?? "inne",
        kwota_dochodzona: Number(
          answers.kwota_dochodzona ?? caseRow.kwota_glowna ?? 0,
        ),
        data_pisma: (answers.data_pisma as string) ?? "",
        // Uzasadnienie
        sytuacja: ((answers.sytuacja as string[]) ?? []) as KomornikAnswers["sytuacja"],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        // Skarga (warunkowo)
        czynnosc_komornika: (answers.czynnosc_komornika as string) ?? "",
        data_doreczenia: (answers.data_doreczenia as string) ?? "",
        // Raty (warunkowo)
        rata_miesieczna: Number(answers.rata_miesieczna ?? 0),
        liczba_rat: Number(answers.liczba_rat ?? 0),
        data_pierwszej_raty: (answers.data_pierwszej_raty as string) ?? "",
        consent_truth: true,
      };
      const result = renderKomornikMarkdown(ka);
      const dataDigest = createHash("sha256")
        .update(result.promptHash + ":" + ka.sygnatura_km)
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    case "cesja_odpowiedz": {
      // D6 CesjaCheck — static fallback (1 wariant: odpowiedź na wezwanie funduszu).
      const ca: CesjaAnswers = {
        // Dłużnik
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        // Fundusz
        fundusz_nazwa:
          (answers.fundusz_nazwa as string) ?? caseRow.powod_nazwa ?? "",
        fundusz_adres:
          (answers.fundusz_adres as string) ?? caseRow.powod_adres ?? "",
        fundusz_nip: (answers.fundusz_nip as string) ?? "",
        // Wezwanie
        data_wezwania: (answers.data_wezwania as string) ?? "",
        sygnatura_funduszu:
          (answers.sygnatura_funduszu as string) ?? caseRow.sygnatura ?? "",
        kwota_dochodzona: Number(
          answers.kwota_dochodzona ?? caseRow.kwota_glowna ?? 0,
        ),
        // Pierwotna wierzytelność
        pierwotny_wierzyciel:
          (answers.pierwotny_wierzyciel as string) ?? "",
        numer_umowy: (answers.numer_umowy as string) ?? "",
        data_umowy: (answers.data_umowy as string) ?? "",
        data_wymagalnosci: (answers.data_wymagalnosci as string) ?? "",
        // Zarzuty
        zarzuty: ((answers.zarzuty as string[]) ??
          []) as CesjaAnswers["zarzuty"],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        consent_truth: true,
      };
      const result = renderCesjaMarkdown(ca);
      const dataDigest = createHash("sha256")
        .update(
          result.promptHash +
            ":" +
            (ca.fundusz_nazwa || ca.pierwotny_wierzyciel || ""),
        )
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    case "potracenia_wniosek_pracodawca":
    case "potracenia_wniosek_komornik": {
      // D4 PotrąceniaStop — static fallback dla 2 wariantów.
      const variantFromType: Record<string, PotraceniaAnswers["variant"]> = {
        potracenia_wniosek_pracodawca: "wniosek_pracodawca",
        potracenia_wniosek_komornik: "wniosek_komornik",
      };
      const variant = ((answers.variant as PotraceniaAnswers["variant"]) ??
        variantFromType[type]) as PotraceniaAnswers["variant"];

      const pa: PotraceniaAnswers = {
        variant,
        // Wnioskodawca
        wnioskodawca_nazwa:
          (answers.wnioskodawca_nazwa as string) ??
          caseRow.pozwany_nazwa ??
          "",
        wnioskodawca_adres:
          (answers.wnioskodawca_adres as string) ??
          caseRow.pozwany_adres ??
          "",
        wnioskodawca_pesel: (answers.wnioskodawca_pesel as string) ?? "",
        // Zatrudnienie
        pracodawca_nazwa: (answers.pracodawca_nazwa as string) ?? "",
        pracodawca_adres: (answers.pracodawca_adres as string) ?? "",
        stanowisko: (answers.stanowisko as string) ?? "",
        forma_zatrudnienia:
          (answers.forma_zatrudnienia as PotraceniaAnswers["forma_zatrudnienia"]) ??
          "umowa_o_prace",
        wynagrodzenie_netto: Number(answers.wynagrodzenie_netto ?? 0),
        // Potrącenie
        potracenie_typ:
          (answers.potracenie_typ as PotraceniaAnswers["potracenie_typ"]) ??
          "niealimentacyjne",
        kwota_potracenia: Number(answers.kwota_potracenia ?? 0),
        procent_wynagrodzenia:
          typeof answers.procent_wynagrodzenia === "number"
            ? answers.procent_wynagrodzenia
            : undefined,
        data_pierwszego_potracenia:
          (answers.data_pierwszego_potracenia as string) ?? "",
        // Sytuacja
        sytuacja: ((answers.sytuacja as string[]) ??
          []) as PotraceniaAnswers["sytuacja"],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        // Komornik (warunkowo)
        kancelaria_nazwa: (answers.kancelaria_nazwa as string) ?? "",
        kancelaria_adres: (answers.kancelaria_adres as string) ?? "",
        sygnatura_km:
          (answers.sygnatura_km as string) ?? caseRow.sygnatura ?? "",
        wierzyciel:
          (answers.wierzyciel as string) ?? caseRow.powod_nazwa ?? "",
        consent_truth: true,
      };
      const result = renderPotraceniaMarkdown(pa);
      const dataDigest = createHash("sha256")
        .update(
          result.promptHash + ":" + (pa.pracodawca_nazwa || pa.sygnatura_km || ""),
        )
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    case "ugoda_raty":
    case "ugoda_umorzenie":
    case "ugoda_propozycja": {
      // D7 UgodoMat — static fallback dla 3 wariantów propozycji ugody.
      // Wariant pochodzi z answers.variant (krok 1), z fallbackiem na case_type.
      const variantFromType: Record<string, UgodaAnswers["variant"]> = {
        ugoda_raty: "propozycja_raty",
        ugoda_umorzenie: "propozycja_umorzenie",
        ugoda_propozycja: "propozycja_indywidualna",
      };
      const variant = ((answers.variant as UgodaAnswers["variant"]) ??
        variantFromType[type]) as UgodaAnswers["variant"];

      const ua: UgodaAnswers = {
        variant,
        // Dłużnik
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        // Wierzyciel
        wierzyciel_nazwa:
          (answers.wierzyciel_nazwa as string) ?? caseRow.powod_nazwa ?? "",
        wierzyciel_adres:
          (answers.wierzyciel_adres as string) ?? caseRow.powod_adres ?? "",
        // Zobowiązanie
        numer_umowy: (answers.numer_umowy as string) ?? "",
        sygnatura:
          (answers.sygnatura as string) ?? caseRow.sygnatura ?? "",
        kwota_zadluzenia: Number(
          answers.kwota_zadluzenia ?? caseRow.kwota_glowna ?? 0,
        ),
        data_wymagalnosci: (answers.data_wymagalnosci as string) ?? "",
        // Propozycja — raty (warunkowo)
        rata_miesieczna:
          typeof answers.rata_miesieczna === "number"
            ? answers.rata_miesieczna
            : answers.rata_miesieczna != null
              ? Number(answers.rata_miesieczna)
              : undefined,
        liczba_rat:
          typeof answers.liczba_rat === "number"
            ? answers.liczba_rat
            : answers.liczba_rat != null
              ? Number(answers.liczba_rat)
              : undefined,
        data_pierwszej_raty: (answers.data_pierwszej_raty as string) ?? "",
        // Propozycja — umorzenie (warunkowo)
        kwota_proponowana:
          typeof answers.kwota_proponowana === "number"
            ? answers.kwota_proponowana
            : answers.kwota_proponowana != null
              ? Number(answers.kwota_proponowana)
              : undefined,
        procent_umorzenia:
          typeof answers.procent_umorzenia === "number"
            ? answers.procent_umorzenia
            : answers.procent_umorzenia != null
              ? Number(answers.procent_umorzenia)
              : undefined,
        termin_zaplaty: (answers.termin_zaplaty as string) ?? "",
        // Sytuacja
        sytuacja: ((answers.sytuacja as string[]) ?? []) as UgodaAnswers["sytuacja"],
        okolicznosci: (answers.okolicznosci as string) ?? "",
        consent_truth: true,
      };
      const result = renderUgodaMarkdown(ua);
      const dataDigest = createHash("sha256")
        .update(
          result.promptHash + ":" + (ua.wierzyciel_nazwa || ua.numer_umowy || ""),
        )
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    case "upadlosc_wniosek": {
      // D8 Upadłość-Lite — static fallback (1 wariant: wniosek konsumencki).
      const wierzyciele = Array.isArray(answers.wierzyciele)
        ? (answers.wierzyciele as WierzycielItem[])
        : [];

      const ua: UpadloscAnswers = {
        // Dłużnik
        dluznik_nazwa:
          (answers.dluznik_nazwa as string) ?? caseRow.pozwany_nazwa ?? "",
        dluznik_adres:
          (answers.dluznik_adres as string) ?? caseRow.pozwany_adres ?? "",
        dluznik_pesel: (answers.dluznik_pesel as string) ?? "",
        dluznik_nip: (answers.dluznik_nip as string) ?? "",
        dluznik_email: (answers.dluznik_email as string) ?? "",
        dluznik_telefon: (answers.dluznik_telefon as string) ?? "",
        // Sąd
        sad_nazwa: (answers.sad_nazwa as string) ?? caseRow.sad ?? "",
        sad_adres: (answers.sad_adres as string) ?? "",
        // Sytuacja zawodowa
        status_zawodowy:
          ((answers.status_zawodowy as UpadloscAnswers["status_zawodowy"]) ??
            "konsument") as UpadloscAnswers["status_zawodowy"],
        data_zakonczenia_dzialalnosci:
          (answers.data_zakonczenia_dzialalnosci as string) ?? "",
        forma_dochodu:
          ((answers.forma_dochodu as UpadloscAnswers["forma_dochodu"]) ??
            "umowa_o_prace") as UpadloscAnswers["forma_dochodu"],
        dochod_miesieczny: Number(answers.dochod_miesieczny ?? 0),
        liczba_osob_na_utrzymaniu: Number(
          answers.liczba_osob_na_utrzymaniu ?? 0,
        ),
        // Majątek
        posiada_nieruchomosc: Boolean(answers.posiada_nieruchomosc),
        nieruchomosc_opis: (answers.nieruchomosc_opis as string) ?? "",
        posiada_pojazd: Boolean(answers.posiada_pojazd),
        pojazd_opis: (answers.pojazd_opis as string) ?? "",
        srodki_na_koncie: Number(answers.srodki_na_koncie ?? 0),
        inne_skladniki: (answers.inne_skladniki as string) ?? "",
        // Wierzyciele
        wierzyciele,
        // Niewypłacalność
        przyczyny: ((answers.przyczyny as string[]) ??
          []) as UpadloscAnswers["przyczyny"],
        data_powstania_niewyplacalnosci:
          (answers.data_powstania_niewyplacalnosci as string) ?? "",
        uzasadnienie: (answers.uzasadnienie as string) ?? "",
        // Załączniki
        zalaczniki: ((answers.zalaczniki as string[]) ??
          []) as UpadloscAnswers["zalaczniki"],
        consent_truth: true,
        consent_full_disclosure: true,
      };
      const result = renderUpadloscMarkdown(ua);
      const dataDigest = createHash("sha256")
        .update(
          result.promptHash +
            ":" +
            (ua.dluznik_nazwa || ua.sad_nazwa || "") +
            ":" +
            String(wierzyciele.length),
        )
        .digest("hex")
        .slice(0, 16);
      return { markdown: result.markdown, promptHash: dataDigest };
    }
    default:
      throw new Error(
        `Renderer dla typu sprawy '${type}' jest dostępny dopiero po wdrożeniu prompt template.`,
      );
  }
}

function pick<T>(...vals: (T | null | undefined)[]): T | undefined {
  for (const v of vals) {
    if (v !== null && v !== undefined && v !== "") return v as T;
  }
  return undefined;
}
