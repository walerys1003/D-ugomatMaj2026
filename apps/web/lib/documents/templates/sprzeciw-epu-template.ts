/**
 * D2 — Sprzeciw EPU. Statyczny generator szablonu (Tier 2).
 *
 * W Tier 3 zostanie podmieniony na wywołanie Claude Sonnet 4.6 z RAG.
 * Tier 2 produkuje deterministyczny Markdown na podstawie odpowiedzi z kreatora,
 * więc cały vertical slice (wizard → dokument → PDF) jest weryfikowalny end-to-end
 * bez zewnętrznych zależności.
 *
 * Zasady redakcyjne (zgodne ze spec §3 — Tarcza, ton "Calm Authority"):
 *   - II osoba liczby pojedynczej w komentarzach (ten plik nie generuje komentarzy
 *     w piśmie procesowym — tam zawsze formalny styl prawniczy).
 *   - Brak emoji, brak wykrzykników w treści pisma.
 *   - Zwięzłe akapity, każdy zarzut osobno z odnośnikiem do podstawy prawnej.
 */

import { sprzeciwEpuZarzutyOptions } from "@/lib/wizard/modules/sprzeciw-epu";
import { formatDatePL, formatPLN } from "@/lib/utils";

export interface SprzeciwEpuTemplateInput {
  // z kroku "nakaz"
  sygnatura: string;
  sad: string;
  data_nakazu: string;
  data_doreczenia: string;
  kwota_glowna: number;
  kwota_odsetki: number;
  kwota_koszty: number;

  // z kroku "strony"
  powod_nazwa: string;
  powod_adres: string;
  pozwany_nazwa: string;
  pozwany_adres: string;
  pozwany_pesel?: string;

  // z kroku "zarzuty"
  zarzuty: string[];
  zarzuty_custom?: string;

  // z kroku "okolicznosci"
  okolicznosci?: string;
  cesja: boolean;
  cesja_data?: string;
}

interface ZarzutBlock {
  title: string;
  body: string;
}

const ZARZUT_BODY: Record<string, ZarzutBlock> = {
  przedawnienie: {
    title: "Zarzut przedawnienia roszczenia",
    body: `Z ostrożności procesowej podnoszę zarzut przedawnienia roszczenia objętego nakazem zapłaty (art. 117 § 2¹ k.c. w zw. z art. 118 k.c.). Zgodnie z aktualną treścią art. 117 § 2¹ k.c. po upływie terminu przedawnienia nie można domagać się zaspokojenia roszczenia przysługującego przeciwko konsumentowi, a sąd uwzględnia upływ terminu przedawnienia z urzędu.`,
  },
  brak_dowodow: {
    title: "Brak dokumentów potwierdzających roszczenie",
    body: `Powód nie przedstawił dokumentów źródłowych, z których wywodzi roszczenie (umowy, harmonogramu spłat, wezwania do zapłaty). Wnoszę o zobowiązanie powoda do przedłożenia kompletu dokumentów źródłowych pod rygorem oddalenia powództwa (art. 6 k.c.).`,
  },
  cesja_niewykazana: {
    title: "Niewykazana cesja wierzytelności",
    body: `Powód nie wykazał skutecznego nabycia wierzytelności. Wnoszę o zobowiązanie powoda do przedłożenia umowy cesji wraz z załącznikiem identyfikującym wierzytelność oraz dowodu zapłaty ceny (art. 509 k.c.). Bez tych dokumentów legitymacja procesowa czynna powoda jest wątpliwa.`,
  },
  spelnienie_swiadczenia: {
    title: "Roszczenie spełnione (zarzut zapłaty)",
    body: `Roszczenie objęte nakazem zostało już spełnione przed jego wydaniem. Wnoszę o przeprowadzenie dowodu z dokumentów potwierdzających dokonane wpłaty oraz oddalenie powództwa w całości.`,
  },
  kwestionuje_kwote: {
    title: "Kwestionowanie wysokości roszczenia",
    body: `Kwestionuję wysokość dochodzonego roszczenia, w szczególności sposób naliczenia odsetek i kosztów. Wnoszę o przedłożenie szczegółowego rozliczenia z wyodrębnieniem kapitału, odsetek umownych, odsetek karnych oraz kosztów dodatkowych.`,
  },
  brak_legitymacji: {
    title: "Brak legitymacji procesowej powoda",
    body: `Powód nie wykazał, by przysługiwało mu uprawnienie do dochodzenia roszczenia. Wnoszę o zobowiązanie powoda do udokumentowania swojej legitymacji procesowej czynnej oraz oddalenie powództwa w razie braku stosownych dokumentów.`,
  },
  abuzywne_klauzule: {
    title: "Klauzule abuzywne w umowie",
    body: `Postanowienia umowne, na podstawie których powód dochodzi roszczenia, zawierają klauzule abuzywne w rozumieniu art. 385¹ k.c. Postanowienia te nie wiążą konsumenta, a roszczenie w zakresie z nich wynikającym pozbawione jest podstawy.`,
  },
  wadliwa_doręczenie: {
    title: "Wadliwe doręczenie nakazu",
    body: `Doręczenie nakazu zapłaty nastąpiło w sposób uniemożliwiający zapoznanie się z jego treścią w terminie. Wnoszę o uznanie sprzeciwu za wniesiony w terminie z uwagi na faktyczną datę odebrania pisma.`,
  },
};

