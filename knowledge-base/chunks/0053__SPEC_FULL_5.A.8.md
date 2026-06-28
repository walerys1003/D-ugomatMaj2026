# 5.A.8 — Kalkulator odsetek – logika i UI

_source: SPEC_FULL · tags: database · line 486 · 635 chars_

Formularz: kwota główna, data wymagalności, data obliczenia (domyślnie dzisiaj), typ odsetek (ustawowe za opóźnienie, ustawowe kapitałowe, maksymalne, umowne – z polem na stopę), ewentualna kapitalizacja.
Algorytm (lib/calculators/odsetki.ts) pobiera historyczne stopy procentowe NBP (tabela w Supabase lub stała w kodzie), oblicza odsetki dzień po dniu z uwzględnieniem zmian stóp, zwraca: kwotę odsetek, łączną kwotę (kapitał + odsetki), tabelę okresów ze stopami.
UI: karta wyniku z kwotą odsetek (duża czcionka), wykres liniowy narastania długu w czasie (Recharts), tabela amortyzacyjna, eksport do PDF, przycisk „Dodaj do sprawy".
