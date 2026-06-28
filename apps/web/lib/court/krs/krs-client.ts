/**
 * Tier 18 — KRS (Krajowy Rejestr Sądowy) deep extraction.
 *
 * Integracja z publicznym API KRS Ministerstwa Sprawiedliwości:
 *   https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/<KRS>?rejestr=P&format=JSON
 *
 * Zakres:
 *  - fetchByNumber(krs) → odpis aktualny (cache 24h)
 *  - fetchByNip(nip)     → wyszukanie po NIP (osobny endpoint)
 *  - extractCompanyProfile() — rozpakowanie nazwy, formy prawnej, adresu, reprezentacji
 *  - extractRepresentatives() — zarząd/wspólnicy/prokurenci z kompetencjami
 *  - extractFinancialIndicators() — KRS nie ma sprawozdań, ale możemy wyłuskać
 *    informacje o kapitale, statusie (likwidacja, upadłość, restrukturyzacja)
 *  - upadłośćCheck() — flaga "podmiot w upadłości" (kluczowa dla case_type=upadlosc)
 */

import { createHash } from "crypto";

export interface KrsCompanyProfile {
  krs: string;
  name: string;
  shortName: string | null;
  legalForm: string;
  nip: string | null;
  regon: string | null;
  registrationDate: string | null;
  address: {
    street: string;
    streetNumber: string;
    apartmentNumber: string | null;
    postalCode: string;
    city: string;
    country: string;
  } | null;
  capital: {
    declared: number | null;
    paid: number | null;
    currency: string;
  } | null;
  status: {
    active: boolean;
    inLiquidation: boolean;
    inBankruptcy: boolean;
    inRestructuring: boolean;
    crossed: boolean;
  };
  representation: {
    description: string | null;
    members: KrsRepresentative[];
  };
  pkdCodes: Array<{ code: string; description: string }>;
  raw: unknown;
}

export interface KrsRepresentative {
  function: string; // np. "PREZES ZARZĄDU"
  fullName: string;
  firstName: string | null;
  surname: string | null;
  pesel: string | null; // KRS publikuje 4 ostatnie tylko od 2024
  appointedAt: string | null;
  power: "samodzielnie" | "lacznie" | "inne" | null;
}

const KRS_BASE = "https://api-krs.ms.gov.pl/api/krs";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const inMemoryCache = new Map<string, { at: number; value: unknown }>();

function cacheKey(prefix: string, val: string): string {
  return `${prefix}:${val.toLowerCase()}`;
}

function cacheGet<T>(key: string): T | null {
  const hit = inMemoryCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    inMemoryCache.delete(key);
    return null;
  }
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T): void {
  inMemoryCache.set(key, { at: Date.now(), value });
}

export async function fetchByNumber(krs: string): Promise<unknown> {
  const cleaned = krs.replace(/\D/g, "").padStart(10, "0");
  const key = cacheKey("krs", cleaned);
  const cached = cacheGet<unknown>(key);
  if (cached) return cached;
  const url = `${KRS_BASE}/OdpisAktualny/${cleaned}?rejestr=P&format=JSON`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`KRS fetch failed: ${res.status}`);
  }
  const json = await res.json();
  cacheSet(key, json);
  return json;
}

export async function fetchByNip(nip: string): Promise<unknown> {
  const cleaned = nip.replace(/\D/g, "");
  if (cleaned.length !== 10) throw new Error("Invalid NIP");
  const key = cacheKey("nip", cleaned);
  const cached = cacheGet<unknown>(key);
  if (cached) return cached;
  const url = `${KRS_BASE}/wyszukaj-podmiot?nip=${cleaned}&rejestr=P`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`KRS NIP search failed: ${res.status}`);
  }
  const json = await res.json();
  cacheSet(key, json);
  return json;
}

