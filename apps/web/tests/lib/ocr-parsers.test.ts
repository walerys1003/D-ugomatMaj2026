/**
 * Testy parserów OCR (Tier 3.3).
 *
 * Każdy parser ma własny syntetyczny "skan" (string) imitujący wyjście
 * Tesseracta — zaszumiony, ale realistyczny.
 */
import { describe, expect, it } from "vitest";

import {
  parsePolishAmount,
  parsePolishDate,
  parsePesel,
  validatePesel,
  maskPesel,
  computeCompleteness,
} from "@/lib/ocr/parsers/common";
import { parseNakaz } from "@/lib/ocr/parsers/nakaz-parser";
import { parseKomornik } from "@/lib/ocr/parsers/komornik-parser";
import { parseBik } from "@/lib/ocr/parsers/bik-parser";
import { dispatchParser, sniffIntent } from "@/lib/ocr/parsers/dispatcher";

// -----------------------------------------------------------------------------
// common.ts
// -----------------------------------------------------------------------------
describe("parsePolishAmount", () => {
  it("parsuje 1 234,56 zł", () => {
    expect(parsePolishAmount("1 234,56 zł")).toBe(1234.56);
  });
  it("parsuje 1.234,56 PLN (kropka jako tysiące)", () => {
    expect(parsePolishAmount("1.234,56 PLN")).toBe(1234.56);
  });
  it("parsuje 1234,56", () => {
    expect(parsePolishAmount("1234,56")).toBe(1234.56);
  });
  it("parsuje liczbę z kropką dziesiętną", () => {
    expect(parsePolishAmount("1234.56")).toBe(1234.56);
  });
  it("zwraca null dla śmieci", () => {
    expect(parsePolishAmount("abc")).toBeNull();
    expect(parsePolishAmount("")).toBeNull();
    expect(parsePolishAmount(null)).toBeNull();
  });
});

describe("parsePolishDate", () => {
  it("parsuje DD.MM.YYYY", () => {
    expect(parsePolishDate("15.03.2025")).toBe("2025-03-15");
  });
  it("parsuje YYYY-MM-DD (passthrough)", () => {
    expect(parsePolishDate("2025-03-15")).toBe("2025-03-15");
  });
  it("parsuje '15 marca 2025'", () => {
    expect(parsePolishDate("15 marca 2025")).toBe("2025-03-15");
  });
  it("parsuje '5 stycznia 2024' (single digit day)", () => {
    expect(parsePolishDate("5 stycznia 2024")).toBe("2024-01-05");
  });
  it("zwraca null dla nieparsowalnego", () => {
    expect(parsePolishDate("kiedyś")).toBeNull();
  });
});

describe("validatePesel & parsePesel & maskPesel", () => {
  // Test PESEL: 02070803628 — syntetyczny valid (data 2002-07-08, suma OK).
  // 0·1+2·3+0·7+7·9+0·1+8·3+0·7+3·9+6·1+2·3 = 132, (10-2)%10 = 8.
  const VALID_PESEL = "02070803628";
  it("waliduje poprawny PESEL", () => {
    expect(validatePesel(VALID_PESEL)).toBe(true);
  });
  it("odrzuca niepoprawny PESEL (zła suma kontrolna)", () => {
    expect(validatePesel("02070803629")).toBe(false);
  });
  it("odrzuca PESEL o złej długości", () => {
    expect(validatePesel("123")).toBe(false);
    expect(validatePesel("020708036289")).toBe(false);
  });
  it("wyciąga PESEL z tekstu", () => {
    expect(parsePesel(`PESEL: ${VALID_PESEL} to dane`)).toBe(VALID_PESEL);
  });
  it("maskuje PESEL — XXX*****YY (RODO data minimization)", () => {
    expect(maskPesel(VALID_PESEL)).toBe("020*****28");
  });
});

