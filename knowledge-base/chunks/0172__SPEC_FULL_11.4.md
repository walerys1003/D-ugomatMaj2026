# 11.4 — D4 — PotrąceniaStop (199 zł pakiet / 79 zł solo)

_source: SPEC_FULL · tags: ai-engine, modules · line 2140 · 506 chars_

Cel: ochrona wynagrodzenia i świadczeń przed nadmiernymi potrąceniami.
Workflow: kalkulator potrąceń → identyfikacja nadmiernych potrąceń → generowanie pism do pracodawcy i/lub komornika.
Kalkulator potrąceń (calculators/potracenia.ts): input: wynagrodzenie brutto, typ umowy, osoby na utrzymaniu, rodzaj długu (alimenty/inne), kwota potrącenia z ostatniego paska. Output: maksymalne dopuszczalne potrącenie, kwota nadmiernie potrącona, podstawa prawna (art. 87-91 Kodeks pracy).
Generowane pisma (2 typy):
