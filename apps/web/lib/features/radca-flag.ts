/**
 * Feature flag — wyświetlanie informacji o współpracującym radcy prawnym.
 *
 * Gating placeholderów do czasu otrzymania:
 *   - podpisanej zgody radcy na publikację imienia/nazwiska (RODO art. 6 ust. 1 lit. a),
 *   - numeru wpisu KIRP (Krajowa Izba Radców Prawnych),
 *   - krótkiego opisu zakresu współpracy do publikacji w trust-bar.
 *
 * Flag domyślnie WYŁĄCZONA — landing pokazuje fallback "Współpraca w przygotowaniu".
 * Po otrzymaniu danych od użytkownika:
 *   1. NEXT_PUBLIC_RADCA_ENABLED=true
 *   2. Wypełnij NEXT_PUBLIC_RADCA_NAME / KIRP / SCOPE
 *   → launch ready (zero zmian w kodzie).
 *
 * Patrz: docs/RADCA_CONSENT_CHECKLIST.md dla pełnego runbook'a.
 *
 * Plan v1 Priority 3 — domyka MVP gating placeholderów (zad. 4% remaining).
 */

export const RADCA_ENABLED =
  process.env.NEXT_PUBLIC_RADCA_ENABLED === "true";

export interface RadcaInfo {
  /** Imię i nazwisko w formie do publikacji, np. "Anna Kowalska". */
  name: string;
  /** Numer wpisu KIRP, np. "WA-1234" (z prefiksem OIRP). */
  kirp: string;
  /** Krótki opis zakresu współpracy (≤120 znaków, do trust-bar). */
  scope: string;
  /** Opcjonalne inicjały do awatara — fallback do pierwszych liter `name`. */
  initials: string;
  /** Opcjonalna nazwa Okręgowej Izby — domyślnie OIRP w Warszawie. */
  oirp: string;
}

/**
 * Zwraca dane radcy do publikacji w landing — albo `null` jeżeli flaga
 * wyłączona / brak wymaganych pól (fallback do "Współpraca w przygotowaniu").
 *
 * Wywoływane w komponentach SSR/RSC — bezpieczne (czysta funkcja, brak side effects).
 */
export function getRadcaInfo(): RadcaInfo | null {
  if (!RADCA_ENABLED) return null;

  const name = process.env.NEXT_PUBLIC_RADCA_NAME;
  const kirp = process.env.NEXT_PUBLIC_RADCA_KIRP;

  // Safety: jeśli flag włączona ale brak wymaganych pól → fallback.
  // To zabezpiecza przed wyrenderowaniem "undefined" lub "[Imię Nazwisko Radcy]"
  // w przypadku nieprawidłowej konfiguracji środowiska.
  if (!name || !kirp) return null;

  // Truthy check (nie ??): pusty string env też traktujemy jako brak,
  // żeby nie wyrenderować pustego paragrafu w trust-bar.
  const scope =
    process.env.NEXT_PUBLIC_RADCA_SCOPE ||
    "Konsultacja prawna w obszarze prawa cywilnego i konsumenckiego.";

  const oirp =
    process.env.NEXT_PUBLIC_RADCA_OIRP ||
    "Okręgowa Izba Radców Prawnych w Warszawie";

  // Inicjały — z env albo wyliczone z imienia.
  const initialsFromEnv = process.env.NEXT_PUBLIC_RADCA_INITIALS;
  const initials = initialsFromEnv && initialsFromEnv.length > 0
    ? initialsFromEnv.slice(0, 2).toUpperCase()
    : computeInitials(name);

  return { name, kirp, scope, initials, oirp };
}

/**
 * Wylicza inicjały z pełnego imienia (np. "Anna Kowalska" → "AK").
 * Bierze pierwszą literę pierwszych dwóch słów; jeśli jedno słowo — pierwsze 2 litery.
 */
function computeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}
