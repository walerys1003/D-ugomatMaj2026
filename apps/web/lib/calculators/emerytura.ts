/**
 * Kalkulator kwoty wolnej od potrąceń ze świadczeń emerytalno-rentowych.
 *
 * Podstawa prawna:
 *   - art. 139 ustawy z dnia 17 grudnia 1998 r. o emeryturach i rentach
 *     z Funduszu Ubezpieczeń Społecznych — kolejność potrąceń.
 *   - art. 140 ust. 1 — limity ułamkowe (60% / 50% / 25% świadczenia).
 *   - art. 141 ust. 1 — kwoty wolne wyrażone jako procent najniższej
 *     emerytury (waloryzowane corocznie 1 marca).
 *
 * Kwoty wolne (art. 141 ust. 1 — stan prawny po nowelizacji 2022):
 *   - 500 zł × wskaźnik waloryzacji      → potrącenia alimentacyjne
 *   - 825 zł × wskaźnik                  → potrącenia niealimentacyjne
 *     (tj. 75% najniższej emerytury)
 *   - 660 zł × wskaźnik                  → świadczenia nienależnie pobrane
 *     (tj. 60% najniższej emerytury)
 *   - 200 zł × wskaźnik                  → odpłatność za pobyt w DPS
 *
 * Z uwagi na zmiany ustawowe (waloryzacja kwot wolnych razem z najniższą
 * emeryturą) — operujemy procentem najniższej emerytury, a nie sztywnymi
 * kwotami z 1998 r. Wartości procentowe są zgodne z obecnym stanem prawnym
 * potwierdzonym tabelą ZUS „Kwoty wolne od potrąceń ze świadczeń".
 */
import { resolveMinPension } from "./legal-constants";

export type EmeryturaKategoria =
  | "alimentacyjne"
  | "niealimentacyjne"
  | "nienależne"
  | "dps";

export interface EmeryturaInput {
  /** Świadczenie BRUTTO miesięcznie (w groszach). */
  bruttoGrosze: number;
  /** Kategoria potrącenia. */
  kategoria: EmeryturaKategoria;
  /** Data obliczenia (do wyboru wskaźnika waloryzacji). */
  at?: Date;
}

export interface EmeryturaResult {
  /** Kwota wolna w groszach. */
  kwotaWolnaGrosze: number;
  /** Maksymalne dopuszczalne potrącenie (groszach). */
  maksPotracenieGrosze: number;
  /** Świadczenie po potrąceniu (groszach). */
  pozostaleGrosze: number;
  /** Limit ułamkowy zastosowany (np. 0.6). */
  limitUlamkowy: number;
  /** Czy kwota wolna jest wiążącym ograniczeniem? */
  kwotaWolnaWiazaca: boolean;
  /** Podstawa prawna do zacytowania w piśmie. */
  podstawaPrawna: string;
  /** Czytelne objaśnienie. */
  objasnienie: string;
}

/** Limity ułamkowe — art. 140 ust. 1 ustawy emerytalnej. */
const LIMIT_ULAMKOWY: Record<EmeryturaKategoria, number> = {
  alimentacyjne: 0.6, // 60% świadczenia
  niealimentacyjne: 0.25, // 25% świadczenia (potrącenia z tytułów innych)
  nienależne: 0.5, // 50% — nienależnie pobrane świadczenia
  dps: 0.5, // 50% — odpłatność za pobyt w DPS
};

/** Procent najniższej emerytury — art. 141 ust. 1 ustawy emerytalnej. */
const KWOTA_WOLNA_PROCENT: Record<EmeryturaKategoria, number> = {
  alimentacyjne: 0.5, // 50% najniższej emerytury (alimenty)
  niealimentacyjne: 0.75, // 75% najniższej emerytury
  nienależne: 0.6, // 60% — nienależne
  dps: 0.2, // 20% — koszty pobytu w DPS
};

