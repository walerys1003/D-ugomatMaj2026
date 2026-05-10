/**
 * D3 KomornikShield — statyczny fallback dla 6 wariantów pism.
 *
 * Używane gdy AI pipeline jest niedostępny (AiUnavailableError /
 * PromptNotFoundError). Każdy wariant ma odrębną podstawę prawną:
 *
 *   zwolnienie_konta      → art. 8901 §1 KPC, art. 833 KPC (kwoty wolne)
 *   zwolnienie_swiadczen  → art. 833 §6 KPC (świadczenia rodzinne, 500+)
 *   skarga                → art. 767 KPC, termin 7 dni
 *   ograniczenie          → art. 822 KPC
 *   umorzenie             → art. 825 KPC
 *   raty                  → art. 320 KPC (analogicznie)
 *
 * Tarcza ton: stanowczy, formalny polski, bez emocji, z konkretnym petitum.
 */
import {
  KOMORNIK_VARIANTS,
  SYTUACJA_ZYCIOWA,
  ZAJECIE_TYPY,
  type KomornikAnswers,
} from "@/lib/wizard/modules/komornik/schemas";
import { formatDatePL, formatPLN } from "@/lib/utils";

export interface KomornikRenderResult {
  markdown: string;
  promptHash: string;
}

export function renderKomornikMarkdown(
  answers: KomornikAnswers,
): KomornikRenderResult {
  switch (answers.variant) {
    case "zwolnienie_konta":
      return renderZwolnienieKonta(answers);
    case "zwolnienie_swiadczen":
      return renderZwolnienieSwiadczen(answers);
    case "skarga":
      return renderSkarga(answers);
    case "ograniczenie":
      return renderOgraniczenie(answers);
    case "umorzenie":
      return renderUmorzenie(answers);
    case "raty":
      return renderRaty(answers);
    default:
      throw new Error(`Nieznany wariant KomornikShield: ${String(answers.variant)}`);
  }
}

// -----------------------------------------------------------------------------
// Helpers — wspólne fragmenty
// -----------------------------------------------------------------------------

function header(a: KomornikAnswers, today: string): string {
  return `**${escapeMd(a.dluznik_nazwa)}**
${escapeMd(a.dluznik_adres)}
${a.dluznik_pesel ? `PESEL: ${maskedPesel(a.dluznik_pesel)}` : ""}

${today}`.trim();
}

function komornikHeader(a: KomornikAnswers): string {
  return `**${escapeMd(a.kancelaria_nazwa)}**
${a.kancelaria_adres ? escapeMd(a.kancelaria_adres) : "[adres kancelarii]"}

Sygn. akt: **${escapeMd(a.sygnatura_km)}**
Wierzyciel: ${escapeMd(a.wierzyciel)}`;
}

function sytuacjaList(a: KomornikAnswers): string {
  const labels = SYTUACJA_ZYCIOWA.filter((s) =>
    (a.sytuacja ?? []).includes(s.id),
  ).map((s) => `- ${s.label}`);
  if (labels.length === 0) return "";
  return `\n**Sytuacja życiowa wnioskodawcy:**\n${labels.join("\n")}\n`;
}

function okolicznosciSection(a: KomornikAnswers): string {
  if (!a.okolicznosci?.trim()) return "";
  return `\n**Dodatkowe okoliczności:** ${a.okolicznosci.trim()}\n`;
}

function zajecieLabel(a: KomornikAnswers): string {
  return ZAJECIE_TYPY.find((t) => t.id === a.zajecie_typ)?.label ?? a.zajecie_typ ?? "—";
}

function variantLabel(a: KomornikAnswers): string {
  return KOMORNIK_VARIANTS.find((v) => v.id === a.variant)?.label ?? a.variant;
}

function maskedPesel(pesel: string): string {
  if (!/^\d{11}$/.test(pesel)) return pesel;
  return `${pesel.slice(0, 3)}*****${pesel.slice(8)}`;
}

function escapeMd(s: string): string {
  return s.replace(/\*/g, "\\*").replace(/_/g, "\\_");
}

function hash(parts: string[]): string {
  return `static-template:komornik:${parts.join(":")}:v1`;
}

