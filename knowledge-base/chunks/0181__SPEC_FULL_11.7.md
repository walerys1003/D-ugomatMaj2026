# 11.7 — D7 — UgodoMat (119 zł)

_source: SPEC_FULL · tags: modules · line 2172 · 800 chars_

Cel: negocjowanie spłaty długu na korzystniejszych warunkach (raty, umorzenie odsetek, redukcja kapitału).
Workflow:
Krok 1 — Budżet domowy: kalkulator (calculators/budzet-domowy.ts). Dochody (wynagrodzenie, świadczenia, inne). Wydatki stałe (czynsz, media, jedzenie, transport, leki, ubezpieczenia). Wynik: nadwyżka/deficyt.
Krok 2 — Lista wierzycieli: dynamiczna lista (dodawanie wierzyciela: nazwa, kwota, typ długu, priorytet). System automatycznie priorytetyzuje (alimenty → ZUS → US → banki → fundusze).
Krok 3 — Propozycja ugody: AI generuje propozycje na podstawie nadwyżki budżetowej. Np.: 5 wierzycieli, nadwyżka 800 zł/mc → proporcjonalny podział + propozycja umorzenia odsetek.
Krok 4 — Generowanie pism negocjacyjnych (jedno per wierzyciel).
Generowane pisma (3 warianty per wierzyciel):