export function extractCompanyProfile(raw: unknown): KrsCompanyProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, any>;
  const dz1 = root?.odpis?.dane?.dzial1;
  if (!dz1) return null;

  const dane = dz1.danePodmiotu ?? {};
  const siedziba = dz1.siedzibaIAdres?.adres ?? null;
  const kapital = dz1.kapital ?? null;
  const pkd = dz1.przedmiotDzialalnosci?.przedmiotPrzewazajacejDzialalnosci ?? [];
  const inny = dz1.przedmiotDzialalnosci?.przedmiotPozostalejDzialalnosci ?? [];
  const dz2 = root?.odpis?.dane?.dzial2 ?? {};
  const dz6 = root?.odpis?.dane?.dzial6 ?? {};

  const status = {
    active: !dz6?.wykreslenie,
    inLiquidation: Boolean(dz6?.likwidacja),
    inBankruptcy: Boolean(dz6?.postepowanieUpadlosciowe),
    inRestructuring: Boolean(dz6?.postepowanieNaprawcze ?? dz6?.postepowanieRestrukturyzacyjne),
    crossed: Boolean(dz6?.wykreslenie),
  };

  const repsRaw = dz2?.reprezentacja?.sklad ?? [];
  const members: KrsRepresentative[] = Array.isArray(repsRaw)
    ? repsRaw.map((m: Record<string, any>): KrsRepresentative => ({
        function: String(m.funkcjaWOrganie ?? m.funkcja ?? "").trim(),
        fullName: [m.imiona?.imie, m.nazwisko].filter(Boolean).join(" ").trim() || String(m.nazwaPelna ?? "").trim(),
        firstName: m.imiona?.imie ?? null,
        surname: m.nazwisko ?? null,
        pesel: null,
        appointedAt: m.dataPowolania ?? null,
        power: inferPower(dz2?.reprezentacja?.sposobReprezentacji),
      }))
    : [];

  return {
    krs: String(dane.numerKRS ?? "").padStart(10, "0"),
    name: String(dane.nazwa ?? "").trim(),
    shortName: dane.skrot ? String(dane.skrot) : null,
    legalForm: String(dane.formaPrawna ?? "").trim(),
    nip: dane.identyfikatory?.nip ?? null,
    regon: dane.identyfikatory?.regon ?? null,
    registrationDate: root?.odpis?.naglowekP?.dataRejestracjiPK ?? null,
    address: siedziba
      ? {
          street: String(siedziba.ulica ?? ""),
          streetNumber: String(siedziba.nrDomu ?? ""),
          apartmentNumber: siedziba.nrLokalu ?? null,
          postalCode: String(siedziba.kodPocztowy ?? ""),
          city: String(siedziba.miejscowosc ?? ""),
          country: String(siedziba.kraj ?? "POLSKA"),
        }
      : null,
    capital: kapital
      ? {
          declared: parseAmount(kapital.wysokoscKapitaluZakladowego),
          paid: parseAmount(kapital.czescKapZakladuWplaconego),
          currency: "PLN",
        }
      : null,
    status,
    representation: {
      description: dz2?.reprezentacja?.sposobReprezentacji ?? null,
      members,
    },
    pkdCodes: [...pkd, ...inny].map((p: Record<string, any>) => ({
      code: String(p.kodPKD ?? ""),
      description: String(p.opis ?? ""),
    })),
    raw,
  };
}

function inferPower(desc: unknown): KrsRepresentative["power"] {
  if (!desc) return null;
  const s = String(desc).toLowerCase();
  if (s.includes("samodzieln")) return "samodzielnie";
  if (s.includes("łącznie") || s.includes("lacznie") || s.includes("dwóch")) return "lacznie";
  return "inne";
}

function parseAmount(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Szybka flaga: czy podmiot jest w upadłości? Używane w wizardzie
 * D-Upadlosc do walidacji wniosków.
 */
export async function upadloscCheck(krs: string): Promise<{ inBankruptcy: boolean; profile: KrsCompanyProfile | null }> {
  const raw = await fetchByNumber(krs);
  const profile = extractCompanyProfile(raw);
  return { inBankruptcy: profile?.status.inBankruptcy ?? false, profile };
}

/**
 * Generuje stabilny audit-fingerprint odpisu (do timeline'a sprawy).
 */
export function fingerprintProfile(profile: KrsCompanyProfile): string {
  const payload = JSON.stringify({
    krs: profile.krs,
    name: profile.name,
    status: profile.status,
    repCount: profile.representation.members.length,
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}
