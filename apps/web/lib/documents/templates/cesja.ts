/**
 * D6 CesjaCheck — statyczny fallback dla pisma "odpowiedź na wezwanie funduszu".
 *
 * Używane gdy AI pipeline jest niedostępny. Pismo do funduszu sekurytyzacyjnego
 * lub firmy windykacyjnej — żądanie udokumentowania cesji + zarzuty.
 *
 * Podstawy prawne:
 *   - art. 509 KC (cesja wierzytelności — wymóg umowy)
 *   - art. 512 KC (zawiadomienie o cesji)
 *   - art. 117 KC, art. 117¹ KC (przedawnienie)
 *   - art. 6 KC (ciężar dowodu)
 *
 * Tarcza ton: stanowczy, formalny polski, bez emocji, z konkretnym petitum.
 */
import {
  CESJA_ZARZUTY,
  type CesjaAnswers,
} from "@/lib/wizard/modules/cesja/schemas";
import { formatDatePL, formatPLN } from "@/lib/utils";

export interface CesjaRenderResult {
  markdown: string;
  promptHash: string;
}

export function renderCesjaMarkdown(
  answers: CesjaAnswers,
): CesjaRenderResult {
  const today = formatDatePL(new Date());
  const kwota = answers.kwota_dochodzona
    ? formatPLN(Number(answers.kwota_dochodzona))
    : "—";
  const dataWez = answers.data_wezwania
    ? formatDatePL(answers.data_wezwania)
    : "—";
  const dataUm = answers.data_umowy ? formatDatePL(answers.data_umowy) : "—";
  const dataWym = answers.data_wymagalnosci
    ? formatDatePL(answers.data_wymagalnosci)
    : "—";

  const markdown = `${header(answers, today)}

${adresat(answers)}

# ODPOWIEDŹ na wezwanie do zapłaty

**dotyczy:** wezwanie z dnia ${dataWez}${
    answers.sygnatura_funduszu
      ? `, sygn. ${escapeMd(answers.sygnatura_funduszu)}`
      : ""
  }

## I. Identyfikacja wierzytelności

- **Pierwotny wierzyciel:** ${escapeMd(answers.pierwotny_wierzyciel)}
- **Numer umowy:** ${
    answers.numer_umowy ? escapeMd(answers.numer_umowy) : "—"
  }
- **Data umowy:** ${dataUm}
- **Data wymagalności:** ${dataWym}
- **Kwota dochodzona przez fundusz:** ${kwota}

## II. Stanowisko

W odpowiedzi na wezwanie z dnia ${dataWez} **kwestionuję zasadność roszczenia**
w całości i wnoszę o:

1. **udokumentowanie nabycia wierzytelności** — przedstawienie kopii umowy
   przelewu wierzytelności (cesji) zawartej z pierwotnym wierzycielem
   (art. 509 KC w zw. z art. 6 KC),
2. **przedstawienie dowodu zawiadomienia o cesji** zgodnie z art. 512 KC,
3. **przedstawienie pełnej historii zobowiązania** (saldo, raty, daty
   wymagalności poszczególnych części roszczenia),
4. **wstrzymanie wszelkich czynności windykacyjnych** do czasu wykazania
   legitymacji czynnej.

## III. Zarzuty

${zarzutyList(answers)}

## IV. Uzasadnienie

Zgodnie z **art. 6 KC** ciężar wykazania faktu spoczywa na osobie, która
wywodzi z niego skutki prawne. To Państwa Fundusz / firma — jako podmiot
twierdzący nabycie wierzytelności w drodze cesji — winien przedstawić:

- pełną umowę przelewu wierzytelności (art. 509 §1 KC),
- dowód zawiadomienia dłużnika o cesji (art. 512 KC) — bez zawiadomienia
  spełnienie świadczenia do rąk pierwotnego wierzyciela ma skutek wobec
  nabywcy,
- dokumentację pierwotnego stosunku zobowiązaniowego (umowę, harmonogram,
  saldo, korespondencję).

Brak powyższych dokumentów uniemożliwia weryfikację legitymacji czynnej
i czyni wezwanie do zapłaty bezskutecznym.

${przedawnienieFragment(answers)}${okolicznosciSection(answers)}

## V. Skutek prawny

Do czasu pełnego udokumentowania cesji oraz wykazania, że roszczenie nie
jest przedawnione, **odmawiam zapłaty kwoty ${kwota}** i zastrzegam sobie
prawo podniesienia zarzutu przedawnienia (art. 117 §2¹ KC) w każdym
ewentualnym postępowaniu sądowym.

Niniejsze pismo nie stanowi uznania długu w rozumieniu art. 123 §1 pkt 2 KC.

## VI. Załączniki

1. Kopia wezwania funduszu (do wglądu).
2. Korespondencja z pierwotnym wierzycielem (do dosłania, jeśli istnieje).

---

Z poważaniem,

${signature(answers)}
`;

  return {
    markdown,
    promptHash: hash([
      (answers.fundusz_nazwa || "").slice(0, 16),
      (answers.pierwotny_wierzyciel || "").slice(0, 16),
      String((answers.zarzuty ?? []).length),
    ]),
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function header(a: CesjaAnswers, today: string): string {
  return `**${escapeMd(a.dluznik_nazwa)}**
${escapeMd(a.dluznik_adres)}
${a.dluznik_pesel ? `PESEL: ${maskedPesel(a.dluznik_pesel)}` : ""}

${today}`.trim();
}

function adresat(a: CesjaAnswers): string {
  return `**${escapeMd(a.fundusz_nazwa)}**
${a.fundusz_adres ? escapeMd(a.fundusz_adres) : "[adres funduszu]"}
${a.fundusz_nip ? `NIP / KRS: ${escapeMd(a.fundusz_nip)}` : ""}`.trim();
}

function zarzutyList(a: CesjaAnswers): string {
  const items = CESJA_ZARZUTY.filter((z) =>
    (a.zarzuty ?? []).includes(z.id),
  ).map((z, i) => `${i + 1}. **${z.label}** — ${z.helper}`);
  if (items.length === 0) return "Brak wyszczególnionych zarzutów.";
  return items.join("\n");
}

function przedawnienieFragment(a: CesjaAnswers): string {
  if (!(a.zarzuty ?? []).includes("przedawnienie")) return "";
  return `\n**W zakresie zarzutu przedawnienia:** zgodnie z art. 117 §2¹ KC
po upływie terminu przedawnienia nie można domagać się zaspokojenia
roszczenia przysługującego przeciwko konsumentowi. Ewentualna data
wymagalności roszczenia (${
    a.data_wymagalnosci ? formatDatePL(a.data_wymagalnosci) : "—"
  }) wskazuje, że termin przedawnienia mógł upłynąć przed wszczęciem
windykacji.\n`;
}

function okolicznosciSection(a: CesjaAnswers): string {
  if (!a.okolicznosci?.trim()) return "";
  return `\n**Dodatkowe okoliczności:** ${a.okolicznosci.trim()}\n`;
}

function maskedPesel(pesel: string): string {
  if (!/^\d{11}$/.test(pesel)) return pesel;
  return `${pesel.slice(0, 3)}*****${pesel.slice(8)}`;
}

function escapeMd(s: string): string {
  return s.replace(/\*/g, "\\*").replace(/_/g, "\\_");
}

function hash(parts: string[]): string {
  return `static-template:cesja:${parts.join(":")}:v1`;
}

function signature(a: CesjaAnswers): string {
  return `\\______________________
${escapeMd(a.dluznik_nazwa)}`;
}
