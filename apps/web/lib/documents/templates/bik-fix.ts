/**
 * D5 BIK-Fix — statyczne templates fallback dla 3 wariantów.
 *
 * Używane gdy AI pipeline nie jest dostępny (AiUnavailableError /
 * PromptNotFoundError). Każdy wariant ma odrębną podstawę prawną:
 *
 *   - reklamacja_bank → art. 70a Pr. bank., art. 16 RODO
 *   - reklamacja_bik  → regulamin BIK S.A. + art. 16 RODO
 *   - skarga_uodo     → art. 77 RODO + ustawa o ochronie danych z 2018 r.
 *
 * Tarcza ton: stanowczy, formalny polski, bez emocji, z konkretnym petitum.
 */
import {
  BIK_NIEPRAWIDLOWOSCI,
  type BikFixAnswers,
} from "@/lib/wizard/modules/bik-fix/schemas";
import { formatDatePL, formatPLN } from "@/lib/utils";

export interface BikFixRenderResult {
  markdown: string;
  promptHash: string;
}

export function renderBikFixMarkdown(
  answers: BikFixAnswers,
): BikFixRenderResult {
  switch (answers.variant) {
    case "reklamacja_bank":
      return renderReklamacjaBank(answers);
    case "reklamacja_bik":
      return renderReklamacjaBik(answers);
    case "skarga_uodo":
      return renderSkargaUodo(answers);
    default:
      throw new Error(`Nieznany wariant BIK-Fix: ${String(answers.variant)}`);
  }
}

// -----------------------------------------------------------------------------
// Helpers — wspólne fragmenty
// -----------------------------------------------------------------------------

function header(answers: BikFixAnswers, today: string): string {
  return `**${escapeMd(answers.powod_nazwa)}**
${escapeMd(answers.powod_adres)}
${answers.pozwany_pesel ? `PESEL: ${maskedPesel(answers.pozwany_pesel)}` : ""}

${today}`.trim();
}

function zarzutyList(answers: BikFixAnswers): string {
  const labels = BIK_NIEPRAWIDLOWOSCI.filter((z) =>
    answers.zarzuty.includes(z.id),
  ).map((z) => `- ${z.label}`);
  if (labels.length === 0)
    return "- (brak wskazanych zarzutów — uzupełnij w treści)";
  return labels.join("\n");
}

function okolicznosciSection(answers: BikFixAnswers): string {
  if (!answers.okolicznosci?.trim() && !answers.rodzaj_nieprawidlowosci?.trim())
    return "";
  const parts: string[] = [];
  if (answers.rodzaj_nieprawidlowosci?.trim())
    parts.push(answers.rodzaj_nieprawidlowosci.trim());
  if (answers.okolicznosci?.trim()) parts.push(answers.okolicznosci.trim());
  return `\n**Okoliczności:** ${parts.join(" ")}\n`;
}

function maskedPesel(pesel: string): string {
  if (!/^\d{11}$/.test(pesel)) return pesel;
  return `${pesel.slice(0, 3)}*****${pesel.slice(8)}`;
}

function escapeMd(s: string): string {
  return s.replace(/\*/g, "\\*").replace(/_/g, "\\_");
}

function hash(parts: string[]): string {
  // Deterministyczny digest (PII-safe — tylko sygnatury + wariant)
  return `static-template:bik:${parts.join(":")}:v1`;
}