function podstawaPrawnaFor(kategoria: EmeryturaKategoria): string {
  switch (kategoria) {
    case "alimentacyjne":
      return "art. 139 ust. 1 pkt 3, art. 140 ust. 1 pkt 1, art. 141 ust. 1 pkt 1 ustawy o emeryturach i rentach z FUS";
    case "niealimentacyjne":
      return "art. 139 ust. 1 pkt 5, art. 140 ust. 1 pkt 3, art. 141 ust. 1 pkt 2 ustawy o emeryturach i rentach z FUS";
    case "nienależne":
      return "art. 138, art. 140 ust. 1 pkt 2, art. 141 ust. 1 pkt 3 ustawy o emeryturach i rentach z FUS";
    case "dps":
      return "art. 139 ust. 1 pkt 10, art. 140 ust. 1 pkt 2, art. 141 ust. 1 pkt 4 ustawy o emeryturach i rentach z FUS";
  }
}

export function obliczKwoteWolnaEmerytura(
  input: EmeryturaInput,
): EmeryturaResult {
  const minPension = resolveMinPension(input.at);
  const procent = KWOTA_WOLNA_PROCENT[input.kategoria];
  const kwotaWolnaGrosze = Math.floor(minPension.bruttoGrosze * procent);

  const limitUlamkowy = LIMIT_ULAMKOWY[input.kategoria];
  const maksPotracenieZUlamka = Math.floor(input.bruttoGrosze * limitUlamkowy);
  const pozostaleZUlamka = input.bruttoGrosze - maksPotracenieZUlamka;

  let pozostaleGrosze: number;
  let maksPotracenieGrosze: number;
  let kwotaWolnaWiazaca: boolean;

  if (pozostaleZUlamka >= kwotaWolnaGrosze) {
    pozostaleGrosze = pozostaleZUlamka;
    maksPotracenieGrosze = maksPotracenieZUlamka;
    kwotaWolnaWiazaca = false;
  } else {
    pozostaleGrosze = Math.min(input.bruttoGrosze, kwotaWolnaGrosze);
    maksPotracenieGrosze = Math.max(0, input.bruttoGrosze - pozostaleGrosze);
    kwotaWolnaWiazaca = true;
  }

  return {
    kwotaWolnaGrosze,
    maksPotracenieGrosze,
    pozostaleGrosze,
    limitUlamkowy,
    kwotaWolnaWiazaca,
    podstawaPrawna: podstawaPrawnaFor(input.kategoria),
    objasnienie: buildObjasnienie({
      kategoria: input.kategoria,
      bruttoGrosze: input.bruttoGrosze,
      kwotaWolnaGrosze,
      maksPotracenieGrosze,
      pozostaleGrosze,
      limitUlamkowy,
      kwotaWolnaWiazaca,
      minPensionGrosze: minPension.bruttoGrosze,
      procent,
    }),
  };
}

function buildObjasnienie(args: {
  kategoria: EmeryturaKategoria;
  bruttoGrosze: number;
  kwotaWolnaGrosze: number;
  maksPotracenieGrosze: number;
  pozostaleGrosze: number;
  limitUlamkowy: number;
  kwotaWolnaWiazaca: boolean;
  minPensionGrosze: number;
  procent: number;
}): string {
  const f = (g: number) => formatPLN(g);
  const procentTxt = `${Math.round(args.procent * 100)}%`;
  const ulamekTxt = `${Math.round(args.limitUlamkowy * 100)}%`;
  const wiazacy = args.kwotaWolnaWiazaca
    ? `Wiążącym ograniczeniem jest kwota wolna ${procentTxt} najniższej emerytury (art. 141 ustawy emerytalnej) — ZUS musi zostawić Ci co najmniej ${f(args.kwotaWolnaGrosze)}.`
    : `Wiążącym ograniczeniem jest limit ułamkowy ${ulamekTxt} świadczenia (art. 140 ustawy emerytalnej).`;
  return [
    `Najniższa emerytura: ${f(args.minPensionGrosze)}.`,
    `Kwota wolna dla tej kategorii potrącenia: ${procentTxt} najniższej emerytury = ${f(args.kwotaWolnaGrosze)}.`,
    wiazacy,
    `Maksymalne potrącenie: ${f(args.maksPotracenieGrosze)}.`,
    `Pozostaje do wypłaty: ${f(args.pozostaleGrosze)}.`,
  ].join(" ");
}

function formatPLN(grosze: number): string {
  return `${(grosze / 100).toFixed(2).replace(".", ",")} zł`;
}
