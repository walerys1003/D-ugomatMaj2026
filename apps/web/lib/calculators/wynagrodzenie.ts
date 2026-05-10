/**
 * Kalkulator kwoty wolnej od potrąceń z wynagrodzenia za pracę.
 *
 * Podstawa prawna:
 *   - art. 87 § 1 KP   — kolejność i granice potrąceń
 *   - art. 87 § 3 KP   — limity ułamkowe (1/2, 3/5, 2/5)
 *   - art. 87¹ § 1 KP  — kwota wolna = minimalne wynagrodzenie netto
 *   - art. 87¹ § 2 KP  — proporcjonalne stosowanie przy niepełnym etacie
 *   - art. 91 KP       — potrącenia za zgodą pracownika
 *
 * Ten kalkulator NIE jest poradą prawną — to wyłącznie pomoc w wypełnieniu
 * pisma. Wynik zawsze opatrujemy dyskleimerem.
 */
import { resolveMinWage } from "./legal-constants";

export type PotracenieKategoria =
  | "alimentacyjne"
  | "niealimentacyjne"
  | "zaliczki_pieniezne"
  | "kary_pieniezne"
  | "kilka_tytulow";

export interface WynagrodzenieInput {
  /** Wynagrodzenie netto miesięcznie (w groszach). */
  nettoGrosze: number;
  /** Kategoria potrącenia — decyduje o limicie ułamkowym. */
  kategoria: PotracenieKategoria;
  /** Wymiar etatu (1.0 = pełny, 0.5 = pół etatu itd.). */
  etat?: number;
  /** Data obliczenia (do wyboru właściwej stawki min. wynagrodzenia). */
  at?: Date;
}

export interface WynagrodzenieResult {
  /** Kwota wolna (w groszach) — to musi pozostać u pracownika. */
  kwotaWolnaGrosze: number;
  /** Maksymalna dopuszczalna kwota potrącenia (w groszach). */
  maksPotracenieGrosze: number;
  /** Wynagrodzenie po potrąceniu (w groszach). */
  pozostaleGrosze: number;
  /** Limit ułamkowy zastosowany (np. 0.6 dla 3/5). */
  limitUlamkowy: number;
  /**
   * Czy kwota wolna jest aktywnym ograniczeniem? Jeśli true — limit
   * ułamkowy schodzi poniżej kwoty wolnej, więc realnym ogranicznikiem
   * jest art. 87¹ KP.
   */
  kwotaWolnaWiazaca: boolean;
  /** Podstawa prawna do zacytowania w piśmie. */
  podstawaPrawna: string;
  /** Czytelne objaśnienie dla użytkownika. */
  objasnienie: string;
}

/**
 * Limity ułamkowe potrąceń wg art. 87 § 3 KP.
 *
 *   - alimentacyjne          — 3/5 wynagrodzenia
 *   - niealimentacyjne       — 1/2 wynagrodzenia
 *   - zaliczki_pieniezne     — 1/2 wynagrodzenia
 *   - kary_pieniezne         — do 1/10 wynagrodzenia (art. 108 KP)
 *   - kilka_tytulow          — łącznie nie więcej niż 1/2 (lub 3/5
 *                              z udziałem alimentów)
 */
const LIMIT_ULAMKOWY: Record<PotracenieKategoria, number> = {
  alimentacyjne: 3 / 5,
  niealimentacyjne: 1 / 2,
  zaliczki_pieniezne: 1 / 2,
  kary_pieniezne: 1 / 10,
  kilka_tytulow: 3 / 5,
};

/**
 * Próg kwoty wolnej dla danej kategorii.
 * Alimenty: kwota wolna NIE PRZYSŁUGUJE (art. 87¹ § 1 KP a contrario —
 * przepis wymienia tylko potrącenia niealimentacyjne).
 */
function kwotaWolnaProcent(kategoria: PotracenieKategoria): number {
  switch (kategoria) {
    case "alimentacyjne":
      return 0; // brak ochrony kwotą wolną
    case "niealimentacyjne":
    case "kilka_tytulow":
      return 1.0; // 100% min. wynagrodzenia netto
    case "zaliczki_pieniezne":
      return 0.75; // art. 87¹ § 1 pkt 2 KP
    case "kary_pieniezne":
      return 0.9; // art. 87¹ § 1 pkt 3 KP — 90% min. wynagrodzenia
  }
}

function podstawaPrawnaFor(kategoria: PotracenieKategoria): string {
  switch (kategoria) {
    case "alimentacyjne":
      return "art. 87 § 3 pkt 1 KP, art. 87¹ § 1 KP a contrario";
    case "niealimentacyjne":
      return "art. 87 § 3 pkt 2 KP, art. 87¹ § 1 pkt 1 KP";
    case "zaliczki_pieniezne":
      return "art. 87 § 1 pkt 3 KP, art. 87¹ § 1 pkt 2 KP";
    case "kary_pieniezne":
      return "art. 108 KP, art. 87¹ § 1 pkt 3 KP";
    case "kilka_tytulow":
      return "art. 87 § 3 KP, art. 87¹ § 1 KP";
  }
}

/**
 * Oblicza maksymalne dopuszczalne potrącenie z wynagrodzenia oraz
 * kwotę wolną pozostającą do dyspozycji pracownika.
 */