function signature(a: KomornikAnswers): string {
  return `\\______________________
${escapeMd(a.dluznik_nazwa)}`;
}

// -----------------------------------------------------------------------------
// Wariant 1 — Zwolnienie rachunku bankowego (art. 8901 §1 KPC)
// -----------------------------------------------------------------------------
function renderZwolnienieKonta(a: KomornikAnswers): KomornikRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_dochodzona ? formatPLN(Number(a.kwota_dochodzona)) : "—";

  const markdown = `${header(a, today)}

${komornikHeader(a)}

# WNIOSEK o zwolnienie rachunku bankowego spod egzekucji

## I. Identyfikacja postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km)}
- **Wierzyciel:** ${escapeMd(a.wierzyciel)}
- **Zajęty składnik:** ${zajecieLabel(a)}
- **Kwota dochodzona:** ${kwota}

## II. Żądanie

Na podstawie **art. 8901 §1 ustawy z dnia 17 listopada 1964 r. — Kodeks
postępowania cywilnego** w zw. z **art. 833 KPC** wnoszę o:

1. **zwolnienie spod zajęcia** rachunku bankowego prowadzonego na moją rzecz
   w zakresie kwot wolnych od egzekucji,
2. **niezwłoczne wstrzymanie** dalszych czynności egzekucyjnych z tego
   rachunku do czasu rozstrzygnięcia niniejszego wniosku,
3. **przekazanie zwolnionych środków** do mojej dyspozycji.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Zgodnie z **art. 833 §1 i §6 KPC** określone kategorie świadczeń (świadczenia
rodzinne, alimentacyjne, 500+, niektóre zasiłki) **nie podlegają egzekucji**
sądowej. Egzekucja prowadzona z rachunku, na który wpływają takie świadczenia,
wymaga odpowiedniego zwolnienia spod zajęcia.

Ponadto, zgodnie z **art. 54 ust. 1 ustawy Prawo bankowe**, kwota wolna
od zajęcia w każdym miesiącu wynosi 75% minimalnego wynagrodzenia za pracę.

## IV. Załączniki

1. Kopia dokumentu tożsamości (do wglądu).
2. Zaświadczenia / wyciągi potwierdzające pobierane świadczenia (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.sygnatura_km.slice(0, 12)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 2 — Zwolnienie świadczeń (art. 833 §6 KPC)
// -----------------------------------------------------------------------------
function renderZwolnienieSwiadczen(a: KomornikAnswers): KomornikRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_dochodzona ? formatPLN(Number(a.kwota_dochodzona)) : "—";

  const markdown = `${header(a, today)}

${komornikHeader(a)}

# WNIOSEK o zwolnienie świadczeń spod egzekucji

## I. Identyfikacja postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km)}
- **Wierzyciel:** ${escapeMd(a.wierzyciel)}
- **Zajęty składnik:** ${zajecieLabel(a)}
- **Kwota dochodzona:** ${kwota}

## II. Żądanie

Na podstawie **art. 833 §6 KPC** wnoszę o:

1. **całkowite zwolnienie spod egzekucji** świadczeń wymienionych
   w niniejszym piśmie, tj. świadczeń rodzinnych, świadczenia
   wychowawczego (500+), alimentów oraz świadczeń wspomagających rodzinę,
2. **wstrzymanie egzekucji** w zakresie tych świadczeń do czasu
   rozstrzygnięcia wniosku,
3. **zwrot bezprawnie pobranych** świadczeń (jeżeli takie zostały zajęte).

## III. Uzasadnienie

Zgodnie z **art. 833 §6 KPC** egzekucji nie podlegają:
- świadczenia alimentacyjne,
- świadczenia rodzinne (w tym 500+, świadczenia z funduszu alimentacyjnego),
- świadczenia z pomocy społecznej,
- jednorazowe zapomogi z tytułu urodzenia dziecka,
- niektóre zasiłki celowe i okresowe.
${sytuacjaList(a)}${okolicznosciSection(a)}
Ochrona ta ma charakter **bezwzględny** i obejmuje również środki tych
świadczeń wpłacane na rachunek bankowy (zob. orzecznictwo SN, m.in.
postanowienie z 8 marca 2018 r., II CSK 308/17).

