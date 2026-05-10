3. DŁUGOMAT
Instrukcja dla agenta AI: Frontend & Design System
3.1 TOŻSAMOŚĆ MARKI
Długomat obsługuje osoby w ekstremalnej sytuacji finansowej i prawnej. Nakaz zapłaty z e-Sądu — 14 dni na reakcję. Komornik zajmujący konto — 7 dni na skargę. Fundusz sekurytyzacyjny pozywający o przedawniony dług — termin wyznaczony przez sąd. Negatywny BIK blokujący kredyt hipoteczny — miesiące oczekiwania na skorygowanie. Cesja wierzytelności od nieznanego podmiotu — niepewność i poczucie bezsilności.
To nie jest aplikacja dla ludzi, którzy „chcieliby kiedyś coś z tym zrobić". To narzędzie ratunkowe. Użytkownik trafia tutaj w jednym z najgorszych momentów życia — z listem od komornika w ręku, z zablokowanym kontem, z wezwaniem do zapłaty kwoty, której nie rozpoznaje. Jest przerażony, zdezorientowany i nie ma pieniędzy na prawnika.
Archetyp marki: Tarcza — nie terapeuta, nie doradca, nie przyjaciel. Tarcza. Długomat musi komunikować jedno: „Staję między Tobą a zagrożeniem. Wiem, co robić. Robimy to teraz."
Emocje użytkownika przy wejściu: strach, poczucie bezsilności, wstyd, pośpiech, brak zaufania.
Emocje, które musi wywołać interfejs: bezpieczeństwo, kompetencja, porządek, pilność bez paniki, poczucie kontroli nad sytuacją.
Zasada naczelna designu: Każdy piksel musi budować zaufanie. Żaden element nie istnieje dla ozdoby. Jeśli nie informuje, nie kieruje, nie uspokaja — usuwamy go.
Ton komunikacji w UI:
Zdecydowany, konkretny, pozbawiony żargonu prawniczego (lub z natychmiastowym wyjaśnieniem w tooltipie).
Nigdy nie straszący — nigdy „Uwaga! Możesz stracić majątek!" — zamiast tego: „Termin na reakcję: 14 dni. Twój sprzeciw będzie gotowy w 12 minut."
Strukturalnie pewny siebie: krótkie zdania, aktywne czasowniki, konkretne liczby.
Przykłady copy: „Masz 14 dni — wystarczy.“, „Twój sprzeciw jest gotowy do pobrania.”, „Komornik? Mamy na to pismo.“, „BIK skorygowany — powiadomienie wysłane.”
3.2 SYSTEM KOLORÓW
System kolorów Długomat zbudowany jest wokół jednego przekazu psychologicznego: głęboki granat = autorytet i bezpieczeństwo instytucjonalne, kontrolowany zielony = nadzieja i sukces, bursztyn i czerwień wyłącznie jako sygnały czasowe, nigdy jako dekoracja.
3.2.1 Paleta Primary — Shield Navy
Navy to kolor instytucji finansowych, kancelarii prawnych, ubezpieczycieli — a więc dokładnie tych podmiotów, z którymi użytkownik walczy. Długomat przejmuje ten kolor, by stanąć na równi z przeciwnikiem. To nie granat „internetowy" ani „startupowy" — to granat gabinetowy, ciężki, niezachwiany.
:root {
  --dlug-950: #060E1F;   /* Tło modali, overlay */
  --dlug-900: #0B1D3A;   /* Sidebar, nawigacja główna, hero gradient START */
  --dlug-850: #0F2750;   /* Hover state sidebar */
  --dlug-800: #132D5E;   /* Hero gradient END, nagłówki sekcji */
  --dlug-700: #1B3F82;   /* Aktywne elementy nawigacji, border-left sprawa pilna */
  --dlug-600: #2354A6;   /* Linki, ikony aktywne */
  --dlug-500: #2B69CA;   /* Primary button background, focus ring */
  --dlug-400: #5A8FDB;   /* Ikony sidebar nieaktywne, tekst pomocniczy */
  --dlug-300: #89B5EC;   /* Badge'e informacyjne, tło pól disabled */
  --dlug-200: #B8DBFD;   /* Tło kart informacyjnych (light) */
  --dlug-100: #E0EFFF;   /* Tło sekcji, hover kart */
  --dlug-50:  #F0F7FF;   /* Subtelne tło stron, alternating rows */
}

Tailwind config extension:
dlugomat: {
  950: '#060E1F',
  900: '#0B1D3A',
  850: '#0F2750',
  800: '#132D5E',
  700: '#1B3F82',
  600: '#2354A6',
  500: '#2B69CA',
  400: '#5A8FDB',
  300: '#89B5EC',
  200: '#B8DBFD',
  100: '#E0EFFF',
  50:  '#F0F7FF',
}

3.2.2 Paleta Accent — Controlled Hope Green
Zielony w Długomat nie jest „radosny" ani „ekologiczny". Jest kontrolowany — oznacza sukces operacji, zakończenie etapu, potwierdzenie bezpieczeństwa. Używany wyłącznie w kontekstach pozytywnych: „gotowe", „bezpieczne", „termin dotrzymany", „pismo wygenerowane".
:root {
  --dlug-accent-700: #087A3E;   /* Tekst sukcesu na białym tle */
  --dlug-accent-600: #0D8A4A;   /* Ikona sukcesu, check-mark */
  --dlug-accent-500: #10B461;   /* CTA primary (landing), badge "GOTOWE" */
  --dlug-accent-400: #34D07E;   /* Hover CTA primary */
  --dlug-accent-300: #6EE7A0;   /* Progress bar fill — termin >7 dni */
  --dlug-accent-200: #A7F3C8;   /* Background badge sukces */
  --dlug-accent-100: #DCFCE7;   /* Tło karty "sprawa zamknięta" */
  --dlug-accent-50:  #F0FFF4;   /* Subtelne tło pozytywnych sekcji */
}

