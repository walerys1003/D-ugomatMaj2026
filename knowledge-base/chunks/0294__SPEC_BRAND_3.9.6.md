# 3.9.6 — PDF Preview Component

_source: SPEC_BRAND · tags: frontend, payments · line 1149 · 1016 chars_

KOMPONENT: PDFPreview
Lokalizacja: wizard krok 4 (podgląd), strona /panel/dokumenty/[id]

  Container: bg iron-100, radius-xl, p-4, position relative

  PDF rendering: PDF.js canvas
    Bg: white (symulacja kartki A4)
    Shadow: lg (efekt kartki leżącej na stole)
    Aspect ratio: 1:1.414 (A4)
    Max-height: 500px (scrollable jeśli dłuższe)
    Scale controls:
      Bottom-right, floating, bg white/90% backdrop-blur,
      radius-full, shadow-md, p-1
      Buttons: [−] [100%] [+], icon-only, 32x32px

  Watermark (dla nieopłaconych):
    "PODGLĄD — DŁUGOMAT"
    Rotated -30deg, opacity 8%, center
    Inter 700 48px iron-500
    Repeat: every 300px vertical
    Usunięty po płatności.

  Toolbar (above PDF):
    Flex row, justify-between, mb-3
    Left: "Podgląd dokumentu" Inter 14px 600 iron-800
    Right:
      [📄 Pobierz PDF] — primary small, dlug-500
      [✏️ Edytuj] — ghost small, iron-600
      [🖨️ Drukuj] — ghost small, iron-600

    Styl buttonów toolbar: h-8, px-3, text-sm, radius-md, gap-1.5
