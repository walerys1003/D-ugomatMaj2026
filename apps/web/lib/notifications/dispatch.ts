import "server-only";

/**
 * Notification dispatcher — single entry point for sending email/SMS.
 *
 * Flow:
 *   1. Render template (email: subject+text+html, sms: text)
 *   2. Insert row do `notifications` (status='scheduled' albo 'sent' po skutecznym push'u)
 *   3. Wyślij przez providera (Resend / SMSAPI)
 *   4. Update row z provider_message_id + status='sent' (lub 'failed' + failure_reason)
 *
 * Idempotency:
 *   - Caller może podać własny `dedupKey` (np. `"deadline:${id}:d3"`),
 *     który mapujemy na (template, recipient, deadline_id, sent_today) constraint.
 *   - Jeśli istnieje już status='sent' z tą samą trójką (template, recipient, deadline_id)
 *     z dnia dzisiejszego — skip (idempotency).
 *
 * Auth:
 *   - Funkcja używa SUPABASE_SERVICE_ROLE_KEY (insert do notifications obiega RLS,
 *     bo CRON / webhook może adresować maile do dowolnego user_id).
 *   - NIGDY nie wywoływać tego z route przyjmującego niezweryfikowany input —
 *     warstwa wyżej musi sprawdzić uprawnienia.
 */
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

import { renderEmail } from "./email-templates";
import { renderSms } from "./sms-templates";
import {
  isResendAvailable,
  sendEmail,
  EmailProviderUnavailableError,
} from "./resend-client";
import {
  isSmsApiAvailable,
  sendSms,
  SmsProviderUnavailableError,
} from "./smsapi-client";
import {
  type DispatchInput,
  type DispatchResult,
  type EmailTemplateKey,
  type SmsTemplateKey,
} from "./types";

interface IdempotencyOptions {
  /** Klucz deduplikacji — gdy podany, sprawdzamy czy nie wysłano już dziś. */
  dedupKey?: string;
}

