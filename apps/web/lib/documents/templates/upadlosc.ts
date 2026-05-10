/**
 * D8 Upadłość-Lite — static template renderer (Tier 2 fallback).
 *
 * Generuje gotowy do złożenia wniosek o ogłoszenie upadłości konsumenckiej:
 *   - Nagłówek (sąd, wnioskodawca)
 *   - I.   Petitum (żądanie ogłoszenia upadłości)
 *   - II.  Spis wierzycieli (art. 22a ust. 1 pkt 1 Pr.up.)
 *   - III. Wykaz majątku (art. 22a ust. 1 pkt 2 Pr.up.)
 *   - IV.  Sytuacja osobista i zawodowa
 *   - V.   Uzasadnienie niewypłacalności (art. 11 + art. 491¹ Pr.up.)
 *   - VI.  Załączniki
 *   - Podpis
 *
 * Kluczowe podstawy prawne:
 *   - art. 491¹ Pr.up.    — postępowanie upadłościowe wobec osób fizycznych
 *   - art. 491² Pr.up.    — wniosek dłużnika o ogłoszenie upadłości
 *   - art. 491⁴ Pr.up.    — przesłanki ogłoszenia upadłości konsumenckiej
 *   - art. 11 Pr.up.      — definicja niewypłacalności
 *   - art. 22a Pr.up.     — wymagana zawartość wniosku
 *   - art. 18 Pr.up.      — właściwość sądu (sąd rejonowy — wydz. gospodarczy)
 *   - art. 76a u.k.s.c.   — opłata sądowa 30 zł
 *   - art. 522 Pr.up.     — ostrzeżenie o ukryciu majątku
 */
import { createHash } from "node:crypto";

import {
  PRZYCZYNY_NIEWYPLACALNOSCI,
  STATUS_ZAWODOWY,
  ZALACZNIKI,
  type UpadloscAnswers,
  type WierzycielItem,
} from "@/lib/wizard/modules/upadlosc/schemas";

const formatPLN = (n: number | null | undefined) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));

const formatDatePL = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
};

