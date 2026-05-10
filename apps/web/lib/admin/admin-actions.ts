"use server";

/**
 * Tier 5.4 — Admin server actions (write-side).
 *
 * Każda akcja: requireAdmin() + guardAction(rate-limit api) + audit log.
 * Mutacje idą przez service-role klienta (bypass RLS), bo zmieniają
 * dane innych użytkowników (status sprawy, role, prompty).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  requireAdmin,
  requireFullAdmin,
  AdminAccessDeniedError,
} from "./rbac";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  guardAction,
  ActionRateLimitError,
  ActionUnauthenticatedError,
} from "@/lib/security/server-action-guard";
import { assertCsrfFromFormData } from "@/lib/security/csrf";
import type { CaseStatus, UserRole } from "@/lib/db/types";

const STATUS_VALUES: CaseStatus[] = [
  "draft",
  "analysis",
  "generated",
  "paid",
  "downloaded",
  "completed",
  "archived",
];

const updateCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum([
    "draft",
    "analysis",
    "generated",
    "paid",
    "downloaded",
    "completed",
    "archived",
  ]),
  reason: z.string().max(500).optional(),
});

export interface AdminActionResult {
  ok: true;
  message: string;
}

/**
 * Zmiana statusu sprawy przez admina/moderatora — np. ręczne odblokowanie
 * pobrania po reklamacji, albo archiwizacja zalegających szkiców.
 */
export async function adminUpdateCaseStatusAction(input: {
  caseId: string;
  status: CaseStatus;
  reason?: string;
  csrf: string;
}): Promise<AdminActionResult> {
  // Tier 5 zad. 203 — CSRF check (admin actions to mocna power → priorytet).
  await assertCsrfFromFormData({ csrf: input.csrf });

  const admin = await requireAdmin();
  await guardAction({
    profile: "api",
    key: "admin.case.updateStatus",
  });

  const parsed = updateCaseStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Niepoprawny status lub identyfikator sprawy.");
  }
  if (!STATUS_VALUES.includes(parsed.data.status)) {
    throw new Error("Nieobsługiwany status sprawy.");
  }

  const supabase = createSupabaseAdminClient();

  const { data: existing, error: readErr } = await supabase
    .from("cases")
    .select("user_id, status")
    .eq("id", parsed.data.caseId)
    .maybeSingle();
  if (readErr || !existing) {
    throw new Error("Sprawa nie została znaleziona.");
  }

  const { error: updErr } = await supabase
    .from("cases")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.caseId);
  if (updErr) {
    throw new Error(`Aktualizacja statusu nie powiodła się: ${updErr.message}`);
  }

  // Audyt — actor = "admin" + admin_user_id w metadata.
  await supabase.from("case_events").insert({
    case_id: parsed.data.caseId,
    user_id: existing.user_id,
    actor: "admin",
    event_type: "admin_case_status_changed",
    metadata: {
      from: existing.status,
      to: parsed.data.status,
      admin_user_id: admin.userId,
      admin_email: admin.email,
      reason: parsed.data.reason ?? null,
    },
  });

  revalidatePath("/admin/sprawy");
  revalidatePath(`/admin/sprawy/${parsed.data.caseId}`);
  revalidatePath(`/panel/sprawa/${parsed.data.caseId}`);

  return {
    ok: true,
    message: `Status sprawy ustawiony na "${parsed.data.status}".`,
  };
}

const upsertPromptSchema = z.object({
  id: z.string().uuid().optional(),
  case_type: z.string().min(2),
  variant: z.string().min(1).max(50),
  system_prompt: z.string().min(20).max(20000),
  user_prompt_template: z.string().min(20).max(20000),
  required_variables: z.array(z.string().min(1)).max(64).default([]),
  model: z.string().min(2).max(100),
  temperature: z.number().min(0).max(1),
  max_tokens: z.number().int().min(256).max(64000),
  is_active: z.boolean(),
  notes: z.string().max(1000).nullable().optional(),
});

export interface UpsertPromptInput
  extends z.infer<typeof upsertPromptSchema> {
  /** Tier 5 zad. 203 — CSRF token z cookie. */
  csrf: string;
}

/**
 * Zapis prompt template — only `admin` (nie 'moderator').
 * Przy edycji aktywnej wersji bumpujemy `version` + 1, a starą zostawiamy
 * jako historię (is_active = false), żeby zachować audyt zmian promptów.
 */
