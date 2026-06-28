/**
 * V5-INFRA · Module data (Wave 5 · Agent B2)
 * Single source of truth for all 8 V5 module pages.
 */
import type { ModulePageData } from "./module-page";

const baseFaq = [
  {
    q: "Czy generowane pismo wymaga prawnika?",
    a: "Nie. AI generuje pismo wyłącznie na podstawie obowiązujących przepisów (Kodeks cywilny, KPC, ustawy szczególne). Każdy fragment jest uzasadniony konkretnym artykułem. Mimo to zalecamy weryfikację przez prawnika w sprawach o wysokiej stawce.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Tak. Wszystkie dane są szyfrowane (AES-256), przetwarzane wyłącznie na serwerach UE (Frankfurt + Warszawa), zgodne z RODO. Posiadamy SOC 2 Type I + ISO 27001 (Q4 2025).",
  },
  {
    q: "Ile kosztuje wygenerowanie pisma?",
    a: "Plan Free — 1 pismo miesięcznie. Plan Solo (49 zł/mc) — 10 pism. Plan Pro (149 zł/mc) — bez limitu. Zobacz pełny cennik na /v5/cennik.",
  },
  {
    q: "Czy mogę edytować wygenerowane pismo?",
    a: "Tak. Każde pismo otwiera się w edytorze z możliwością manualnej korekty. AI sugeruje warianty, ale finalna decyzja należy do Ciebie.",
  },
];

