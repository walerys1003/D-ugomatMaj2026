/**
 * Tier 19 — Polish VAT invoice metadata builder.
 *
 * Buduje strukturę faktury VAT zgodną z wymogami ustawy o VAT
 * (art. 106e), gotową do przekazania do fakturownia.pl / generatora
 * PDF / KSeF.
 *
 * Pola obowiązkowe (skrót):
 *   - data wystawienia, data sprzedaży, numer kolejny
 *   - dane sprzedawcy (nazwa, adres, NIP)
 *   - dane nabywcy (nazwa, adres, NIP/PESEL/VAT-UE)
 *   - nazwa towaru/usługi, ilość, jm, cena netto
 *   - stawka, kwota podatku, wartość brutto
 *   - podsumowanie netto/VAT/brutto per stawka
 *   - adnotacje: "mechanizm podzielonej płatności" / "odwrotne obciążenie"
 */

import { computeVat, formatPln, type VatBreakdown, type VatLine, type VatRate } from "./vat-calculator";

export interface InvoiceParty {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  nip?: string;
  vatId?: string;
  pesel?: string;
}

export interface InvoiceLineInput {
  description: string;
  quantity: number;
  unit: string; // "szt", "godz", "miesiąc"
  unitPriceNetCents: number;
  vatRate: VatRate;
  pkwiu?: string; // klasyfikacja statystyczna
  appendix15?: boolean; // pozycja z załącznika 15 → MPP
}

export interface InvoiceMeta {
  number: string; // np. "FV/2026/05/0042"
  issueDate: string; // ISO
  saleDate: string;  // ISO
  paymentDueDate: string; // ISO
  paymentMethod: "transfer" | "card" | "blik" | "cash";
  currency: "PLN" | "EUR" | "USD";
  exchangeRate?: { date: string; rate: number; source: "NBP" };
  notes?: string;
}

export interface Invoice {
  meta: InvoiceMeta;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  lines: Array<InvoiceLineInput & {
    netCents: number;
    vatCents: number;
    grossCents: number;
  }>;
  breakdown: VatBreakdown;
  annotations: string[];
  totalDisplay: {
    net: string;
    vat: string;
    gross: string;
  };
  buyerKind: "consumer" | "business_pl" | "business_eu" | "business_world";
}

export function buildInvoice(args: {
  meta: InvoiceMeta;
  seller: InvoiceParty;
  buyer: InvoiceParty;
  lines: InvoiceLineInput[];
}): Invoice {
  const buyerKind = classifyBuyer(args.buyer);

  const expandedLines = args.lines.map((line) => {
    const netCents = Math.round(line.unitPriceNetCents * line.quantity);
    return { ...line, netCents, vatCents: 0, grossCents: 0 };
  });

  const vatLines: VatLine[] = expandedLines.map((l) => ({ netCents: l.netCents, rate: l.vatRate }));
  const breakdown = computeVat(vatLines, {
    buyerCountryCode: args.buyer.country,
    buyerVatId: args.buyer.vatId,
    hasAppendix15Item: expandedLines.some((l) => l.appendix15),
  });

  // Dystrybuujemy obliczenia VAT z powrotem do linii.
  for (const line of expandedLines) {
    const effectiveRate: VatRate = breakdown.reverseCharge ? "np" : line.vatRate;
    const factor = effectiveRate === "23" ? 0.23 :
                   effectiveRate === "8" ? 0.08 :
                   effectiveRate === "5" ? 0.05 : 0;
    line.vatCents = Math.round(line.netCents * factor);
    line.grossCents = line.netCents + line.vatCents;
  }

  const annotations: string[] = [];
  if (breakdown.mppRequired) annotations.push("mechanizm podzielonej płatności");
  if (breakdown.reverseCharge) annotations.push("odwrotne obciążenie / reverse charge");
  if (breakdown.byRate.some((b) => b.rate === "zw")) annotations.push("zwolnienie z VAT — art. 43 ust. 1 ustawy o VAT");
  if (args.meta.currency !== "PLN" && args.meta.exchangeRate) {
    annotations.push(
      `Kurs ${args.meta.currency}/PLN z dnia ${args.meta.exchangeRate.date} (NBP): ${args.meta.exchangeRate.rate}`,
    );
  }

  return {
    meta: args.meta,
    seller: args.seller,
    buyer: args.buyer,
    lines: expandedLines,
    breakdown,
    annotations,
    buyerKind,
    totalDisplay: {
      net: formatPln(breakdown.netCents),
      vat: formatPln(breakdown.vatCents),
      gross: formatPln(breakdown.grossCents),
    },
  };
}

function classifyBuyer(b: InvoiceParty): Invoice["buyerKind"] {
  if (!b.nip && !b.vatId) return "consumer";
  const cc = (b.country || "").toUpperCase();
  if (cc === "PL" || (b.nip && !b.vatId)) return "business_pl";
  if (cc && cc !== "PL" && b.vatId) {
    const euCountries = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PT","RO","SK","SI","ES","SE"];
    return euCountries.includes(cc) ? "business_eu" : "business_world";
  }
  return "business_world";
}

/**
 * Generator numeru faktury: FV/{rok}/{miesiąc}/{kolejny:0000}
 */
export function nextInvoiceNumber(args: { year: number; month: number; sequence: number; prefix?: string }): string {
  const prefix = args.prefix ?? "FV";
  const mm = String(args.month).padStart(2, "0");
  const seq = String(args.sequence).padStart(4, "0");
  return `${prefix}/${args.year}/${mm}/${seq}`;
}
