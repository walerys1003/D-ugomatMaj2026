/**
 * Kalkulator kwoty wolnej od zajęcia z rachunku bankowego.
 *
 * Podstawa prawna:
 *   - art. 54 ust. 1 ustawy z dnia 29 sierpnia 1997 r. — Prawo bankowe
 *     Środki pieniężne na rachunkach oszczędnościowych, oszczędnościowo-
 *     rozliczeniowych oraz na rachunkach terminowych lokat oszczędnościowych
 *     jednej osoby są wolne od zajęcia na podstawie sądowego lub
 *     administracyjnego tytułu wykonawczego do wysokości 75% minimalnego
 *     wynagrodzenia za pracę w każdym miesiącu kalendarzowym, w którym
 *     obowiązuje zajęcie.
 *   - art. 54a Prawa bankowego — wyłączenia z tego limitu (np. środki
 *     z funduszy unijnych, świadczenia rodzinne, 500+, alimenty —
 *     zwolnione na podstawie art. 833 § 6 KPC, niezależnie od limitu UFG).
 *   - art. 833 § 6 KPC — całkowite wyłączenie z egzekucji świadczeń
 *     rodzinnych, wychowawczego (500+), alimentów, świadczeń wspomagających.
 *
 * UWAGA — kwota wolna kumuluje się miesięcznie:
 *   Limit z art. 54 ust. 1 PB nie jest "stanem konta", a sumą wpływów
 *   chronionych w danym miesiącu kalendarzowym. Klient ma prawo
 *   dysponować tymi środkami nawet jeśli rachunek jest zajęty.
 *   Po przekroczeniu limitu w danym miesiącu — bank musi przekazać
 *   nadwyżkę komornikowi.
 *
 * UWAGA — kwota wolna jest WSPÓLNA dla wszystkich rachunków dłużnika
 *   w jednym banku. Dłużnik może wskazać bank, w którym chce ją
 *   wykorzystać (zazwyczaj ten z bieżącymi wpływami).
 */
import {
  resolveMinWage,
  ufgBankAccountLimitGrosze,
} from "./legal-constants";

export interface RachunekInput {
  /** Aktualne saldo zajętego rachunku (w groszach). */
  saldoGrosze: number;
  /** Suma wpływów na konto w bieżącym miesiącu kalendarzowym (groszach). */
  wplywyMiesieczneGrosze: number;
  /**
   * Kwota świadczeń całkowicie wyłączonych z egzekucji
   * (500+, alimenty, świadczenia rodzinne) — w groszach.
   * Zwolnione na podstawie art. 833 § 6 KPC niezależnie od limitu UFG.
   */
  swiadczeniaWylaczoneGrosze?: number;
  /**
   * Kwota już wypłacona / wykorzystana z limitu UFG w bieżącym miesiącu
   * (np. wcześniejsze wypłaty po zajęciu) — w groszach.
   */
  juzWykorzystanaGrosze?: number;
  /** Data obliczenia (do wyboru właściwej stawki min. wynagrodzenia). */
  at?: Date;
}

export interface RachunekResult {
  /** Limit UFG na bieżący miesiąc (w groszach). */
  limitMiesiecznyGrosze: number;
  /** Pozostały do wykorzystania limit UFG (groszach). */
  pozostalyLimitGrosze: number;
  /** Świadczenia wyłączone z egzekucji (art. 833 § 6 KPC) — groszach. */
  swiadczeniaWylaczoneGrosze: number;
  /** Łączna kwota chroniona (limit UFG + świadczenia wyłączone). */
  lacznieChronioneGrosze: number;
  /** Saldo dostępne dla dłużnika (min. saldo i kwota chroniona). */
  doDyspozycjiGrosze: number;
  /** Saldo, które bank przekaże komornikowi po wpłatach do rachunku. */
  doZajeciaGrosze: number;
  /** Czy limit UFG został wyczerpany w tym miesiącu? */
  limitWyczerpany: boolean;
  /** Podstawa prawna do zacytowania w piśmie. */
  podstawaPrawna: string;
  /** Czytelne objaśnienie. */
  objasnienie: string;
}

export function obliczKwoteWolnaRachunek(
  input: RachunekInput,
): RachunekResult {
  const limit = ufgBankAccountLimitGrosze(input.at);
  const minWage = resolveMinWage(input.at);
  const wykorzystana = Math.max(0, input.juzWykorzystanaGrosze ?? 0);
  const swiadczeniaWylaczone = Math.max(
    0,
    input.swiadczeniaWylaczoneGrosze ?? 0,
  );

  const pozostalyLimit = Math.max(0, limit - wykorzystana);
  const lacznieChronione = pozostalyLimit + swiadczeniaWylaczone;
  const doDyspozycji = Math.min(input.saldoGrosze, lacznieChronione);
  const doZajecia = Math.max(0, input.saldoGrosze - lacznieChronione);
  const limitWyczerpany = wykorzystana >= limit;

  const objasnienie = [
    `Minimalne wynagrodzenie brutto: ${formatPLN(minWage.bruttoGrosze)}.`,
    `Limit kwoty wolnej z art. 54 ust. 1 Prawa bankowego (75% min. wynagrodzenia): ${formatPLN(limit)} miesięcznie.`,
    wykorzystana > 0
      ? `Wykorzystano w tym miesiącu: ${formatPLN(wykorzystana)} → pozostały limit: ${formatPLN(pozostalyLimit)}.`
      : `Limit nie został jeszcze wykorzystany — pełne ${formatPLN(limit)} dostępne.`,
    swiadczeniaWylaczone > 0
      ? `Dodatkowo świadczenia z art. 833 § 6 KPC (500+, alimenty, świadczenia rodzinne) — ${formatPLN(swiadczeniaWylaczone)} całkowicie wyłączone z egzekucji.`
      : "",
    `Łącznie chroniona kwota: ${formatPLN(lacznieChronione)}.`,
    `Z aktualnego salda ${formatPLN(input.saldoGrosze)} do Twojej dyspozycji pozostaje ${formatPLN(doDyspozycji)}, a komornik może zająć ${formatPLN(doZajecia)}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    limitMiesiecznyGrosze: limit,
    pozostalyLimitGrosze: pozostalyLimit,
    swiadczeniaWylaczoneGrosze: swiadczeniaWylaczone,
    lacznieChronioneGrosze: lacznieChronione,
    doDyspozycjiGrosze: doDyspozycji,
    doZajeciaGrosze: doZajecia,
    limitWyczerpany,
    podstawaPrawna:
      "art. 54 ust. 1 ustawy Prawo bankowe; art. 833 § 6 KPC (świadczenia wyłączone)",
    objasnienie,
  };
}

function formatPLN(grosze: number): string {
  return `${(grosze / 100).toFixed(2).replace(".", ",")} zł`;
}
