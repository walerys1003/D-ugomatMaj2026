# 5.3 — Kluczowe komponenty UI

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr, payments, notifications, brand, strategy · line 810 · 3286 chars_

WizardShell — wspólny shell dla wszystkich kreatorów pism. Zawiera step indicator (numerowany stepper z ikonami i opisami kroków), wizard content area (renderuje bieżący krok), wizard navigation (przyciski Wstecz/Dalej z walidacją), progress bar (procent ukończenia), oraz kontekstowy panel informacyjny (wyświetla wskazówki prawne zależne od kroku).
┌─────────────────────────────────────────────────────────────┐
│  ← Wstecz          SPRZECIW OD NAKAZU EPU        Krok 2/6  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ████████████████████░░░░░░░░░░░░  33% ukończono            │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───┐  ┌───┐  ┌───┐│
│  │ ✓ Upload│──│ 2 Dane  │──│ 3 Zarzu-│──│ 4 │──│ 5 │──│ 6 ││
│  │         │  │ sprawy  │  │   ty    │  │   │  │   │  │   ││
│  └─────────┘  └─────────┘  └─────────┘  └───┘  └───┘  └───┘│
│                                                              │
│  ┌──────────────────────────────┬──────────────────────────┐ │
│  │                              │  ℹ️ Wskazówka            │ │
│  │   DANE SPRAWY                │                          │ │
│  │                              │  Sygnatura sprawy        │ │
│  │   Sygnatura: [VI Nc-e ___]   │  znajduje się w lewym    │ │
│  │   Sąd: [e-Sąd w Lublinie▼]  │  górnym rogu nakazu      │ │
│  │   Data nakazu: [__/__/____]  │  zapłaty. Format:        │ │
│  │   Data doręczenia: [__/__]   │  "VI Nc-e XXXXXX/XX"    │ │
│  │   Powód: [________________]  │                          │ │
     Kwota: [________] PLN       � PrzykBad:             
│  │   Odsetki: [________] PLN   │  VI Nc-e 1234567/25      │ │
│  │   Koszty: [________] PLN    │                          │ │
│  │                              │                          │ │
│  └──────────────────────────────┴──────────────────────────┘ │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │   ← Wstecz           │  │        Dalej →               │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

OCRUploadStep — drag-and-drop zone z ikoną dokumentu, obsługa PDF/JPG/PNG do 10MB, progress bar uploadu, preview zeskanowanego dokumentu z podświetlonymi wykrytymi polami (sygnatura, kwota, data — zielone podkreślenie), confidence score z informacją „Wykryto X/Y pól" i opcja ręcznej korekty.
DeadlineCountdown — widget wyświetlający odliczanie do terminu procesowego. Kolory: >7 dni = zielony, 3–7 dni = amber, <3 dni = czerwony pulsujący. Format: „Zostało X dni Y godzin". Poniżej: data terminu, opis konsekwencji przekroczenia.
PDFPreview — podgląd wygenerowanego pisma w PDF.js z zoom, nawigacją stron, przyciskiem „Edytuj" (otwiera edytor tekstu pisma), oraz watermark „PODGLĄD — WERSJA ROBOCZA" przed płatnością.
PricingTable — tabela z trzema kolumnami (podstawowy / rekomendowany / premium), animowane badge „NAJPOPULARNIEJSZY", lista cech z checkmarkami, przycisk CTA z ceną i mikrokopiją („bez zobowiązań", „14-dniowa gwarancja"), porównanie z kosztem prawnika (przekreślona cena 1500–3000 zł).
