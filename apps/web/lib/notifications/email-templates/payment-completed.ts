/**
 * Email — potwierdzenie płatności + link do faktury.
 * Variables: case_title, case_id, amount_pln, invoice_url?, invoice_number?
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderPaymentCompleted(
  variables: Record<string, string | number>,
): RenderedEmail {
  const title = requireVar(variables, "case_title");
  const caseId = requireVar(variables, "case_id");
  const amountPln = String(variables.amount_pln ?? "");
  const invoiceUrl = String(variables.invoice_url ?? "");
  const invoiceNumber = String(variables.invoice_number ?? "");

  const ctaHref = appUrl(`/panel/sprawa/${caseId}`);
  const subject = `Płatność zaksięgowana — ${title}`;
  const preheader = `Pismo gotowe do pobrania. Faktura ${invoiceNumber || ""}.`.trim();
  const hero = `Płatność zaksięgowana`;

  const bodyHtml = `
<p>Dziękujemy za opłacenie sprawy <strong>${escapeHtml(title)}</strong>${amountPln ? ` na kwotę <strong>${escapeHtml(amountPln)}</strong>` : ""}.</p>
<p>Pismo jest teraz odblokowane — możesz pobrać je w formacie PDF z panelu.</p>
${invoiceUrl ? `<p style="margin-top:16px;color:#1F2937;">Faktura ${invoiceNumber ? `<strong>${escapeHtml(invoiceNumber)}</strong> ` : ""}jest gotowa: <a href="${escapeHtml(invoiceUrl)}" style="color:#0F172A;">otwórz fakturę PDF</a>.</p>` : ""}
<p style="margin-top:16px;font-size:14px;color:#6B7280;">
  Płatność została zrealizowana przez Stripe. Dane karty/konta nie są przechowywane na serwerach Długomatu.
</p>`.trim();

  const bodyText = [
    `Dziękujemy za opłacenie sprawy "${title}"${amountPln ? `, kwota: ${amountPln}` : ""}.`,
    "Pismo jest teraz odblokowane — pobierz je w PDF z panelu.",
    "",
    invoiceUrl ? `Faktura ${invoiceNumber || ""}: ${invoiceUrl}` : "",
    "",
    "Płatność zrealizowana przez Stripe. Dane karty nie są przechowywane na serwerach Długomatu.",
  ].filter(Boolean).join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Pobierz pismo", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Pobierz pismo", href: ctaHref },
    }),
  };
}
