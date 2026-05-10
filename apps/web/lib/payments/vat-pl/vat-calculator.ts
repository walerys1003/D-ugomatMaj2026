/**
 * Tier 19 — Polish VAT calculator + invoice metadata builder.
 *
 * Stawki VAT PL (2026):
 *   23% — standard
 *   8%  — usługi gastronomiczne, hotelowe, transport pasażerski
 *   5%  — niektóre produkty spożywcze, książki
 *   0%  — eksport, WDT
 *   zw  — usługi prawnicze świadczone na rzecz osób prywatnych w UE
 *   np  — nie podlega (poza terytorium)
 *
 * MPP (mechanizm podzielonej płatności) — obowiązkowy dla
 * faktur ≥ 15 000 PLN brutto zawierających pozycje z załącznika 15.
 *
 * Reverse charge (odwrotne obciążenie) — dla B2B z VAT-UE z innego
 * państwa członkowskiego (NP), z dopiskiem "reverse charge".
 */

export type VatRate = "23" | "8" | "5" | "0" | "zw" | "np";

export interface VatLine {
  netCents: number;
  rate: VatRate;
}

export interface VatBreakdown {
  netCents: number;
  vatCents: number;
  grossCents: number;
  byRate: Array<{ rate: VatRate; netCents: number; vatCents: number; grossCents: number }>;
  mppRequired: boolean;
  reverseCharge: boolean;
}

const RATE_NUMBER: Record<VatRate, number> = {
  "23": 0.23,
  "8":  0.08,
  "5":  0.05,
  "0":  0,
  "zw": 0,
  "np": 0,
};

const MPP_THRESHOLD_CENTS = 15_000_00; // 15 000 PLN brutto

export interface VatComputeOptions {
  buyerCountryCode?: string; // ISO-3166 alpha-2
  buyerVatId?: string;       // VAT-UE
  hasAppendix15Item?: boolean;
}

export function computeVat(lines: VatLine[], opts: VatComputeOptions = {}): VatBreakdown {
  const reverseCharge = isReverseCharge(opts);
  const byRateMap = new Map<VatRate, { netCents: number; vatCents: number; grossCents: number }>();
  for (const line of lines) {
    const rate: VatRate = reverseCharge ? "np" : line.rate;
    const factor = RATE_NUMBER[rate] ?? 0;
    const vat = Math.round(line.netCents * factor);
    const gross = line.netCents + vat;
    const cur = byRateMap.get(rate) ?? { netCents: 0, vatCents: 0, grossCents: 0 };
    cur.netCents += line.netCents;
    cur.vatCents += vat;
    cur.grossCents += gross;
    byRateMap.set(rate, cur);
  }

  let net = 0;
  let vat = 0;
  let gross = 0;
  const byRate: VatBreakdown["byRate"] = [];
  for (const [rate, sums] of byRateMap.entries()) {
    byRate.push({ rate, ...sums });
    net += sums.netCents;
    vat += sums.vatCents;
    gross += sums.grossCents;
  }

  const mppRequired = !reverseCharge && gross >= MPP_THRESHOLD_CENTS && Boolean(opts.hasAppendix15Item);

  return {
    netCents: net,
    vatCents: vat,
    grossCents: gross,
    byRate: byRate.sort((a, b) => orderVatRate(a.rate) - orderVatRate(b.rate)),
    mppRequired,
    reverseCharge,
  };
}

function isReverseCharge(opts: VatComputeOptions): boolean {
  if (!opts.buyerCountryCode || opts.buyerCountryCode.toUpperCase() === "PL") return false;
  if (!opts.buyerVatId) return false;
  // Klient z VAT-UE z innego kraju członkowskiego → reverse charge B2B.
  return EU_COUNTRIES.has(opts.buyerCountryCode.toUpperCase());
}

const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
]);

function orderVatRate(r: VatRate): number {
  return ["23", "8", "5", "0", "zw", "np"].indexOf(r);
}

/**
 * Formatuje kwotę centową na ciąg PLN w formacie "1 234,56 PLN".
 */
export function formatPln(cents: number): string {
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  const wholeFormatted = whole.toLocaleString("pl-PL");
  const sign = cents < 0 ? "-" : "";
  return `${sign}${wholeFormatted},${frac} PLN`;
}

/**
 * Konwertuje kwotę zapisaną jako "1234.56" / "1 234,56" → centy.
 */
export function parsePlnToCents(input: string): number | null {
  const cleaned = input.replace(/\s+/g, "").replace(/,/g, ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

/**
 * Walidacja VAT-ID (struktura, bez online VIES — to robi vies-checker.ts).
 */
const VAT_ID_PATTERNS: Record<string, RegExp> = {
  PL: /^PL\d{10}$/,
  DE: /^DE\d{9}$/,
  FR: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/,
  IT: /^IT\d{11}$/,
  ES: /^ES[A-Z]\d{7}[A-Z]|^ES\d{8}[A-Z]|^ES[A-Z]\d{8}$/,
  GB: /^GB\d{9}$|^GB\d{12}$/,
  NL: /^NL\d{9}B\d{2}$/,
  CZ: /^CZ\d{8,10}$/,
  SK: /^SK\d{10}$/,
  HU: /^HU\d{8}$/,
};

export function isStructurallyValidVatId(vatId: string): boolean {
  const upper = vatId.toUpperCase().replace(/[\s-]/g, "");
  const cc = upper.slice(0, 2);
  const pattern = VAT_ID_PATTERNS[cc];
  return pattern ? pattern.test(upper) : /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(upper);
}
