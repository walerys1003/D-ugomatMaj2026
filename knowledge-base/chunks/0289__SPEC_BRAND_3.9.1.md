# 3.9.1 — Kalkulator kwoty wolnej

_source: SPEC_BRAND · tags: frontend, modules · line 915 · 2062 chars_

KOMPONENT: FreeAmountCalculator
Lokalizacja: moduł KomornikShield, osobna strona /kalkulatory/kwota-wolna
Cel: użytkownik sprawdza ile komornik może mu zostawić na koncie

  Card:
    Background: white, border iron-200, radius-xl, padding 36px
    Max-width: 520px, mx-auto
    Shadow: lg

  Heading: "Kalkulator kwoty wolnej od zajęcia"
    Inter 700, --text-h2, iron-900

  Subtitle: "Sprawdź ile pieniędzy komornik musi Ci zostawić"
    Inter 400, --text-body, iron-600, mt-2

  Formularz:
    Field 1: "Rodzaj umowy" — CardSelect horizontal
      [Umowa o pracę] [Zlecenie] [Emerytura] [Działalność]
      Styl: cards 4-col (desktop), 2-col (mobile)

    Field 2: "Wynagrodzenie brutto" — number input
      Placeholder: "np. 5 200"
      Suffix: "zł" (inside input, right-align, iron-400)

    Field 3: "Liczba osób na utrzymaniu" — stepper (- / 0 / +)
      Min: 0, Max: 10
      Buttons: border iron-300, 36x36px, radius-md

    Field 4: "Typ zajęcia" — radio group
      ○ Alimenty  ○ Inne zobowiązania
      (zmienia % potrąceń: alimenty 3/5, inne 1/2)

  ── separator, mt-6 ──

  Wynik (pojawia się po wypełnieniu — bez klikania "oblicz"):
    Animacja: fade-in + slide-up 200ms

    Result card:
      Bg: accent-50, border accent-200, radius-lg, p-6

      Main value:
        "Kwota wolna od zajęcia:" Inter 14px 500 iron-700
        "2 831,20 zł" Inter 700 32px accent-700

      Breakdown (grid 2-col, gap-y 2, mt-4):
        "Wynagrodzenie netto:"     "3 890,40 zł"
        "Maksymalne potrącenie:"   "1 059,20 zł"
        "Kwota wolna (minimalna):" "2 831,20 zł"
        Styl: Inter 14px iron-700 (labels), Inter 14px 600 iron-900 (values)

      Podstawa prawna (collapsible):
        Trigger: "📋 Podstawa prawna" (Inter 13px dlug-500, hover underline)
        Content: "Art. 87 § 1 Kodeksu pracy, art. 833 KPC,
                  Rozporządzenie Rady Ministrów z dnia..."
                  Georgia 13px iron-600, italic

    Poniżej:
      CTA: "Komornik zajmuje więcej? Wygeneruj skargę →"
      Button: dlug-500 bg, white text, radius-lg, mt-4