export function obliczKwoteWolnaWynagrodzenie(
  input: WynagrodzenieInput,
): WynagrodzenieResult {
  const etat = clampEtat(input.etat ?? 1.0);
  const minWage = resolveMinWage(input.at);

  // Kwota wolna proporcjonalna do etatu (art. 87¹ § 2 KP).
  const procent = kwotaWolnaProcent(input.kategoria);
  const kwotaWolnaGrosze = Math.floor(minWage.nettoGrosze * procent * etat);

  // Limit ułamkowy z art. 87 § 3 KP.
  const limitUlamkowy = LIMIT_ULAMKOWY[input.kategoria];
  const maksPotracenieZUlamka = Math.floor(input.nettoGrosze * limitUlamkowy);

  // Pozostałe wynagrodzenie po potrąceniu z limitu ułamkowego.
  const pozostaleZUlamka = input.nettoGrosze - maksPotracenieZUlamka;

  // Realny ograniczenie: pozostałe musi być >= kwota wolna.
  let pozostaleGrosze: number;
  let maksPotracenieGrosze: number;
  let kwotaWolnaWiazaca: boolean;

  if (pozostaleZUlamka >= kwotaWolnaGrosze) {
    // Limit ułamkowy schodzi nas powyżej kwoty wolnej — wiążący jest ułamek.
    pozostaleGrosze = pozostaleZUlamka;
    maksPotracenieGrosze = maksPotracenieZUlamka;
    kwotaWolnaWiazaca = false;
  } else {
    // Po zastosowaniu ułamka zostałoby mniej niż kwota wolna — wiążąca
    // jest kwota wolna z art. 87¹ KP.
    pozostaleGrosze = Math.min(input.nettoGrosze, kwotaWolnaGrosze);
    maksPotracenieGrosze = Math.max(0, input.nettoGrosze - pozostaleGrosze);
    kwotaWolnaWiazaca = procent > 0;
  }

  const objasnienie = buildObjasnienie({
    kategoria: input.kategoria,
    nettoGrosze: input.nettoGrosze,
    kwotaWolnaGrosze,
    maksPotracenieGrosze,
    pozostaleGrosze,
    limitUlamkowy,
    kwotaWolnaWiazaca,
    minWageBrutto: minWage.bruttoGrosze,
    minWageNetto: minWage.nettoGrosze,
    etat,
  });

  return {
    kwotaWolnaGrosze,
    maksPotracenieGrosze,
    pozostaleGrosze,
    limitUlamkowy,
    kwotaWolnaWiazaca,
    podstawaPrawna: podstawaPrawnaFor(input.kategoria),
    objasnienie,
  };
}

function clampEtat(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0.05, value));
}

function buildObjasnienie(args: {
  kategoria: PotracenieKategoria;
  nettoGrosze: number;
  kwotaWolnaGrosze: number;
  maksPotracenieGrosze: number;
  pozostaleGrosze: number;
  limitUlamkowy: number;
  kwotaWolnaWiazaca: boolean;
  minWageBrutto: number;
  minWageNetto: number;
  etat: number;
}): string {
  const f = (g: number) => formatPLN(g);
  const ulamekTxt = ulamekToString(args.limitUlamkowy);
  const etatTxt =
    args.etat === 1 ? "" : ` (proporcjonalnie do etatu ${args.etat})`;

  if (args.kategoria === "alimentacyjne") {
    return [
      `Świadczenia alimentacyjne nie są chronione kwotą wolną (art. 87¹ § 1 KP a contrario).`,
      `Limit ułamkowy: do ${ulamekTxt} wynagrodzenia (art. 87 § 3 pkt 1 KP)${etatTxt}.`,
      `Maksymalne potrącenie: ${f(args.maksPotracenieGrosze)}.`,
      `Pozostaje do wypłaty: ${f(args.pozostaleGrosze)}.`,
    ].join(" ");
  }

  const wiazaceFragment = args.kwotaWolnaWiazaca
    ? `Wiążącym ograniczeniem jest kwota wolna z art. 87¹ KP — pracodawca musi zostawić Ci co najmniej ${f(args.kwotaWolnaGrosze)}.`
    : `Wiążącym ograniczeniem jest limit ułamkowy ${ulamekTxt} z art. 87 § 3 KP.`;

  return [
    `Minimalne wynagrodzenie netto: ${f(args.minWageNetto)}.`,
    `Kwota wolna dla tej kategorii potrącenia: ${f(args.kwotaWolnaGrosze)}${etatTxt}.`,
    wiazaceFragment,
    `Maksymalne potrącenie: ${f(args.maksPotracenieGrosze)}.`,
    `Pozostaje do wypłaty: ${f(args.pozostaleGrosze)}.`,
  ].join(" ");
}

function ulamekToString(value: number): string {
  // 0.5 -> "1/2", 0.6 -> "3/5", 0.1 -> "1/10"
  const eps = 0.001;
  if (Math.abs(value - 1 / 2) < eps) return "1/2";
  if (Math.abs(value - 3 / 5) < eps) return "3/5";
  if (Math.abs(value - 1 / 10) < eps) return "1/10";
  if (Math.abs(value - 2 / 5) < eps) return "2/5";
  return `${Math.round(value * 100)}%`;
}

function formatPLN(grosze: number): string {
  const zl = (grosze / 100).toFixed(2).replace(".", ",");
  return `${zl} zł`;
}
