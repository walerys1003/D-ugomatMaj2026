/**
 * mObywatel auto-fill — zad. 324
 *
 * After OIDC login via mObywatel, fetches the user's verified data and pre-fills
 * the wizard. Returns a structured Profile + validation flags.
 */

import { logger } from "@/lib/observability/logger";

export interface MObywatelProfile {
  /** PESEL (always present after mObywatel auth). */
  pesel: string;
  imie: string;
  nazwisko: string;
  data_urodzenia: string; // YYYY-MM-DD
  /** Address may be missing if user opted out. */
  adres?: {
    ulica: string;
    nr_domu: string;
    nr_lokalu?: string;
    kod_pocztowy: string;
    miejscowosc: string;
    wojewodztwo?: string;
    powiat?: string;
    gmina?: string;
  };
  /** Document */
  dowod_osobisty?: {
    seria_numer: string;
    data_waznosci: string;
  };
  verified_at: string;
}

export async function fetchMObywatelProfile(accessToken: string): Promise<MObywatelProfile | null> {
  const base = process.env.MOBYWATEL_API_BASE;
  if (!base || !accessToken) {
    logger.warn("mobywatel.not_configured");
    return null;
  }
  try {
    const resp = await fetch(`${base}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) {
      logger.warn("mobywatel.userinfo_failed", { status: resp.status });
      return null;
    }
    const data: unknown = await resp.json();
    return normalizeMObywatel(data);
  } catch (err) {
    logger.warn("mobywatel.fetch_failed", { error: (err as Error).message });
    return null;
  }
}

/** Surowa odpowiedź OIDC z mObywatel (pola opcjonalne, snake_case lub PL). */
interface MObywatelRaw {
  pesel?: string;
  given_name?: string;
  imie?: string;
  family_name?: string;
  nazwisko?: string;
  birthdate?: string;
  data_urodzenia?: string;
  address?: {
    street_name?: string;
    house_number?: string;
    flat_number?: string;
    postal_code?: string;
    locality?: string;
    region?: string;
    county?: string;
    municipality?: string;
  };
  id_document?: { number?: string; valid_to?: string };
}

function normalizeMObywatel(input: unknown): MObywatelProfile | null {
  const raw = (input ?? {}) as MObywatelRaw;
  if (!raw.pesel) return null;
  return {
    pesel: raw.pesel,
    imie: raw.given_name ?? raw.imie ?? "",
    nazwisko: raw.family_name ?? raw.nazwisko ?? "",
    data_urodzenia: raw.birthdate ?? raw.data_urodzenia ?? "",
    adres: raw.address
      ? {
          ulica: raw.address.street_name ?? "",
          nr_domu: raw.address.house_number ?? "",
          nr_lokalu: raw.address.flat_number ?? undefined,
          kod_pocztowy: raw.address.postal_code ?? "",
          miejscowosc: raw.address.locality ?? "",
          wojewodztwo: raw.address.region ?? undefined,
          powiat: raw.address.county ?? undefined,
          gmina: raw.address.municipality ?? undefined,
        }
      : undefined,
    dowod_osobisty: raw.id_document
      ? { seria_numer: raw.id_document.number ?? "", data_waznosci: raw.id_document.valid_to ?? "" }
      : undefined,
    verified_at: new Date().toISOString(),
  };
}

/**
 * Map mObywatel profile to wizard answers structure.
 */
export function mObywatelToWizardAnswers(profile: MObywatelProfile): Record<string, unknown> {
  return {
    imie_nazwisko: `${profile.imie} ${profile.nazwisko}`.trim(),
    imie: profile.imie,
    nazwisko: profile.nazwisko,
    pesel: profile.pesel,
    data_urodzenia: profile.data_urodzenia,
    adres_zamieszkania: profile.adres
      ? `${profile.adres.ulica} ${profile.adres.nr_domu}${profile.adres.nr_lokalu ? "/" + profile.adres.nr_lokalu : ""}, ${profile.adres.kod_pocztowy} ${profile.adres.miejscowosc}`
      : undefined,
    kod_pocztowy: profile.adres?.kod_pocztowy,
    miejscowosc: profile.adres?.miejscowosc,
    seria_numer_dowodu: profile.dowod_osobisty?.seria_numer,
    _source: "mobywatel",
    _verified_at: profile.verified_at,
  };
}
