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
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: existing, error: readErr } = await sb
    .from("cases")
    .select("user_id, status")
    .eq("id", parsed.data.caseId)
    .maybeSingle();
  if (readErr || !existing) {
    throw new Error("Sprawa nie została znaleziona.");
  }

  const { error: updErr } = await sb
    .from("cases")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.caseId);
  if (updErr) {
    throw new Error(`Aktualizacja statusu nie powiodła się: ${updErr.message}`);
  }

  // Audyt — actor = "admin" + admin_user_id w metadata.
  await sb.from("case_events").insert({
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
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  let id = parsed.data.id;
  let version: number;

  if (id) {
    // UPDATE — bump version i (jeżeli aktywujemy) deaktywuj inne dla pary
    // (case_type, variant).
    const { data: existing, error: readErr } = await sb
      .from("prompt_templates")
      .select("version, case_type, variant")
      .eq("id", id)
      .maybeSingle();
    if (readErr || !existing) throw new Error("Prompt nie istnieje.");

    version = (existing.version as number) + 1;

    if (parsed.data.is_active) {
      await sb
        .from("prompt_templates")
        .update({ is_active: false })
        .eq("case_type", parsed.data.case_type)
        .eq("variant", parsed.data.variant)
        .neq("id", id);
    }

    const { error: updErr } = await sb
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
    const { data: existing } = await sb
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
      await sb
        .from("prompt_templates")
        .update({ is_active: false })
        .eq("case_type", parsed.data.case_type)
        .eq("variant", parsed.data.variant);
    }

    const { data: inserted, error: insErr } = await sb
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
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { error } = await sb
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

// ─── Tier 4 zad. 156 — Refund flow (admin tool) ──────────────────────────

const refundSchema = z.object({
  paymentId: z.string().uuid(),
  amountGrosze: z.number().int().positive().optional(),
  reason: z
    .enum(["duplicate", "fraudulent", "requested_by_customer"])
    .optional(),
  internalNote: z.string().max(1000).optional(),
});

export interface AdminRefundInput extends z.infer<typeof refundSchema> {
  csrf: string;
}

/**
 * Admin server action — tworzy refund w Stripe + rekord w `refunds`.
 *
 * Flow:
 *   1. CSRF + RBAC (requireFullAdmin — refundy wymagają pełnego admina).
 *   2. Load payment row (must be status='completed' + stripe_payment_intent_id).
 *   3. Stripe `createRefund()` (sync).
 *   4. Insert into `refunds` table (status z Stripe).
 *   5. Audit case_event + revalidate paths.
 *
 * Webhook `charge.refunded` zaktualizuje payments.refunded_at + status,
 * gdy Stripe potwierdzi finalizację (czasem async dla niektórych PM).
 */
export async function adminCreateRefundAction(
  input: AdminRefundInput,
): Promise<AdminActionResult & { refundId: string; stripeRefundId: string }> {
  await assertCsrfFromFormData({ csrf: input.csrf });

  const admin = await requireFullAdmin();
  await guardAction({ profile: "api", key: "admin.payment.refund" });

  const parsed = refundSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Niepoprawne dane refundu.");
  }

  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // 1) Load payment
  const { data: payment, error: payErr } = await sb
    .from("payments")
    .select(
      "id, user_id, case_id, amount, status, stripe_payment_intent_id, refunded_at",
    )
    .eq("id", parsed.data.paymentId)
    .maybeSingle();
  if (payErr || !payment) {
    throw new Error("Płatność nie została znaleziona.");
  }
  if (payment.status !== "completed") {
    throw new Error(
      `Nie można zrefundować płatności o statusie "${payment.status}".`,
    );
  }
  if (!payment.stripe_payment_intent_id) {
    throw new Error(
      "Brak Stripe payment_intent_id — refund nie jest możliwy via API.",
    );
  }

  const refundAmount = parsed.data.amountGrosze ?? payment.amount;
  if (refundAmount > payment.amount) {
    throw new Error("Kwota refundu przekracza kwotę pierwotnej płatności.");
  }

  // 2) Stripe call (lazy import — by nie wciągać klienta do bundle'a server-only)
  const { createRefund } = await import("@/lib/payments/stripe-client");
  let stripeRes;
  try {
    stripeRes = await createRefund({
      paymentIntentId: payment.stripe_payment_intent_id,
      amountGrosze: refundAmount,
      reason: parsed.data.reason,
      metadata: {
        payment_id: payment.id,
        admin_user_id: admin.userId,
      },
    });
  } catch (err) {
    throw new Error(
      `Stripe odrzucił refund: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // 3) Insert refund row
  const { data: refundRow, error: insErr } = await sb
    .from("refunds")
    .insert({
      payment_id: payment.id,
      user_id: payment.user_id,
      stripe_refund_id: stripeRes.id,
      stripe_payment_intent_id: payment.stripe_payment_intent_id,
      amount: refundAmount,
      currency: "pln",
      reason: parsed.data.reason ?? null,
      internal_note: parsed.data.internalNote ?? null,
      status: stripeRes.status === "succeeded" ? "succeeded" : "pending",
      initiated_by_admin_id: admin.userId,
      succeeded_at: stripeRes.status === "succeeded" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (insErr || !refundRow) {
    throw new Error(
      `Refund w Stripe się powiódł, ale zapis do bazy nie: ${insErr?.message}. Sprawdź Stripe Dashboard.`,
    );
  }

  // 4) Mark payment as refunded jeżeli full refund
  if (refundAmount === payment.amount && stripeRes.status === "succeeded") {
    await sb
      .from("payments")
      .update({
        status: "refunded",
        refunded_at: new Date().toISOString(),
        failure_reason: parsed.data.reason ?? "admin_refund",
      })
      .eq("id", payment.id);
  }

  // 5) Audit
  if (payment.case_id) {
    await sb.from("case_events").insert({
      case_id: payment.case_id,
      user_id: payment.user_id,
      actor: "admin",
      event_type: "admin_payment_refunded",
      metadata: {
        payment_id: payment.id,
        refund_id: refundRow.id,
        stripe_refund_id: stripeRes.id,
        amount: refundAmount,
        reason: parsed.data.reason ?? null,
        admin_user_id: admin.userId,
        admin_email: admin.email,
      },
    });
  }

  revalidatePath("/admin/platnosci");
  revalidatePath("/admin/sprawy");
  if (payment.case_id) {
    revalidatePath(`/admin/sprawy/${payment.case_id}`);
    revalidatePath(`/panel/sprawa/${payment.case_id}`);
  }

  return {
    ok: true,
    message:
      stripeRes.status === "succeeded"
        ? `Refund ${(refundAmount / 100).toFixed(2)} PLN wykonany.`
        : `Refund zlecony (status: ${stripeRes.status}). Webhook potwierdzi finalizację.`,
    refundId: refundRow.id,
    stripeRefundId: stripeRes.id,
  };
}

// Re-export błędów dla UI (klient może rozróżniać).
export { ActionRateLimitError, ActionUnauthenticatedError };
