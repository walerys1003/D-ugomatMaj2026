/**
 * Email — payment failure recovery (PLAN.md zad. 163).
 *
 * Wysyłany po:
 *   - checkout.session.async_payment_failed (BLIK / P24 / przelew)
 *   - payment_intent.payment_failed (karta odrzucona, niewystarczające środki)
 *
 * Tarcza ton: Calm Authority — bez paniki, bez oskarżeń, konkretny CTA
 * "Spróbuj ponownie" prowadzący do panelu sprawy. Komunikat wyjaśnia że
 * środki nie zostały pobrane (typowy lęk klienta) i pokazuje powód
 * tylko jeśli jest informacyjny dla użytkownika (decline_code/message).
 *
 * Variables:
 *   - product_name (string)  — nazwa produktu / pakietu
 *   - amount_pln   (string)  — kwota brutto, sformatowana
 *   - case_id      (string)  — UUID, do CTA URL
 *   - reason       (string)  — Stripe decline_code / message (krótki)
 *   - retry_url    (string)  — pełny URL do panelu sprawy
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

/**
 * Mapowanie krótkich kodów Stripe / lokalnych na komunikat po polsku.
 * Wszystko czego nie znamy → ogólne "Płatność nie została zrealizowana".
 */
function humanizeReason(reasonRaw: string): string {
  const reason = reasonRaw.toLowerCase().trim();
  if (!reason) return "Płatność nie została zrealizowana.";

  // Najczęstsze decline_code Stripe
  if (reason.includes("insufficient_funds") || reason.includes("insufficient")) {
    return "Bank odrzucił płatność z powodu braku środków na karcie / koncie.";
  }
  if (reason.includes("expired_card")) {
    return "Karta utraciła ważność.";
  }
  if (reason.includes("incorrect_cvc") || reason.includes("invalid_cvc")) {
    return "Niepoprawny kod CVC karty.";
  }
  if (reason.includes("card_declined") || reason.includes("generic_decline")) {
    return "Bank odrzucił płatność. Skontaktuj się z bankiem lub spróbuj inną metodą.";
  }
  if (reason.includes("authentication_required") || reason.includes("3ds")) {
    return "Bank wymagał dodatkowej autoryzacji (3D Secure), która nie została potwierdzona.";
  }
  if (reason.includes("blik") || reason.includes("p24") || reason.includes("session_expired")) {
    return "Płatność nie została potwierdzona w wymaganym czasie.";
  }
  return "Płatność nie została zrealizowana.";
}

export function renderPaymentFailed(
  variables: Record<string, string | number>,
): RenderedEmail {
  const productName = requireVar(variables, "product_name");
  const caseId = String(variables.case_id ?? "");
  const amountPln = String(variables.amount_pln ?? "");
  const reasonRaw = String(variables.reason ?? "");
  const retryUrl =
    String(variables.retry_url ?? "") ||
    appUrl(caseId ? `/panel/sprawa/${caseId}` : "/panel");

  const humanReason = humanizeReason(reasonRaw);

  const subject = `Płatność nieudana — ${productName}`;
  const preheader = "Środki nie zostały pobrane. Możesz spróbować ponownie.";
  const hero = "Płatność nie doszła do skutku";

  const bodyHtml = `
<p>Próba opłacenia sprawy <strong>${escapeHtml(productName)}</strong>${amountPln ? ` na kwotę <strong>${escapeHtml(amountPln)}</strong>` : ""} nie powiodła się.</p>
<p style="margin-top:12px;color:#1F2937;">${escapeHtml(humanReason)}</p>
<p style="margin-top:16px;color:#0F172A;"><strong>Spokojnie — środki nie zostały z Twojego konta pobrane.</strong> Twoja sprawa pozostaje zapisana w panelu i możesz spróbować ponownie w dowolnym momencie.</p>
<p style="margin-top:16px;font-size:14px;color:#6B7280;">
  Wszystkie wprowadzone dane są bezpieczne — generator AI zapamiętał Twój postęp.
  Po kliknięciu poniższego przycisku zostaniesz przeniesiony bezpośrednio do swojej sprawy.
</p>`.trim();

  const bodyText = [
    `Próba opłacenia sprawy "${productName}"${amountPln ? `, kwota: ${amountPln}` : ""} nie powiodła się.`,
    "",
    humanReason,
    "",
    "Spokojnie — środki nie zostały z Twojego konta pobrane.",
    "Twoja sprawa pozostaje zapisana w panelu — możesz spróbować ponownie.",
    "",
    `Link do sprawy: ${retryUrl}`,
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Spróbuj ponownie", href: retryUrl },
    }),
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyText,
      bodyHtml,
      cta: { label: "Spróbuj ponownie", href: retryUrl },
    }),
  };
}
