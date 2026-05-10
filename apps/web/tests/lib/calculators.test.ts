/**
 * Testy jednostkowe kalkulatorów kwot wolnych.
 *
 * Sprawdzamy:
 *   - poprawność limitów ułamkowych (art. 87 § 3 KP, art. 140 ustawy emerytalnej)
 *   - poprawność kwot wolnych (art. 87¹ KP, art. 141 ust. emerytalnej, art. 54 PB)
 *   - flagę kwotaWolnaWiazaca (czy ułamek czy kwota wolna jest aktywnym
 *     ograniczeniem)
 *   - świadczenia wyłączone z egzekucji (art. 833 § 6 KPC)
 *   - rozdzielczość czasową stałych (resolveMinWage / resolveMinPension)
 */
import { describe, it, expect } from "vitest";
import {
  obliczKwoteWolnaWynagrodzenie,
  obliczKwoteWolnaEmerytura,
  obliczKwoteWolnaRachunek,
  resolveMinWage,
  resolveMinPension,
  ufgBankAccountLimitGrosze,
} from "@/lib/calculators";

describe("resolveMinWage", () => {
  it("zwraca stawkę 4242 zł brutto dla daty 2024-03-15", () => {
    const m = resolveMinWage(new Date("2024-03-15T00:00:00Z"));
    expect(m.bruttoGrosze).toBe(4_242_00);
  });
  it("zwraca stawkę 4666 zł brutto dla daty 2025-06-01", () => {
    const m = resolveMinWage(new Date("2025-06-01T00:00:00Z"));
    expect(m.bruttoGrosze).toBe(4_666_00);
  });
  it("zwraca stawkę 2026 dla daty z 2026-04", () => {
    const m = resolveMinWage(new Date("2026-04-01T00:00:00Z"));
    expect(m.bruttoGrosze).toBe(4_806_00);
  });
});

describe("resolveMinPension", () => {
  it("zwraca 1780,96 zł dla daty 2024-04 (przed waloryzacją 2025)", () => {
    const p = resolveMinPension(new Date("2024-04-01T00:00:00Z"));
    expect(p.bruttoGrosze).toBe(1_780_96);
  });
  it("zwraca 1878,91 zł po waloryzacji 2025-03", () => {
    const p = resolveMinPension(new Date("2025-04-01T00:00:00Z"));
    expect(p.bruttoGrosze).toBe(1_878_91);
  });
});

describe("ufgBankAccountLimitGrosze (art. 54 Prawa bankowego)", () => {
  it("75% min. wynagrodzenia brutto z 2025-06 = 3499,50 zł", () => {
    const limit = ufgBankAccountLimitGrosze(new Date("2025-06-01T00:00:00Z"));
    // 4666 * 0.75 = 3499.50 zł = 349_950 grosze
    expect(limit).toBe(Math.floor(4_666_00 * 0.75));
  });
});

describe("obliczKwoteWolnaWynagrodzenie", () => {
  const at = new Date("2025-06-01T00:00:00Z");

  it("alimenty: brak kwoty wolnej, limit 3/5 wynagrodzenia", () => {
    const r = obliczKwoteWolnaWynagrodzenie({
      nettoGrosze: 5_000_00,
      kategoria: "alimentacyjne",
      at,
    });
    expect(r.kwotaWolnaGrosze).toBe(0);
    expect(r.limitUlamkowy).toBeCloseTo(0.6, 5);
    expect(r.maksPotracenieGrosze).toBe(Math.floor(5_000_00 * 0.6));
    expect(r.kwotaWolnaWiazaca).toBe(false);
  });

  it("niealimentacyjne: kwota wolna = pełne min. netto, limit 1/2", () => {
    const r = obliczKwoteWolnaWynagrodzenie({
      nettoGrosze: 5_000_00,
      kategoria: "niealimentacyjne",
      at,
    });
    // Min. netto 2025 = 3510,92. 5000 * 1/2 = 2500. Pozostałe = 2500 < 3510,92.
    // Czyli kwota wolna jest WIĄŻĄCA.
    expect(r.kwotaWolnaGrosze).toBe(3_510_92);
    expect(r.kwotaWolnaWiazaca).toBe(true);
    expect(r.pozostaleGrosze).toBe(3_510_92);
    expect(r.maksPotracenieGrosze).toBe(5_000_00 - 3_510_92);
  });

  it("niealimentacyjne przy bardzo wysokim wynagrodzeniu — wiążący jest ułamek 1/2", () => {
    const r = obliczKwoteWolnaWynagrodzenie({
      nettoGrosze: 20_000_00,
      kategoria: "niealimentacyjne",
      at,
    });
    expect(r.kwotaWolnaWiazaca).toBe(false);
    expect(r.maksPotracenieGrosze).toBe(10_000_00);
    expect(r.pozostaleGrosze).toBe(10_000_00);
  });

  it("niepełny etat (0,5): kwota wolna proporcjonalna", () => {
    const r = obliczKwoteWolnaWynagrodzenie({
      nettoGrosze: 2_000_00,
      kategoria: "niealimentacyjne",
      etat: 0.5,
      at,
    });
    expect(r.kwotaWolnaGrosze).toBe(Math.floor(3_510_92 * 0.5));
  });

  it("zaliczki pieniężne: kwota wolna = 75% min. netto", () => {
    const r = obliczKwoteWolnaWynagrodzenie({
      nettoGrosze: 5_000_00,
      kategoria: "zaliczki_pieniezne",
      at,
    });
    expect(r.kwotaWolnaGrosze).toBe(Math.floor(3_510_92 * 0.75));
  });

  it("kary pieniężne: limit 1/10 (art. 108 KP), kwota wolna 90%", () => {
    const r = obliczKwoteWolnaWynagrodzenie({
      nettoGrosze: 5_000_00,
      kategoria: "kary_pieniezne",
      at,
    });
    expect(r.limitUlamkowy).toBeCloseTo(0.1, 5);
    expect(r.maksPotracenieGrosze).toBe(500_00);
  });
});

