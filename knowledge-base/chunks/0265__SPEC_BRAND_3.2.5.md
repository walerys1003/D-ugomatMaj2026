# 3.2.5 — Reguły użycia kolorów — bezwzględne

_source: SPEC_BRAND · tags: frontend, database · line 96 · 945 chars_

Agent AI musi przestrzegać następujących reguł bez wyjątków:
Czerwień i bursztyn NIGDY bez liczby obok. Jeśli w UI pojawia się --dlug-danger-500 lub --dlug-warn-500, musi mu towarzyszyć konkretna informacja czasowa: „2 dni", „Termin: 12.05.2026", „Przeterminowane o 3 dni". Kolor bez kontekstu to kicz.
Zielony NIGDY na elementach negatywnych. Nawet jeśli przycisk „Zamknij sprawę" jest akcją, a nie błędem — nigdy zielony dla zamknięcia. Zielony = sukces potwierdzony.
Navy gradient wyłącznie w hero i sidebarze. Żadnych gradientów w treści strony, kartach, formularzach. Gradient jest zarezerwowany dla dwóch kontekstów: hero landing page (900→800) i sidebar nawigacji (900→850).
Tło strony: --iron-50 (#F9FAFB). Nie biały (#FFFFFF). Biały jest dla kart, modali i pól formularzy — tworzą wtedy naturalną hierarchię warstw.
Kontrast WCAG 2.1 AA minimum: tekst na tle musi mieć ratio ≥ 4.5:1, elementy graficzne ≥ 3:1. Testować każdą kombinację.