describe("computeCompleteness", () => {
  it("liczy procent niepustych pól (ignorując 'intent' i 'completeness')", () => {
    const fields = {
      intent: "x",
      completeness: 0,
      a: "wartość",
      b: null,
      c: "",
      d: 123,
    };
    // 2 z 4 niepuste = 50%
    expect(computeCompleteness(fields)).toBe(50);
  });
  it("zwraca 0 dla pustego obiektu", () => {
    expect(computeCompleteness({})).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// nakaz-parser.ts
// -----------------------------------------------------------------------------
describe("parseNakaz", () => {
  const RAW = `
Sąd Rejonowy Lublin-Zachód w Lublinie
VI Wydział Cywilny

Sygnatura akt: Nc-e 1234567/24

NAKAZ ZAPŁATY
wydany w dniu 12.02.2025 r.

Powód: Kreditech Polska Sp. z o.o.
ul. Marszałkowska 100, 00-001 Warszawa

Pozwany: Jan Kowalski
ul. Polna 5, 30-001 Kraków
PESEL: 02070803628

Tytułem należności głównej kwota 5 432,10 zł
oraz odsetki w kwocie 234,56 zł
oraz koszty procesu w kwocie 100,00 zł
łącznie 5 766,66 zł

doręczono dnia 15.02.2025
`;

  it("wykrywa sygnaturę EPU (Nc-e)", () => {
    const r = parseNakaz(RAW);
    expect(r.sygnatura).toContain("Nc-e");
    expect(r.sygnatura).toContain("1234567/24");
  });

  it("rozpoznaje sąd lubelski jako EPU", () => {
    const r = parseNakaz(RAW);
    expect(r.sad).toContain("Lublin-Zachód");
  });

  it("parsuje datę nakazu i doręczenia", () => {
    const r = parseNakaz(RAW);
    expect(r.data_nakazu).toBe("2025-02-12");
    expect(r.data_doreczenia).toBe("2025-02-15");
  });

  it("wyciąga powoda i pozwanego", () => {
    const r = parseNakaz(RAW);
    expect(r.powod_nazwa).toContain("Kreditech");
    expect(r.pozwany_nazwa).toContain("Jan Kowalski");
  });

  it("waliduje PESEL", () => {
    const r = parseNakaz(RAW);
    expect(r.pozwany_pesel).toBe("02070803628");
  });

  it("parsuje wszystkie kwoty", () => {
    const r = parseNakaz(RAW);
    expect(r.kwota_glowna).toBe(5432.1);
    expect(r.kwota_odsetki).toBe(234.56);
    expect(r.kwota_koszty).toBe(100);
    expect(r.kwota_razem).toBe(5766.66);
  });

  it("oblicza completeness > 80% dla pełnego skanu", () => {
    const r = parseNakaz(RAW);
    expect(r.completeness).toBeGreaterThanOrEqual(80);
  });

  it("ma intent = 'nakaz_zaplaty'", () => {
    const r = parseNakaz(RAW);
    expect(r.intent).toBe("nakaz_zaplaty");
  });

  it("nie krzaczy się na pustym wejściu", () => {
    const r = parseNakaz("");
    expect(r.intent).toBe("nakaz_zaplaty");
    expect(r.sygnatura).toBeNull();
    expect(r.completeness).toBe(0);
  });
});

// -----------------------------------------------------------------------------
// komornik-parser.ts
// -----------------------------------------------------------------------------
describe("parseKomornik", () => {
  const RAW = `
Komornik Sądowy przy Sądzie Rejonowym dla Krakowa-Krowodrzy
Anna Nowak
ul. Krakowska 12, 30-001 Kraków

Sygnatura: Km 4567/24

ZAWIADOMIENIE O WSZCZĘCIU EGZEKUCJI

Wierzyciel: PROKURA NSFIZ
Dłużnik: Jan Kowalski, PESEL: 02070803628

Zajęcie rachunku bankowego (art. 889 k.p.c.)
Kwota dochodzona: 12 345,67 zł
Dnia: 03.04.2025
`;

  it("wykrywa sygnaturę Km", () => {
    const r = parseKomornik(RAW);
    expect(r.sygnatura_km).toContain("Km");
    expect(r.sygnatura_km).toContain("4567/24");
  });

  it("wyciąga kancelarię", () => {
    const r = parseKomornik(RAW);
    expect(r.kancelaria_nazwa).toContain("Komornik Sądowy");
  });

  it("rozpoznaje typ zajęcia (rachunek bankowy)", () => {
    const r = parseKomornik(RAW);
    expect(r.zajecie_typ).toBe("rachunek_bankowy");
  });

  it("parsuje kwotę dochodzoną", () => {
    const r = parseKomornik(RAW);
    expect(r.kwota_dochodzona).toBe(12345.67);
  });

  it("parsuje datę pisma", () => {
    const r = parseKomornik(RAW);
    expect(r.data_pisma).toBe("2025-04-03");
  });

  it("ma intent = 'pismo_komornika'", () => {
    const r = parseKomornik(RAW);
    expect(r.intent).toBe("pismo_komornika");
  });
});

// -----------------------------------------------------------------------------
// bik-parser.ts
// -----------------------------------------------------------------------------
describe("parseBik", () => {
  const RAW = `
Biuro Informacji Kredytowej S.A.
ul. Postępu 17a, 02-676 Warszawa

Raport BIK — wpis dotyczący zobowiązania:

Bank: PKO BP
Numer umowy: KRD-2024-789
Saldo zadłużenia: 23 450,00 zł
Data wpisu: 01.10.2023
Status: zaległość — kredyt został spłacony, ale wpis pozostał aktywny.
`;

  it("rozpoznaje znany bank", () => {
    const r = parseBik(RAW);
    expect(r.bank_nazwa).toBe("PKO BP");
  });

  it("wyciąga numer umowy", () => {
    const r = parseBik(RAW);
    expect(r.numer_umowy).toBe("KRD-2024-789");
  });

  it("parsuje kwotę kredytu (saldo)", () => {
    const r = parseBik(RAW);
    expect(r.kwota_kredytu).toBe(23450);
  });

  it("parsuje datę wpisu", () => {
    const r = parseBik(RAW);
    expect(r.data_wpisu).toBe("2023-10-01");
  });

  it("rozpoznaje status zaległości", () => {
    const r = parseBik(RAW);
    expect(r.status_wpisu).toBe("zaległość");
  });

  it("rozpoznaje charakter nieprawidłowości (wpis spłacony)", () => {
    const r = parseBik(RAW);
    expect(r.rodzaj_nieprawidlowosci).toContain("spłacon");
  });

  it("ma intent = 'raport_bik'", () => {
    const r = parseBik(RAW);
    expect(r.intent).toBe("raport_bik");
  });
});

// -----------------------------------------------------------------------------
// dispatcher.ts
// -----------------------------------------------------------------------------
describe("sniffIntent", () => {
  it("wykrywa nakaz EPU po anchor-words", () => {
    const text = "NAKAZ ZAPŁATY w EPU, Sąd Rejonowy Lublin-Zachód, Nc-e 123/24";
    expect(sniffIntent(text)).toBe("nakaz_zaplaty");
  });

  it("wykrywa pismo komornicze po Km", () => {
    const text = "Komornik Sądowy, Km 1234/24, zajęcie rachunku";
    expect(sniffIntent(text)).toBe("pismo_komornika");
  });

  it("wykrywa BIK po Biuro Informacji Kredytowej", () => {
    const text = "Biuro Informacji Kredytowej S.A., wpis BIK, kredyt, sprostowanie";
    expect(sniffIntent(text)).toBe("raport_bik");
  });

  it("zwraca 'unknown' dla niepowiązanego tekstu", () => {
    expect(sniffIntent("Lorem ipsum dolor sit amet")).toBe("unknown");
  });
});

describe("dispatchParser", () => {
  it("uruchamia parseNakaz dla intent='nakaz_zaplaty'", () => {
    const r = dispatchParser("Sygn. Nc-e 1/24", "nakaz_zaplaty");
    expect(r.intent).toBe("nakaz_zaplaty");
  });

  it("auto-detect: kieruje na parseKomornik gdy hint='unknown'", () => {
    const text = "Komornik Sądowy Anna Nowak\nKm 1234/24\nzajęcie rachunku bankowego art. 889";
    const r = dispatchParser(text, "unknown");
    expect(r.intent).toBe("pismo_komornika");
  });

  it("zwraca UnknownParsed gdy nic nie dopasuje", () => {
    const r = dispatchParser("aaa bbb ccc", "unknown");
    expect(r.intent).toBe("unknown");
    if (r.intent === "unknown") {
      expect(r.hints.length).toBeGreaterThan(0);
    }
  });
});
