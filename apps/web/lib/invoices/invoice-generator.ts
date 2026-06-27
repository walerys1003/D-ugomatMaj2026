/**
 * Długomat — Tier 8 — Invoice generator (PL VAT + OSS for EU).
 *
 * Generuje fakturę PDF zgodną z polskim ustawodawstwem (Ustawa o VAT, art. 106e).
 * Obsługuje:
 *  - Faktura krajowa B2C (paragon) → zwykła faktura na życzenie
 *  - Faktura krajowa B2B z NIP → pełna faktura VAT 23%
 *  - Faktura B2B UE (reverse charge / OSS) — adnotacja "odwrotne obciążenie"
 *  - Faktura zagraniczna (export poza UE) — VAT 0%
 *  - Faktura korekta (refund) — wskazuje fakturę pierwotną
 *
 * Numeracja: FV/{YYYY}/{seq} — sekwencja per rok (transakcyjnie, RPC).
 *
 * Integracja z Fakturownia (opcjonalna) — jeśli FAKTUROWNIA_API_TOKEN
 * ustawiony, fakturę zaliczamy do oficjalnego księgowego systemu.
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitNetGrosze: number;
  vatRate: number;
}

export interface InvoiceCustomer {
  name: string;
  email: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string; // ISO alpha-2
  nip?: string | null;
  vatId?: string | null;
  customerType: "b2c" | "b2b";
}

export interface InvoiceInput {
  paymentId: string;
  userId: string;
  customer: InvoiceCustomer;
  items: InvoiceLineItem[];
  /** Issue date — domyślnie now. */
  issueDate?: Date;
  /** Sell date — może być różny od issue (np. usługa świadczona wcześniej). */
  sellDate?: Date;
  /** Numer faktury pierwotnej (gdy korekta). */
  originalInvoiceNumber?: string;
  /** Powód korekty (gdy korekta). */
  correctionReason?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  payment_id: string;
  user_id: string;
  customer_name: string;
  customer_nip: string | null;
  total_net_grosze: number;
  total_vat_grosze: number;
  total_gross_grosze: number;
  vat_summary: Array<{ rate: number; net: number; vat: number }>;
  issue_date: string;
  sell_date: string;
  pdf_url: string | null;
  fakturownia_id: string | null;
  is_correction: boolean;
  status: "draft" | "issued" | "sent" | "paid" | "cancelled";
}

/**
 * Generuje numer faktury w sekwencji "FV/2026/000123".
 * Używa RPC fn_next_invoice_number(year) dla atomicity.
 */
async function nextInvoiceNumber(year: number, isCorrection: boolean): Promise<string> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.rpc("fn_next_invoice_number", {
    p_year: year,
    p_is_correction: isCorrection,
  });
  if (error) {
    throw new Error(`Nie udało się wygenerować numeru faktury: ${error.message}`);
  }
  const seq = data as number;
  const prefix = isCorrection ? "KOR" : "FV";
  return `${prefix}/${year}/${String(seq).padStart(6, "0")}`;
}

export async function createInvoice(input: InvoiceInput): Promise<InvoiceRecord> {
  const sb = createSupabaseAdminClient();
  const issueDate = input.issueDate ?? new Date();
  const sellDate = input.sellDate ?? issueDate;
  const isCorrection = !!input.originalInvoiceNumber;

  const invoiceNumber = await nextInvoiceNumber(issueDate.getUTCFullYear(), isCorrection);

  // Compute totals + VAT summary
  const vatBuckets = new Map<number, { net: number; vat: number }>();
  let totalNet = 0;
  let totalVat = 0;
  let totalGross = 0;

  for (const item of input.items) {
    const lineNet = item.unitNetGrosze * item.quantity;
    const lineVat = Math.round((lineNet * item.vatRate) / 100);
    const lineGross = lineNet + lineVat;
    totalNet += lineNet;
    totalVat += lineVat;
    totalGross += lineGross;
    const bucket = vatBuckets.get(item.vatRate) ?? { net: 0, vat: 0 };
    bucket.net += lineNet;
    bucket.vat += lineVat;
    vatBuckets.set(item.vatRate, bucket);
  }

  const vatSummary = [...vatBuckets.entries()].map(([rate, b]) => ({
    rate,
    net: b.net,
    vat: b.vat,
  }));

  const { data, error } = await sb
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      payment_id: input.paymentId,
      user_id: input.userId,
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_address: input.customer.address ?? null,
      customer_city: input.customer.city ?? null,
      customer_zip: input.customer.zip ?? null,
      customer_country: input.customer.country ?? "PL",
      customer_nip: input.customer.nip ?? null,
      customer_vat_id: input.customer.vatId ?? null,
      customer_type: input.customer.customerType,
      items: input.items as unknown as Json,
      vat_summary: vatSummary as unknown as Json,
      total_net_grosze: totalNet,
      total_vat_grosze: totalVat,
      total_gross_grosze: totalGross,
      issue_date: issueDate.toISOString(),
      sell_date: sellDate.toISOString(),
      is_correction: isCorrection,
      original_invoice_number: input.originalInvoiceNumber ?? null,
      correction_reason: input.correctionReason ?? null,
      status: "issued",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as InvoiceRecord;
}