## IV. Załączniki

1. Kopia dokumentu tożsamości (do wglądu).
2. Decyzje przyznające świadczenia (do dosłania w terminie 7 dni).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.sygnatura_km.slice(0, 12)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 3 — Skarga na czynność komornika (art. 767 KPC)
// -----------------------------------------------------------------------------
function renderSkarga(a: KomornikAnswers): KomornikRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_dochodzona ? formatPLN(Number(a.kwota_dochodzona)) : "—";
  const dataDoreczenia = a.data_doreczenia
    ? formatDatePL(new Date(a.data_doreczenia))
    : "[__do uzupełnienia__]";

  const markdown = `${header(a, today)}

**Sąd Rejonowy [właściwy ze względu na siedzibę komornika]**
za pośrednictwem:
${komornikHeader(a)}

# SKARGA na czynność komornika

składana w trybie **art. 767 ustawy z dnia 17 listopada 1964 r. — Kodeks
postępowania cywilnego**, w terminie 7 dni od dnia doręczenia czynności
(art. 767 §4 KPC).

## I. Wskazanie postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km)}
- **Wierzyciel:** ${escapeMd(a.wierzyciel)}
- **Data doręczenia czynności:** ${dataDoreczenia}
- **Kwota dochodzona:** ${kwota}

## II. Zaskarżana czynność

${a.czynnosc_komornika ? escapeMd(a.czynnosc_komornika) : "[opis czynności do uzupełnienia]"}

## III. Wnioski

Wnoszę o:

1. **uchylenie zaskarżonej czynności komornika** w całości,
2. **zobowiązanie komornika** do dokonania czynności zgodnie z prawem,
3. **wstrzymanie wykonania zaskarżonej czynności** do czasu rozpoznania
   skargi (art. 767 §1 KPC).

## IV. Uzasadnienie

Zaskarżona czynność narusza przepisy postępowania egzekucyjnego — w
szczególności art. 833 KPC (kwoty i świadczenia wolne od egzekucji)
oraz art. 8901 KPC (ochrona rachunku bankowego).
${sytuacjaList(a)}${okolicznosciSection(a)}
W świetle utrwalonego orzecznictwa Sądu Najwyższego (m.in. uchwała
SN z 26 lutego 2014 r., III CZP 121/13) komornik jest zobowiązany do
weryfikacji charakteru zajętych środków zanim podejmie czynności
egzekucyjne.

## V. Termin

Skargę składam w terminie 7 dni od dnia doręczenia czynności komornika
(${dataDoreczenia}), zgodnie z art. 767 §4 KPC.

## VI. Załączniki

1. Kopia czynności komornika (zaskarżonej).
2. Kopia dokumentu tożsamości (do wglądu).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.sygnatura_km.slice(0, 12)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 4 — Ograniczenie egzekucji (art. 822 KPC)
// -----------------------------------------------------------------------------
function renderOgraniczenie(a: KomornikAnswers): KomornikRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_dochodzona ? formatPLN(Number(a.kwota_dochodzona)) : "—";

  const markdown = `${header(a, today)}

${komornikHeader(a)}

# WNIOSEK o ograniczenie egzekucji

## I. Identyfikacja postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km)}
- **Wierzyciel:** ${escapeMd(a.wierzyciel)}
- **Zajęty składnik:** ${zajecieLabel(a)}
- **Kwota dochodzona:** ${kwota}

## II. Żądanie

Na podstawie **art. 822 KPC** wnoszę o:

1. **ograniczenie zakresu egzekucji** prowadzonej przeciwko mnie do
   minimum koniecznego dla zaspokojenia roszczenia,
2. **wyłączenie spod egzekucji** składników niezbędnych do prowadzenia
   gospodarstwa domowego,
3. **wstrzymanie zajęć** wykraczających poza minimum egzekucyjne.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Egzekucja prowadzona w obecnym zakresie przekracza minimum konieczne dla
zaspokojenia roszczenia wierzyciela i godzi w moje podstawowe potrzeby
życiowe oraz potrzeby osób pozostających na moim utrzymaniu.

