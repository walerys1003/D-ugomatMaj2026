# 5.A.10 — Komponenty specyficzne dla Długomat

_source: SPEC_FULL · tags: frontend, database, brand, strategy · line 497 · 2065 chars_

Oprócz komponentów współdzielonych, Długomat wymaga następujących dedykowanych elementów:
DebtSummaryCard (components/dlugomat/debt-summary-card.tsx) – karta podsumowująca łączne zadłużenie użytkownika: suma kapitału, suma odsetek, liczba wierzycieli, procent przedawnionych. Gradient tła zależny od ogólnej sytuacji (zielony = większość przedawniona, czerwony = wszystko aktywne).
PrzedawnienieGauge (components/dlugomat/przedawnienie-gauge.tsx) – okrągły wskaźnik z animacją, wyświetlający status przedawnienia konkretnego roszczenia. Trzy stany kolorystyczne. Kliknięcie rozwija szczegóły (oś czasu, podstawa prawna).
CreditorTimeline (components/dlugomat/creditor-timeline.tsx) – wizualizacja historii działań wierzyciela: wezwania, cesje, pozwy, nakazy, egzekucje – renderowana na osi czasu z ikonami i datami.
DebtComparisonTable (components/dlugomat/debt-comparison-table.tsx) – tabela porównująca scenariusze: spłata jednorazowa vs raty vs zarzut przedawnienia vs negocjacja, z kosztami i prawdopodobieństwem sukcesu.
InterestChart (components/dlugomat/interest-chart.tsx) – wykres liniowy (Recharts) narastania odsetek w czasie z zaznaczonymi zmianami stóp NBP.
AmortizationTable (components/dlugomat/amortization-table.tsx) – tabela rat z kolumnami: nr raty, data, rata, kapitał, odsetki, saldo, z opcją eksportu CSV/PDF.
CreditorCard (components/dlugomat/creditor-card.tsx) – karta wierzyciela z nazwą, typem (bank, fundusz, firma windykacyjna, organ publiczny), liczbą spraw, łączną kwotą, badge statusu.
DocumentChecklist (components/dlugomat/document-checklist.tsx) – interaktywna lista dokumentów do przygotowania (generowana przez AI), z checkboxami, tooltipami wyjaśniającymi, linkami do uploadu.
Niniejszy podrozdział 5.A stanowi kompletny opis warstwy użytkownika modułu Długomat i powinien być wstawiony do specyfikacji Mandatomatu między istniejącym podrozdziałem 5 (Frontend – komponenty, strony, UX/UI) a podrozdziałem 6 (Panel użytkownika – Dashboard Mandatomat), zachowując ciągłość numeracji i spójność architektoniczną z resztą dokumentu.