const escapeMd = (s: string | undefined | null) =>
  String(s ?? "").replace(/[\\`*_{}[\]()#+\-!]/g, (c) => `\\${c}`);

const maskedPesel = (pesel: string | null | undefined) => {
  if (!pesel || pesel.length !== 11) return "—";
  return `${pesel.slice(0, 3)}*****${pesel.slice(-4)}`;
};

const labelFromList = (
  list: ReadonlyArray<{ id: string; label: string }>,
  id?: string,
) => list.find((x) => x.id === id)?.label ?? id ?? "";

const hash = (parts: string[]) =>
  createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);

// -----------------------------------------------------------------------------
// Sekcje pomocnicze
// -----------------------------------------------------------------------------
function header(a: UpadloscAnswers): string {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}.${today.getFullYear()}`;
  const miasto = (() => {
    // Heurystyka: ostatni segment adresu po przecinku — jeśli nie zadziała, "—".
    const parts = (a.dluznik_adres || "").split(",").map((s) => s.trim());
    const last = parts[parts.length - 1] || "";
    return last.replace(/^\d{2}-\d{3}\s*/, "") || "—";
  })();

  const lines = [
    `${miasto}, dnia ${dateStr}`,
    "",
    `**Wnioskodawca (dłużnik):**`,
    escapeMd(a.dluznik_nazwa),
    escapeMd(a.dluznik_adres),
    `PESEL: ${maskedPesel(a.dluznik_pesel)}`,
  ];
  if (a.dluznik_nip) lines.push(`NIP: ${escapeMd(a.dluznik_nip)}`);
  if (a.dluznik_email) lines.push(`E-mail: ${escapeMd(a.dluznik_email)}`);
  if (a.dluznik_telefon) lines.push(`Telefon: ${escapeMd(a.dluznik_telefon)}`);
  return lines.join("\n");
}

function adresat(a: UpadloscAnswers): string {
  return [
    `**${escapeMd(a.sad_nazwa)}**`,
    a.sad_adres ? escapeMd(a.sad_adres) : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function wierzycieleSection(items: WierzycielItem[]): string {
  if (!items.length) return "_Brak wierzycieli — wniosek bezprzedmiotowy._";
  const rows = items
    .map((w, i) => {
      const data = w.data_wymagalnosci
        ? ` (wymagalna od ${formatDatePL(w.data_wymagalnosci)})`
        : "";
      return `${i + 1}. **${escapeMd(w.nazwa)}** — ${escapeMd(w.tytul)} — kwota: **${formatPLN(
        w.kwota,
      )}**${data}`;
    })
    .join("\n");
  const suma = items.reduce((acc, w) => acc + (Number(w.kwota) || 0), 0);
  return `${rows}\n\n**Łączna kwota zobowiązań: ${formatPLN(suma)}**`;
}

function majatekSection(a: UpadloscAnswers): string {
  const lines: string[] = [];
  if (a.posiada_nieruchomosc) {
    lines.push(
      `1. **Nieruchomości:** ${escapeMd(a.nieruchomosc_opis || "tak — opis do uzupełnienia")}`,
    );
  } else {
    lines.push("1. **Nieruchomości:** brak");
  }
  if (a.posiada_pojazd) {
    lines.push(
      `2. **Pojazdy mechaniczne:** ${escapeMd(a.pojazd_opis || "tak — opis do uzupełnienia")}`,
    );
  } else {
    lines.push("2. **Pojazdy mechaniczne:** brak");
  }
  lines.push(`3. **Środki na rachunkach bankowych:** ${formatPLN(a.srodki_na_koncie)}`);
  if (a.inne_skladniki) {
    lines.push(`4. **Inne składniki majątku:** ${escapeMd(a.inne_skladniki)}`);
  } else {
    lines.push("4. **Inne składniki majątku:** brak");
  }
  return lines.join("\n");
}

function sytuacjaSection(a: UpadloscAnswers): string {
  const status = labelFromList(STATUS_ZAWODOWY, a.status_zawodowy);
  const lines = [
    `- Status zawodowy: **${status}**`,
    `- Dochód miesięczny netto: **${formatPLN(a.dochod_miesieczny)}**`,
    `- Osób pozostających na utrzymaniu: **${a.liczba_osob_na_utrzymaniu ?? 0}**`,
  ];
  if (
    (a.status_zawodowy === "byly_przedsiebiorca" ||
      a.status_zawodowy === "wspolnik_spolki") &&
    a.data_zakonczenia_dzialalnosci
  ) {
    lines.push(
      `- Data zakończenia działalności: **${formatDatePL(a.data_zakonczenia_dzialalnosci)}**`,
    );
  }
  return lines.join("\n");
}

function przyczynyList(ids: string[]): string {
  if (!ids.length) return "_Brak wskazanych przyczyn._";
  return ids
    .map((id) => `- ${labelFromList(PRZYCZYNY_NIEWYPLACALNOSCI, id)}`)
    .join("\n");
}

function zalacznikiSection(ids: string[]): string {
  const standard = [
    "Wniosek (egzemplarz dla sądu)",
    "Potwierdzenie opłaty sądowej (30 zł)",
  ];
  const wybrane = ids
    .map((id) => labelFromList(ZALACZNIKI, id))
    .filter(Boolean);
  const all = Array.from(new Set([...standard, ...wybrane]));
  return all.map((t, i) => `${i + 1}. ${t}`).join("\n");
}

function signature(a: UpadloscAnswers): string {
  return `_______________________\n${escapeMd(a.dluznik_nazwa)}\n(własnoręczny podpis)`;
}

// -----------------------------------------------------------------------------
// Główny renderer
// -----------------------------------------------------------------------------
export function renderUpadloscMarkdown(a: UpadloscAnswers): {
  markdown: string;
  promptHash: string;
} {
  const sumaZobowiazan = (a.wierzyciele ?? []).reduce(
    (acc, w) => acc + (Number(w.kwota) || 0),
    0,
  );

  const markdown = `${header(a)}

${adresat(a)}

# WNIOSEK O OGŁOSZENIE UPADŁOŚCI KONSUMENCKIEJ

_(art. 491² ust. 1 ustawy z dnia 28 lutego 2003 r. — Prawo upadłościowe; dalej: „Pr.up.")_

## I. Żądanie wniosku

Wnoszę o:

1. **ogłoszenie upadłości** wnioskodawcy — ${escapeMd(a.dluznik_nazwa)},
   PESEL: ${maskedPesel(a.dluznik_pesel)}${a.dluznik_nip ? `, NIP: ${escapeMd(a.dluznik_nip)}` : ""} —
   jako osoby fizycznej nieprowadzącej działalności gospodarczej, na zasadach
   określonych w art. 491¹ i nast. Pr.up.;
2. ustanowienie syndyka i powierzenie mu likwidacji masy upadłości;
3. ustalenie planu spłaty wierzycieli (art. 491¹⁴ Pr.up.) z uwzględnieniem
   sytuacji osobistej i majątkowej wnioskodawcy.

## II. Spis wierzycieli

_(art. 22a ust. 1 pkt 1 Pr.up.)_

${wierzycieleSection(a.wierzyciele ?? [])}

## III. Wykaz majątku

_(art. 22a ust. 1 pkt 2 Pr.up. — szacunkowa wycena majątku wnioskodawcy)_

${majatekSection(a)}

## IV. Sytuacja osobista i zawodowa

${sytuacjaSection(a)}

## V. Uzasadnienie niewypłacalności

_(art. 11 Pr.up. — definicja niewypłacalności; art. 491⁴ ust. 1 Pr.up. —
przesłanki ogłoszenia upadłości konsumenckiej)_

Wnioskodawca utracił zdolność do wykonywania wymagalnych zobowiązań pieniężnych.
Łączne zadłużenie wynosi **${formatPLN(sumaZobowiazan)}**, znacząco przewyższając
miesięczne dochody (**${formatPLN(a.dochod_miesieczny)}**) oraz wartość posiadanego majątku.

${a.data_powstania_niewyplacalnosci
    ? `Stan niewypłacalności powstał w dniu **${formatDatePL(a.data_powstania_niewyplacalnosci)}** i utrzymuje się do dnia złożenia wniosku.\n\n`
    : ""}**Główne przyczyny niewypłacalności:**

${przyczynyList((a.przyczyny ?? []) as string[])}

**Opis sytuacji:**

${escapeMd(a.uzasadnienie || "—")}

W ocenie wnioskodawcy niewypłacalność nie powstała wskutek umyślnego działania
ani rażącego niedbalstwa, co spełnia przesłankę art. 491⁴ ust. 1 Pr.up.
i uzasadnia oddłużenie po wykonaniu planu spłaty.

## VI. Wniosek końcowy

W świetle przedstawionych okoliczności, wykazu majątku oraz spisu wierzycieli,
wnoszę jak w petitum (pkt I).

Oświadczam, że dane przedstawione w niniejszym wniosku są zgodne z prawdą oraz
że nie zataiłem żadnego składnika majątku ani wierzyciela. Jestem świadomy, że
zatajenie majątku stanowi przestępstwo (art. 522 Pr.up.) i może skutkować
umorzeniem postępowania bez oddłużenia.

## VII. Załączniki

${zalacznikiSection((a.zalaczniki ?? []) as string[])}

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([
      "upadlosc_wniosek",
      a.dluznik_nazwa.slice(0, 16),
      a.sad_nazwa.slice(0, 24),
      String((a.wierzyciele ?? []).length),
      String(sumaZobowiazan),
    ]),
  };
}
