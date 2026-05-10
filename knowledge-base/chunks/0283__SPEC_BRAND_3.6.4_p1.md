# 3.6.4#p1 — Typowe kroki wizarda (przykład: Sprzeciw EPU — moduł D2) (part 1)

_source: SPEC_BRAND · tags: frontend, ai-engine, ocr, modules, brand · line 569 · 3992 chars_

KROK 1: Upload nakazu zapłaty
  Komponent: OCRUploadStep

  Główna area: Drag-and-drop zone
    Border: 2px dashed iron-300, radius-xl
    Bg: iron-50
    Min-height: 200px
    Center content:
      Ikona: UploadCloud (48px, iron-400)
      H3: "Przeciągnij zdjęcie lub skan nakazu" (Inter 600 16px iron-700)
      P: "JPG, PNG lub PDF · max 10 MB" (Inter 400 14px iron-500)
      [Wybierz plik] — ghost button, dlug-500 border, dlug-500 text

    Hover state: border dlug-300, bg dlug-50
    Active/dropping: border dlug-500 solid, bg dlug-100

  Po uploadzie:
    Drag-zone zastąpiona podglądem (thumbnail 120px height, radius-md)
    + nazwa pliku + rozmiar + [✕ Usuń]
    Poniżej: progress bar OCR
      Height: 6px, bg iron-200, fill dlug-500
      Label: "Rozpoznawanie tekstu..." (Inter 13px 500 iron-600)
      Animacja: scanning line (gradient left→right, 2s, infinite)
      Po zakończeniu: "Rozpoznano 94% tekstu" (accent-600) lub
      "Rozpoznano 62% — wymagana ręczna korekta" (warn-600)

  Poniżej OCR:
    Extracted data preview — karty z rozpoznanymi polami:
    ┌────────────────────────────────┐
    │ Sygnatura: I Nc 3847/26       │  ← JetBrains Mono, editable
    │ Sąd: SR Lublin-Zachód         │  ← Inter, editable
    │ Powód: XYZ Fundusz NSFIZ      │  ← Inter, editable
    │ Kwota: 4 328,45 zł            │  ← Inter 600, editable
    │ Data wydania: 2026-04-10      │  ← Inter, editable
    │ Confidence: ████████░░ 87%    │  ← mini bar
    └────────────────────────────────┘
    Każde pole: input z pre-filled wartością, ikona Edit obok,
    tooltip: "Sprawdź i popraw jeśli OCR odczytał błędnie"

    Jeśli confidence < 70%:
      Alert box: bg warn-50, border warn-200, radius-md, p-4
      Icon: AlertTriangle 20px warn-600
      "Jakość skanu jest niska. Sprawdź uważnie wszystkie pola
       lub prześlij lepsze zdjęcie."

KROK 2: Twoje dane
  Standardowy formularz:
    Imię i nazwisko (text input)
    PESEL (text input, mask: XX-XXXXXXXXX, walidacja modulo)
    Adres zamieszkania (street, city, postal code — 3 inputy w row)

  Tip panel: "Twoje dane muszą zgadzać się z danymi w nakazie.
  Jeśli zmieniłeś adres — podaj aktualny, sąd prześle korespondencję
  na nowy adres."

KROK 3: Powód sprzeciwu
  Komponent: CardSelect (nie dropdown — karty do kliknięcia)

  Grid 2-kolumnowy, gap-4. Każda opcja:
    Card: border iron-200, radius-lg, p-5, cursor-pointer
    Hover: border dlug-300, bg dlug-50
    Selected: border dlug-500 (2px), bg dlug-50, shadow-sm
      Checkmark circle: top-right, accent-500 bg, white check

    Ikona: Lucide, 24px, iron-500 (selected: dlug-500)
    Label: Inter 600 15px iron-900
    Opis: Inter 400 13px iron-600, 1-2 linie

  Opcje:
    [⏱] Przedawnienie roszczenia
        "Minęły 3 lata (konsument) lub 6 lat od wymagalności"
    [📄] Brak dowodu doręczenia wezwania
        "Nie otrzymałem wezwania do zapłaty przed e-Sądem"
    [💰] Kwota jest zawyżona lub nieprawidłowa
        "Naliczone odsetki, opłaty lub kapitał się nie zgadzają"
    [🔄] Cesja — brak zawiadomienia
        "Dług został sprzedany, ale nie zostałem poinformowany"
    [❓] Nie rozpoznaję tego długu
        "Nie wiem, czego dotyczy to roszczenie"
    [📋] Inny powód
        "Chcę opisać własny powód sprzeciwu"
        → po wybraniu: textarea max 500 znaków, placeholder:
          "Opisz krótko, dlaczego nie zgadzasz się z nakazem..."

  Poniżej CardSelect:
    Komponent: SuccessEstimator (opisany w sekcji 3.9)

KROK 4: Podgląd i generowanie
  Komponent: AIPreview

  Card: bg white, shadow-lg, radius-xl, p-8

  Header: flex row between
    Left: "Podgląd Twojego sprzeciwu" (Inter 700 --text-h2)
    Right: badge "AI-generated" (bg dlug-50, text dlug-600,
           radius-full, px-3 py-1, Sparkles icon 14px)

  Content area:
    Bg: iron-50, border iron-200, radius-lg, p-6, mt-4
    Font: Georgia 15px, leading-loose, iron-800
    Max-height: 400px, overflow-y scroll (custom scrollbar:
      width 4px, thumb dlug-300, track transparent)
