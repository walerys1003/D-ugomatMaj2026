/**
 * D2 Sprzeciw EPU — statyczny template (Tier 2 fallback / vertical slice).
 *
 * Tier 3 podmieni to na pełny pipeline: RAG retrieval → Claude Sonnet 4.6 →
 * walidacja Haiku 4.5 → ewentualna eskalacja Opus 4.6.
 * Tier 2 dostarcza w pełni funkcjonalny "iron-clad" szablon — pismo, które
 * po wypełnieniu danymi user'a jest gotowe do złożenia w sądzie (z odsetkami
 * i kosztami zostawiamy sądowi do obliczenia).
 *
 * Wzorzec: pismo procesowe wg art. 503 § 1 k.p.c. — sprzeciw od nakazu
 * zapłaty wydanego w EPU. Polskie konwencje: I. petitum, II. uzasadnienie,
 * III. wnioski dowodowe (puste), IV. załączniki.
 */
import { ZARZUTY_OPTIONS } from "@/lib/wizard/modules/sprzeciw-epu/schemas";
import type { SprzeciwEpuAnswers } from "@/lib/wizard/modules/sprzeciw-epu/schemas";

import { formatDatePL, formatPLN } from "@/lib/utils";

export interface SprzeciwEpuRenderResult {
  markdown: string;
  promptHash: string;
}

export function renderSprzeciwEpuMarkdown(
  answers: SprzeciwEpuAnswers,
): SprzeciwEpuRenderResult {
  const today = formatDatePL(new Date());
  const total =
    Number(answers.kwota_glowna ?? 0) +
    Number(answers.kwota_odsetki ?? 0) +
    Number(answers.kwota_koszty ?? 0);

  // Mapowanie zarzutów na akapity uzasadnienia
  const zarzutyParas: string[] = [];
  const zarzutyById = new Map(ZARZUTY_OPTIONS.map((z) => [z.id, z]));

  for (const id of answers.zarzuty) {
    const opt = zarzutyById.get(id);
    if (!opt) continue;
    zarzutyParas.push(buildZarzutParagraph(id, answers));
    void opt;
  }

  const okolicznosciSection = answers.okolicznosci
    ? `\n**Okoliczności podane przez pozwanego.** ${answers.okolicznosci.trim()}\n`
    : "";

  const sygnatura = answers.sygnatura;
  const sad = answers.sad;
  const dataNakazu = formatDatePL(new Date(answers.data_nakazu));
  const dataDoreczenia = formatDatePL(new Date(answers.data_doreczenia));

  const markdown = `# Sprzeciw od nakazu zapłaty wydanego w elektronicznym postępowaniu upominawczym

**${sad}**
${humanizedTrybunal(sad)}

**Sygn. akt:** ${sygnatura}
**Data sporządzenia:** ${today}

---

**Powód:**
${answers.powod_nazwa}
${answers.powod_adres}

**Pozwany:**
${answers.pozwany_nazwa}
${answers.pozwany_adres}${
    answers.pozwany_pesel
      ? `\nPESEL: ${answers.pozwany_pesel}`
      : ""
  }

**Wartość przedmiotu sporu:** ${formatPLN(total)}

---

## Sprzeciw od nakazu zapłaty

Działając w imieniu własnym, na podstawie art. 503 § 1 ustawy z dnia 17 listopada 1964 r. — Kodeks postępowania cywilnego (Dz.U. 1964 nr 43 poz. 296 z późn. zm.), w terminie ustawowym

**wnoszę sprzeciw od nakazu zapłaty wydanego w elektronicznym postępowaniu upominawczym** o sygnaturze **${sygnatura}** z dnia ${dataNakazu}, doręczonego w dniu ${dataDoreczenia},

**zaskarżając go w całości** i wnosząc o:

1. **uchylenie nakazu zapłaty w całości** i przekazanie sprawy do sądu właściwości ogólnej pozwanego,
2. **oddalenie powództwa w całości**,
3. **zasądzenie od powoda na rzecz pozwanego kosztów postępowania** według norm przepisanych.

## Uzasadnienie

W dniu ${dataDoreczenia} doręczono pozwanemu nakaz zapłaty wydany przez ${sad} w elektronicznym postępowaniu upominawczym, zobowiązujący do zapłaty kwoty ${formatPLN(total)} wraz z kosztami procesu.

**Pozwany kwestionuje roszczenie powoda w całości** — zarówno co do zasady, jak i co do wysokości — z następujących powodów:

${zarzutyParas.map((p, i) => `**${romanize(i + 1)}.** ${p}`).join("\n\n")}
${okolicznosciSection}
W świetle powyższego nakaz zapłaty nie powinien się ostać. Wnoszę jak na wstępie.

---

## Załączniki

1. Odpis sprzeciwu dla strony przeciwnej.
2. Pełnomocnictwo (jeśli pismo składane przez pełnomocnika).
3. Dowód uiszczenia opłaty (jeżeli wymagana).

---

_____________________________
${answers.pozwany_nazwa}
(podpis pozwanego)
`;

  // Prompt-hash: deterministyczny digest zawartości szablonu (Tier 5: do
  // anonimizowanego logowania, by wykrywać regresje promptu bez zapisywania PII).
  const promptHash = "static-template:sprzeciw_epu:v1";

  return { markdown, promptHash };
}

