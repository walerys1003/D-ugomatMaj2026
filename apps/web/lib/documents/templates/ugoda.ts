/**
 * D7 UgodoMat — statyczny fallback dla 3 wariantów propozycji ugody.
 *
 * Używane gdy AI pipeline jest niedostępny. Każdy wariant bazuje na
 * art. 917 KC (ugoda jako czynność prawna). Pismo nie stanowi uznania
 * długu (art. 123 §1 pkt 2 KC) do czasu akceptacji warunków.
 *
 *   propozycja_raty          → harmonogram miesięcznych rat
 *   propozycja_umorzenie     → kwota do zapłaty + żądanie umorzenia części
 *   propozycja_indywidualna  → mieszana (raty + częściowe umorzenie)
 *
 * Tarcza ton: stanowczy, formalny polski, bez emocji, z konkretną propozycją.
 */
import {
  SYTUACJA_ZYCIOWA,
  UGODA_VARIANTS,
  type UgodaAnswers,
} from "@/lib/wizard/modules/ugoda/schemas";
import { formatDatePL, formatPLN } from "@/lib/utils";

export interface UgodaRenderResult {
  markdown: string;
  promptHash: string;
}

export function renderUgodaMarkdown(
  answers: UgodaAnswers,
): UgodaRenderResult {
  switch (answers.variant) {
    case "propozycja_raty":
      return renderRaty(answers);
    case "propozycja_umorzenie":
      return renderUmorzenie(answers);
    case "propozycja_indywidualna":
      return renderIndywidualna(answers);
    default:
      throw new Error(`Nieznany wariant UgodoMat: ${String(answers.variant)}`);
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function header(a: UgodaAnswers, today: string): string {
  return `**${escapeMd(a.dluznik_nazwa)}**
${escapeMd(a.dluznik_adres)}
${a.dluznik_pesel ? `PESEL: ${maskedPesel(a.dluznik_pesel)}` : ""}

${today}`.trim();
}

function adresat(a: UgodaAnswers): string {
  return `**${escapeMd(a.wierzyciel_nazwa)}**
${a.wierzyciel_adres ? escapeMd(a.wierzyciel_adres) : "[adres wierzyciela]"}
(do działu windykacji / negocjacji)`;
}

function identyfikacja(a: UgodaAnswers): string {
  const lines: string[] = [];
  if (a.numer_umowy) lines.push(`- **Numer umowy:** ${escapeMd(a.numer_umowy)}`);
  if (a.sygnatura) lines.push(`- **Sygnatura sprawy:** ${escapeMd(a.sygnatura)}`);
  lines.push(
    `- **Aktualna kwota zadłużenia:** ${
      a.kwota_zadluzenia ? formatPLN(Number(a.kwota_zadluzenia)) : "—"
    }`,
  );
  if (a.data_wymagalnosci) {
    lines.push(`- **Data wymagalności:** ${formatDatePL(a.data_wymagalnosci)}`);
  }
  return lines.join("\n");
}

function sytuacjaList(a: UgodaAnswers): string {
  const labels = SYTUACJA_ZYCIOWA.filter((s) =>
    (a.sytuacja ?? []).includes(s.id),
  ).map((s) => `- ${s.label}`);
  if (labels.length === 0) return "";
  return `\n**Sytuacja życiowa wnioskodawcy:**\n${labels.join("\n")}\n`;
}

function okolicznosciSection(a: UgodaAnswers): string {
  if (!a.okolicznosci?.trim()) return "";
  return `\n**Dodatkowe uzasadnienie:** ${a.okolicznosci.trim()}\n`;
}

function variantLabel(a: UgodaAnswers): string {
  return UGODA_VARIANTS.find((v) => v.id === a.variant)?.label ?? a.variant;
}

function maskedPesel(pesel: string): string {
  if (!/^\d{11}$/.test(pesel)) return pesel;
  return `${pesel.slice(0, 3)}*****${pesel.slice(8)}`;
}

function escapeMd(s: string): string {
  return s.replace(/\*/g, "\\*").replace(/_/g, "\\_");
}

function hash(parts: string[]): string {
  return `static-template:ugoda:${parts.join(":")}:v1`;
}

function signature(a: UgodaAnswers): string {
  return `\\______________________
${escapeMd(a.dluznik_nazwa)}`;
}

function nieUznanieDlugu(): string {
  return `**Zastrzeżenie:** niniejsza propozycja nie stanowi uznania długu
w rozumieniu art. 123 §1 pkt 2 KC. Wiąże mnie wyłącznie po obustronnym
zawarciu ugody w formie pisemnej (art. 917 KC).`;
}

// -----------------------------------------------------------------------------
// Wariant 1 — Propozycja spłaty w ratach (art. 917 KC)
// -----------------------------------------------------------------------------
function renderRaty(a: UgodaAnswers): UgodaRenderResult {
  const today = formatDatePL(new Date());
  const rata = a.rata_miesieczna ? formatPLN(Number(a.rata_miesieczna)) : "—";
  const liczba = a.liczba_rat ? String(a.liczba_rat) : "—";
  const dataPierwszej = a.data_pierwszej_raty
    ? formatDatePL(a.data_pierwszej_raty)
    : "—";
  const suma =
    typeof a.rata_miesieczna === "number" && typeof a.liczba_rat === "number"
      ? formatPLN(a.rata_miesieczna * a.liczba_rat)
      : "—";

  const markdown = `${header(a, today)}

${adresat(a)}

# PROPOZYCJA UGODY — spłata w ratach

## I. Identyfikacja zobowiązania

${identyfikacja(a)}

## II. Propozycja

Na podstawie **art. 917 ustawy z dnia 23 kwietnia 1964 r. — Kodeks cywilny**
(ugoda) proponuję polubowne rozwiązanie sporu poprzez **spłatę zadłużenia
w ratach** na następujących warunkach:

1. **rata miesięczna:** ${rata}
2. **liczba rat:** ${liczba}
3. **łączna suma rat:** ${suma}
4. **termin pierwszej raty:** ${dataPierwszej}
5. **forma zapłaty:** przelew bankowy na rachunek wierzyciela.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Propozycja jest realna do wykonania przy uwzględnieniu mojej obecnej
sytuacji finansowej. Wybór ścieżki polubownej pozwoli uniknąć kosztów
postępowania sądowego i egzekucyjnego po obu stronach.

## IV. Termin odpowiedzi

Proszę o pisemną odpowiedź w terminie **14 dni** od dnia otrzymania
niniejszego pisma. Po tym terminie propozycja przestaje wiązać.

${nieUznanieDlugu()}

## V. Załączniki

1. Dokumenty potwierdzające sytuację finansową (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([
      a.variant,
      a.wierzyciel_nazwa.slice(0, 16),
      String(a.liczba_rat ?? 0),
    ]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 2 — Propozycja częściowego umorzenia (art. 917 KC, art. 508 KC)
// -----------------------------------------------------------------------------
function renderUmorzenie(a: UgodaAnswers): UgodaRenderResult {
  const today = formatDatePL(new Date());
  const kwotaProponowana = a.kwota_proponowana
    ? formatPLN(Number(a.kwota_proponowana))
    : "—";
  const procent =
    typeof a.procent_umorzenia === "number"
      ? `${a.procent_umorzenia}%`
      : "—";
  const termin = a.termin_zaplaty ? formatDatePL(a.termin_zaplaty) : "—";

  const markdown = `${header(a, today)}

${adresat(a)}

# PROPOZYCJA UGODY — częściowe umorzenie

## I. Identyfikacja zobowiązania

${identyfikacja(a)}

## II. Propozycja

Na podstawie **art. 917 KC** (ugoda) w zw. z **art. 508 KC** (zwolnienie
z długu) proponuję polubowne rozwiązanie sporu poprzez:

1. **jednorazową zapłatę kwoty:** ${kwotaProponowana},
2. **umorzenie pozostałej części zobowiązania**${
    procent !== "—" ? ` (orientacyjnie ${procent})` : ""
  }, w szczególności odsetek za opóźnienie i kosztów windykacji,
3. **termin zapłaty:** ${termin}, przelewem na rachunek wierzyciela,
4. **zamknięcie sprawy** windykacyjnej / sądowej / egzekucyjnej po
   zaksięgowaniu wpłaty.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Proponowana kwota stanowi maksymalny dostępny dla mnie wysiłek finansowy.
Ścieżka polubowna pozwala uniknąć kosztów postępowania sądowego i
egzekucyjnego — co dla obu stron jest rozwiązaniem korzystniejszym niż
długotrwały spór.

## IV. Termin odpowiedzi

Proszę o pisemną odpowiedź w terminie **14 dni** od dnia otrzymania
niniejszego pisma. Po tym terminie propozycja przestaje wiązać.

${nieUznanieDlugu()}

## V. Załączniki

1. Dokumenty potwierdzające sytuację finansową (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([
      a.variant,
      a.wierzyciel_nazwa.slice(0, 16),
      String(a.kwota_proponowana ?? 0),
    ]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 3 — Propozycja indywidualna / mieszana (art. 917 KC)
// -----------------------------------------------------------------------------
function renderIndywidualna(a: UgodaAnswers): UgodaRenderResult {
  const today = formatDatePL(new Date());
  const rata = a.rata_miesieczna ? formatPLN(Number(a.rata_miesieczna)) : "—";
  const liczba = a.liczba_rat ? String(a.liczba_rat) : "—";
  const dataPierwszej = a.data_pierwszej_raty
    ? formatDatePL(a.data_pierwszej_raty)
    : "—";
  const kwotaProponowana = a.kwota_proponowana
    ? formatPLN(Number(a.kwota_proponowana))
    : "—";
  const procent =
    typeof a.procent_umorzenia === "number"
      ? `${a.procent_umorzenia}%`
      : "—";
  const sumaRat =
    typeof a.rata_miesieczna === "number" && typeof a.liczba_rat === "number"
      ? formatPLN(a.rata_miesieczna * a.liczba_rat)
      : "—";

  const markdown = `${header(a, today)}

${adresat(a)}

# PROPOZYCJA UGODY — propozycja indywidualna

## I. Identyfikacja zobowiązania

${identyfikacja(a)}

## II. Propozycja

Na podstawie **art. 917 KC** (ugoda) proponuję polubowne rozwiązanie
sporu poprzez następujące, łącznie traktowane warunki:

**A. Spłata kapitału w ratach:**
1. rata miesięczna: ${rata},
2. liczba rat: ${liczba},
3. łączna suma rat: ${sumaRat},
4. termin pierwszej raty: ${dataPierwszej}.

**B. Częściowe umorzenie:**
5. żądam umorzenia odsetek za opóźnienie i kosztów windykacji${
    a.kwota_proponowana
      ? ` (kwota docelowa do zapłaty: ${kwotaProponowana})`
      : ""
  }${procent !== "—" ? `, orientacyjnie ${procent}` : ""},
6. forma zapłaty: przelew bankowy na rachunek wierzyciela,
7. zamknięcie sprawy po zaksięgowaniu ostatniej raty.

## III. Uzasadnienie
${sytuacjaList(a)}${okolicznosciSection(a)}
Połączenie rat na kapitał z umorzeniem odsetek to rozwiązanie, które
realnie odzwierciedla moją zdolność płatniczą i jednocześnie pozwala
wierzycielowi odzyskać główną część świadczenia bez kosztów postępowania
sądowego oraz egzekucji.

## IV. Termin odpowiedzi

Proszę o pisemną odpowiedź w terminie **14 dni** od dnia otrzymania
niniejszego pisma. Jestem otwarty(-a) na renegocjację poszczególnych
warunków — celem jest zawarcie obustronnie korzystnej ugody.

${nieUznanieDlugu()}

## V. Załączniki

1. Dokumenty potwierdzające sytuację finansową (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([
      a.variant,
      a.wierzyciel_nazwa.slice(0, 16),
      String(a.liczba_rat ?? 0),
      String(a.kwota_proponowana ?? 0),
    ]),
  };
}
