# 3.9.2 — Deadline Countdown Widget

_source: SPEC_BRAND · tags: frontend, notifications, brand · line 976 · 1391 chars_

KOMPONENT: DeadlineCountdown
Lokalizacja: dashboard widget, karta sprawy, wizard krok 1

  Warianty zależne od pozostałych dni:

  WARIANT A: >7 dni (bezpieczny)
    Badge: bg accent-50, border accent-200, radius-full, px-3 py-1.5
    Ikona: Clock 14px accent-600
    Tekst: "Termin: 12 maja 2026 (za 18 dni)"
    Inter 13px 600 accent-700
    Żadnej animacji.

  WARIANT B: 3-7 dni (ostrzeżenie)
    Badge: bg warn-50, border warn-200, radius-full, px-3 py-1.5
    Ikona: AlertTriangle 14px warn-600
    Tekst: "Termin: 28 kwietnia 2026 (za 4 dni)"
    Inter 13px 600 warn-700
    Ikona: subtle pulse (opacity 1→0.6→1, 2s, infinite)

  WARIANT C: <3 dni (krytyczny)
    Badge: bg danger-50, border danger-200, radius-md, px-4 py-2
    Ikona: AlertOctagon 16px danger-600
    Tekst linia 1: "TERMIN ZA 2 DNI" Inter 14px 700 danger-700 uppercase
    Tekst linia 2: "26 kwietnia 2026, sobota" Inter 13px 400 iron-600
    Border-left: 3px danger-500
    Ikona: pulse (scale 1→1.1→1, 1.5s, infinite)

  WARIANT D: przeterminowany
    Badge: bg danger-100, border danger-300, radius-md, px-4 py-2
    Ikona: XOctagon 16px danger-600
    Tekst: "TERMIN UPŁYNĄŁ 3 DNI TEMU" Inter 14px 700 danger-700
    Tekst linia 2: "Nadal możesz podjąć działania — sprawdź opcje"
                   Inter 13px 400 iron-600
    Link: "Co mogę jeszcze zrobić? →" dlug-500
    Animacja: żadna — statyczne, poważne.
