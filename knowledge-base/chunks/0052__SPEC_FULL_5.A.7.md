# 5.A.7 — Kalkulator przedawnienia – logika i UI

_source: SPEC_FULL · tags: strategy · line 482 · 975 chars_

Formularz przyjmuje: datę wymagalności roszczenia, typ zobowiązania (select: umowa cywilna, działalność gospodarcza, mandat, podatek, ZUS, alimenty, karta kredytowa, pożyczka), czy były przerwania biegu (pozew, ugoda, uznanie długu) z datami, czy zobowiązanie powstało przed czy po 9.07.2018.
Algorytm (lib/calculators/przedawnienie.ts) stosuje odpowiedni termin przedawnienia (2, 3, 6 lub 10 lat), uwzględnia art. 118 k.c. po nowelizacji (koniec roku kalendarzowego), sprawdza przerwania i zawieszenia biegu. Wynik zawiera: status (przedawnione / nieprzedawnione / graniczne), datę przedawnienia, liczbę dni do/po przedawnieniu, podstawę prawną, rekomendację (zarzut przedawnienia, wniosek o umorzenie, negocjacja).
UI wyświetla wynik jako kartę z dużym badge (zielony = przedawnione, czerwony = nieprzedawnione, żółty = graniczne), osią czasu wizualizującą bieg, przyciskami akcji (Generuj sprzeciw z zarzutem przedawnienia / Generuj wniosek o umorzenie / Skonsultuj z AI).