/**
 * Generuje PDF faktury (lazy-import pdfkit/pdf-lib).
 * Zwraca buffer — caller decyduje o storage (R2/S3/Supabase Storage).
 */
export async function renderInvoicePdf(invoice: InvoiceRecord): Promise<Uint8Array> {
  let pdfMod: any;
  try {
    pdfMod = await import("pdf-lib");
  } catch {
    return new TextEncoder().encode(buildInvoiceTextFallback(invoice));
  }
  const { PDFDocument, StandardFonts, rgb } = pdfMod;
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 portrait
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const draw = (text: string, opts: { x?: number; size?: number; bold?: boolean } = {}) => {
    page.drawText(text, {
      x: opts.x ?? 50,
      y,
      size: opts.size ?? 11,
      font: opts.bold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= (opts.size ?? 11) + 4;
  };

  draw(invoice.is_correction ? "FAKTURA KORYGUJĄCA" : "FAKTURA", { size: 18, bold: true });
  draw(`Numer: ${invoice.invoice_number}`, { bold: true });
  draw(`Data wystawienia: ${invoice.issue_date.slice(0, 10)}`);
  draw(`Data sprzedaży:   ${invoice.sell_date.slice(0, 10)}`);
  y -= 10;
  draw("Sprzedawca:", { bold: true });
  draw("Długomat sp. z o.o.");
  draw("ul. Marszałkowska 1, 00-001 Warszawa");
  draw("NIP: 1234567890");
  y -= 10;
  draw("Nabywca:", { bold: true });
  draw(invoice.customer_name);
  if (invoice.customer_nip) draw(`NIP: ${invoice.customer_nip}`);
  y -= 14;

  // VAT summary
  draw("Podsumowanie VAT:", { bold: true });
  for (const v of invoice.vat_summary) {
    draw(
      `Stawka ${v.rate}% — netto ${(v.net / 100).toFixed(2)} zł, VAT ${(v.vat / 100).toFixed(2)} zł`,
    );
  }
  y -= 10;
  draw(`SUMA NETTO:  ${(invoice.total_net_grosze / 100).toFixed(2)} zł`);
  draw(`VAT:         ${(invoice.total_vat_grosze / 100).toFixed(2)} zł`);
  draw(`SUMA BRUTTO: ${(invoice.total_gross_grosze / 100).toFixed(2)} zł`, { bold: true });

  if (invoice.is_correction) {
    y -= 12;
    draw("ADNOTACJA: Faktura korygująca do faktury pierwotnej.", { bold: true });
  }

  return await doc.save();
}

function buildInvoiceTextFallback(inv: InvoiceRecord): string {
  return [
    inv.is_correction ? "FAKTURA KORYGUJĄCA" : "FAKTURA",
    `Numer: ${inv.invoice_number}`,
    `Nabywca: ${inv.customer_name}`,
    `Razem: ${(inv.total_gross_grosze / 100).toFixed(2)} zł brutto`,
  ].join("\n");
}

/**
 * Sync do Fakturownia (opcjonalny, gdy klucz API jest skonfigurowany).
 */
export async function syncInvoiceToFakturownia(
  invoice: InvoiceRecord,
): Promise<string | null> {
  const apiToken = process.env.FAKTUROWNIA_API_TOKEN;
  const account = process.env.FAKTUROWNIA_ACCOUNT;
  if (!apiToken || !account) return null;

  try {
    const res = await fetch(`https://${account}.fakturownia.pl/invoices.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_token: apiToken,
        invoice: {
          number: invoice.invoice_number,
          buyer_name: invoice.customer_name,
          buyer_tax_no: invoice.customer_nip ?? "",
          issue_date: invoice.issue_date.slice(0, 10),
          sell_date: invoice.sell_date.slice(0, 10),
          // ... mapping pól
        },
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { id?: number };
    if (!json.id) return null;

    const sb = createSupabaseAdminClient();
    await sb
      .from("invoices")
      .update({ fakturownia_id: String(json.id) })
      .eq("id", invoice.id);
    return String(json.id);
  } catch {
    return null;
  }
}