describe("obliczKwoteWolnaEmerytura", () => {
  const at = new Date("2025-06-01T00:00:00Z");
  // Najniższa emerytura 2025-03 → 1878,91 zł = 187_891 grosze.

  it("alimenty: limit 60% świadczenia, kwota wolna 50% najniższej emerytury", () => {
    const r = obliczKwoteWolnaEmerytura({
      bruttoGrosze: 3_000_00,
      kategoria: "alimentacyjne",
      at,
    });
    expect(r.limitUlamkowy).toBeCloseTo(0.6, 5);
    expect(r.kwotaWolnaGrosze).toBe(Math.floor(1_878_91 * 0.5));
    // 3000 * 0.6 = 1800. Pozostałe = 1200. Kwota wolna = 939,45.
    // 1200 >= 939,45 → ułamek wiążący.
    expect(r.kwotaWolnaWiazaca).toBe(false);
    expect(r.maksPotracenieGrosze).toBe(1_800_00);
  });

  it("niealimentacyjne: limit 25%, kwota wolna 75% najniższej emerytury", () => {
    const r = obliczKwoteWolnaEmerytura({
      bruttoGrosze: 2_000_00,
      kategoria: "niealimentacyjne",
      at,
    });
    expect(r.limitUlamkowy).toBeCloseTo(0.25, 5);
    expect(r.kwotaWolnaGrosze).toBe(Math.floor(1_878_91 * 0.75));
    // 2000 * 0.25 = 500. Pozostałe = 1500. Kwota wolna = 1409,18.
    // 1500 >= 1409,18 → ułamek wiążący.
    expect(r.kwotaWolnaWiazaca).toBe(false);
  });

  it("niska emerytura — kwota wolna chroni minimum egzystencji", () => {
    const r = obliczKwoteWolnaEmerytura({
      bruttoGrosze: 2_000_00,
      kategoria: "nienależne",
      at,
    });
    // Limit 50%, kwota wolna 60% najniższej.
    // 2000 * 0.5 = 1000 → pozostałe 1000. Kwota wolna = 0.6 * 1878,91 = 1127,34.
    // 1000 < 1127,34 → kwota wolna wiążąca.
    expect(r.kwotaWolnaWiazaca).toBe(true);
    expect(r.pozostaleGrosze).toBe(Math.floor(1_878_91 * 0.6));
  });
});

describe("obliczKwoteWolnaRachunek", () => {
  const at = new Date("2025-06-01T00:00:00Z");
  // Limit UFG 2025 = 75% × 4666 = 3499,50 zł = 349_950 grosze.
  const limit = Math.floor(4_666_00 * 0.75);

  it("zwraca limit miesięczny zgodny z art. 54 ust. 1 PB", () => {
    const r = obliczKwoteWolnaRachunek({
      saldoGrosze: 1_000_00,
      wplywyMiesieczneGrosze: 1_000_00,
      at,
    });
    expect(r.limitMiesiecznyGrosze).toBe(limit);
  });

  it("saldo poniżej limitu → wszystko do dyspozycji, nic do zajęcia", () => {
    const r = obliczKwoteWolnaRachunek({
      saldoGrosze: 2_000_00,
      wplywyMiesieczneGrosze: 2_000_00,
      at,
    });
    expect(r.doDyspozycjiGrosze).toBe(2_000_00);
    expect(r.doZajeciaGrosze).toBe(0);
  });

  it("saldo powyżej limitu → nadwyżka idzie do komornika", () => {
    const r = obliczKwoteWolnaRachunek({
      saldoGrosze: 5_000_00,
      wplywyMiesieczneGrosze: 5_000_00,
      at,
    });
    expect(r.doDyspozycjiGrosze).toBe(limit);
    expect(r.doZajeciaGrosze).toBe(5_000_00 - limit);
  });

  it("świadczenia wyłączone (500+, alimenty) — chronione poza limitem UFG", () => {
    const r = obliczKwoteWolnaRachunek({
      saldoGrosze: 5_000_00,
      wplywyMiesieczneGrosze: 5_000_00,
      swiadczeniaWylaczoneGrosze: 800_00,
      at,
    });
    expect(r.lacznieChronioneGrosze).toBe(limit + 800_00);
    expect(r.doDyspozycjiGrosze).toBe(limit + 800_00);
    expect(r.doZajeciaGrosze).toBe(5_000_00 - limit - 800_00);
  });

  it("limit już częściowo wykorzystany w danym miesiącu", () => {
    const r = obliczKwoteWolnaRachunek({
      saldoGrosze: 2_000_00,
      wplywyMiesieczneGrosze: 4_000_00,
      juzWykorzystanaGrosze: 2_000_00,
      at,
    });
    expect(r.pozostalyLimitGrosze).toBe(limit - 2_000_00);
    expect(r.limitWyczerpany).toBe(false);
  });

  it("flaga limitWyczerpany gdy juz wykorzystana >= limit", () => {
    const r = obliczKwoteWolnaRachunek({
      saldoGrosze: 1_000_00,
      wplywyMiesieczneGrosze: 5_000_00,
      juzWykorzystanaGrosze: limit,
      at,
    });
    expect(r.limitWyczerpany).toBe(true);
    expect(r.pozostalyLimitGrosze).toBe(0);
  });
});