export async function adminUpsertPromptTemplateAction(
  input: UpsertPromptInput,
): Promise<AdminActionResult & { id: string; version: number }> {
  // Tier 5 zad. 203 — CSRF check (admin-only akcja, ale CSRF chroni
  // przed atakami "zalogowany admin klika w link na evil.com").
  await assertCsrfFromFormData({ csrf: input.csrf });

  const admin = await requireFullAdmin();
  await guardAction({
    profile: "api",
    key: "admin.prompt.upsert",
  });

  const parsed = upsertPromptSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      "Walidacja danych promptu nie powiodła się: " +
        parsed.error.issues.map((i) => i.message).join("; "),
    );
  }

  const supabase = createSupabaseAdminClient();
  let id = parsed.data.id;
  let version: number;

  if (id) {
    // UPDATE — bump version i (jeżeli aktywujemy) deaktywuj inne dla pary
    // (case_type, variant).
    const { data: existing, error: readErr } = await supabase
      .from("prompt_templates")
      .select("version, case_type, variant")
      .eq("id", id)
      .maybeSingle();
    if (readErr || !existing) throw new Error("Prompt nie istnieje.");

    version = (existing.version as number) + 1;

    if (parsed.data.is_active) {
      await supabase
        .from("prompt_templates")
        .update({ is_active: false })
        .eq("case_type", parsed.data.case_type)
        .eq("variant", parsed.data.variant)
        .neq("id", id);
    }

    const { error: updErr } = await supabase
      .from("prompt_templates")
      .update({
        system_prompt: parsed.data.system_prompt,
        user_prompt_template: parsed.data.user_prompt_template,
        required_variables: parsed.data.required_variables,
        model: parsed.data.model,
        temperature: parsed.data.temperature,
        max_tokens: parsed.data.max_tokens,
        is_active: parsed.data.is_active,
        notes: parsed.data.notes ?? null,
        version,
      })
      .eq("id", id);
    if (updErr) {
      throw new Error(`Zapis promptu nie powiódł się: ${updErr.message}`);
    }
  } else {
    // INSERT — version = max+1 dla pary (case_type, variant) lub 1.
    const { data: existing } = await supabase
      .from("prompt_templates")
      .select("version")
      .eq("case_type", parsed.data.case_type)
      .eq("variant", parsed.data.variant)
      .order("version", { ascending: false })
      .limit(1);
    version =
      existing && existing.length > 0
        ? (existing[0].version as number) + 1
        : 1;

    if (parsed.data.is_active) {
      await supabase
        .from("prompt_templates")
        .update({ is_active: false })
        .eq("case_type", parsed.data.case_type)
        .eq("variant", parsed.data.variant);
    }

    const { data: inserted, error: insErr } = await supabase
      .from("prompt_templates")
      .insert({
        case_type: parsed.data.case_type as never,
        variant: parsed.data.variant,
        system_prompt: parsed.data.system_prompt,
        user_prompt_template: parsed.data.user_prompt_template,
        required_variables: parsed.data.required_variables,
        model: parsed.data.model,
        temperature: parsed.data.temperature,
        max_tokens: parsed.data.max_tokens,
        is_active: parsed.data.is_active,
        notes: parsed.data.notes ?? null,
        version,
      })
      .select("id")
      .single();
    if (insErr || !inserted) {
      throw new Error(
        `Utworzenie promptu nie powiodło się: ${insErr?.message ?? "?"}`,
      );
    }
    id = inserted.id as string;
  }

  // Audyt — case_events nie pasuje (nie ma case_id), więc używamy
  // tabeli case_events tylko jako pomoc; tu logujemy do logu serwera.
  // W realnej produkcji warto rozważyć osobną tabelę audit_log.
  // eslint-disable-next-line no-console
  console.warn(
    "[admin-audit] prompt_upsert",
    JSON.stringify({
      admin_user_id: admin.userId,
      admin_email: admin.email,
      prompt_id: id,
      case_type: parsed.data.case_type,
      variant: parsed.data.variant,
      version,
      is_active: parsed.data.is_active,
    }),
  );

  revalidatePath("/admin/prompty");
  revalidatePath(`/admin/prompty/${id}`);

  return {
    ok: true,
    id: id as string,
    version,
    message: `Prompt zapisany (wersja ${version}).`,
  };
}

const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin", "moderator"]),
});

/**
 * Zmiana roli użytkownika — only `admin`. Niemożliwe odebranie sobie
 * roli (zapobiega lockoutowi).
 */
export async function adminUpdateUserRoleAction(input: {
  userId: string;
  role: UserRole;
  csrf: string;
}): Promise<AdminActionResult> {
  // Tier 5 zad. 203 — CSRF check (krytyczne: zmiana roli admin).
  await assertCsrfFromFormData({ csrf: input.csrf });

  const admin = await requireFullAdmin();
  await guardAction({
    profile: "api",
    key: "admin.user.updateRole",
  });

  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) throw new Error("Niepoprawne dane roli.");

  if (parsed.data.userId === admin.userId && parsed.data.role !== "admin") {
    throw new AdminAccessDeniedError(
      "Nie możesz odebrać samemu sobie roli administratora.",
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);
  if (error) {
    throw new Error(`Zmiana roli nie powiodła się: ${error.message}`);
  }

  // eslint-disable-next-line no-console
  console.warn(
    "[admin-audit] user_role_changed",
    JSON.stringify({
      admin_user_id: admin.userId,
      admin_email: admin.email,
      target_user_id: parsed.data.userId,
      role: parsed.data.role,
    }),
  );

  revalidatePath("/admin/uzytkownicy");

  return {
    ok: true,
    message: `Rola ustawiona na "${parsed.data.role}".`,
  };
}

// Re-export błędów dla UI (klient może rozróżniać).
export { ActionRateLimitError, ActionUnauthenticatedError };