// -----------------------------------------------------------------------------
// Helpery
// -----------------------------------------------------------------------------
function buildZarzutParagraph(id: string, a: SprzeciwEpuAnswers): string {
  switch (id) {
    case "przedawnienie":
      return `**Zarzut przedawnienia.** Pozwany podnosi zarzut przedawnienia roszczenia. Zgodnie z art. 117 § 2¹ Kodeksu cywilnego, sąd ma obowiązek z urzędu uwzględnić upływ terminu przedawnienia w sprawach przeciwko konsumentom. Dla roszczeń wynikających z działalności gospodarczej termin przedawnienia wynosi 3 lata (art. 118 k.c.).`;

    case "brak_umowy":
      return `**Zarzut nieistnienia stosunku prawnego.** Pozwany zaprzecza, jakoby zawarł z powodem (${a.powod_nazwa}) jakąkolwiek umowę będącą źródłem dochodzonego roszczenia. Zgodnie z art. 6 k.c., ciężar udowodnienia faktu spoczywa na osobie, która z faktu tego wywodzi skutki prawne — w niniejszej sprawie na powodzie.`;

    case "cesja_niewykazana":
      return `**Zarzut nieudokumentowania cesji wierzytelności.** Powód, jako podmiot inny niż pierwotny wierzyciel, ma obowiązek wykazać przejście wierzytelności (art. 509 k.c.). Pozwany nie otrzymał żadnego dokumentu poświadczającego przelew, w szczególności umowy cesji wraz z załącznikiem identyfikującym roszczenie indywidualnie.`;

    case "nieprawidlowa_wysokosc":
      return `**Zarzut nieprawidłowej wysokości roszczenia.** Pozwany kwestionuje wysokość kwoty głównej (${formatPLN(Number(a.kwota_glowna ?? 0))}) oraz naliczonych odsetek (${formatPLN(Number(a.kwota_odsetki ?? 0))}) i kosztów (${formatPLN(Number(a.kwota_koszty ?? 0))}). Powód nie przedstawił szczegółowego rozliczenia, które umożliwiałoby weryfikację dochodzonej kwoty.`;

    case "brak_doreczenia":
      return `**Zarzut braku skutecznego wezwania do zapłaty.** Pozwany przed wytoczeniem powództwa nie otrzymał skutecznego wezwania do zapłaty. Brak takiego wezwania uniemożliwił dobrowolne spełnienie świadczenia i skutkuje nieuzasadnionym obciążeniem pozwanego kosztami procesu (art. 101 k.p.c.).`;

    case "splata_calkowita":
      return `**Zarzut spełnienia świadczenia.** Roszczenie objęte nakazem zapłaty zostało już — w całości lub w przeważającej części — uregulowane przez pozwanego. Pozwany przedstawi w toku postępowania dowody zapłaty (potwierdzenia przelewów, pokwitowania).`;

    default:
      return `**Zarzut formalny.** Pozwany kwestionuje zasadność roszczenia powoda.`;
  }
}

function romanize(n: number): string {
  const map = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return map[n - 1] ?? String(n);
}

function humanizedTrybunal(sad: string): string {
  // Jeżeli user wpisał już pełną nazwę sądu z adresem, nie wstawiamy nic.
  if (sad.includes(",") || sad.includes("ul.")) return "";
  return "(adres jak w nakazie)";
}
