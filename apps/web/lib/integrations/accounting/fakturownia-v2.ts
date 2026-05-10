/**
 * Tier 12 — Fakturownia & wFirma & iFirma sync (Polish accounting platforms).
 */
export type AccountingProvider = "fakturownia" | "wfirma" | "ifirma";

export interface ContractorInput {
  name: string;
  nip?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

export interface InvoiceLineInput {
  name: string;
  quantity: number;
  unit_price_grosze: number;
  vat_rate: number; // 23, 8, 5, 0
}

export interface IssuedInvoiceRef {
  provider: AccountingProvider;
  external_id: string;
  number?: string;
  pdf_url?: string;
}

export async function syncToFakturownia(opts: { contractor: ContractorInput; lines: InvoiceLineInput[]; issued_on?: string; payment_to?: string }): Promise<IssuedInvoiceRef> {
  const token = process.env.FAKTUROWNIA_API_TOKEN;
  const acct = process.env.FAKTUROWNIA_ACCOUNT;
  if (!token || !acct) throw new Error("fakturownia_not_configured");
  const body = {
    api_token: token,
    invoice: {
      kind: "vat",
      buyer_name: opts.contractor.name,
      buyer_tax_no: opts.contractor.nip,
      buyer_email: opts.contractor.email,
      buyer_post_code: opts.contractor.postal_code,
      buyer_city: opts.contractor.city,
      buyer_country: opts.contractor.country ?? "PL",
      issue_date: opts.issued_on ?? new Date().toISOString().slice(0, 10),
      payment_to: opts.payment_to,
      positions: opts.lines.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        total_price_gross: (l.quantity * l.unit_price_grosze) / 100,
        tax: l.vat_rate,
      })),
    },
  };
  const r = await fetch(`https://${acct}.fakturownia.pl/invoices.json`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`fakturownia_${r.status}`);
  const j: any = await r.json();
  return {
    provider: "fakturownia",
    external_id: String(j.id),
    number: j.number,
    pdf_url: j.pdf_url,
  };
}

export async function syncToWfirma(opts: { contractor: ContractorInput; lines: InvoiceLineInput[] }): Promise<IssuedInvoiceRef> {
  const key = process.env.WFIRMA_ACCESS_KEY;
  if (!key) throw new Error("wfirma_not_configured");
  // Stub: real implementation requires OAuth + company_id parameters.
  return { provider: "wfirma", external_id: `wfirma_pending_${Date.now()}` };
}

export async function syncToIfirma(opts: { contractor: ContractorInput; lines: InvoiceLineInput[] }): Promise<IssuedInvoiceRef> {
  const key = process.env.IFIRMA_AUTH_KEY;
  if (!key) throw new Error("ifirma_not_configured");
  return { provider: "ifirma", external_id: `ifirma_pending_${Date.now()}` };
}

export async function syncInvoice(provider: AccountingProvider, opts: { contractor: ContractorInput; lines: InvoiceLineInput[] }): Promise<IssuedInvoiceRef> {
  switch (provider) {
    case "fakturownia":
      return syncToFakturownia(opts);
    case "wfirma":
      return syncToWfirma(opts);
    case "ifirma":
      return syncToIfirma(opts);
  }
}