3.2.3 Paleta Status — Temporal Signals
Kolory statusowe istnieją wyłącznie do komunikowania czasu i pilności. Nigdy nie są dekoracyjne. Nigdy nie pojawiają się bez kontekstu liczbowego (np. „3 dni") obok.
:root {
  /* AMBER — ostrzeżenie, zbliżający się termin (3-7 dni) */
  --dlug-warn-600: #D97706;
  --dlug-warn-500: #F59E0B;
  --dlug-warn-100: #FEF3C7;
  --dlug-warn-50:  #FFFBEB;
  
  /* RED — krytyczne, termin <3 dni lub przeterminowane */
  --dlug-danger-700: #B91C1C;
  --dlug-danger-600: #DC2626;
  --dlug-danger-500: #EF4444;
  --dlug-danger-100: #FEE2E2;
  --dlug-danger-50:  #FEF2F2;
}

3.2.4 Paleta Neutral — Iron
Neutraly oparte na chłodnym odcieniu szarości z mikro-domieszką blue, co utrzymuje spójność z navy primary i unika „beżowej ciepłości", która podważałaby autorytet.
:root {
  --iron-950: #0A0D14;   /* Tekst primary dark mode */
  --iron-900: #111827;   /* Tekst primary light mode, nagłówki */
  --iron-800: #1F2937;   /* Tekst secondary */
  --iron-700: #374151;   /* Tekst tertiary, labels */
  --iron-600: #4B5563;   /* Placeholder text */
  --iron-500: #6B7280;   /* Disabled elements */
  --iron-400: #9CA3AF;   /* Ikony nieaktywne, border light */
  --iron-300: #D1D5DB;   /* Separatory, border kart */
  --iron-200: #E5E7EB;   /* Background input */
  --iron-100: #F3F4F6;   /* Background sekcji alternatywnych */
  --iron-50:  #F9FAFB;   /* Background strony */
}

3.2.5 Reguły użycia kolorów — bezwzględne
Agent AI musi przestrzegać następujących reguł bez wyjątków:
Czerwień i bursztyn NIGDY bez liczby obok. Jeśli w UI pojawia się --dlug-danger-500 lub --dlug-warn-500, musi mu towarzyszyć konkretna informacja czasowa: „2 dni", „Termin: 12.05.2026", „Przeterminowane o 3 dni". Kolor bez kontekstu to kicz.
Zielony NIGDY na elementach negatywnych. Nawet jeśli przycisk „Zamknij sprawę" jest akcją, a nie błędem — nigdy zielony dla zamknięcia. Zielony = sukces potwierdzony.
Navy gradient wyłącznie w hero i sidebarze. Żadnych gradientów w treści strony, kartach, formularzach. Gradient jest zarezerwowany dla dwóch kontekstów: hero landing page (900→800) i sidebar nawigacji (900→850).
Tło strony: --iron-50 (#F9FAFB). Nie biały (#FFFFFF). Biały jest dla kart, modali i pól formularzy — tworzą wtedy naturalną hierarchię warstw.
Kontrast WCAG 2.1 AA minimum: tekst na tle musi mieć ratio ≥ 4.5:1, elementy graficzne ≥ 3:1. Testować każdą kombinację.
3.2.6 Prohibited Colors
Następujące kolory i style są zabronione w całym projekcie Długomat:
Fiolet, lawenda, lila — kojarzą się z wellness, duchowością; podważają powagę.
Brąz, beż, kremowy — kojarzą się z naturalizmem, ciepłem; Długomat nie jest ciepły, jest bezpieczny.
Róż, koralowy — infantylizacja; Długomat nie „przytula", Długomat chroni.
Turkusowy, cyjan jasny — „startupowy" kolor, konotacje z fintechami; Długomat to legal-tech obronny.
Multi-kolorowe gradienty — carnaval, brak powagi.
Neonowe odcienie — desperation marketing; my jesteśmy instytucją.
3.3 TYPOGRAFIA
3.3.1 Hierarchia fontów
WARSTWA DISPLAY (marketing, hero, H1-H2 na landing):
  Font: Space Grotesk
  Wagi: 500 (medium), 700 (bold)
  Charakter: geometryczny, współczesny, pewny siebie
  Rola: komunikuje nowoczesność i kompetencję technologiczną
  
WARSTWA INTERFACE (dashboard, formularze, wizardy, cały UI aplikacji):
  Font: Inter
  Wagi: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  Charakter: neutralny, czytelny w małych rozmiarach, zoptymalizowany dla ekranów
  Rola: czytelność, profesjonalizm, brak rozpraszania
  
WARSTWA LEGAL (generowane pisma prawne, podgląd PDF):
  Font: Georgia (web) / Times New Roman (PDF)
  Waga: 400 (regular), 700 (bold)
  Rozmiar: 12pt w PDF (standard prawniczy PL)
  Charakter: tradycyjny, formalny
  Rola: dokument wygląda jak pismo z kancelarii, nie jak wydruk z internetu
  
WARSTWA CODE (dane techniczne, sygnatury, numery spraw):
  Font: JetBrains Mono
  Waga: 400
  Rozmiar: 13-14px
  Rola: sygnatury akt, numery KRS, kody pocztowe — wszystko co musi być odczytane znak po znaku

3.3.2 Skala typograficzna — fluid typography z clamp()
Zastosowanie fluid typography eliminuje breakpointowe skoki rozmiaru. Agent AI implementuje to jako CSS custom properties z clamp():
:root {
  /* Display scale — tylko landing i marketing */
  --text-display-hero: clamp(2.25rem, 3vw + 1rem, 3.5rem);     /* 36-56px */
  --text-display-h1:   clamp(1.875rem, 2.5vw + 0.75rem, 3rem); /* 30-48px */
  --text-display-h2:   clamp(1.5rem, 2vw + 0.5rem, 2.25rem);   /* 24-36px */
  
  /* Interface scale — dashboard i aplikacja */
  --text-h1:    clamp(1.375rem, 1.5vw + 0.5rem, 1.75rem);  /* 22-28px */
  --text-h2:    clamp(1.125rem, 1.2vw + 0.4rem, 1.5rem);   /* 18-24px */
  --text-h3:    clamp(1rem, 1vw + 0.3rem, 1.25rem);         /* 16-20px */
  --text-body:  clamp(0.9375rem, 0.5vw + 0.75rem, 1.0625rem); /* 15-17px */
  --text-small: clamp(0.8125rem, 0.3vw + 0.7rem, 0.875rem);  /* 13-14px */
  --text-xs:    0.75rem;                                       /* 12px — fixed */
  
  /* Line heights */
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   1.75;
  
  /* Letter spacing */
  --tracking-tight:  -0.02em;  /* Nagłówki display */
  --tracking-normal:  0em;
  --tracking-wide:    0.01em;  /* Small text, labels */
  --tracking-wider:   0.05em;  /* Overline, badge text */
  --tracking-widest:  0.1em;   /* Caps in badges */
}

3.3.3 Reguły typograficzne — bezwzględne
Nagłówki H1 w dashboardzie: Inter 700, nie Space Grotesk. Space Grotesk jest zarezerwowany wyłącznie dla stron marketingowych (landing, cennik, blog). Mieszanie fontów display z interfejsem tworzy niespójność.
Maksymalna długość linii tekstu: 72 znaki (≈ 680px). Dłuższe linie zmniejszają czytelność. Ustawić max-width: 42rem na kontenerach tekstowych.
Nigdy nie centrować tekstu dłuższego niż 2 linie. Centrowanie jest dozwolone dla nagłówków hero, krótkich subheadline, tekstu w pustych stanach (empty state). Wszystko inne — left-aligned.
Sygnatura akt sądowych zawsze w JetBrains Mono. Format: I Nc 1234/26 — monospace zapewnia czytelność każdego znaku, co jest krytyczne w kontekście prawnym.
Brak italic w interfejsie. Italic jest dozwolony wyłącznie w: tooltipach z cytatami prawnymi, podpisach pod przykładami, komentarzach w podglądzie PDF. Italic w interfejsie sugeruje niepewność — a Długomat nie jest niepewny.
3.4 SYSTEM PRZESTRZENI I KSZTAŁTÓW
3.4.1 Grid bazowy
Cały system przestrzeni oparty jest na siatce 4px. Każda wartość paddingu, marginesu, gapu, wysokości i szerokości musi być wielokrotnością 4.
:root {
  --space-0:   0px;
  --space-0.5: 2px;     /* Micro-gaps: border offsets */
  --space-1:   4px;     /* Ikona-tekst gap wewnętrzny */
  --space-1.5: 6px;     /* Badge padding vertical */
  --space-2:   8px;     /* Gap między badge'ami, inline spacing */
  --space-3:   12px;    /* Padding wewnętrzny mały (tag, chip) */
  --space-4:   16px;    /* Standard gap, padding input vertical */
  --space-5:   20px;    /* Padding button vertical */
  --space-6:   24px;    /* Gap między elementami listy */
  --space-8:   32px;    /* Padding kart wewnętrzny */
  --space-10:  40px;    /* Sekcja gap mały */
  --space-12:  48px;    /* Sekcja gap medium */
  --space-16:  64px;    /* Sekcja gap duży */
  --space-20:  80px;    /* Padding sekcji marketing vertical */
  --space-24:  96px;    /* Hero padding top */
  --space-32:  128px;   /* Mega spacing — hero bottom, footer top */
}

3.4.2 Border radius
:root {
  --radius-none: 0px;
  --radius-sm:   6px;     /* Badge, tag, chip */
  --radius-md:   10px;    /* Input, select, textarea */
  --radius-lg:   14px;    /* Karty, modalle */
  --radius-xl:   18px;    /* Karty hero, pricing cards */
  --radius-2xl:  24px;    /* Duże sekcje, feature cards */
  --radius-full: 9999px;  /* Pill buttons, avatary, badge round */
}

Reguła: Żaden element w interfejsie nie może mieć border-radius mniejszego niż 6px (oprócz linii i separatorów). Sharp corners (0px radius) komunikują „tanim systemem" — Długomat tego nie robi.
3.4.3 System cieni
Cienie w Długomat są chłodne (blue-tinted) i subtelne. Nigdy ciepłe, nigdy ostre. Cień nie „dekoruje" — cień buduje hierarchię warstw.
:root {
  --shadow-xs:  0 1px 2px 0 rgba(11, 29, 58, 0.04);
  --shadow-sm:  0 1px 3px 0 rgba(11, 29, 58, 0.06), 0 1px 2px -1px rgba(11, 29, 58, 0.06);
  --shadow-md:  0 4px 6px -1px rgba(11, 29, 58, 0.07), 0 2px 4px -2px rgba(11, 29, 58, 0.05);
  --shadow-lg:  0 10px 15px -3px rgba(11, 29, 58, 0.08), 0 4px 6px -4px rgba(11, 29, 58, 0.04);
  --shadow-xl:  0 20px 25px -5px rgba(11, 29, 58, 0.10), 0 8px 10px -6px rgba(11, 29, 58, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(11, 29, 58, 0.18);
  
  /* Special: card hover — subtelne podniesienie */
  --shadow-card-hover: 0 12px 24px -4px rgba(11, 29, 58, 0.12), 0 4px 8px -2px rgba(11, 29, 58, 0.06);
  
  /* Special: focus ring shadow (zamiast outline) */
  --shadow-focus: 0 0 0 3px rgba(43, 105, 202, 0.35);
}

Reguła: Każda karta w stanie default ma --shadow-sm. Hover podnosi do --shadow-card-hover z transition 200ms. Kliknięta/aktywna karta wraca do --shadow-md. Modalle zawsze --shadow-2xl.
3.5 LAYOUT I STRUKTURA STRON
3.5.1 Landing page — architektura sekcji
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR — sticky, bg white/95% opacity, blur 12px         │
│  Logo (tarcza + §) | Nav links | CTA "Zaloguj się"        │
│  Wysokość: 64px, border-bottom: 1px iron-100               │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                               │
│  Background: linear-gradient(165deg, dlug-900, dlug-800)    │
│  Subtle pattern: repeating shield outlines at 4% opacity    │
│  Min-height: 600px, padding: 96px top, 128px bottom         │
│                                                             │
│  ┌─────────── Grid 2 kolumny (60/40) ──────────────┐       │
│  │ LEFT:                                            │       │
│  │ Overline: "DŁUGOMAT — LEXMATE24" (Inter 13px,    │       │
│  │   500, dlug-300, tracking-wider, uppercase)      │       │
│  │                                                  │       │
│  │ H1: "Komornik zajął Ci konto?                    │       │
│  │      Sąd wysłał nakaz?                           │       │
│  │      Mamy na to pisma."                          │       │
│  │ (Space Grotesk 700, --text-display-hero, white,  │       │
│  │  tracking-tight, leading-tight)                  │       │
│  │                                                  │       │
│  │ Paragraph: "Wygeneruj sprzeciw, skargę lub       │       │
│  │ wniosek w 12 minut. Bez prawnika. Z gwarancją   │       │
│  │ poprawności formalnej lub zwrot pieniędzy."       │       │
│  │ (Inter 18px, 400, dlug-200, leading-relaxed,     │       │
│  │  max-width: 540px)                               │       │
│  │                                                  │       │
│  │ CTA Row:                                         │       │
│  │ [Skanuj nakaz za darmo →]  ← accent-500 bg,     │       │
│  │   white text, 700, px-8 py-4, radius-full,      │       │
│  │   shadow-lg, hover: accent-400, scale 1.02       │       │
│  │                                                  │       │
│  │ [Zobacz cennik]  ← ghost button, border white/30%│       │
│  │   white text, 500, px-6 py-3, radius-full        │       │
│  │   hover: bg white/10%                            │       │
│  │                                                  │       │
│  │ RIGHT:                                           │       │
│  │ Ilustracja: geometric shield with animated       │       │
│  │ shield-pulse (subtle scale 1.0→1.03→1.0, 4s,    │       │
│  │ ease-in-out, infinite). Lub: screenshot          │       │
│  │ dashboardu na laptop mockup z perspektywą 5°.    │       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
│  TRUST STRIP — poniżej hero, bg white, py-5, border-y      │
│  iron-100. Flex row, gap-12, center.                        │
│  Items: [🔒 AES-256] [🇪🇺 RODO] [💳 Stripe] [⏱ 14 dni  │
│  gwarancja] [✓ 12 400+ wygenerowanych pism]                │
│  Styl: iron-500 text, 13px, 500, ikona 16px iron-400       │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: "Jak to działa?" — 3 kroki                        │
│  Bg: iron-50, py: 96px                                      │
│  Grid 3-kolumnowy, gap-8                                    │
│  Każdy krok: Card white, shadow-sm, radius-xl, p-8         │
│    Numer: accent-500 bg, white text, 40x40 circle, Inter   │
│    700 18px. Nagłówek: Inter 600 20px iron-900.             │
│    Opis: Inter 400 16px iron-600, leading-relaxed.          │
│    Ikona: Lucide, 32px, dlug-500.                           │
│  Krok 1: "Prześlij dokument" (Upload Cloud icon)            │
│  Krok 2: "AI wygeneruje pismo" (Sparkles icon)              │
│  Krok 3: "Pobierz PDF i wyślij" (FileCheck icon)            │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: Moduły — Grid 2x4 (desktop) / 1 kolumna (mobile)  │
│  Bg: white, py: 96px                                        │
│  Heading: "Jedno narzędzie. Osiem tarcz." (center)          │
│  Każdy moduł: Card z ikoną specyficzną, nazwą, ceną,        │
│  krótkim opisem 2 linijki, CTA ghost "Sprawdź →"           │
│  Hover: border-left 4px w kolorze modułu, shadow-card-hover│
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: Porównanie z prawnikiem                            │
│  Bg: dlug-50, py: 96px                                      │
│  Tabela 2-kolumnowa: "Prawnik" vs "Długomat"               │
│  Rows: Koszt, Czas, Dostępność, Gwarancja, Poprawki        │
│  Kolumna prawnik: iron-300 text, przekreślone lub blade     │
│  Kolumna Długomat: accent-600 text, check marks, bold       │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: Pricing                                            │
│  Bg: white, py: 96px                                        │
│  3 karty: Skaner (0 zł), Sprzeciwomat (159 zł, badge       │
│  "NAJPOPULARNIEJSZY"), Pakiet Ochrona (349 zł)              │
│  Pricing card: radius-2xl, shadow-lg, p-10                  │
│  Karta popularna: border 2px dlug-500, scale 1.02           │
├─────────────────────────────────────────────────────────────┤
│  SEKCJA: FAQ (Accordion)                                    │
│  Bg: iron-50, py: 96px                                      │
│  Max-width: 720px, center. 8-10 pytań.                      │
│  Schema.org FAQPage JSON-LD.                                │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
│  Bg: dlug-900, py: 64px                                     │
│  4-kolumnowy grid: Moduły, Firma, Pomoc, Kontakt            │
│  Text: dlug-300, links hover: white                         │
│  Bottom: copyright, regulamin, polityka prywatności          │
└─────────────────────────────────────────────────────────────┘

3.5.2 Dashboard — architektura
┌──────────────────────────────────────────────────────────────┐
│  LAYOUT: Sidebar (272px fixed) + Main (flex-1)               │
│                                                              │
│  ┌── SIDEBAR ──────────┐ ┌── MAIN AREA ──────────────────┐  │
│  │ Bg: dlug-900         │ │ Bg: iron-50                   │  │
│  │                      │ │                               │  │
│  │ Logo area: py-6 px-6 │ │ TOP BAR (wewnętrzny):         │  │
│  │ Tarcza § + "Długomat"│ │ h-16, bg white, border-b      │  │
│  │ Space Grotesk 600    │ │ iron-100, px-8                │  │
│  │ 18px, white          │ │ Left: Breadcrumb              │  │
│  │                      │ │ Right: Search (⌘K), Bell,     │  │
│  │ ── separator ──      │ │ Avatar dropdown               │  │
│  │ 1px dlug-850         │ │                               │  │
│  │                      │ │ CONTENT AREA:                 │  │
│  │ Nav items:           │ │ px-8, py-6                    │  │
│  │ Icon (20px, dlug-400)│ │ max-width: 1200px             │  │
│  │ + Label (Inter 14px, │ │                               │  │
│  │   500, dlug-300)     │ │ ┌── PAGE HEADER ──────────┐  │  │
│  │ py-2.5, px-4,        │ │ │ H1 (Inter 700 --text-h1)│  │  │
│  │ radius-md            │ │ │ + optional subtitle      │  │  │
│  │                      │ │ │ + CTA button right       │  │  │
│  │ Active state:        │ │ └─────────────────────────┘  │  │
│  │ bg dlug-800/70%,     │ │                               │  │
│  │ text white,          │ │ ┌── CONTENT ──────────────┐  │  │
│  │ icon white,          │ │ │ (page-specific)          │  │  │
│  │ border-left 3px      │ │ │                          │  │  │
│  │ accent-500           │ │ └─────────────────────────┘  │  │
│  │                      │ │                               │  │
│  │ Hover state:         │ │                               │  │
│  │ bg dlug-850/50%      │ │                               │  │
│  │                      │ │                               │  │
│  │ Nav groups:          │ │                               │  │
│  │ SPRAWY               │ │                               │  │
│  │  · Dashboard         │ │                               │  │
│  │  · Moje sprawy       │ │                               │  │
│  │  · Terminy           │ │                               │  │
│  │ NARZĘDZIA            │ │                               │  │
│  │  · Nowe pismo        │ │                               │  │
│  │  · Skaner OCR        │ │                               │  │
│  │  · Kalkulatory       │ │                               │  │
│  │ KONTO                │ │                               │  │
│  │  · Dokumenty         │ │                               │  │
│  │  · Płatności         │ │                               │  │
│  │  · Ustawienia        │ │                               │  │
│  │                      │ │                               │  │
│  │ ── bottom ──         │ │                               │  │
│  │ Pomoc (?) icon       │ │                               │  │
│  │ Wersja: 1.0.0        │ │                               │  │
│  └──────────────────────┘ └───────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

Dashboard — strona główna (po zalogowaniu):
Widok główny składa się z 4 widgetów w gridzie 2x2 (desktop) / 1-kolumna (mobile):
Widget 1: Deadline Radar (colspan 2 na desktop)
Pełna szerokość, bg white, shadow-sm, radius-lg, p-6.
Horizontal timeline z punktami dla najbliższych terminów.
Każdy punkt: kółko 12px z kolorem pilności (accent-300 >7d, warn-500 3-7d, danger-500 <3d).
Najbliższy termin: pulsujący ring (animation: pulse 2s infinite), etykieta pogrubiona.
Jeśli brak terminów: „Brak pilnych terminów. Wszystkie sprawy pod kontrolą." z ilustracją tarczy + checkmark.
Widget 2: Aktywne sprawy
Lista 3-5 najnowszych spraw. Każda: flex row, border-left 4px (kolor zależny od statusu modułu), icon modułu, nazwa sprawy (skrócona), badge statusu, data.
CTA: „Zobacz wszystkie →"
Widget 3: Ostatnie dokumenty
Lista 3 ostatnich PDF. Każdy: ikona FileText, nazwa, data, badge (Wygenerowany / Opłacony / Pobrany).
CTA: „Wszystkie dokumenty →"
Widget 4: Szybkie akcje
Grid 2x2 małych kart-buttonów: „Nowy sprzeciw EPU", „Skarga na komornika", „Reklamacja BIK", „Sprawdź cesję".
Każdy: icon + label, bg dlug-50, hover bg dlug-100, border iron-200, radius-lg.
3.6 WIZARD — SYSTEM KROKÓW
Wizard jest sercem Długomat. Każdy moduł (D1-D8) prowadzi użytkownika przez sekwencję kroków. Wizard musi być zaprojektowany tak, żeby osoba w stresie — bez wiedzy prawnej — mogła go ukończyć w 8-15 minut.
3.6.1 Struktura WizardShell
┌─────────────────────────────────────────────────────────────┐
│  WIZARD SHELL                                                │
│  Max-width: 800px, mx-auto, py-8                             │
│                                                              │
│  ┌── PROGRESS BAR ─────────────────────────────────────────┐ │
│  │ Height: 4px, bg: iron-200, radius-full                  │ │
│  │ Fill: dlug-500, width: (currentStep/totalSteps)%        │ │
│  │ Transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1)  │ │
│  │                                                         │ │
│  │ Below bar: Flex row between                              │ │
│  │ Left: "Krok 3 z 5" (Inter 13px 500 iron-600)            │ │
│  │ Right: "Sprzeciw od nakazu EPU" (Inter 13px 500          │ │
│  │         dlug-500, badge-like, bg dlug-50, radius-full,   │ │
│  │         px-3 py-1)                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── STEP CONTENT AREA ──────────────────────────────────┐   │
│  │ Card: bg white, shadow-md, radius-xl, p-10              │   │
│  │                                                         │   │
│  │ H2: Inter 700, --text-h2, iron-900                      │   │
│  │ Subtitle: Inter 400, --text-body, iron-600, mt-2        │   │
│  │                                                         │   │
│  │ ── Form fields ──                                       │   │
│  │ (specyficzne dla kroku — patrz poniżej)                 │   │
│  │                                                         │   │
│  │ ── Tip Panel (opcjonalny) ──                            │   │
│  │ bg: dlug-50, border-left 3px dlug-300, radius-md,       │   │
│  │ p-4, mt-6                                               │   │
│  │ Ikona: Info (16px, dlug-400)                             │   │
│  │ Tekst: Inter 14px 400 iron-700                           │   │
│  │ Np: "Sygnaturę akt znajdziesz w lewym górnym rogu       │   │
│  │ nakazu zapłaty, w formacie: I Nc XXXX/XX"               │   │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌── NAVIGATION BAR ────────────────────────────────────┐    │
│  │ Flex row, justify-between, mt-6                       │    │
│  │                                                       │    │
│  │ [← Wstecz]                [Dalej →]                   │    │
│  │ Ghost button,              Primary button,             │    │
│  │ iron-600 text,             dlug-500 bg,                │    │
│  │ hover iron-800             white text 600,             │    │
│  │                            hover dlug-600,             │    │
│  │                            disabled: iron-300 bg,      │    │
│  │                            cursor-not-allowed          │    │
│  │                                                       │    │
│  │ Ostatni krok: "Dalej" → "Wygeneruj pismo"             │    │
│  │ bg accent-500, hover accent-400                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌── LEGAL TIP PANEL (sidebar na desktop) ──────────────┐    │
│  │ Widoczny na desktop (≥1024px) jako kolKontynuuję dokładnie od urwanego miejsca:
│  ┌── LEGAL TIP PANEL (sidebar na desktop) ──────────────┐    │
│  │ Widoczny na desktop (≥1024px) jako kolumna boczna     │    │
│  │ po prawej stronie wizard content area.                 │    │
│  │ Width: 280px, position: sticky, top: 96px              │    │
│  │ Bg: dlug-50, border: 1px dlug-100, radius-lg, p-6     │    │
│  │                                                        │    │
│  │ Heading: "Wskazówka prawna" (Inter 13px 600,           │    │
│  │   dlug-600, uppercase, tracking-wider)                 │    │
│  │                                                        │    │
│  │ Content: dynamiczny, zmienia się z każdym krokiem       │    │
│  │ wizarda. Tekst: Inter 14px 400 iron-700,               │    │
│  │ leading-relaxed. Max 4-5 zdań.                         │    │
│  │                                                        │    │
│  │ Przykłady per krok:                                    │    │
│  │ Krok 1 (upload): "Nakaz zapłaty z e-Sądu to           │    │
│  │   dokument wydawany bez rozprawy. Masz 14 dni          │    │
│  │   od doręczenia na złożenie sprzeciwu. Nie musisz      │    │
│  │   podawać powodu — wystarczy sam sprzeciw."            │    │
│  │ Krok 2 (dane): "Twoje dane osobowe są potrzebne       │    │
│  │   wyłącznie do wygenerowania pisma. Szyfrujemy         │    │
│  │   je AES-256 i usuwamy po 30 dniach."                  │    │
│  │ Krok 3 (powód): "Najczęstsze powody sprzeciwu:        │    │
│  │   przedawnienie roszczenia, brak dowodu doręczenia     │    │
│  │   wezwania, niewłaściwa kwota, cesja bez               │    │
│  │   zawiadomienia dłużnika."                             │    │
│  │                                                        │    │
│  │ Bottom: link "Dowiedz się więcej →" (dlug-500,         │    │
│  │   hover underline) — prowadzi do wpisu blogowego       │    │
│  │   powiązanego z kontekstem kroku.                      │    │
│  │                                                        │    │
│  │ Na mobile (< 1024px): panel chowany do                 │    │
│  │ collapsible accordion pod formularzem,                 │    │
│  │ domyślnie złożony, trigger: "💡 Wskazówka prawna"     │    │
│  │ (Inter 14px 500 dlug-500)                              │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘

3.6.2 Animacje przejść między krokami
Agent AI implementuje przejścia między krokami wizarda z użyciem Framer Motion. Cel: płynność, brak „teleportacji", ale bez przesadnej teatralności. Użytkownik jest w stresie — animacja ma być spokojna i kierunkowa, nie spektakularna.
// Konfiguracja animacji przejścia między krokami wizarda
// Plik: src/components/wizard/WizardStepTransition.tsx

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,  // 80px — krótki, pewny ruch
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const stepTransition = {
  x: { 
    type: "spring", 
    stiffness: 350,   // szybka reakcja
    damping: 35,       // brak „odbicia" — pewność, nie zabawa
    mass: 0.8 
  },
  opacity: { 
    duration: 0.2, 
    ease: "easeInOut" 
  },
};

// Komponent:
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={stepTransition}
  >
    {children}
  </motion.div>
</AnimatePresence>

Reguły animacji — bezwzględne:
Czas trwania przejścia: 200-350ms. Nigdy powyżej 400ms. Użytkownik nie ogląda — użytkownik działa.
Kierunek: Dalej = slide left-to-right (x: 80→0). Wstecz = slide right-to-left (x: -80→0). Spójne z mentalnym modelem „postępu".
Progress bar: animacja width z transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1) — nieco wolniejsza niż krok, daje poczucie „napełniania się".
prefers-reduced-motion: reduce — wyłącz wszystkie animacje x/y, zostaw tylko opacity fade 150ms. Bezwzględnie.
Żaden element formularza nie może animować się po załadowaniu kroku. Formularz jest gotowy natychmiast — żadnych „wjeżdżających" inputów.
3.6.3 Walidacja w wizardzie
STRATEGIA WALIDACJI:
  Moment: on blur (po opuszczeniu pola) + on submit (przy próbie przejścia dalej)
  NIE on change — użytkownik w stresie nie potrzebuje czerwonych
  komunikatów podczas pisania.

STYL BŁĘDU:
  Input border: danger-500 (2px, transition 150ms)
  Poniżej inputa: flex row, gap-2, mt-1.5
    Ikona: AlertCircle 14px danger-500
    Tekst: Inter 13px 500 danger-600
    Np: "Podaj sygnaturę akt w formacie: I Nc 1234/26"
  
  Input w stanie błędu: bg danger-50 (subtelne czerwone tło)
  
STYL SUKCESU (dla pól krytycznych — np. sygnatura, PESEL):
  Input border: accent-500 (2px)
  Ikona: CheckCircle 14px accent-600 wewnątrz inputa (right side)
  Brak dodatkowego tekstu — sam zielony check wystarczy.

STYL FOCUS:
  Input border: dlug-500 (2px)
  Box-shadow: --shadow-focus (0 0 0 3px rgba(43, 105, 202, 0.35))
  Transition: all 150ms ease

POLA WYMAGANE:
  Label: Inter 14px 600 iron-800
  Asterisk: danger-500, ml-0.5 (nie słowo "wymagane" — asterisk wystarczy)
  
POLA OPCJONALNE:
  Label z dopiskiem "(opcjonalne)" — Inter 14px 400 iron-500

3.6.4 Typowe kroki wizarda (przykład: Sprzeciw EPU — moduł D2)
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

3.7 MODUŁY — IDENTYFIKACJA WIZUALNA
Każdy z 8 modułów Długomat ma przypisany unikalny kolor akcentowy i ikonę. Kolory są wariacjami głównej palety navy — utrzymują spójność, ale pozwalają użytkownikowi natychmiast rozpoznać, w którym module się znajduje.
MODUŁ          KOD    KOLOR AKCENTOWY       IKONA LUCIDE      CENA
─────────────────────────────────────────────────────────────────────
D1 Skaner      FREE   dlug-400 (#5A8FDB)    ScanSearch         0 zł
D2 Sprzeciwomat EPU   dlug-600 (#2354A6)    ShieldAlert      159 zł
D3 KomornikShield      dlug-800 (#132D5E)    Gavel            199 zł
D4 PotrąceniaStop      warn-500 (#F59E0B)    Scissors         199 zł
D5 BIK-Fix             accent-500 (#10B461)  CreditCard       129 zł
D6 CesjaCheck          dlug-500 (#2B69CA)    FileSearch       149 zł
D7 UgodoMat            accent-600 (#0D8A4A)  Handshake        119 zł
D8 Upadłość-Lite       dlug-700 (#1B3F82)    LifeBuoy         249 zł

Implementacja w UI:
Sidebar: ikona modułu kolorowana na kolor akcentowy gdy aktywna.
Karta modułu na dashboardzie: border-left: 4px solid {kolor_modulu}.
Breadcrumb: badge z nazwą modułu w tle {kolor_modulu}-50, tekst {kolor_modulu}-700.
Wizard progress bar: fill w kolorze modułu zamiast domyślnego dlug-500.
Wygenerowany PDF: subtelna linia kolorowa (1px) na górze pierwszej strony w kolorze modułu.
3.8 PRICING SECTION — DESIGN
Sekcja cennikowa musi odpowiedzieć na jedno pytanie: „Ile zaoszczędzę w porównaniu z prawnikiem?" Dlatego cena nigdy nie stoi sama — zawsze obok jest porównanie.
PRICING SECTION LAYOUT:
  Bg: white, py: 96px
  Heading: "Ile kosztuje obrona?" center, Space Grotesk 700, 
           --text-display-h2
  Subheading: "Porównaj z ceną prawnika — i zdecyduj sam."
              center, Inter 400 16px iron-600
  
  Grid: 3 kolumny (desktop), 1 kolumna (mobile), gap-8, mt-12
  
  ┌── KARTA 1: SKANER ──────────────┐
  │ Bg: white                        │
  │ Border: 1px iron-200             │
  │ Radius: 2xl                      │
  │ Shadow: sm                       │
  │ Padding: 40px                    │
  │                                  │
  │ Badge: — (brak)                  │
  │ Nazwa: "Skaner" Inter 600 20px   │
  │ Cena: "0 zł" Inter 700 40px     │
  │        iron-900                  │
  │ Opis: "Sprawdź czy masz podstawy │
  │ do obrony — za darmo"            │
  │ Inter 400 15px iron-600          │
  │                                  │
  │ ── separator ──                  │
  │                                  │
  │ Features (checkmark list):       │
  │ ✓ OCR rozpoznawanie dokumentu    │
  │ ✓ Analiza podstaw prawnych       │
  │ ✓ Szacunek skuteczności          │
  │ ✗ Generowanie pisma (grayed)     │
  │ ✗ PDF do pobrania (grayed)       │
  │                                  │
  │ [Skanuj za darmo]                │
  │ Ghost button, dlug-500           │
  │ Full-width, radius-lg            │
  └──────────────────────────────────┘
  
  ┌── KARTA 2: SPRZECIWOMAT ────────┐
  │ Bg: white                        │
  │ Border: 2px dlug-500             │  ← wyróżnienie
  │ Radius: 2xl                      │
  │ Shadow: xl                       │  ← podniesiona
  │ Padding: 40px                    │
  │ Transform: scale(1.03)           │  ← subtelnie większa
  │ Position: relative               │
  │                                  │
  │ Badge (absolute, top -14px,      │
  │   left 50%, transform -50%):     │
  │   "NAJPOPULARNIEJSZY"            │
  │   Bg: dlug-500, text white       │
  │   Inter 11px 700, uppercase      │
  │   Tracking-widest                │
  │   Px-4 py-1.5, radius-full      │
  │                                  │
  │ Nazwa: "Sprzeciwomat EPU"        │
  │ Cena: "159 zł" Inter 700 40px   │
  │        dlug-600                   │
  │ Porównanie: "Prawnik: 500-2000zł"│
  │   Inter 13px iron-400,           │
  │   line-through                   │
  │ Oszczędność: "Oszczędzasz min.   │
  │   341 zł" Inter 14px 600         │
  │   accent-600                     │
  │                                  │
  │ ── separator ──                  │
  │                                  │
  │ Features (checkmark list):       │
  │ ✓ Wszystko z wersji darmowej     │
  │ ✓ Pismo wygenerowane przez AI    │
  │ ✓ Walidacja formalna 94%+        │
  │ ✓ PDF gotowy do wydruku          │
  │ ✓ Przypomnienia o terminach      │
  │ ✓ 14-dniowa gwarancja zwrotu     │
  │                                  │
  │ [Wygeneruj sprzeciw →]           │
  │ Primary button, accent-500 bg    │
  │ White text, full-width           │
  │ Shadow-md, radius-lg             │
  └──────────────────────────────────┘
  
  ┌── KARTA 3: PAKIET OCHRONA ──────┐
  │ Bg: dlug-900 (dark card)         │
  │ Border: 1px dlug-700             │
  │ Radius: 2xl                      │
  │ Shadow: lg                       │
  │ Padding: 40px                    │
  │ Text color: white / dlug-200     │
  │                                  │
  │ Badge: "NAJLEPSZA WARTOŚĆ"       │
  │   Bg: accent-500, text white     │
  │                                  │
  │ Nazwa: "Pakiet Ochrona"          │
  │ Cena: "349 zł" Inter 700 40px   │
  │        white                     │
  │ Porównanie: "Prawnik: 3000-8000zł│
  │   Inter 13px dlug-400,           │
  │   line-through                   │
  │                                  │
  │ ── separator (dlug-700) ──       │
  │                                  │
  │ Features:                        │
  │ ✓ Sprzeciw EPU                   │
  │ ✓ Skarga na komornika            │
  │ ✓ Reklamacja BIK                 │
  │ ✓ Weryfikacja cesji              │
  │ ✓ Wniosek o ugodę               │
  │ ✓ Priorytetowe wsparcie          │
  │ Check color: accent-400          │
  │                                  │
  │ [Kup pakiet →]                   │
  │ Button: accent-500 bg, white text│
  │ Full-width, radius-lg            │
  └──────────────────────────────────┘
  
  Poniżej kart:
    Trust note: center, Inter 14px iron-500, mt-8
    "💳 Bezpieczna płatność Stripe · 📄 Faktura VAT · 
     🔄 14 dni na zwrot bez pytań"

3.9 KOMPONENTY UNIKALNE DLA DŁUGOMAT
3.9.1 Kalkulator kwoty wolnej
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

3.9.2 Deadline Countdown Widget
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

3.9.3 AI Success Estimator
KOMPONENT: SuccessEstimator
Lokalizacja: wizard krok 3 (po wyborze powodu sprzeciwu/odwołania)

  Pojawia się po wybraniu powodu (300ms delay).
  
  Card:
    Background: dlug-50, border 1px dlug-100, radius-lg, padding 16px
    Flex row, gap 14px, align-center
    
    Left: circular mini-chart (40px × 40px)
      SVG circle: 
        Track: stroke dlug-200, stroke-width 3px
        Fill: stroke dynamiczny:
          ≥70% → accent-500
          40-69% → warn-500
          <40% → danger-500
        stroke-dasharray: calculated, stroke-linecap round
        Animacja fill: 0 → target %, 800ms, ease-out, delay 200ms
      Center number: Inter 12px 700, kolor fill
      
    Center: 
      Linia 1: "Szacunkowa skuteczność: 82%"
        Inter 14px 600 iron-800
      Linia 2: "Na podstawie 1 240 podobnych spraw"
        Inter 12px 400 iron-500
        
    Right: 
      Info icon (InfoCircle 16px dlug-400)
      Tooltip on hover:
        Bg: white, shadow-xl, radius-lg, p-4, max-width 260px
        "Szacunek opiera się na analizie AI wyników podobnych spraw 
         z tego samego powodu i wobec tego samego typu wierzyciela. 
         Nie jest to porada prawna."
        Inter 13px 400 iron-700
  
  Animacja wejścia: 
    Container: height 0→auto, opacity 0→1, 250ms, 
    ease [0.16, 1, 0.3, 1]
    
  Zmiana powodu: 
    Fade out 100ms → update data → fade in 200ms
    Chart re-animates from 0
    
  API: POST /api/ai/estimate-success
    Body: { module: "D2", reason: "przedawnienie", 
            creditor_type: "fundusz_sekurytyzacyjny" }
    Response: { score: 82, sample_size: 1240, confidence: "high" }
    
  Fallback (jeśli API niedostępne):
    Ukryj komponent — nie pokazuj "brak danych" ani błędu.
    Wizard działa normalnie bez estimatora.

3.9.4 Document Timeline
KOMPONENT: DocumentTimeline
Lokalizacja: strona szczegółów sprawy /panel/sprawy/[id]

  Desktop (≥768px): horizontal timeline
  Mobile (<768px): vertical timeline
  
  Container: bg white, border iron-100, radius-xl, p-6
  
  HORIZONTAL LAYOUT:
    Flex row, position relative
    Connecting line: absolute, top 50% of dots, height 2px, 
      bg iron-200, width calc(100% - 48px), left 24px
    Completed segment: bg dlug-500 (overlay na iron-200 line)
    
    Każdy punkt:
      Flex col, align-center, flex 1
      
      Dot: 
        Completed: 14px circle, bg dlug-500, border 2px white, shadow-xs
        Active: 14px circle, bg dlug-500, border 2px white,
          + outer ring: 24px, border 2px dlug-300, 
            animation: pulse (opacity 0.4→1→0.4, 2s, infinite)
        Future: 14px circle, bg white, border 2px iron-300
        Success: 14px circle, bg accent-500, white checkmark 8px
        Failed: 14px circle, bg danger-500, white X 8px
        
      Label (below dot, mt-3):
        Inter 13px 600 iron-800 (completed/active)
        Inter 13px 400 iron-400 (future)
        Max-width: 100px, text-center
        
      Date (below label, mt-1):
        Inter 11px 400 iron-500
        
    Przykładowe punkty (Sprzeciw EPU):
      ✓ Utworzono      ✓ Wygenerowano    ✓ Opłacono
      12.04.2026       12.04.2026        12.04.2026
      
      ● Wysłano (ACTIVE — pulsating)
      13.04.2026
      "Oczekiwanie na odpowiedź sądu"
      
      ○ Odpowiedź sądu (FUTURE)
      —
      
      ○ Zakończone (FUTURE)
      —
  
  VERTICAL LAYOUT (mobile):
    Flex col
    Line: absolute, left 10px, width 2px, bg iron-200, top 0 bottom 0
    Completed segment: bg dlug-500
    
    Każdy punkt: flex row, gap 16px
      Left: dot (10px, positioned on line)
      Right: label + date + optional description
        Label: Inter 14px 600 iron-800
        Date: Inter 12px 400 iron-500
        Description: Inter 13px 400 iron-600 (optional, 1 linia)
      Padding-bottom: 24px per item

3.9.5 OCR Confidence Indicator
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

3.9.6 PDF Preview Component
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

3.10 DARK MODE
Długomat implementuje dark mode oparty na prefers-color-scheme: dark z opcją manualnego przełączenia (toggle w ustawieniach + header).
/* Dark mode — semantic tokens override */
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-page:       #0C1019;   /* Prawie czarny z micro-blue */
  --bg-card:       #141925;   /* Karty */
  --bg-card-hover: #1A2133;   /* Karty hover */
  --bg-input:      #1A2133;   /* Inputy */
  --bg-sidebar:    #080C14;   /* Sidebar — jeszcze ciemniejszy */
  --bg-modal:      #141925;   /* Modale */
  
  /* Borders */
  --border-subtle:  #1E2A3E;
  --border-default: #2A3650;
  --border-strong:  #3B4D6B;
  
  /* Text */
  --text-primary:   #E8ECF2;
  --text-secondary: #9BA4B5;
  --text-tertiary:  #6B7A90;
  --text-disabled:  #4A5568;
  
  /* Primary (navy shifts lighter in dark mode) */
  --dlug-500-dark:  #5A8FDB;   /* Linki, focus ring */
  --dlug-400-dark:  #89B5EC;   /* Ikony sidebar */
  --dlug-300-dark:  #B8DBFD;   /* Hover tekst */
  
  /* Accent green (slightly desaturated for dark bg) */
  --accent-500-dark: #34D07E;
  --accent-700-dark: #10B461;
  
  /* Status colors: identyczne hue, nieco jaśniejsze */
  --warn-500-dark:   #FBBF24;
  --danger-500-dark:  #F87171;
  
  /* Shadows: blue-black tinted, stronger opacity */
  --shadow-sm-dark:  0 1px 3px 0 rgba(0, 0, 0, 0.3);
  --shadow-md-dark:  0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg-dark:  0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

Reguła dark mode: Nigdy nie invertować kolorów mechanicznie. Każdy token ma oddzielną wartość dark — ręcznie dobrane. Kontrast tekst-na-tle musi spełniać WCAG 2.1 AA także w dark mode (testować osobno).
3.11 RESPONSYWNOŚĆ
BREAKPOINTS (Tailwind defaults + custom):
  xs:  475px   (duże telefony landscape)
  sm:  640px   (małe tablety)
  md:  768px   (tablety portrait)
  lg:  1024px  (tablety landscape, małe laptopy)
  xl:  1280px  (desktop standard)
  2xl: 1536px  (duże monitory)

MOBILE (<768px):
  Sidebar: ukryty, dostępny via hamburger (top-left)
    Overlay: bg iron-950/60% backdrop-blur-sm
    Sidebar slides in from left, 280px, shadow-2xl
    Close: X button top-right sidebar + tap overlay
    
  Nawigacja: bottom tab bar (fixed bottom)
    5 items: Dashboard, Sprawy, Nowe pismo, Terminy, Więcej
    Height: 64px + safe-area-inset-bottom
    Bg: white, border-top iron-200, shadow-sm
    Active: dlug-500 icon + label, scale 1.05
    Inactive: iron-400 icon, iron-500 label (11px)
    
  Wizard: full-width (px-4), single column
    Cards: radius-lg (not 2xl — mniejszy radius na mobile)
    Buttons: full-width, stacked vertically
    Legal Tip Panel: collapsed accordion below form
    
  Hero: single column, text centered
    H1: --text-display-h1 (clamp handles sizing)
    Ilustracja: hidden on mobile (treść ważniejsza)
    CTA: full-width stack
    
  Pricing: single column, scroll, cards full-width
    „NAJPOPULARNIEJSZY" card: first (not second)
    
  Tables: horizontal scroll with fade indicators (left/right gradient)
  
TABLET (768-1023px):
  Sidebar: collapsed (64px width, icons only, tooltip on hover)
  Content: expands to fill
  Wizard: full width z padding 48px
  Gridy: 2 kolumny zamiast 3-4
  
DESKTOP (≥1024px):
  Sidebar: expanded (272px)
  Wizard: max-width 800px + Legal Tip Panel right (280px)
  Dashboard: 2x2 widget grid
  Pricing: 3 kolumny

PRINT (@media print):
  Ukryj: sidebar, navigation, buttons, shadows, backgrounds
  Zachowaj: treść sprawy, timeline, dane, tabelę podsumowującą
  Force: black text, white bg, border 1px solid #000
  PDF previews: render full page without scroll

3.12 STANY PUSTE I BŁĘDY
EMPTY STATE — Brak spraw:
  Container: center, max-width 400px, py-16
  Ilustracja: geometric shield with checkmark, 120x120px,
    colors: dlug-200 (shield), accent-300 (check)
    Styl: monoline 2px, geometric, flat
  H3: "Brak aktywnych spraw" Inter 600 18px iron-800
  P: "Gdy wygenerujesz pierwsze pismo — pojawi się tutaj. 
      Zacznij od skanowania dokumentu." 
      Inter 400 15px iron-500, center, mt-2
  CTA: [Skanuj dokument →] ghost button, dlug-500, mt-6

EMPTY STATE — Brak dokumentów:
  Ikona: FileX, 80px, iron-300
  H3: "Brak dokumentów"
  P: "Wygenerowane pisma pojawią się na tej liście."
  CTA: [Utwórz nowe pismo →]

ERROR STATE — Błąd serwera (500):
  Container: center, max-width 400px, py-16
  Ikona: ServerCrash, 80px, danger-300
  H3: "Coś poszło nie tak" Inter 600 18px iron-800
  P: "Nasz serwer potrzebuje chwili. Spróbuj ponownie za minutę. 
      Jeśli problem się powtarza — napisz do nas."
      Inter 400 15px iron-500
  CTA: [Spróbuj ponownie] primary, dlug-500
  Link: "Napisz do wsparcia →" text link, iron-600

ERROR STATE — 404:
  Minimalistyczny layout (bez sidebara)
  H1: "404" Space Grotesk 700 96px iron-200
  P: "Ta strona nie istnieje lub została przeniesiona."
     Inter 400 16px iron-600
  CTA: [Wróć do panelu →] primary, dlug-500

ERROR STATE — Brak połączenia:
  Toast notification (top-center):
    Bg: warn-50, border warn-200, radius-lg, shadow-lg, p-4
    Ikona: WifiOff 20px warn-600
    "Brak połączenia z internetem. Sprawdź sieć i odśwież stronę."
    Inter 14px 500 iron-800
    Auto-dismiss: never (persist until online)
    On reconnect: auto-replace with success toast:
      "Połączenie przywrócone ✓" (accent-500, auto-dismiss 3s)

LOADING STATES:
  Skeleton screens — NIE spinnery. 
  Skeleton: bg iron-100, radius-md, animate-pulse (opacity 0.4→1→0.4, 1.5s)
  Odwzoruj kształt treści: prostokąty dla tekstu (h-4 rounded, 
  różne width: 100%, 75%, 60%), kwadraty dla ikon (w-10 h-10),
  karty dla kart (w-full h-32).
  
  Wyjątek — AI generation: 
    Zamiast skeleton: typewriter effect (patrz 3.6.4 krok 4)
    + processing bar (indeterminate, dlug-500, h-1, animate)
    + label: "Generuję pismo... (~10 sekund)" Inter 14px 500 iron-600

3.13 ILUSTRACJE I GRAFIKA
STYL ILUSTRACJI:
  Geometric flat — nie ilustracyjny, nie realistyczny, nie cute.
  
  Zasady:
  1. Monoline: stroke-width 2px, rounded caps/joins
  2. Paleta ograniczona: max 3 kolory z palety Długomat per ilustracja
     (np. dlug-200 + dlug-500 + accent-300)
  3. Shapes: prostokąty, kółka, trójkąty, shield shapes
  4. Brak twarzy — żadnych postaci ludzkich. Abstrakcja.
     Dokumenty, tarcze, zegary, zamki — ale nie ludzie.
  5. Brak stock photos — nigdy, w żadnym kontekście.
  6. Format: SVG inline (dla animacji) lub SVG jako asset
  7. Rozmiary: max 200x200px dla empty states, max 400px width 
     dla hero/feature sections
  
  Przykłady ilustracji:
  - Hero: Shield z § — geometryczny, 3 warstwy głębi (opacity layers)
  - Empty state "brak spraw": Shield z checkmark wewnątrz
  - Empty state "brak dokumentów": Folder z powiększonym X
  - Feature "OCR": Dokument z linią skanowania (animowana)
  - Feature "AI": Sparkles nad dokumentem
  - Feature "PDF": Dokument z pieczątką ✓
  
  PROHIBITED:
  - Stock photography
  - Emoji jako ikony UI (emoji dozwolone wyłącznie w treści bloga)
  - Gradienty w ilustracjach (flat only)
  - Efekty 3D, cienie w ilustracjach
  - Ilustracje z ludźmi, twarzami, rąk
  - Clipart, karuzelowe banery, ozdobne separatory

3.14 IKONY
SYSTEM IKON: Lucide Icons (MIT license)
  - Rozmiary: 16px (inline), 20px (nav, buttons), 24px (feature cards), 
              32px (section headers), 48px (hero features)
  - Stroke-width: 2px (default), 1.5px (for ≥32px icons)
  - Color: inherit from parent text color (via currentColor)
  
  NIGDY nie mieszać icon packs. Wyłącznie Lucide. Jeśli brakuje 
  ikony — stworzyć custom SVG w stylu Lucide (2px stroke, 
  24x24 viewBox, rounded caps).
  
  Ikony per moduł (definitive list):
    D1 Skaner:         ScanSearch
    D2 Sprzeciwomat:   ShieldAlert  
    D3 KomornikShield:  Gavel
    D4 PotrąceniaStop:  Scissors
    D5 BIK-Fix:        CreditCard
    D6 CesjaCheck:     FileSearch
    D7 UgodoMat:       Handshake
    D8 Upadłość-Lite:  LifeBuoy
    
  Ikony systemowe:
    Dashboard:     LayoutDashboard
    Sprawy:        Briefcase
    Terminy:       CalendarClock
    Dokumenty:     FileText
    Płatności:     Receipt
    Ustawienia:    Settings
    Pomoc:         HelpCircle
    Wyloguj:       LogOut
    Szukaj:        Search
    Powiadomienia: Bell
    Upload:        UploadCloud
    Pobierz:       Download
    Edytuj:        Pencil
    Usuń:          Trash2
    Sukces:        CheckCircle
    Błąd:          XCircle
    Ostrzeżenie:   AlertTriangle
    Info:          Info

3.15 FORMULARZE — SZCZEGÓŁOWE STYLE KOMPONENTÓW
TEXT INPUT:
  Height: 44px
  Padding: 12px 14px
  Border: 1px iron-300
  Radius: --radius-md (10px)
  Bg: white
  Font: Inter 15px 400 iron-900
  Placeholder: Inter 15px 400 iron-400
  
  Focus: border dlug-500 (2px), shadow --shadow-focus, bg white
  Error: border danger-500 (2px), bg danger-50
  Disabled: bg iron-100, text iron-500, cursor-not-allowed, border iron-200
  
  Transition: border-Kontynuuję dokładnie od urwanego miejsca:
  Transition: border-color 150ms ease, box-shadow 150ms ease, 
              background-color 150ms ease

  /* Wariant z ikoną (left icon inside input) */
  Icon-left variant:
    Padding-left: 42px (14px + 20px icon + 8px gap)
    Icon: absolute, left 14px, top 50%, transform -translateY(50%)
    Icon size: 18px, color iron-400
    Focus: icon color → dlug-500
    Error: icon color → danger-500
    
  /* Wariant z sufiksem (np. "zł", "%") */
  Suffix variant:
    Padding-right: 48px
    Suffix text: absolute, right 14px, top 50%, transform -translateY(50%)
    Inter 14px 500 iron-400
    Pointer-events: none (nie blokuje kliknięcia w input)
    
  /* Wariant z przyciskiem wewnętrznym (np. show/hide password, clear) */
  Action-right variant:
    Padding-right: 44px
    Button: absolute, right 8px, top 50%, transform -translateY(50%)
    Size: 28x28px, radius-md, bg transparent
    Icon: 16px iron-400
    Hover: bg iron-100, icon iron-600
    Focus-visible: shadow --shadow-focus

  /* Wariant z maską (PESEL, telefon, kod pocztowy) */
  Masked input:
    PESEL: XX-XXXXXXXXX (auto-format on type, cyfry only)
    Telefon: +48 XXX XXX XXX (auto-spacje, prefix locked)
    Kod pocztowy: XX-XXX (auto-myślnik po 2 cyfrach)
    NIP: XXX-XXX-XX-XX
    Sygnatura akt: free text, ale regex validation on blur:
      /^[IVX]+\s+(Nc|C|Co|GC|GCo|Km|Kmp)\s+\d{1,6}\/\d{2,4}$/
    Font dla masked inputs: JetBrains Mono 15px 400
    Cel: monospace zapewnia równe szerokości znaków, 
         krytyczne dla danych prawnych
    
  /* Group inputs (np. adres: ulica + nr + mieszkanie w jednym wierszu) */
  Input group:
    Flex row, gap-3
    First input: flex-[3] (ulica — najszersze)
    Second input: flex-[1] (nr domu — wąskie)
    Third input: flex-[1] (nr mieszkania — wąskie, optional label)
    Mobile (<640px): stack vertically, each full-width
    Border-radius shared: 
      NIE — każdy input ma własny radius. Grouping to layout, nie wizualna fuzja.
TEXTAREA:
  Min-height: 120px
  Max-height: 320px (resize: vertical, max constrained via JS)
  Padding: 14px 14px
  Border: 1px iron-300
  Radius: --radius-md (10px)
  Bg: white
  Font: Inter 15px 400 iron-900, leading-relaxed (1.625)
  Placeholder: Inter 15px 400 iron-400
  
  Focus: border dlug-500 (2px), shadow --shadow-focus
  Error: border danger-500 (2px), bg danger-50
  Disabled: bg iron-100, text iron-500, cursor-not-allowed
  
  Character counter (positioned bottom-right inside textarea container):
    Position: absolute, bottom 8px, right 12px
    Font: Inter 12px 400
    Color logic:
      0-79% capacity: iron-400
      80-94% capacity: warn-600
      95-99% capacity: danger-500
      100% (at limit): danger-600, font-weight 600
    Format: "234 / 500"
    Bg: white/80% (semi-transparent to not obstruct last line)
    Padding: 2px 6px, radius-sm
    
  Auto-resize variant (used in chat/note contexts):
    Min-height: 44px (single line)
    Grows with content up to max-height
    Overflow-y: hidden until max → then scroll
    JS: textarea.style.height = 'auto'; 
        textarea.style.height = textarea.scrollHeight + 'px';
    Transition: height 100ms ease (smooth growth)
SELECT (Custom — Radix UI Select):
  Trigger:
    Identical to text input: h-[44px], px-3.5, border 1px iron-300
    Radius: --radius-md
    Bg: white
    Text: Inter 15px 400 iron-900
    Placeholder (no selection): Inter 15px 400 iron-400
    Chevron: ChevronDown 16px iron-400, absolute right 14px
    Focus: border dlug-500, shadow --shadow-focus
    Open state: border dlug-500, chevron rotates 180° (200ms ease)
    
  Content (dropdown panel):
    Bg: white
    Border: 1px iron-200
    Radius: --radius-lg (14px)
    Shadow: --shadow-xl
    Padding: 6px
    Max-height: 280px
    Overflow-y: auto (custom scrollbar: 4px width, 
                thumb iron-300, track transparent, radius-full)
    
    Animation open: 
      scale-y 0.96 → 1.0, opacity 0 → 1
      Transform-origin: top
      Duration: 150ms ease-out
    Animation close:
      opacity 1 → 0
      Duration: 100ms ease-in
    
  Item:
    Padding: 10px 12px
    Radius: --radius-md (8px)
    Font: Inter 15px 400 iron-800
    
    Hover: bg dlug-50, text iron-900
    Focus (keyboard): bg dlug-50, outline none 
      (visual focus indicated by bg, not ring — 
       because ring inside dropdown is noisy)
    Selected: bg dlug-100, text dlug-700, font-weight 500
      Check icon: right side, 16px dlug-500
    Disabled item: text iron-400, cursor-not-allowed, no hover
    
  Group label (for grouped selects):
    Font: Inter 12px 600 iron-500, uppercase, tracking-wider
    Padding: 8px 12px 4px
    Not selectable, not focusable
    
  Separator (between groups):
    Height: 1px, bg iron-100, mx-2, my-1
    
  Empty state (no matching items after filter):
    Center: "Brak wyników" Inter 14px 400 iron-500
    Padding: 20px
COMBOBOX (Search + Select — Radix Combobox):
  Użycie: sąd (lista 300+ sądów), miasto, wierzyciel
  
  Trigger: text input z ikoną Search left + ChevronDown right
    User types → filters dropdown in real-time
    Debounce: 150ms
    Min chars to open: 2 (for large lists) or 0 (for small lists ≤20)
    
  Dropdown: identical to Select Content
    Matching text highlighted: 
      <mark> tag, bg dlug-100, text dlug-700, 
      padding 0 1px, radius 2px
    
  No match: 
    "Nie znaleziono sądu o takiej nazwie" Inter 14px iron-500
    + link: "Zgłoś brakujący sąd →" dlug-500, 13px
    
  Selected value: displayed in input, ChevronDown → X button (clear)
  
  Keyboard:
    ArrowDown/Up: navigate items
    Enter: select highlighted
    Escape: close dropdown, keep current value
    Type: filters list
CHECKBOX:
  Container: flex row, gap-3, align-start (nie center — 
             dla multi-line labels alignment is better at top)
  
  Box:
    Size: 20x20px
    Border-radius: 6px
    Unchecked: 
      Border: 2px iron-300
      Bg: white
    Hover (unchecked): 
      Border: 2px iron-400
      Bg: iron-50
    Checked:
      Bg: dlug-500
      Border: 2px dlug-500
      Icon: check SVG path, white, stroke-width 2.5px
      Animation: 
        Background: instant (no delay — responsiveness matters)
        Check path: draw from stroke-dashoffset full → 0
        Duration: 200ms ease-out
        Slight overshoot: scale box 1.0 → 1.06 → 1.0 (150ms spring)
    Focus: 
      Shadow: --shadow-focus (0 0 0 3px rgba(43, 105, 202, 0.35))
      Widoczny TYLKO z keyboard (focus-visible), nie na click
    Disabled:
      Box: bg iron-100, border iron-200
      Check (if checked+disabled): iron-400
      Label: iron-400
    Error state:
      Box border: danger-500
      Error message below: same as text input error style
    
  Label:
    Font: Inter 15px 400 iron-800
    Cursor: pointer (cały label klikalny)
    Multi-line: leading-snug (1.375)
    
  Description (optional, below label):
    Font: Inter 13px 400 iron-500
    Margin-top: 2px
    Use case: legal consent checkboxes — długi tekst wyjaśniający

  Indeterminate state (for parent checkbox in tree):
    Bg: dlug-500, border dlug-500
    Icon: horizontal dash (—), white, 2px stroke, centered
    Animation: same as checked
RADIO GROUP:
  Container: flex col, gap-3 (vertical) lub flex row, gap-6 (horizontal)
  Horizontal layout: only when ≤3 options AND labels are short (≤20 chars)
  
  Radio button:
    Size: 20x20px, fully round (border-radius: 50%)
    Unchecked:
      Border: 2px iron-300
      Bg: white
    Hover (unchecked):
      Border: 2px iron-400
      Bg: iron-50
    Selected:
      Border: 2px dlug-500
      Inner dot: 10px circle, bg dlug-500
      Animation: 
        Inner dot scale 0 → 1.1 → 1.0 (200ms spring)
    Focus: shadow --shadow-focus (focus-visible only)
    Disabled: border iron-200, dot iron-400, label iron-400
    
  Label: Inter 15px 400 iron-800, ml-3, cursor-pointer
  Description: Inter 13px 400 iron-500, ml-[calc(20px+12px)] 
               (aligned with label text, not radio)
CARD SELECT (custom — used in wizards for choosing options):
  Layout: grid, gap-4
    2 columns (desktop ≥768px)
    1 column (mobile <768px)
    3 columns ONLY when ≥6 options AND labels short
  
  Card option:
    Border: 1.5px iron-200
    Radius: --radius-lg (14px)
    Padding: 20px
    Bg: white
    Cursor: pointer
    Transition: all 200ms ease
    
    Content layout: flex row, gap-14px, align-start
      Left (optional): icon container
        Size: 40x40px, radius-lg
        Bg: iron-100
        Icon: 20px iron-600
      Center: flex col
        Label: Inter 15px 600 iron-900
        Description: Inter 13px 400 iron-600, mt-1, leading-snug
        Badge (optional): inline, mt-2
          Bg: dlug-50, text dlug-600, Inter 11px 600, 
          px-2 py-0.5, radius-sm, uppercase, tracking-wide
          Np: "NAJCZĘŚCIEJ WYBIERANY"
      Right: selection indicator
        Unchecked: 20px circle, border 2px iron-300, bg white
        Checked: 20px circle, bg dlug-500, white check 12px
    
    States:
      Default: border iron-200, shadow-xs
      Hover: border dlug-200, bg dlug-50/50%, shadow-sm
        Icon container bg: dlug-100
        Icon color: dlug-500
      Selected: 
        Border: 2px dlug-500
        Bg: dlug-50
        Shadow: --shadow-sm
        Icon container bg: dlug-100
        Icon color: dlug-600
        Label color: dlug-800
      Focus (keyboard): shadow --shadow-focus, border dlug-500
      Disabled: opacity 0.5, cursor-not-allowed, no hover

    Animation on select:
      Border color: 150ms ease
      Check indicator: scale 0 → 1.0 (200ms spring)
      Background: 150ms ease
      
  Multi-select variant:
    Same visual, but checkbox instead of radio indicator
    Multiple cards can be selected simultaneously
    Use case: "Wybierz wszystkie powody sprzeciwu"
    
  Keyboard:
    Arrow keys navigate between cards
    Space/Enter toggles selection
    Tab moves to next form element (not next card)
TOGGLE SWITCH:
  Track:
    Size: 44px × 24px
    Radius: --radius-full
    Off: bg iron-200
    On: bg dlug-500
    Transition: background-color 200ms ease
    
  Thumb:
    Size: 20px × 20px circle
    Bg: white
    Shadow: --shadow-sm
    Position: 
      Off: left 2px
      On: right 2px (translateX: 20px)
    Transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1)
    
  Focus: track gets shadow --shadow-focus
  Disabled: track bg iron-100, thumb bg iron-200, opacity 0.6
  
  Label (right of switch):
    Inter 15px 500 iron-800, ml-3
    Description below (optional): Inter 13px 400 iron-500
    
  Use cases in Długomat:
    "Powiadomienia email" — toggle
    "Powiadomienia SMS" — toggle
    "Tryb ciemny" — toggle
    "Automatyczne usuwanie danych po 30 dniach" — toggle
DATE PICKER (Radix / custom):
  Trigger: text input style, calendar icon right (18px iron-400)
  Format displayed: "24 kwietnia 2026" (human-readable PL)
  Format stored: "2026-04-24" (ISO 8601)
  
  Calendar dropdown:
    Bg: white, shadow-2xl, radius-xl, border iron-200, p-4
    Width: 320px
    
    Header: flex row between
      Month/Year: Inter 15px 600 iron-900
      Arrows: ChevronLeft / ChevronRight, 18px, iron-500
        Hover: iron-800, bg iron-100, radius-md
        
    Weekday headers: 
      Inter 12px 500 iron-400, center, uppercase
      "Pn  Wt  Śr  Cz  Pt  Sb  Nd"
      
    Day cells: grid 7-col, gap-1
      Size: 36x36px, radius-md, center
      Default: Inter 14px 400 iron-800
      Hover: bg dlug-50, text dlug-700
      Today: border 1.5px dlug-400, font-weight 600
      Selected: bg dlug-500, text white, font-weight 600
      Disabled (past dates for deadline picker): iron-300, 
        cursor-not-allowed, no hover
      Range (if applicable): bg dlug-100 between start/end
      
    Special: deadline dates
      Dates that are legally significant (14-day deadline etc.)
      Highlighted: bg warn-50, text warn-700, border warn-300
      Tooltip on hover: "Ostatni dzień na złożenie sprzeciwu"
      
    Keyboard:
      Arrow keys: navigate days
      Enter: select
      Escape: close
      Page Up/Down: previous/next month
      
    Mobile: 
      Calendar opens as bottom sheet (not dropdown)
      Full-width, radius-xl top corners
      Backdrop: iron-950/60%, click outside closes
      Swipe down to dismiss
FILE UPLOAD (Drag & Drop):
  Komponent: FileDropzone
  
  Default state:
    Border: 2px dashed iron-300
    Radius: --radius-xl (18px)
    Bg: iron-50
    Min-height: 180px
    Padding: 32px
    Display: flex col, align-center, justify-center, gap-4
    Cursor: pointer
    
    Icon: UploadCloud 48px iron-300
    Heading: "Przeciągnij plik lub kliknij" 
             Inter 16px 600 iron-700
    Subtext: "JPG, PNG lub PDF · maksymalnie 10 MB"
             Inter 14px 400 iron-500
    Button (alternative): [Wybierz plik] 
             ghost button sm, dlug-500
    
  Hover / drag-over:
    Border: 2px dashed dlug-400
    Bg: dlug-50
    Icon color: dlug-400
    Heading color: dlug-700
    Scale: 1.01 (subtle, 200ms ease)
    
  Active drop (file hovering over):
    Border: 2px solid dlug-500
    Bg: dlug-100
    Shadow: inset 0 0 0 4px dlug-100
    Icon: animated bounce-gentle (translateY 0→-4px→0, 600ms)
    
  File selected (replaces dropzone content):
    Border: 1.5px solid iron-200 (solid, not dashed)
    Bg: white
    Padding: 16px
    Flex row, gap-12px, align-center
    
    Thumbnail: 
      If image: 48x48px, radius-md, object-cover, border iron-200
      If PDF: FileText icon 48px in iron-100 bg circle
    
    Info: flex col
      Filename: Inter 14px 600 iron-800, truncate max-width 280px
      File size: Inter 12px 400 iron-500, "2.4 MB"
      
    Actions (right):
      [✕ Usuń] — icon button, ghost, danger-500 on hover
      
  Upload progress (during OCR/upload):
    Below file info: 
      Progress bar: h-1.5, bg iron-200, radius-full
      Fill: dlug-500, animated width 0→100%, ease
      Label below: Inter 12px 400 iron-500
        "Przesyłanie... 67%" → "Rozpoznawanie tekstu..." → "Gotowe ✓"
      Scanning animation overlay: 
        Thin line (2px, dlug-300/50%) sweeping top→bottom 
        of thumbnail, 2s infinite (during OCR phase only)
        
  Error state:
    Border: 2px dashed danger-300
    Bg: danger-50
    Icon: AlertCircle 48px danger-400
    Heading: "Nie udało się przesłać pliku" Inter 16px 600 danger-700
    Subtext: error message, Inter 14px 400 danger-600
      "Plik jest za duży (max 10 MB)" lub
      "Nieobsługiwany format — użyj JPG, PNG lub PDF" lub
      "Błąd serwera — spróbuj ponownie"
    [Spróbuj ponownie] ghost button sm, danger-500
    
  Multiple files variant (for KomornikShield — multiple documents):
    After first file: dropzone shrinks to compact (h-16, horizontal)
    Files list below: flex col, gap-2
    Each file: same as "file selected" row
    Max files: 5 (configurable)
    Reorder: drag handle (GripVertical icon, left side)
MODAL / DIALOG (Radix Dialog):
  Overlay:
    Bg: iron-950/60% (rgba(10, 13, 20, 0.60))
    Backdrop-filter: blur(4px)
    Animation: opacity 0→1, 200ms ease-out
    Click outside: closes modal (unless preventClose flag)
    
  Content:
    Bg: white (light) / --bg-modal (dark)
    Radius: --radius-xl (18px)
    Shadow: --shadow-2xl
    Max-width: 520px (default), 640px (large), 400px (small)
    Max-height: calc(100vh - 64px)
    Overflow-y: auto (for long content)
    Margin: 32px auto
    
    Animation:
      Enter: scale 0.96→1.0, opacity 0→1, 200ms ease-out
      Exit: scale 1.0→0.98, opacity 1→0, 150ms ease-in
      prefers-reduced-motion: opacity only, 150ms
    
  Structure:
    ┌─────────────────────────────────────────┐
    │ HEADER: flex row between, p-6 pb-0      │
    │  Left: H3 (Inter 700 --text-h3 iron-900)│
    │  Right: X button (icon-only ghost,       │
    │    iron-400, hover iron-600, 32x32px)   │
    ├─────────────────────────────────────────┤
    │ BODY: p-6, flex col, gap-4              │
    │  Description: Inter 15px 400 iron-600   │
    │  Form fields / content                  │
    ├─────────────────────────────────────────┤
    │ FOOTER: flex row justify-end, gap-3,    │
    │   p-6 pt-0                              │
    │  [Anuluj] ghost button                  │
    │  [Potwierdź] primary button             │
    └─────────────────────────────────────────┘
    
  Danger modal (delete confirmation):
    Icon: AlertTriangle 48px danger-500, center, mb-4
    Heading: center
    Description: center, max-width 360px
    CTA: [Usuń] danger button, full-width
    Cancel: ghost button, full-width, below danger button
    
  Keyboard:
    Escape: close (always)
    Tab: trapped inside modal (focus trap)
    Initial focus: first focusable element (or close button)
    Return focus: to trigger element on close
    
  Mobile (<640px):
    Converted to bottom sheet:
      Radius: radius-xl radius-xl 0 0 (top corners only)
      Max-height: 85vh
      Width: 100%
      Bottom: 0
      Animation: slide-up from bottom (translateY 100%→0%, 250ms spring)
      Drag handle: centered top, 36x4px, bg iron-300, radius-full, mt-2
      Swipe down to dismiss (threshold: 100px translateY)
ACCORDION / COLLAPSIBLE (Radix Accordion):
  Usage: FAQ section, Legal Tip Panel (mobile), additional info blocks
  
  Item container:
    Border-bottom: 1px iron-200
    First item: border-top: 1px iron-200
    
  Trigger:
    Flex row between, py-5, px-0, w-full
    Text: Inter 16px 600 iron-900
    Icon: ChevronDown 18px iron-500, right side
    
    Hover: text dlug-600
    Focus: outline none, text dlug-600 (subtle — no ring inside accordion)
    
    Open state:
      Icon: rotated 180° (transition: transform 200ms ease)
      Text color: dlug-700
      
  Content:
    Animation:
      Open: height 0→auto, opacity 0→1
        Duration: 250ms cubic-bezier(0.16, 1, 0.3, 1)
      Close: height auto→0, opacity 1→0
        Duration: 200ms ease-in
    
    Padding: pb-5 (top padding from gap with trigger)
    Text: Inter 15px 400 iron-700, leading-relaxed
    Max-width: 640px (prevent ultra-wide paragraphs)
    
    Links inside: dlug-500, hover underline
    
  Single-expand variant (FAQ): only one item open at a time
  Multi-expand variant (settings): multiple items can be open
TABS (Radix Tabs):
  Usage: document detail page (Podgląd / Dane / Historia), 
         settings page, module comparison
  
  Tab list:
    Flex row, border-bottom 2px iron-200, gap-0
    Overflow-x: auto on mobile (horizontal scroll, no scrollbar visible)
    
  Tab trigger:
    Padding: 12px 20px
    Font: Inter 14px 500 iron-600
    Border-bottom: 2px transparent (overlay on list border)
    Position: relative, bottom -2px (sits on top of list border)
    Transition: color 150ms, border-color 150ms
    
    Hover: text iron-800
    Active: 
      Text: dlug-600, font-weight 600
      Border-bottom: 2px dlug-500
    Focus (keyboard): 
      text dlug-600, subtle bg dlug-50, radius-t-md
    Disabled: iron-400, cursor-not-allowed
    
  Tab content:
    Padding-top: 24px
    Animation: opacity 0→1, 150ms ease (no slide — tabs should feel instant)
    
  Badge on tab (notification count):
    Inline after label, ml-2
    Min-width: 20px, h-5, radius-full
    Bg: danger-500, text white, Inter 11px 700, center
    Np: "Historia (3)" — 3 new events
BREADCRUMB:
  Location: top of main content area, above page title
  
  Container: flex row, align-center, gap-2, mb-4
  
  Items:
    Text: Inter 13px 500 iron-500
    Separator: ChevronRight 14px iron-400, mx-0
    Link: hover text dlug-500, hover underline
    Current (last item): iron-800, font-weight 600, not a link
    
  Truncation (>4 levels): 
    Show first + "..." dropdown + last 2
    "..." is a button → Radix dropdown with middle items
    
  Example:
    Panel  ›  Sprawy  ›  Sprzeciw EPU  ›  I Nc 3847/26
    [link]    [link]      [link]           [current, bold]
    
  Mobile (<640px):
    Show only: [← Sprzeciw EPU] (back button style)
    Replaces full breadcrumb — simpler, touchable
    Inter 14px 500 dlug-500, flex row, gap-1.5, align-center
    ChevronLeft 16px
BADGE / TAG:
  Variants by purpose:

  STATUS BADGE (on case cards, document cards):
    Size: h-6, px-2.5, radius-full
    Font: Inter 11px 600, uppercase, tracking-wide
    
    Nowy:       bg dlug-100,    text dlug-700
    W toku:     bg dlug-50,     text dlug-600
    Wygenerowany: bg accent-100, text accent-700
    Opłacony:   bg accent-50,   text accent-600
    Wysłany:    bg iron-100,    text iron-700
    Zakończony: bg accent-100,  text accent-700, icon Check 12px
    Odrzucony:  bg danger-100,  text danger-700, icon X 12px
    Przeterminowany: bg danger-50, text danger-600
    
  MODULE BADGE (identifying which module):
    Size: h-6, px-2.5, radius-full
    Font: Inter 11px 600
    Bg: {module-color}-50
    Text: {module-color}-700
    Icon: module icon 12px, mr-1
    Np: "🛡️ Sprzeciwomat EPU" in dlug-50/dlug-700
    
  INFO BADGE (pricing, features):
    Bg: dlug-500 (lub accent-500)
    Text: white
    Size: h-6, px-3, radius-full
    Font: Inter 11px 700, uppercase, tracking-widest
    Np: "NAJPOPULARNIEJSZY", "NOWY", "PREMIUM"
    
  COUNTER BADGE (notifications):
    Min-width: 20px, h-5, radius-full
    Bg: danger-500, text white
    Font: Inter 11px 700, center
    Position: absolute, top -4px, right -4px (relative to icon)
    Content: number (max "99+")
    Animation: scale 0→1.1→1.0 (200ms spring) on new count
TOOLTIP:
  Trigger: hover (desktop) / long-press (mobile) / focus (keyboard)
  Delay: 300ms (show), 100ms (hide)
  
  Content:
    Bg: iron-900 (dark tooltip on light UI)
    Text: white, Inter 13px 400, leading-snug
    Padding: 8px 12px
    Radius: --radius-md (10px)
    Shadow: --shadow-lg
    Max-width: 240px
    
  Arrow: 6px, same bg as content, centered on trigger edge
  
  Positioning: auto (Radix handles — prefers top, falls back 
               to bottom/left/right based on viewport)
  
  Animation:
    Enter: opacity 0→1, translateY(4px)→0, 150ms ease-out
    Exit: opacity 1→0, 100ms ease-in
    
  Rich tooltip variant (with title + description):
    Bg: white, border iron-200, shadow-xl
    Title: Inter 14px 600 iron-900
    Description: Inter 13px 400 iron-600, mt-1
    Max-width: 280px
    Padding: 14px 16px
    
  Use in Długomat:
    - Icon tooltips in sidebar (collapsed tablet mode)
    - Info icons (ⓘ) next to legal terms
    - OCR confidence explanation
    - Success estimator methodology
    - Form field help text (alternative to helper text below)
    - Button tooltips for icon-only buttons
NOTIFICATION BELL (header component):
  Icon: Bell 20px iron-600
  Container: relative, 36x36px, radius-md, center
  Hover: bg iron-100
  
  Badge (when unread):
    Position: absolute top-0 right-0
    Size: 8px circle (no number — just dot indicator)
    Bg: danger-500
    Border: 2px white (creates gap between dot and icon)
    Animation: scale 0→1 (150ms spring) when new notification arrives
    
  Dropdown (Radix Popover):
    Width: 380px
    Max-height: 480px
    Bg: white, shadow-2xl, radius-xl, border iron-200
    
    Header: flex row between, p-4 pb-3, border-bottom iron-100
      "Powiadomienia" Inter 15px 600 iron-900
      [Oznacz jako przeczytane] text link, Inter 12px dlug-500
      
    List: flex col, overflow-y auto
      Item: p-4, border-bottom iron-50, cursor-pointer
        Unread: bg dlug-50/30%, dot 8px dlug-500 (left side)
        Read: bg white
        
        Flex row, gap-3
        Left: icon container 36x36 radius-lg
          Deadline reminder: CalendarClock, warn-100 bg, warn-600 icon
          Document ready: FileCheck, accent-100 bg, accent-600 icon
          Payment: Receipt, dlug-100 bg, dlug-600 icon
          System: Info, iron-100 bg, iron-600 icon
          
        Center: flex col
          Title: Inter 14px 500 iron-800, truncate 1 line
            "Termin za 3 dni: Sprzeciw I Nc 3847/26"
          Description: Inter 13px 400 iron-500, truncate 2 lines
            "Złóż sprzeciw przed 28 kwietnia 2026"
          Time: Inter 12px 400 iron-400, mt-1
            "2 godziny temu"
            
        Hover: bg iron-50
        
    Footer: p-3, border-top iron-100, center
      [Zobacz wszystkie powiadomienia →] 
      text link, Inter 13px 500 dlug-500
      
    Empty state:
      Center, p-8
      Icon: BellOff 40px iron-300
      "Brak nowych powiadomień"
      Inter 14px 400 iron-500
      
    Mobile: full bottom sheet instead of dropdown
SEARCH (Command Palette — ⌘K):
  Trigger: 
    Desktop: ⌘K (Mac) / Ctrl+K (Win) keyboard shortcut
    Also: Search icon in header → opens palette
    Search input in header: 
      Bg: iron-100, radius-full, h-9, px-4
      Placeholder: "Szukaj... ⌘K" Inter 14px 400 iron-500
      Click → opens command palette (not inline search)
      
  Palette overlay:
    Bg: iron-950/50% backdrop-blur-sm
    Click outside: close
    
  Palette content:
    Bg: white, shadow-2xl, radius-2xl, border iron-200
    Width: 560px
    Max-height: 480px
    Position: center, top 20vh
    
    Input:
      Full-width, border-bottom iron-200
      h-14, px-5
      Font: Inter 16px 400 iron-900
      Placeholder: "Szukaj spraw, dokumentów, akcji..."
      Icon: Search 20px iron-400 (left)
      Clear: X button (right, visible when text entered)
      No border-radius on input (inherits from parent top radius)
      
    Results: flex col, overflow-y auto, p-2
      Group header: Inter 12px 600 iron-500, px-3, py-2, uppercase
        "SPRAWY", "DOKUMENTY", "AKCJE"
        
      Result item: flex row, gap-3, px-3, py-2.5, radius-lg
        Icon: 18px iron-500
        Label: Inter 14px 500 iron-800
        Description: Inter 13px 400 iron-500 (optional)
        Shortcut badge (for actions): Inter 11px iron-400, 
          bg iron-100, px-1.5 py-0.5, radius-sm, monospace
          Np: "Enter", "⌘N"
          
        Hover / keyboard selected: bg iron-100
        
      Np results:
        🔍 SPRAWY
          Briefcase  I Nc 3847/26 — Sprzeciw EPU
          Briefcase  KM 1223/26 — Skarga na komornika
        📄 DOKUMENTY
          FileText  Sprzeciw_I_Nc_3847_26.pdf
        ⚡ AKCJE
          Plus  Nowy sprzeciw EPU                    ⌘N
          ScanSearch  Skanuj dokument                 ⌘U
          CreditCard  Reklamacja BIK                   
          
    Empty state:
      Center, p-8
      "Nie znaleziono wyników dla „xyz""
      Inter 14px 400 iron-500
      
    Keyboard:
      ↑↓: navigate items
      Enter: select/navigate to item
      Escape: close palette
      Type: filters in real-time (debounce 200ms)
      
    Animation:
      Open: scale 0.98→1.0, opacity 0→1, 200ms ease-out
      Close: opacity 1→0, 150ms ease-in