export async function dispatchNotification(
  input: DispatchInput,
  opts: IdempotencyOptions = {},
): Promise<DispatchResult> {
  const supabase = createSupabaseAdminClient();

  // -----------------------------------------------------------------------
  // Idempotency check (best-effort — bez constraintu DB, tylko soft-skip).
  // -----------------------------------------------------------------------
  if (opts.dedupKey) {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0); // od początku dnia UTC
    // Audyt #8 — filtrujemy TAKŻE po deadline_id, inaczej dwa różne terminy
    // tego samego typu w jednym dniu zostałyby błędnie zdeduplikowane
    // (klient nie dostałby alertu o ważnym terminie sądowym).
    let q = supabase
      .from("notifications")
      .select("id, status, provider_message_id")
      .eq("user_id", input.userId)
      .eq("template", input.template)
      .eq("recipient", input.recipient)
      .gte("created_at", since.toISOString())
      .in("status", ["sent", "scheduled"]);
    q = input.deadlineId
      ? q.eq("deadline_id", input.deadlineId)
      : q.is("deadline_id", null);
    const { data: existing } = await q.limit(1).maybeSingle();
    if (existing && existing.status === "sent") {
      return {
        notificationId: existing.id,
        status: "sent",
        providerMessageId: existing.provider_message_id,
        providerError: null,
      };
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  let subject: string | null = null;
  let bodyText: string;
  let bodyHtml: string | null = null;

  if (input.channel === "email") {
    const r = renderEmail(input.template as EmailTemplateKey, input.variables);
    subject = r.subject;
    bodyText = r.bodyText;
    bodyHtml = r.bodyHtml;
  } else if (input.channel === "sms") {
    const r = renderSms(input.template as SmsTemplateKey, input.variables);
    bodyText = r.bodyText;
  } else if (input.channel === "push") {
    // Audyt #10 — kanał push jest obsługiwany przez VAPID/web-push.
    // Render tekstu reużywamy z szablonu SMS (krótki tytuł+treść).
    const r = renderSms(input.template as SmsTemplateKey, input.variables);
    bodyText = r.bodyText;
    subject = (input.variables?.title as string) ?? "Długomat";
  } else {
    throw new Error(`Channel "${input.channel}" jeszcze nie obsługiwany.`);
  }

  // -----------------------------------------------------------------------
  // Insert row (status początkowy 'scheduled')
  // -----------------------------------------------------------------------
  const { data: inserted, error: insErr } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      case_id: input.caseId ?? null,
      deadline_id: input.deadlineId ?? null,
      channel: input.channel,
      template: input.template,
      recipient: input.recipient,
      subject,
      body_text: bodyText,
      body_html: bodyHtml,
      status: "scheduled",
      scheduled_for: input.scheduledFor ? input.scheduledFor.toISOString() : null,
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    // Audyt #7 — TOCTOU: jeśli równoległe wywołanie zdążyło wstawić wiersz,
    // partial unique index rzuci 23505. Traktujemy to jako idempotentny skip
    // (drugie wywołanie nie wysyła duplikatu maila/SMS).
    if (insErr && (insErr as { code?: string }).code === "23505") {
      let q2 = supabase
        .from("notifications")
        .select("id, status, provider_message_id")
        .eq("user_id", input.userId)
        .eq("template", input.template)
        .eq("recipient", input.recipient)
        .in("status", ["sent", "scheduled"]);
      q2 = input.deadlineId
        ? q2.eq("deadline_id", input.deadlineId)
        : q2.is("deadline_id", null);
      const { data: dup } = await q2
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (dup) {
        return {
          notificationId: dup.id,
          status: (dup.status as DispatchResult["status"]) ?? "scheduled",
          providerMessageId: dup.provider_message_id,
          providerError: null,
        };
      }
    }
    throw new Error(
      `Nie udało się zapisać powiadomienia: ${insErr?.message ?? "unknown"}`,
    );
  }
  const notificationId = inserted.id;

  // Jeśli scheduled_for w przyszłości — nie wysyłamy teraz, tylko zostawiamy CRON-owi.
  if (input.scheduledFor && input.scheduledFor.getTime() > Date.now() + 60_000) {
    return {
      notificationId,
      status: "scheduled",
      providerMessageId: null,
      providerError: null,
    };
  }

  // -----------------------------------------------------------------------
  // Send via provider
  // -----------------------------------------------------------------------
  let providerName: string;
  let providerMessageId: string | null = null;
  let providerError: string | null = null;

  try {
    if (input.channel === "email") {
      if (!isResendAvailable()) {
        throw new EmailProviderUnavailableError(
          "Resend nie jest skonfigurowany (RESEND_API_KEY / RESEND_FROM_EMAIL).",
        );
      }
      providerName = "resend";
      const sent = await sendEmail({
        to: input.recipient,
        subject: subject ?? "(bez tematu)",
        text: bodyText,
        html: bodyHtml ?? "",
        idempotencyKey: opts.dedupKey,
      });
      providerMessageId = sent.id;
    } else if (input.channel === "sms") {
      if (!isSmsApiAvailable()) {
        throw new SmsProviderUnavailableError(
          "SMSAPI nie jest skonfigurowany (SMSAPI_OAUTH_TOKEN / SMSAPI_SENDER).",
        );
      }
      providerName = "smsapi";
      const sent = await sendSms({
        to: input.recipient,
        body: bodyText,
        idempotencyKey: opts.dedupKey?.slice(0, 36),
      });
      providerMessageId = sent.id;
    } else {
      // Audyt #10 — kanał push przez VAPID/web-push (fanout do urządzeń usera).
      providerName = "web-push";
      const { sendPushToUser } = await import("./push-notifications");
      const delivered = await sendPushToUser(input.userId, {
        title: subject ?? "Długomat",
        body: bodyText,
        url: (input.variables?.url as string) ?? "/panel",
        tag: input.template,
      });
      if (delivered === 0) {
        throw new Error("Brak aktywnych subskrypcji push lub VAPID nieskonfigurowany.");
      }
      providerMessageId = `push:${delivered}`;
    }
  } catch (e) {
    providerError = e instanceof Error ? e.message : String(e);
    providerName =
      input.channel === "email"
        ? "resend"
        : input.channel === "sms"
          ? "smsapi"
          : "web-push";
  }

  // -----------------------------------------------------------------------
  // Update row z wynikiem
  // -----------------------------------------------------------------------
  const finalStatus = providerError ? "failed" : "sent";
  await supabase
    .from("notifications")
    .update({
      status: finalStatus,
      provider: providerName,
      provider_message_id: providerMessageId,
      sent_at: providerError ? null : new Date().toISOString(),
      failed_at: providerError ? new Date().toISOString() : null,
      failure_reason: providerError,
    })
    .eq("id", notificationId);

  return {
    notificationId,
    status: finalStatus,
    providerMessageId,
    providerError,
  };
}