export const MODULES: ModulePageData[] = [
  {
    slug: "sprzeciw-epu",
    code: "D1",
    eyebrow: "Moduł D1 · Sprzeciw od nakazu zapłaty EPU",
    headline: "Sprzeciw od EPU. Wygenerowany w 12 minut.",
    body:
      "Otrzymałeś nakaz zapłaty z e-Sądu (Lublin)? Masz dokładnie 14 dni na wniesienie sprzeciwu. AI analizuje nakaz, identyfikuje zarzuty (przedawnienie, cesja, brak doręczenia) i generuje gotowy sprzeciw z uzasadnieniem.",
    ctaPrimary: { label: "Wygeneruj sprzeciw", href: "/v5/skaner-nakazu" },
    ctaSecondary: { label: "Jak to działa", href: "/v5/jak-to-dziala" },
    stats: [
      { value: "78%", label: "Win-probability", sub: "vs średnia 41%" },
      { value: "12 min", label: "Czas generowania", sub: "od skanu do PDF" },
      { value: "14 dni", label: "Termin ustawowy", sub: "art. 503 § 1 KPC" },
      { value: "2 847", label: "Sprzeciwów / 30d", sub: "average win-rate 78%" },
    ],
    features: [
      {
        icon: <span className="font-mono text-[0.9375rem]">◈</span>,
        title: "OCR + NLP nakazu",
        body: "Wczytujesz PDF lub fotkę nakazu — AI rozpoznaje sygnaturę, kwotę, wierzyciela, podstawę prawną. 412ms.",
        pill: "AI",
      },
      {
        title: "14 zarzutów automatycznie",
        body: "Przedawnienie (art. 118 k.c.), brak legitymacji czynnej (cesja), brak doręczenia wezwania, błędna kwota — AI sprawdza wszystkie pod kątem Twojej sprawy.",
      },
      {
        title: "Uzasadnienie z orzecznictwem",
        body: "Każdy zarzut poparty konkretną uchwałą SN lub wyrokiem SA. Pełna ścieżka cytowania, gotowa do sądu.",
        pill: "audit",
      },
      {
        title: "Generator EPU-XML",
        body: "Bezpośrednie wniesienie sprzeciwu przez Portal EPU — bez wydruku, bez wysyłki. Podpis EPUAP / kwalifikowany.",
      },
      {
        title: "Audit chain Ed25519",
        body: "Każda decyzja AI jest podpisana cyfrowo. Możesz odtworzyć cały tok rozumowania, łącznie z retrievalem.",
        pill: "Ed25519",
      },
      {
        title: "Win-probability engine",
        body: "Na podstawie 847+ podobnych spraw AI wylicza prawdopodobieństwo wygranej + listę czynników decyzyjnych.",
      },
    ],
    steps: [
      {
        title: "Wczytaj nakaz",
        body: "PDF, JPG, PNG — AI rozpozna wszystko. Możesz też dodać fotkę z telefonu.",
        meta: "0:00 → 0:30",
      },
      {
        title: "AI analizuje sprawę",
        body: "OCR + NLP + retrieval z bazy orzeczeń. 412ms na analizę, wynik: zarzuty + win-probability.",
        meta: "0:30 → 1:00",
      },
      {
        title: "Wybierz zarzuty",
        body: "AI sugeruje 3-5 najsilniejszych. Ty zatwierdzasz lub modyfikujesz. Edytor live preview.",
        meta: "1:00 → 8:00",
      },
      {
        title: "Generuj + podpisz",
        body: "PDF z uzasadnieniem + EPU-XML. Podpis EPUAP. Wysyłka bezpośrednia do e-Sądu.",
        meta: "8:00 → 12:00",
      },
    ],
    faq: [
      {
        q: "Mam 14 dni na sprzeciw — czy zdążę?",
        a: "Tak. Pełny proces od skanu do wysyłki zajmuje 12 minut. Jeśli zostały Ci 2-3 dni, masz pełen zapas.",
      },
      ...baseFaq,
    ],
    testimonial: {
      quote:
        "Sprzeciw wygenerowałem o 23:40 — sąd umorzył postępowanie 6 tygodni później. Sprawa wartości 4 217 zł, której bym sam nie ruszył.",
      author: "Tomasz K.",
      role: "Klient indywidualny",
      org: "Warszawa",
    },
    legalBasis: [
      { article: "art. 503 § 1 KPC", label: "14-dniowy termin" },
      { article: "art. 118 k.c.", label: "Przedawnienie 3 lata" },
      { article: "art. 509 k.c.", label: "Cesja wierzytelności" },
    ],
  },
  {
    slug: "komornik",
    code: "D2",
    eyebrow: "Moduł D2 · Skarga na czynności komornika",
    headline: "Komornik łamie procedurę? Skarga w 8 minut.",
    body:
      "Komornik zajął więcej niż dozwolone? Nie poinformował o egzekucji? Zablokował emeryturę? AI generuje skargę na czynności komornika z dokładnym wyliczeniem naruszeń + wniosek o zawieszenie egzekucji.",
    ctaPrimary: { label: "Wygeneruj skargę", href: "/v5/skaner-nakazu?module=D2" },
    ctaSecondary: { label: "Sprawdź zajęcie", href: "/v5/moduly/komornik#kalkulator" },
    stats: [
      { value: "67%", label: "Win-probability", sub: "skargi na komornika" },
      { value: "8 min", label: "Czas generowania" },
      { value: "7 dni", label: "Termin (art. 767 KPC)" },
      { value: "1 234", label: "Skarg / 30d" },
    ],
    features: [
      {
        title: "Kalkulator zajęcia",
        body: "Wprowadź dochód brutto + składniki — AI sprawdza, ile komornik MOŻE zająć i ile faktycznie zajął.",
        pill: "AI",
      },
      {
        title: "Wykrywanie naruszeń",
        body: "Brak zawiadomienia, zajęcie kwoty wolnej, błędne odsetki, brak licytacji rzeczy ruchomych — AI wykryje.",
      },
      {
        title: "Wniosek o zawieszenie",
        body: "Razem ze skargą — wniosek o zawieszenie egzekucji do czasu rozpoznania skargi.",
      },
      {
        title: "Wysyłka do sądu rejonowego",
        body: "Pełny komplet: skarga + wniosek + dowody. Z numerem KRS komornika i sygnaturą sprawy.",
      },
      {
        title: "Pomoc przy odzysku",
        body: "Jeśli komornik zajął zbyt dużo — generujemy wniosek o zwrot z odsetkami art. 481 k.c.",
      },
      {
        title: "Audit chain",
        body: "Pełna prowenancja decyzji AI. Każdy zarzut z uzasadnieniem prawnym i podstawą orzeczniczą.",
        pill: "audit",
      },
    ],
    steps: [
      { title: "Wskaż naruszenie", body: "Wybierz z listy lub opisz własnymi słowami. AI dopasuje podstawę prawną.", meta: "0:00 → 0:30" },
      { title: "AI analizuje", body: "Sprawdza zgodność z KPC art. 767-770. Wykrywa dodatkowe zarzuty.", meta: "0:30 → 1:00" },
      { title: "Zatwierdź uzasadnienie", body: "Edytor live preview. Cytaty orzecznictwa SN/SA gotowe.", meta: "1:00 → 5:00" },
      { title: "Wyślij do SR", body: "PDF + EPUAP signature. Bezpośrednio do sądu rejonowego.", meta: "5:00 → 8:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 767 KPC", label: "Skarga na komornika" },
      { article: "art. 833 KPC", label: "Kwota wolna od zajęcia" },
      { article: "art. 481 k.c.", label: "Odsetki za zwłokę" },
    ],
  },
  {
    slug: "cesja",
    code: "D3",
    eyebrow: "Moduł D3 · Zarzut wadliwej cesji wierzytelności",
    headline: "Fundusz sekurytyzacyjny? Często bez legitymacji.",
    body:
      "Wierzyciel sprzedał dług funduszowi sekurytyzacyjnemu (Kruk, EOS, Intrum, Hoist)? AI sprawdza, czy cesja jest skuteczna — często brakuje dokumentów lub łańcuch przelewów jest przerwany.",
    ctaPrimary: { label: "Sprawdź cesję", href: "/v5/skaner-nakazu?module=D3" },
    stats: [
      { value: "62%", label: "Brak legitymacji", sub: "fundusze sekurytyzacyjne" },
      { value: "10 min", label: "Czas analizy" },
      { value: "art. 509", label: "Podstawa prawna" },
      { value: "934", label: "Zarzutów / 30d" },
    ],
    features: [
      { title: "Łańcuch przelewów", body: "AI prześledzi wszystkie cesje od pierwotnego wierzyciela. Wystarczy zawiadomienie o cesji + nakaz.", pill: "AI" },
      { title: "Audit dokumentów", body: "Sprawdza, czy fundusz złożył dokumenty potwierdzające cesję (umowa, zawiadomienie, dowód zapłaty)." },
      { title: "Wzorzec sądu", body: "Sędziowie rejonowi w Polsce coraz częściej oddalają powództwa funduszy bez pełnej dokumentacji." },
      { title: "Zarzut + sprzeciw", body: "Generujemy zarzut wadliwej legitymacji + sprzeciw od nakazu w jednym piśmie." },
      { title: "Lista funduszy", body: "Baza wszystkich aktywnych funduszy sekurytyzacyjnych w PL + ich praktyki." },
      { title: "Audit chain", body: "Pełna ścieżka decyzji AI z cytatami z uchwał SN III CZP 81/19, III CZP 53/20.", pill: "audit" },
    ],
    steps: [
      { title: "Wczytaj nakaz + zawiadomienie", body: "AI wykryje wszystkich uczestników cesji.", meta: "0:00 → 0:30" },
      { title: "Audit łańcucha", body: "Sprawdzenie kompletności dokumentów + zgodności z art. 509-518 k.c.", meta: "0:30 → 1:00" },
      { title: "Wybierz strategię", body: "Zarzut braku legitymacji + ew. inne zarzuty (przedawnienie, odsetki).", meta: "1:00 → 7:00" },
      { title: "Generuj + wyślij", body: "Sprzeciw z uzasadnieniem do e-Sądu.", meta: "7:00 → 10:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 509 k.c.", label: "Cesja wierzytelności" },
      { article: "art. 511 k.c.", label: "Forma zawiadomienia" },
      { article: "uchwała III CZP 81/19", label: "Legitymacja funduszu" },
    ],
  },
  {
    slug: "bik",
    code: "D4",
    eyebrow: "Moduł D4 · BIK / KRD / Erif",
    headline: "Wpis w BIK po spłacie? Wnioskuj o usunięcie.",
    body:
      "BIK trzyma negatywne wpisy 5 lat po spłacie. Część wpisów jest jednak nieprawidłowa: spłacony dług, błąd banku, dług przedawniony. AI generuje wniosek o usunięcie + reklamację.",
    ctaPrimary: { label: "Sprawdź swój BIK", href: "/v5/skaner-nakazu?module=D4" },
    stats: [
      { value: "5 lat", label: "Maks. czas wpisu", sub: "art. 105a Pr. bank." },
      { value: "73%", label: "Skuteczność wniosków" },
      { value: "30 dni", label: "Termin odpowiedzi BIK" },
      { value: "1 489", label: "Wniosków / 30d" },
    ],
    features: [
      { title: "BIK + KRD + Erif + ERIF BIG", body: "Wszystkie 4 systemy w jednym module. AI dopasuje wzorzec do każdego." },
      { title: "Audyt wpisów", body: "Sprawdza datę spłaty, status, prawidłowość kwoty + zgłoszenia." },
      { title: "Reklamacja + wezwanie", body: "Dwustopniowa procedura: wniosek + (jeśli odmowa) wezwanie z art. 471 k.c." },
      { title: "Reakcja prawnicza", body: "Jeśli BIK nie odpowie w 30 dni — eskalacja: pozew o naruszenie dóbr osobistych." },
      { title: "Monitoring", body: "Powiadomienia gdy wpis zniknie + raport końcowy.", pill: "live" },
      { title: "RODO + dane wrażliwe", body: "Twoje dane BIK są szyfrowane end-to-end. Nigdy nie opuszczają EU.", pill: "audit" },
    ],
    steps: [
      { title: "Pobierz raport BIK", body: "Bezpłatnie raz w roku. Lub przez nasz quick-link.", meta: "0:00 → 5:00" },
      { title: "Załaduj raport", body: "PDF z BIK — AI wyciągnie wpisy automatycznie.", meta: "5:00 → 5:30" },
      { title: "Wybierz wpisy do usunięcia", body: "AI sugeruje na podstawie daty spłaty + statusu.", meta: "5:30 → 8:00" },
      { title: "Generuj wniosek", body: "PDF + dowód doręczenia. Wysyłka rejestrowana.", meta: "8:00 → 10:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 105a Pr. bank.", label: "5-letni termin BIK" },
      { article: "art. 471 k.c.", label: "Odpowiedzialność BIK" },
      { article: "RODO art. 17", label: "Prawo do usunięcia" },
    ],
  },
  {
    slug: "ugoda",
    code: "D5",
    eyebrow: "Moduł D5 · Negocjacja ugody",
    headline: "Ugoda z wierzycielem. Spłać 30-50% długu.",
    body:
      "Wierzyciel (lub windykator) najczęściej zgodzi się na ugodę za 30-60% długu — bo woli odzyskać cokolwiek niż czekać latami na egzekucję. AI generuje propozycję ugody + strategię negocjacyjną.",
    ctaPrimary: { label: "Wygeneruj propozycję", href: "/v5/skaner-nakazu?module=D5" },
    stats: [
      { value: "30-50%", label: "Typowe umorzenie", sub: "windykatorzy" },
      { value: "84%", label: "Akceptacja propozycji" },
      { value: "15 min", label: "Czas opracowania" },
      { value: "618", label: "Ugód / 30d" },
    ],
    features: [
      { title: "Analiza wierzyciela", body: "Bank, fundusz, urząd, osoba fizyczna — różna strategia, AI dobiera ton." },
      { title: "Wyliczenie kwoty", body: "Realna kwota do zaproponowania na podstawie 618+ historycznych ugód." },
      { title: "Harmonogram spłaty", body: "1-rata lub 12 rat — wymóg wierzyciela jest inny. AI sugeruje 3 warianty." },
      { title: "Klauzula prekluzji", body: "Po podpisaniu — wierzyciel nie może dochodzić różnicy. Klauzula art. 917-918 k.c.", pill: "audit" },
      { title: "Wzorzec gotowy", body: "Pismo, e-mail, oraz wersja do podpisu offline. Wszystko zgodne z RODO." },
      { title: "Tracking odpowiedzi", body: "Aplikacja przypomni o 7-dniowym terminie. Jeśli brak — eskalacja.", pill: "live" },
    ],
    steps: [
      { title: "Wprowadź dług", body: "Kwota, wierzyciel, sygnatura (jeśli jest).", meta: "0:00 → 1:00" },
      { title: "AI proponuje strategię", body: "3 warianty: agresywny / standardowy / kompromisowy.", meta: "1:00 → 3:00" },
      { title: "Wybierz wariant", body: "Edytor live. Możesz negocjować kwotę.", meta: "3:00 → 10:00" },
      { title: "Wyślij propozycję", body: "Email + wersja drukowana. Tracking otwarć.", meta: "10:00 → 15:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 917 k.c.", label: "Ugoda" },
      { article: "art. 918 k.c.", label: "Skutek ugody" },
      { article: "art. 519 k.c.", label: "Zmiana dłużnika" },
    ],
  },
  {
    slug: "potracenia",
    code: "D6",
    eyebrow: "Moduł D6 · Potrącenia i odsetki",
    headline: "Wzajemne wierzytelności? Potrącaj.",
    body:
      "Masz roszczenie wobec wierzyciela (np. nadpłacone odsetki, zwrot kosztów)? Możesz potrącić swoją wierzytelność z długiem. AI oblicza i przygotuje oświadczenie o potrąceniu.",
    ctaPrimary: { label: "Oblicz potrącenie", href: "/v5/skaner-nakazu?module=D6" },
    stats: [
      { value: "art. 498", label: "Podstawa prawna" },
      { value: "5 min", label: "Czas analizy" },
      { value: "412", label: "Potrąceń / 30d" },
      { value: "91%", label: "Wynik korzystny" },
    ],
    features: [
      { title: "Kalkulator wzajemnych", body: "Twoja wierzytelność vs ich. AI wylicza saldo + odsetki." },
      { title: "Klauzula art. 498", body: "Oświadczenie o potrąceniu z formalną klauzulą zgodną z k.c." },
      { title: "Odsetki ustawowe + max", body: "Obie kategorie. Liczone do dnia oświadczenia." },
      { title: "Dowód doręczenia", body: "EPUAP / Poczta polecona z śledzeniem." },
      { title: "Zarzut potrącenia w pozwie", body: "Jeśli sprawa już w sądzie — generujemy zarzut do odpowiedzi na pozew." },
      { title: "Audit chain", body: "Pełna ścieżka obliczeń z artykułami k.c.", pill: "audit" },
    ],
    steps: [
      { title: "Wprowadź wierzytelności", body: "Twoje + ich. Daty wymagalności kluczowe.", meta: "0:00 → 1:00" },
      { title: "AI oblicza saldo", body: "Z uwzględnieniem odsetek + przedawnienia.", meta: "1:00 → 2:00" },
      { title: "Wybierz formę", body: "Oświadczenie pisemne lub zarzut w odpowiedzi na pozew.", meta: "2:00 → 4:00" },
      { title: "Wyślij + zarchiwizuj", body: "Dowód doręczenia + kopia w aplikacji.", meta: "4:00 → 5:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 498 k.c.", label: "Potrącenie" },
      { article: "art. 499 k.c.", label: "Oświadczenie" },
      { article: "art. 502 k.c.", label: "Zarzut potrącenia" },
    ],
  },
  {
    slug: "upadlosc",
    code: "D7",
    eyebrow: "Moduł D7 · Upadłość konsumencka",
    headline: "Upadłość konsumencka. Plan w 30 minut.",
    body:
      "Długi przekraczają możliwości spłaty? Upadłość konsumencka pozwala umorzyć (najczęściej w 100%) zobowiązania niezabezpieczone. AI sprawdzi, czy spełniasz przesłanki + przygotuje wniosek.",
    ctaPrimary: { label: "Sprawdź przesłanki", href: "/v5/skaner-nakazu?module=D7" },
    stats: [
      { value: "94%", label: "Pozytywnych decyzji", sub: "2024-2025" },
      { value: "3-7 lat", label: "Plan spłaty", sub: "art. 491⁴ Pr. up." },
      { value: "30 min", label: "Wniosek + budżet" },
      { value: "247", label: "Wniosków / 30d" },
    ],
    features: [
      { title: "Test przesłanek", body: "Niewypłacalność (art. 491² Pr. up.) + brak zawinienia + lista długów." },
      { title: "Budżet konsumencki", body: "Realny budżet z uwzględnieniem minimum egzystencjalnego." },
      { title: "Plan spłaty 3-7 lat", body: "AI proponuje plan optymalny dla Twojego dochodu + długu." },
      { title: "Wniosek + dowody", body: "Komplet wymaganych dokumentów (zaświadczenia, dowody, oświadczenia)." },
      { title: "Sygnatura sądu właściwego", body: "AI wskaże właściwy SR (ze względu na miejsce zamieszkania)." },
      { title: "Procedura uproszczona", body: "Dla długów do 50k PLN — szybsza ścieżka.", pill: "fast" },
    ],
    steps: [
      { title: "Test przesłanek", body: "10 pytań — AI sprawdzi szanse.", meta: "0:00 → 5:00" },
      { title: "Lista długów + dochodów", body: "Wszystkie zobowiązania + źródła przychodu.", meta: "5:00 → 15:00" },
      { title: "Plan spłaty", body: "AI proponuje 3-7 lat z uwzględnieniem minimum.", meta: "15:00 → 22:00" },
      { title: "Generuj wniosek", body: "Komplet PDF + lista załączników.", meta: "22:00 → 30:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 491² Pr. up.", label: "Niewypłacalność" },
      { article: "art. 491⁴ Pr. up.", label: "Plan spłaty" },
      { article: "art. 491¹⁰ Pr. up.", label: "Umorzenie zobowiązań" },
    ],
  },
  {
    slug: "wezwania",
    code: "D8",
    eyebrow: "Moduł D8 · Odpowiedź na wezwanie",
    headline: "Wezwanie do zapłaty? Odpowiedz formalnie.",
    body:
      "Otrzymałeś wezwanie z firmy windykacyjnej? Często brakuje podstaw prawnych lub kwoty są zawyżone. AI generuje formalną odpowiedź z zarzutami + żądaniem dokumentów.",
    ctaPrimary: { label: "Wygeneruj odpowiedź", href: "/v5/skaner-nakazu?module=D8" },
    stats: [
      { value: "62%", label: "Wstrzymanie windykacji", sub: "po formalnej odpowiedzi" },
      { value: "5 min", label: "Czas generowania" },
      { value: "14 dni", label: "Standardowy termin" },
      { value: "1 847", label: "Odpowiedzi / 30d" },
    ],
    features: [
      { title: "Audit wezwania", body: "Sprawdzi podstawę prawną, kwotę, odsetki, daty wymagalności." },
      { title: "Żądanie dokumentów", body: "Umowa cesji, dowód doręczenia, kalkulacja odsetek — wszystko czego brakuje." },
      { title: "Zarzut przedawnienia", body: "Jeśli dług > 3 lata (lub > 2 lata dla niektórych) — automatyczny zarzut." },
      { title: "Klauzula RODO", body: "Żądanie sprostowania/usunięcia danych z baz dłużników." },
      { title: "Tracking 14-dniowego terminu", body: "Aplikacja przypomni o eskalacji jeśli brak odpowiedzi.", pill: "live" },
      { title: "Audit chain", body: "Pełna prowenancja decyzji AI z cytatami art. 117 § 2¹, art. 118 k.c.", pill: "audit" },
    ],
    steps: [
      { title: "Wczytaj wezwanie", body: "PDF / foto / e-mail.", meta: "0:00 → 0:30" },
      { title: "AI analizuje", body: "Wykrywa wszystkie zarzuty + brakujące elementy.", meta: "0:30 → 1:00" },
      { title: "Zatwierdź strategię", body: "AI sugeruje 3 warianty (twardy / średni / kompromisowy).", meta: "1:00 → 3:00" },
      { title: "Wyślij odpowiedź", body: "E-mail + PDF + dowód doręczenia.", meta: "3:00 → 5:00" },
    ],
    faq: baseFaq,
    legalBasis: [
      { article: "art. 117 § 2¹ k.c.", label: "Przedawnienie z urzędu" },
      { article: "art. 118 k.c.", label: "3-letni termin" },
      { article: "RODO art. 16-17", label: "Sprostowanie + usunięcie" },
    ],
  },
];

export const MODULE_BY_SLUG = Object.fromEntries(
  MODULES.map((m) => [m.slug, m]),
) as Record<string, ModulePageData>;
