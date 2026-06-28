# 5.B.11 — Analityka zaawansowana

_source: SPEC_FULL · tags: frontend, database, ai-engine, payments, devops · line 613 · 1606 chars_

Strona /admin/dlugomat/analytics dostarcza głęboką analitykę modułu:
Funnel konwersji – wizualizacja lejka: wizyta landing Długomat → rejestracja / logowanie → wybór kategorii → start formularza → ukończenie formularza → scoring/podgląd → przejście do płatności → płatność sukces → pobranie PDF. Każdy etap: liczba użytkowników, % drop-off, porównanie z poprzednim okresem. Filtry po źródle ruchu (UTM), urządzeniu, kategorii pisma.
Kohorty – tabela kohortowa: rejestracja tygodniowa → retencja w tygodniu 1, 2, 4, 8, 12 (% użytkowników, którzy wygenerowali kolejny dokument). Heatmapa kolorystyczna (ciemniejszy = lepsza retencja).
Scoring analytics – rozkład wyników scoringu przedawnienia: histogram, średnia per kategoria, korelacja scoring → konwersja (czy osoby z wynikiem „przedawnione" częściej kupują?).
Koszty AI – tabela dzienna: data, liczba generowań, tokeny input (łączne), tokeny output (łączne), koszt USD, koszt PLN, średni koszt per dokument, model breakdown (Opus vs Sonnet vs Haiku). Wykresy: koszt dzienny (area), koszt per dokument (linia), udział modeli (stacked). Alert budżetowy: admin ustawia dzienny / miesięczny limit kosztów AI; system wyświetla warning gdy osiągnięto 80% i blokuje przy 100% (z override).
SEO analytics – (opcjonalnie integracja Google Search Console API): impressions, clicks, CTR, pozycja per strona Długomat. Ranking stron landing per typ pisma.
Analiza typów pism – tabela: typ pisma, liczba generowań (łącznie / 30d), przychód (łącznie / 30d), średni koszt AI, średnia ocena walidacji, NPS (jeśli zbierany), funnel konwersji per typ. Sortowanie, eksport.
