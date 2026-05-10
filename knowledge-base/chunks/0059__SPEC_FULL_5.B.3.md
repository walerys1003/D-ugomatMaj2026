# 5.B.3 — Dashboard KPI – widok główny

_source: SPEC_FULL · tags: frontend, database, ai-engine, payments, notifications, brand, strategy, admin · line 539 · 2274 chars_

Strona /admin/dlugomat/dashboard wyświetla metryki w czasie rzeczywistym (odświeżanie co 30 s via Supabase Realtime lub polling):
Rząd 1 – karty KPI (4 kolumny)
Karta MRR Długomat – miesięczny przychód z modułu Długomat w PLN, trend procentowy (porównanie z poprzednim miesiącem), sparkline 30-dniowy, kolor zielony przy wzroście / czerwony przy spadku. Wartość pobierana z payments filtrowane po product_type = 'dlugomat' i status = 'completed'.
Karta Aktywni użytkownicy – liczba unikalnych użytkowników z co najmniej jedną sprawą Długomat w statusie innym niż draft w ostatnich 30 dniach. Badge z trendem. Drill-down po kliknięciu otwiera listę użytkowników.
Karta Sprawy dziś – liczba spraw Długomat utworzonych dzisiaj, porównanie z wczoraj i średnią 7-dniową. Ikonka trendu.
Karta Konwersja – procent użytkowników, którzy po wejściu na formularz Długomat dokonali płatności i pobrali PDF. Funnel: wizyta landing → start formularza → ukończenie formularza → płatność → pobranie. Wartości z tabeli events filtrowane po event_type i product.
Rząd 2 – wykresy (2 kolumny)
Wykres lewy: Przychody i sprawy – dual-axis chart (Recharts): słupki = przychód dzienny (PLN), linia = liczba spraw. Zakres: 7d / 30d / 90d / 12m. Tooltip z dokładnymi wartościami.
Wykres prawy: Rozkład kategorii – donut chart pokazujący udział procentowy spraw w poszczególnych kategoriach Długomat (windykacja pozasądowa, postępowanie sądowe, egzekucyjne, restrukturyzacja, długi bankowe, długi publicznoprawne). Kolory zgodne z design system Długomat.
Rząd 3 – wykresy dodatkowe (2 kolumny)
Wykres lewy: Scoring przedawnienia – rozkład – histogram / stacked bar pokazujący ile spraw ma status przedawnione / nieprzedawnione / graniczne. Pozwala ocenić profil typowego klienta.
Wykres prawy: Koszty AI – area chart przedstawiający dzienne wydatki na Claude API (tokens input + output przeliczone na USD/PLN), z podziałem na modele (Opus, Sonnet, Haiku). Linia budżetu dziennego (alert jeśli przekroczony).
Rząd 4 – Live Feed
Tabela strumieniowa ostatnich 50 zdarzeń w module Długomat (z tabeli events). Kolumny: timestamp, użytkownik (avatar + email), typ zdarzenia (badge kolorowy), szczegóły (JSON preview), sprawa (link). Auto-scroll z animacją wejścia nowego wiersza. Filtry po typie zdarzenia.
