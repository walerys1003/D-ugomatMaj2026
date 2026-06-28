# 3.6.4#p2 — Typowe kroki wizarda (przykład: Sprzeciw EPU — moduł D2) (part 2)

_source: SPEC_BRAND · tags: frontend, ai-engine, payments, notifications, modules, brand, strategy · line 569 · 3761 chars_

    Dokument renderowany w stylu pisma prawnego:
      Nagłówek sądu: center, bold, uppercase
      Sygnatura: right-align, JetBrains Mono
      "SPRZECIW OD NAKAZU ZAPŁATY" — center, bold, 18px
      Treść: left-align, akapity z wcięciem 1.5em
      Podpis: right-align, italic

    Animacja ładowania: typewriter effect — tekst pojawia się
    linia po linii, 30ms per znak, cursor blink. Po zakończeniu
    generowania (2-4s): cursor znika, cały tekst widoczny.

    Jeśli prefers-reduced-motion: tekst pojawia się blokami
    (paragraf po paragrafie), opacity fade 200ms, bez typewritera.

  Poniżej preview:
    Completeness score:
      Horizontal bar, height 8px, bg iron-200
      Fill: accent-500 (score ≥85%), warn-500 (70-84%),
            danger-500 (<70%)
      Label: "Kompletność formalna: 94%" (Inter 14px 600)
      Tooltip: "Sprawdziliśmy: poprawność sygnatury, termin,
               dane stron, podstawę prawną, wymogi formalne KPC"

    Action row: flex row, gap-4, mt-6
      [✏️ Edytuj treść] — ghost button, dlug-500
        → otwiera modal z textarea, Georgia font,
          pre-filled treścią, max 5000 znaków
      [Wygeneruj ponownie] — ghost button, iron-600
        → ponowne wywołanie AI z tymi samymi danymi
      [Dalej — do płatności →] — primary button, accent-500

KROK 5: Płatność
  Komponent: PaymentStep

  Podsumowanie zamówienia:
    Card: bg white, border iron-200, radius-lg, p-6
    Rows:
      "Sprzeciw od nakazu zapłaty (EPU)" — Inter 600 15px iron-900
      "Sygnatura: I Nc 3847/26" — JetBrains Mono 13px iron-600
      ── separator (1px iron-100) ──
      "Kwota: 159,00 zł" — Inter 700 20px iron-900, right-align
      "Zawiera VAT 23%" — Inter 13px iron-500

  Metody płatności:
    CardSelect horizontal, 3 opcje:
      [Stripe] Karta płatnicza — Visa/MC/Amex
      [P24] Przelewy24 — szybki przelew
      [BLIK] BLIK — kod 6-cyfrowy

    Po wybraniu: Stripe Elements embed (customized styles
    matching design system — font Inter, border-radius 10px,
    focus color dlug-500)

  [Zapłać 159,00 zł →] — full-width button, accent-500 bg,
    white text, Inter 700 16px, py-4, radius-lg
    Hover: accent-400
    Loading: spinner (20px, white) + "Przetwarzanie płatności..."
    Disabled during processing

  Trust elements poniżej:
    Flex row, gap-6, center, mt-4
    [🔒 Stripe] [🛡️ 14 dni gwarancja] [📋 Faktura VAT]
    Inter 12px iron-500

KROK 6 (po płatności): Sukces
  Komponent: SuccessScreen

  Full card: bg white, shadow-xl, radius-2xl, p-12, text-center

  Ikona: animated checkmark w kółku
    Circle: accent-100 bg, 80x80px
    Check: accent-500, stroke-width 3px
    Animacja: circle scale 0→1 (300ms, spring),
    check draw SVG path (400ms, delay 200ms, ease-out)
    Bez confetti — to nie jest zabawa, to jest ulga.

  H1: "Twój sprzeciw jest gotowy" (Inter 700 --text-h1 iron-900)
  P: "Dokument został wygenerowany i opłacony. Pobierz PDF
     i wyślij do sądu przed upływem terminu."
     (Inter 400 --text-body iron-600, max-width 480px, mx-auto)

  Deadline reminder:
    Card inline: bg warn-50, border warn-200, radius-md, p-4, mt-6
    Icon: Clock 20px warn-600
    "Termin na wysłanie: 24 kwietnia 2026 (za 8 dni)"
    Inter 14px 600 iron-800

  Action buttons: flex col, gap-3, mt-8, max-width 360px, mx-auto
    [📄 Pobierz PDF] — primary, dlug-500 bg, full-width
    [📧 Wyślij na email] — secondary, ghost, dlug-500 border
    [📋 Instrukcja wysyłki do sądu] — tertiary, text link,
       iron-600, underline on hover

  Poniżej:
    Cross-sell card (subtelny):
      Bg: dlug-50, radius-lg, p-5, mt-10
      "Fundusz może Cię ponownie pozwać. Sprawdź CesjaCheck
       i dowiedz się, czy cesja wierzytelności jest ważna."
      [Sprawdź za 149 zł →] — small button, dlug-500