// -----------------------------------------------------------------------------
// Wariant 1 — Reklamacja do banku
// -----------------------------------------------------------------------------
function renderReklamacjaBank(a: BikFixAnswers): BikFixRenderResult {
  const today = formatDatePL(new Date());
  const data_wpisu = a.data_wpisu ? formatDatePL(new Date(a.data_wpisu)) : "—";
  const kwota = formatPLN(Number(a.kwota_kredytu ?? 0));

  const markdown = `${header(a, today)}

**${escapeMd(a.bank_nazwa)}**
${a.bank_adres ? escapeMd(a.bank_adres) : "[adres siedziby banku]"}

# REKLAMACJA dotycząca wpisu w Biurze Informacji Kredytowej

## I. Identyfikacja sprawy

- **Numer umowy:** ${escapeMd(a.numer_umowy)}
- **Kwota figurująca w BIK:** **${kwota}**
- **Data wpisu:** ${data_wpisu}
${a.status_wpisu ? `- **Status wpisu:** ${a.status_wpisu}` : ""}

## II. Żądania

Na podstawie **art. 70a ustawy z dnia 29 sierpnia 1997 r. — Prawo bankowe**
oraz **art. 16 i art. 17 RODO** żądam:

1. **niezwłocznego sprostowania / usunięcia** powyższego wpisu w bazie BIK,
2. **potwierdzenia aktualizacji danych** w systemie BIK S.A.,
3. **udzielenia mi pisemnej odpowiedzi w terminie 30 dni** od daty doręczenia
   niniejszej reklamacji (zgodnie z ustawą z dnia 5 sierpnia 2015 r. o
   rozpatrywaniu reklamacji przez podmioty rynku finansowego).

## III. Uzasadnienie

Wnoszący niniejszą reklamację kwestionuje prawidłowość wpisu w BIK z
następujących powodów:

${zarzutyList(a)}
${okolicznosciSection(a)}
Zgodnie z **art. 16 RODO** osoba, której dane dotyczą, ma prawo żądania od
administratora niezwłocznego sprostowania nieprawidłowych danych. **Art. 17
RODO** uzupełnia to prawo o "prawo do bycia zapomnianym", które w
szczególności znajduje zastosowanie, gdy dane nie są już niezbędne do celów,
w których zostały zebrane.

Brak rzetelnej weryfikacji danych po stronie banku skutkuje
nieuzasadnionym ograniczeniem mojej zdolności kredytowej, co stanowi
naruszenie zasady prawidłowości danych (**art. 5 ust. 1 lit. d RODO**).

## IV. Pouczenie

Informuję, że w przypadku braku pozytywnego rozpatrzenia niniejszej
reklamacji w wymaganym terminie skieruję sprawę kolejno do:
- **Biura Informacji Kredytowej S.A.** (reklamacja zewnętrzna),
- **Prezesa Urzędu Ochrony Danych Osobowych** (skarga w trybie art. 77 RODO).

## V. Załączniki

1. Kopia dokumentu tożsamości (do wglądu).
${a.status_wpisu === "zamknięty" ? "2. Potwierdzenie spłaty / zamknięcia zobowiązania.\n" : ""}
---

Z poważaniem,

\\______________________
${escapeMd(a.powod_nazwa)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.numer_umowy.slice(0, 6)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 2 — Reklamacja do BIK S.A.
// -----------------------------------------------------------------------------
function renderReklamacjaBik(a: BikFixAnswers): BikFixRenderResult {
  const today = formatDatePL(new Date());
  const data_wpisu = a.data_wpisu ? formatDatePL(new Date(a.data_wpisu)) : "—";
  const kwota = formatPLN(Number(a.kwota_kredytu ?? 0));
  const dataReklBank = a.data_reklamacji_bank
    ? formatDatePL(new Date(a.data_reklamacji_bank))
    : "[__do uzupełnienia__]";

  const markdown = `${header(a, today)}

**Biuro Informacji Kredytowej S.A.**
ul. Postępu 17a
02-676 Warszawa

# REKLAMACJA do Biura Informacji Kredytowej S.A.

## I. Wskazanie wpisu

- **Wierzyciel pierwotny (bank):** ${escapeMd(a.bank_nazwa)}
- **Numer umowy:** ${escapeMd(a.numer_umowy)}
- **Kwota figurująca w BIK:** **${kwota}**
- **Data wpisu:** ${data_wpisu}
${a.status_wpisu ? `- **Status:** ${a.status_wpisu}` : ""}

## II. Żądania

Na podstawie **art. 16 RODO** (prawo do sprostowania) oraz **art. 17 RODO**
(prawo do usunięcia danych) żądam:

1. **sprostowania lub usunięcia powyższego wpisu** w systemie BIK,
2. **potwierdzenia wykonania korekty** wraz z datą aktualizacji danych,
3. **udzielenia odpowiedzi w terminie 30 dni** od doręczenia niniejszego pisma.

## III. Uzasadnienie

W dniu ${dataReklBank} złożyłem(am) reklamację bezpośrednio do
${escapeMd(a.bank_nazwa)} z żądaniem korekty wpisu w BIK.

${
  a.odpowiedz_banku?.trim()
    ? `Bank odpowiedział negatywnie. Streszczenie odpowiedzi: ${escapeMd(a.odpowiedz_banku.trim())}`
    : "Odpowiedź banku nie przyniosła korekty wpisu lub nie została udzielona w wymaganym terminie."
}

Mimo decyzji banku, wpis pozostaje merytorycznie niezgodny ze stanem
faktycznym z następujących powodów:

${zarzutyList(a)}
${okolicznosciSection(a)}
BIK S.A., jako podmiot przetwarzający dane osobowe, jest **odrębnie
zobowiązany** do zapewnienia ich prawidłowości (art. 5 ust. 1 lit. d
RODO) niezależnie od stanowiska banku-wierzyciela.

## IV. Załączniki

1. Kopia reklamacji złożonej do banku (z dnia ${dataReklBank}).
${a.odpowiedz_banku?.trim() ? "2. Kopia odpowiedzi banku.\n" : ""}3. Kopia dokumentu tożsamości (do wglądu).

## V. Pouczenie

W przypadku braku pozytywnego rozpatrzenia niniejszej reklamacji w terminie
30 dni skieruję sprawę do **Prezesa Urzędu Ochrony Danych Osobowych**
w trybie skargi z **art. 77 RODO**.

---

Z poważaniem,

\\______________________
${escapeMd(a.powod_nazwa)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.numer_umowy.slice(0, 6)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 3 — Skarga do Prezesa UODO
// -----------------------------------------------------------------------------
function renderSkargaUodo(a: BikFixAnswers): BikFixRenderResult {
  const today = formatDatePL(new Date());
  const data_wpisu = a.data_wpisu ? formatDatePL(new Date(a.data_wpisu)) : "—";
  const kwota = formatPLN(Number(a.kwota_kredytu ?? 0));
  const dataReklBank = a.data_reklamacji_bank
    ? formatDatePL(new Date(a.data_reklamacji_bank))
    : "[__do uzupełnienia__]";
  const dataReklBik = a.data_reklamacji_bik
    ? formatDatePL(new Date(a.data_reklamacji_bik))
    : "[__do uzupełnienia__]";

  const markdown = `${header(a, today)}

**Prezes Urzędu Ochrony Danych Osobowych**
ul. Stawki 2
00-193 Warszawa

# SKARGA na nieprawidłowe przetwarzanie danych osobowych

składana w trybie art. 77 RODO oraz ustawy z dnia 10 maja 2018 r. o ochronie
danych osobowych (Dz.U. 2018 poz. 1000 ze zm.)

## I. Skarżący

- **Imię i nazwisko:** ${escapeMd(a.powod_nazwa)}
- **Adres:** ${escapeMd(a.powod_adres)}
${a.pozwany_pesel ? `- **PESEL:** ${maskedPesel(a.pozwany_pesel)}` : ""}

## II. Podmioty objęte skargą

- **Administrator danych (bank):** ${escapeMd(a.bank_nazwa)}${a.bank_adres ? `, ${escapeMd(a.bank_adres)}` : ""}
- **Procesor danych:** Biuro Informacji Kredytowej S.A., ul. Postępu 17a, 02-676 Warszawa

## III. Stan faktyczny

W systemie BIK S.A. figuruje wpis dotyczący umowy:

- **Numer umowy:** ${escapeMd(a.numer_umowy)}
- **Kwota:** **${kwota}**
- **Data wpisu:** ${data_wpisu}
${a.status_wpisu ? `- **Status:** ${a.status_wpisu}` : ""}

Wpis został wprowadzony przez ${escapeMd(a.bank_nazwa)} i jest merytorycznie
nieprawidłowy z następujących powodów:

${zarzutyList(a)}
${okolicznosciSection(a)}

## IV. Wyczerpanie ścieżki reklamacyjnej

Przed wystąpieniem ze skargą do Prezesa UODO wyczerpałem(am) procedurę
reklamacyjną:

1. **W dniu ${dataReklBank}** złożyłem(am) reklamację do ${escapeMd(a.bank_nazwa)}.
   ${a.odpowiedz_banku?.trim() ? `Stanowisko banku: ${escapeMd(a.odpowiedz_banku.trim())}` : "Reklamacja nie została pozytywnie rozpatrzona."}
2. **W dniu ${dataReklBik}** złożyłem(am) reklamację do BIK S.A.
   ${a.odpowiedz_bik?.trim() ? `Stanowisko BIK: ${escapeMd(a.odpowiedz_bik.trim())}` : "Reklamacja nie przyniosła korekty wpisu."}

## V. Naruszone przepisy

- **Art. 5 ust. 1 lit. d RODO** — zasada prawidłowości danych
- **Art. 16 RODO** — prawo do sprostowania
- **Art. 17 RODO** — prawo do usunięcia
- **Art. 6 ust. 1 RODO** — brak / utrata podstawy prawnej przetwarzania

## VI. Wnioski

Na podstawie **art. 58 RODO** wnoszę o:

1. **nakazanie administratorowi sprostowania / usunięcia** kwestionowanego wpisu,
2. **stwierdzenie naruszenia przepisów RODO** przez ${escapeMd(a.bank_nazwa)} oraz
   BIK S.A.,
3. **rozważenie nałożenia administracyjnej kary pieniężnej** zgodnie z
   art. 83 RODO, jeżeli organ uzna to za zasadne.

## VII. Załączniki

1. Kopia reklamacji do banku z dnia ${dataReklBank}.
${a.odpowiedz_banku?.trim() ? "2. Kopia odpowiedzi banku.\n" : ""}3. Kopia reklamacji do BIK z dnia ${dataReklBik}.
${a.odpowiedz_bik?.trim() ? "4. Kopia odpowiedzi BIK.\n" : ""}5. Kopia dokumentu tożsamości (do wglądu).

---

Z poważaniem,

\\______________________
${escapeMd(a.powod_nazwa)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.numer_umowy.slice(0, 6)]),
  };
}
