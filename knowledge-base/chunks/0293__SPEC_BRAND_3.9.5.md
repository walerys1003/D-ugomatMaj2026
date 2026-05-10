# 3.9.5 — OCR Confidence Indicator

_source: SPEC_BRAND · tags: frontend, ocr · line 1128 · 686 chars_

KOMPONENT: OCRConfidenceBar
Lokalizacja: wizard krok 1 (po OCR), wewnątrz extracted data preview

  Inline, flex row, gap 8px, align-center

  Bar: width 80px, height 6px, bg iron-200, radius-full
    Fill:
      ≥85%: accent-500 (zielony — pewny odczyt)
      70-84%: warn-500 (amber — sprawdź)
      <70%: danger-500 (czerwony — ręczna korekta konieczna)
    Width: {confidence}%, transition width 600ms ease-out

  Label: "{confidence}%" Inter 12px 600 {color matching fill}

  Tooltip (hover na bar):
    "Poziom pewności odczytu OCR dla tego pola.
     Poniżej 70% — zalecamy ręczną weryfikację."
    Bg white, shadow-lg, radius-md, p-3, max-width 200px
    Inter 12px 400 iron-700
