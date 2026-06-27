"use server";

/**
 * Server actions for cases (Next.js App Router).
 * Wszystkie wywołania przechodzą przez RLS — klient nie może obejść właściciela.
 *
 * Tier 5 zad. 203 — wszystkie mutujące server actions wywołują
 * `assertCsrfFromFormData()` lub `assertCsrf()` ZANIM dotkną DB.
 * Akcje przyjmujące JSON-objects (nie FormData) używają
 * `assertCsrfFromObject()` — kontrakt: klient woła z polem `csrf`.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createCase,
  createDeadline,
  logCaseEvent,
  patchCase,
  softDeleteCase,
} from "./case-repository";
import { caseTypeMeta } from "./case-types";
import {
  revalidateCase,
  revalidateDeadlines,
} from "@/lib/cache/revalidation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { CaseStatus, CaseType, WizardState } from "@/lib/db/types";
import { assertCsrfFromFormData } from "@/lib/security/csrf";

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------
const caseTypeSchema = z.enum([
  "sprzeciw_epu",
  "komornik_zwolnienie_konta",
  "komornik_zwolnienie_swiadczen",
  "komornik_skarga",
  "komornik_ograniczenie",
  "komornik_umorzenie",
  "komornik_raty",
  "potracenia_wniosek_pracodawca",
  "potracenia_wniosek_komornik",
  "bik_reklamacja_bank",
  "bik_reklamacja_bik",
  "bik_skarga_uodo",
  "cesja_odpowiedz",
  "ugoda_raty",
  "ugoda_umorzenie",
  "ugoda_propozycja",
  "upadlosc_wniosek",
]);

const startCaseSchema = z.object({
  type: caseTypeSchema,
});

const updateWizardSchema = z.object({
  caseId: z.string().uuid(),
  wizardState: z.object({
    current_step: z.string().min(1),
    completed_steps: z.array(z.string()),
    answers: z.record(z.unknown()),
    last_saved_at: z.string().nullable(),
  }),
});

const advanceStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum([
    "draft",
    "analysis",
    "generated",
    "paid",
    "downloaded",
    "completed",
    "archived",
  ]) satisfies z.ZodType<CaseStatus>,
});

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------
export async function startCaseAction(formData: FormData): Promise<void> {
  // Tier 5 zad. 203 — CSRF check przed dotknięciem DB.
  await assertCsrfFromFormData(formData);

  const parsed = startCaseSchema.safeParse({
    type: formData.get("type"),
  });
  if (!parsed.success) {
    throw new Error("Niepoprawny typ sprawy.");
  }
  const type = parsed.data.type as CaseType;
  const created = await createCase({ type });

  await logCaseEvent(created.id, "case_created", { source: "wizard_start" });

  // Auto-utwórz termin jeżeli moduł go ma (np. sprzeciw 14 dni)
  // Liczymy od today — user może później skorygować w wizardzie.
  const meta = caseTypeMeta[type];
  if (meta.deadline) {
    await createDeadline({
      caseId: created.id,
      kind: meta.deadline.kind,
      title: `Termin: ${meta.shortTitle}`,
      startDate: new Date(),
      days: meta.deadline.days,
    });
  }

  // Tier 5.3 — tag-based invalidation poza zwykłym revalidatePath.
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: userData } = await sb.auth.getUser();
  if (userData?.user?.id) {
    revalidateCase(created.id, userData.user.id);
    if (meta.deadline) revalidateDeadlines(userData.user.id);
  } else {
    revalidatePath("/panel");
  }
  redirect(`/panel/sprawa/${created.id}`);
}

export interface SaveWizardResult {
  ok: true;
  savedAt: string;
}

export async function saveWizardAction(input: {
  caseId: string;
  wizardState: WizardState;
  csrf: string;
}): Promise<SaveWizardResult> {
  // Tier 5 zad. 203 — CSRF check (akcja JSON-object, nie FormData).
  await assertCsrfFromFormData({ csrf: input.csrf });

  const parsed = updateWizardSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Niepoprawny stan kreatora.");
  }
  const next: WizardState = {
    ...parsed.data.wizardState,
    answers: parsed.data.wizardState.answers as WizardState["answers"],
    last_saved_at: new Date().toISOString(),
  };
  await patchCase({ id: parsed.data.caseId, wizardState: next });
  return { ok: true, savedAt: next.last_saved_at as string };
}

export async function advanceCaseStatusAction(
  caseId: string,
  status: CaseStatus,
  csrfToken: string,
): Promise<void> {
  // Tier 5 zad. 203 — CSRF check przed mutacją statusu.
  await assertCsrfFromFormData({ csrf: csrfToken });

  const parsed = advanceStatusSchema.safeParse({ caseId, status });
  if (!parsed.success) throw new Error("Niepoprawny status.");

  await patchCase({ id: parsed.data.caseId, status: parsed.data.status });
  await logCaseEvent(parsed.data.caseId, "case_status_changed", {
    to: parsed.data.status,
  });
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: userData } = await sb.auth.getUser();
  if (userData?.user?.id) {
    revalidateCase(parsed.data.caseId, userData.user.id);
  } else {
    revalidatePath(`/panel/sprawa/${parsed.data.caseId}`);
    revalidatePath("/panel");
  }
}

export async function deleteDraftCaseAction(
  caseId: string,
  csrfToken: string,
): Promise<void> {
  // Tier 5 zad. 203 — CSRF check przed soft-delete.
  await assertCsrfFromFormData({ csrf: csrfToken });

  await softDeleteCase(caseId);
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: userData } = await sb.auth.getUser();
  if (userData?.user?.id) {
    revalidateCase(caseId, userData.user.id);
  } else {
    revalidatePath("/panel");
  }
}

export async function patchCaseMetadataAction(
  caseId: string,
  metadata: Record<string, unknown>,
  csrfToken: string,
): Promise<void> {
  // Tier 5 zad. 203 — CSRF check przed patchem metadanych.
  await assertCsrfFromFormData({ csrf: csrfToken });

  await patchCase({ id: caseId, metadata });
  await logCaseEvent(caseId, "case_metadata_updated", {
    keys: Object.keys(metadata),
  });
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: userData } = await sb.auth.getUser();
  if (userData?.user?.id) {
    revalidateCase(caseId, userData.user.id);
  } else {
    revalidatePath(`/panel/sprawa/${caseId}`);
  }
}