function formatGrosz(amount: number | null | undefined): string {
  if (amount == null) return "0,00 zł";
  return formatPLN(amount);
}

/**
 * Renderuje pełen sprzeciw w Markdownie. Output jest gotowy do PDF
 * (bez stylów inline — typografia ustawia się w warstwie HTML).
 */
export function renderSprzeciwEpuMarkdown(input: SprzeciwEpuTemplateInput): string {
  const total =
    Number(input.kwota_glowna || 0) +
    Number(input.kwota_odsetki || 0) +
    Number(input.kwota_koszty || 0);

  const today = new Date();
  const todayPL = formatDatePL(today.toISOString().slice(0, 10));

  const zarzutyBlocks = input.zarzuty
    .map((id) => ZARZUT_BODY[id])
    .filter((b): b is ZarzutBlock => Boolean(b));

  const customParas = input.zarzuty_custom?.trim()
    ? input.zarzuty_custom.trim().split(/\n+/)
    : [];

  const okolicznosciParas = input.okolicznosci?.trim()
    ? input.okolicznosci.trim().split(/\n+/)
    : [];

  const lines: string[] = [];

  // Header (miejsce + data)
  lines.push(`${escapeMd(input.pozwany_adres)}, ${todayPL}`);
  lines.push("");

  // Adresat
  lines.push(`**${escapeMd(input.sad.toUpperCase())}**`);
  lines.push("");

  // Strony
  lines.push(`**Powód:** ${escapeMd(input.powod_nazwa)}`);
  lines.push(`adres: ${escapeMd(input.powod_adres)}`);
  lines.push("");
  lines.push(`**Pozwany:** ${escapeMd(input.pozwany_nazwa)}`);
  lines.push(`adres: ${escapeMd(input.pozwany_adres)}`);
  if (input.pozwany_pesel) {
    lines.push(`PESEL: ${escapeMd(input.pozwany_pesel)}`);
  }
  lines.push("");
  lines.push(`**Sygnatura akt:** ${escapeMd(input.sygnatura)}`);
  lines.push(`**Wartość przedmiotu sporu:** ${formatGrosz(total)}`);
  lines.push("");

  // Tytuł
  lines.push("# SPRZECIW OD NAKAZU ZAPŁATY");
  lines.push("");
  lines.push(
    `wniesiony w sprawie sygn. akt **${escapeMd(input.sygnatura)}**, ` +
      `nakaz zapłaty z dnia ${formatDatePL(input.data_nakazu)} ` +
      `(doręczony w dniu ${formatDatePL(input.data_doreczenia)}).`,
  );
  lines.push("");

  // Wstęp
  lines.push(
    "Działając w imieniu własnym, w terminie 14 dni od doręczenia nakazu zapłaty, na podstawie art. 503 § 1 k.p.c. w zw. z art. 505 k.p.c.,",
  );
  lines.push("");
  lines.push("**zaskarżam ww. nakaz zapłaty w całości**");
  lines.push("");
  lines.push("i wnoszę o:");
  lines.push("");
  lines.push("1. uchylenie nakazu zapłaty w całości i oddalenie powództwa,");
  lines.push("2. zasądzenie od powoda na rzecz pozwanego kosztów postępowania,");
  lines.push(
    "3. rozpoznanie sprawy również pod nieobecność pozwanego (art. 209 k.p.c.).",
  );
  lines.push("");

  // Uzasadnienie
  lines.push("## Uzasadnienie");
  lines.push("");
  lines.push("### Stan faktyczny");
  if (okolicznosciParas.length > 0) {
    for (const p of okolicznosciParas) lines.push(escapeMd(p));
    lines.push("");
  } else {
    lines.push(
      "Pozwany kwestionuje zasadność i wysokość dochodzonego roszczenia, jak również skuteczność jego nabycia przez powoda.",
    );
    lines.push("");
  }

  if (input.cesja) {
    lines.push("### Kwestia cesji wierzytelności");
    lines.push(
      `Powód jest podmiotem nabywającym wierzytelności na podstawie umowy cesji${
        input.cesja_data ? ` z dnia ${formatDatePL(input.cesja_data)}` : ""
      }. Skuteczność cesji oraz identyfikacja wierzytelności wymagają udokumentowania (art. 509 k.c.).`,
    );
    lines.push("");
  }

  // Zarzuty
  if (zarzutyBlocks.length > 0) {
    lines.push("### Zarzuty");
    lines.push("");
    zarzutyBlocks.forEach((block, idx) => {
      lines.push(`#### ${idx + 1}. ${block.title}`);
      lines.push(block.body);
      lines.push("");
    });
  }

  if (customParas.length > 0) {
    lines.push("### Dodatkowe uzasadnienie");
    for (const p of customParas) lines.push(escapeMd(p));
    lines.push("");
  }

  // Kwoty
  lines.push("### Wysokość roszczenia");
  lines.push("Roszczenie objęte nakazem obejmuje:");
  lines.push("");
  lines.push(`- należność główna: **${formatGrosz(input.kwota_glowna)}**`);
  lines.push(`- odsetki: **${formatGrosz(input.kwota_odsetki)}**`);
  lines.push(`- koszty: **${formatGrosz(input.kwota_koszty)}**`);
  lines.push("");
  lines.push(`Łącznie: **${formatGrosz(total)}**.`);
  lines.push("");

  // Podsumowanie
  lines.push("### Podsumowanie");
  lines.push(
    "Wobec wskazanych wyżej zarzutów wnoszę jak na wstępie. Sprawa nie nadaje się do rozpoznania w postępowaniu nakazowym (art. 480¹ k.p.c.) i powinna zostać przekazana do trybu zwykłego.",
  );
  lines.push("");

  // Załączniki
  lines.push("**Załączniki:**");
  lines.push("");
  lines.push("1. odpis sprzeciwu wraz z załącznikami,");
  lines.push("2. dowody wskazane w treści sprzeciwu (w razie potrzeby).");
  lines.push("");

  // Podpis
  lines.push(`${escapeMd(input.pozwany_nazwa)}`);
  lines.push("(podpis pozwanego)");

  return lines.join("\n");
}

/**
 * Prosty escape Markdown — usuwa znaki, które mogłyby zepsuć render.
 * Dla bezpieczeństwa nie pozwalamy na < > w treści.
 */
function escapeMd(text: string): string {
  return text
    .replace(/[<>]/g, "")
    .replace(/\\/g, "\\\\")
    .trim();
}