Zgodnie z art. 822 KPC komornik powinien stosować taki sposób egzekucji,
który jest najmniej uciążliwy dla dłużnika. Aktualnie prowadzone czynności
naruszają tę zasadę.

## IV. Załączniki

1. Kopia dokumentu tożsamości (do wglądu).
2. Dokumenty potwierdzające sytuację życiową (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.sygnatura_km.slice(0, 12)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 5 — Umorzenie egzekucji (art. 825 KPC)
// -----------------------------------------------------------------------------
function renderUmorzenie(a: KomornikAnswers): KomornikRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_dochodzona ? formatPLN(Number(a.kwota_dochodzona)) : "—";

  const markdown = `${header(a, today)}

${komornikHeader(a)}

# WNIOSEK o umorzenie postępowania egzekucyjnego

## I. Identyfikacja postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km)}
- **Wierzyciel:** ${escapeMd(a.wierzyciel)}
- **Zajęty składnik:** ${zajecieLabel(a)}
- **Kwota dochodzona:** ${kwota}

## II. Żądanie

Na podstawie **art. 825 KPC** wnoszę o:

1. **całkowite umorzenie postępowania egzekucyjnego** prowadzonego pod
   sygn. ${escapeMd(a.sygnatura_km)},
2. **uchylenie wszystkich dokonanych zajęć** i czynności egzekucyjnych,
3. **zwrot pobranych środków** dłużnikowi.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Zgodnie z art. 825 KPC komornik umorzy postępowanie w całości lub w części
z urzędu, jeżeli okaże się, że wierzyciel nie ma już czego dochodzić, lub
na wniosek strony — w przypadkach wskazanych w przepisach.

## IV. Załączniki

1. Kopia dokumentu tożsamości (do wglądu).
2. Dowody potwierdzające podstawy umorzenia (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.sygnatura_km.slice(0, 12)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 6 — Rozłożenie na raty (art. 320 KPC analogicznie)
// -----------------------------------------------------------------------------
function renderRaty(a: KomornikAnswers): KomornikRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_dochodzona ? formatPLN(Number(a.kwota_dochodzona)) : "—";
  const rata = a.rata_miesieczna
    ? formatPLN(Number(a.rata_miesieczna))
    : "[do uzupełnienia]";
  const liczba = a.liczba_rat ?? "[do uzupełnienia]";
  const suma =
    a.rata_miesieczna && a.liczba_rat
      ? formatPLN(Number(a.rata_miesieczna) * Number(a.liczba_rat))
      : "—";
  const dataPierwszej = a.data_pierwszej_raty
    ? formatDatePL(new Date(a.data_pierwszej_raty))
    : "[do uzupełnienia]";

  const markdown = `${header(a, today)}

${komornikHeader(a)}

# WNIOSEK o rozłożenie zaległości na raty

## I. Identyfikacja postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km)}
- **Wierzyciel:** ${escapeMd(a.wierzyciel)}
- **Zajęty składnik:** ${zajecieLabel(a)}
- **Kwota dochodzona:** ${kwota}

## II. Propozycja spłaty

Wnoszę o **rozłożenie zaległości na raty** według następującej propozycji:

- **Rata miesięczna:** ${rata}
- **Liczba rat:** ${liczba}
- **Suma:** ${suma}
- **Data pierwszej raty:** ${dataPierwszej}

Zobowiązuję się do regularnego, terminowego płacenia rat na rachunek
wskazany przez Pana Komornika.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Aktualna sytuacja finansowa nie pozwala mi na jednorazową spłatę całości
należności. Proponowane raty są realnie wykonalne i pozwolą wierzycielowi
na pełne zaspokojenie roszczenia bez konieczności prowadzenia kosztownej
egzekucji.

## IV. Wniosek o wstrzymanie egzekucji

Jednocześnie wnoszę o **wstrzymanie czynności egzekucyjnych** z chwilą
rozpoczęcia spłaty rat zgodnie z powyższą propozycją.

## V. Załączniki

1. Kopia dokumentu tożsamości (do wglądu).
2. Dokumenty potwierdzające możliwości spłaty (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.sygnatura_km.slice(0, 12)]),
  };
}
