/**
 * D4 PotrąceniaStop — statyczny fallback dla 2 wariantów pism.
 *
 * Używane gdy AI pipeline jest niedostępny (AiUnavailableError /
 * PromptNotFoundError). Każdy wariant ma odrębną podstawę prawną:
 *
 *   wniosek_pracodawca → art. 87, 871, 91 Kodeksu pracy (kwoty wolne,
 *                        granice potrąceń z wynagrodzenia)
 *   wniosek_komornik   → art. 833 KPC, art. 871 KP, art. 8741 KPC
 *
 * Tarcza ton: stanowczy, formalny polski, bez emocji, z konkretnym petitum.
 */
import {
  FORMA_ZATRUDNIENIA,
  POTRACENIA_VARIANTS,
  POTRACENIE_TYPY,
  SYTUACJA_ZYCIOWA,
  type PotraceniaAnswers,
} from "@/lib/wizard/modules/potracenia/schemas";
import { formatDatePL, formatPLN } from "@/lib/utils";

export interface PotraceniaRenderResult {
  markdown: string;
  promptHash: string;
}

export function renderPotraceniaMarkdown(
  answers: PotraceniaAnswers,
): PotraceniaRenderResult {
  switch (answers.variant) {
    case "wniosek_pracodawca":
      return renderWniosekPracodawca(answers);
    case "wniosek_komornik":
      return renderWniosekKomornik(answers);
    default:
      throw new Error(
        `Nieznany wariant PotrąceniaStop: ${String(answers.variant)}`,
      );
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function header(a: PotraceniaAnswers, today: string): string {
  return `**${escapeMd(a.wnioskodawca_nazwa)}**
${escapeMd(a.wnioskodawca_adres)}
${a.wnioskodawca_pesel ? `PESEL: ${maskedPesel(a.wnioskodawca_pesel)}` : ""}

${today}`.trim();
}

function adresatPracodawca(a: PotraceniaAnswers): string {
  return `**${escapeMd(a.pracodawca_nazwa)}**
${a.pracodawca_adres ? escapeMd(a.pracodawca_adres) : "[adres pracodawcy]"}
(do działu kadr / płac)`;
}

function adresatKomornik(a: PotraceniaAnswers): string {
  return `**${escapeMd(a.kancelaria_nazwa ?? "")}**
${a.kancelaria_adres ? escapeMd(a.kancelaria_adres) : "[adres kancelarii]"}

Sygn. akt: **${escapeMd(a.sygnatura_km ?? "")}**
Wierzyciel: ${escapeMd(a.wierzyciel ?? "")}`;
}

function sytuacjaList(a: PotraceniaAnswers): string {
  const labels = SYTUACJA_ZYCIOWA.filter((s) =>
    (a.sytuacja ?? []).includes(s.id),
  ).map((s) => `- ${s.label}`);
  if (labels.length === 0) return "";
  return `\n**Sytuacja życiowa wnioskodawcy:**\n${labels.join("\n")}\n`;
}

function okolicznosciSection(a: PotraceniaAnswers): string {
  if (!a.okolicznosci?.trim()) return "";
  return `\n**Dodatkowe okoliczności:** ${a.okolicznosci.trim()}\n`;
}

function formaLabel(a: PotraceniaAnswers): string {
  return (
    FORMA_ZATRUDNIENIA.find((f) => f.id === a.forma_zatrudnienia)?.label ??
    a.forma_zatrudnienia ??
    "—"
  );
}

function potracenieLabel(a: PotraceniaAnswers): string {
  return (
    POTRACENIE_TYPY.find((t) => t.id === a.potracenie_typ)?.label ??
    a.potracenie_typ ??
    "—"
  );
}

function variantLabel(a: PotraceniaAnswers): string {
  return (
    POTRACENIA_VARIANTS.find((v) => v.id === a.variant)?.label ?? a.variant
  );
}

function maskedPesel(pesel: string): string {
  if (!/^\d{11}$/.test(pesel)) return pesel;
  return `${pesel.slice(0, 3)}*****${pesel.slice(8)}`;
}

function escapeMd(s: string): string {
  return s.replace(/\*/g, "\\*").replace(/_/g, "\\_");
}

function hash(parts: string[]): string {
  return `static-template:potracenia:${parts.join(":")}:v1`;
}

function signature(a: PotraceniaAnswers): string {
  return `\\______________________
${escapeMd(a.wnioskodawca_nazwa)}`;
}

// -----------------------------------------------------------------------------
// Wariant 1 — Wniosek do pracodawcy (art. 87, 871, 91 KP)
// -----------------------------------------------------------------------------
function renderWniosekPracodawca(
  a: PotraceniaAnswers,
): PotraceniaRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_potracenia
    ? formatPLN(Number(a.kwota_potracenia))
    : "—";
  const wynagrodzenie = a.wynagrodzenie_netto
    ? formatPLN(Number(a.wynagrodzenie_netto))
    : "—";
  const procent =
    typeof a.procent_wynagrodzenia === "number"
      ? `${a.procent_wynagrodzenia}%`
      : "—";

  const markdown = `${header(a, today)}

${adresatPracodawca(a)}

# WNIOSEK o ograniczenie potrąceń z wynagrodzenia za pracę

## I. Identyfikacja stosunku pracy

- **Pracodawca:** ${escapeMd(a.pracodawca_nazwa)}
- **Stanowisko:** ${a.stanowisko ? escapeMd(a.stanowisko) : "—"}
- **Forma zatrudnienia:** ${formaLabel(a)}
- **Wynagrodzenie netto:** ${wynagrodzenie}

## II. Żądanie

Na podstawie **art. 87, art. 87¹ oraz art. 91 ustawy z dnia 26 czerwca 1974 r.
— Kodeks pracy** wnoszę o:

1. **stosowanie ustawowych granic potrąceń** z mojego wynagrodzenia za pracę,
2. **respektowanie kwoty wolnej od potrąceń** w wysokości minimalnego
   wynagrodzenia za pracę po odliczeniach składkowych i podatkowych
   (art. 87¹ § 1 KP),
3. **niezwłoczne skorygowanie** dotychczasowego potrącania w wysokości
   ${kwota}${procent !== "—" ? ` (${procent})` : ""}, jeżeli przekracza ono
   dopuszczalne granice ustawowe.

## III. Uzasadnienie

Aktualnie z mojego wynagrodzenia dokonywane są potrącenia w wysokości
**${kwota}** (typ: ${potracenieLabel(a)}). Zgodnie z art. 87 § 3 KP
suma potrąceń nie może przekraczać ustawowych granic, a zgodnie z art. 87¹
§ 1 KP — wolna od potrąceń jest kwota wynagrodzenia odpowiadająca
minimalnemu wynagrodzeniu za pracę.
${sytuacjaList(a)}${okolicznosciSection(a)}
Mając na uwadze powyższe oraz realne minimum egzystencji, dalsze
prowadzenie potrąceń w obecnej wysokości zagraża zaspokojeniu podstawowych
potrzeb mnie i osób pozostających na moim utrzymaniu.

## IV. Wniosek końcowy

Wnoszę o niezwłoczne dostosowanie potrąceń do granic ustawowych oraz
o pisemne potwierdzenie stosowania kwoty wolnej w terminie 14 dni od
otrzymania niniejszego wniosku.

## V. Załączniki

1. Kopia paska wynagrodzenia (do wglądu).
2. Dokumenty potwierdzające sytuację rodzinną/finansową (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([a.variant, a.pracodawca_nazwa.slice(0, 16)]),
  };
}

// -----------------------------------------------------------------------------
// Wariant 2 — Wniosek do komornika (art. 833 KPC, art. 871 KP)
// -----------------------------------------------------------------------------
function renderWniosekKomornik(
  a: PotraceniaAnswers,
): PotraceniaRenderResult {
  const today = formatDatePL(new Date());
  const kwota = a.kwota_potracenia
    ? formatPLN(Number(a.kwota_potracenia))
    : "—";
  const wynagrodzenie = a.wynagrodzenie_netto
    ? formatPLN(Number(a.wynagrodzenie_netto))
    : "—";
  const dataPierwsza = a.data_pierwszego_potracenia
    ? formatDatePL(a.data_pierwszego_potracenia)
    : "—";

  const markdown = `${header(a, today)}

${adresatKomornik(a)}

# WNIOSEK o respektowanie kwot wolnych od egzekucji

## I. Identyfikacja postępowania

- **Sygnatura akt:** ${escapeMd(a.sygnatura_km ?? "")}
- **Wierzyciel:** ${escapeMd(a.wierzyciel ?? "")}
- **Pracodawca / płatnik:** ${escapeMd(a.pracodawca_nazwa)}
- **Wynagrodzenie netto:** ${wynagrodzenie}
- **Aktualne potrącenie:** ${kwota} (typ: ${potracenieLabel(a)})
- **Data pierwszego potrącenia:** ${dataPierwsza}

## II. Żądanie

Na podstawie **art. 833 ustawy z dnia 17 listopada 1964 r. — Kodeks
postępowania cywilnego** w zw. z **art. 87, 87¹ i 91 ustawy z dnia
26 czerwca 1974 r. — Kodeks pracy** oraz **art. 8741 KPC** wnoszę o:

1. **respektowanie kwot wolnych od egzekucji** w pełnym zakresie,
2. **ograniczenie potrąceń** z mojego wynagrodzenia do granic ustawowych,
3. **niezwłoczne dostosowanie** dotychczasowych zajęć do treści art. 833 KPC,
4. **pisemne potwierdzenie** wprowadzonych zmian wraz z aktualną kalkulacją
   kwoty wolnej.

## III. Uzasadnienie

Zgodnie z **art. 833 KPC** określone składniki wynagrodzenia oraz
świadczenia (alimentacyjne, rodzinne, socjalne) podlegają ograniczeniom lub
nie podlegają egzekucji. Z kolei **art. 87¹ § 1 KP** gwarantuje kwotę wolną
w wysokości minimalnego wynagrodzenia po odliczeniach.

Z aktualnego rozliczenia płacowego wynika, że pobierana w toku egzekucji
kwota **${kwota}** narusza powyższe granice oraz zagraża zaspokojeniu
podstawowych potrzeb wnioskodawcy.
${sytuacjaList(a)}${okolicznosciSection(a)}

## IV. Skutek prawny

Dalsze prowadzenie egzekucji w sposób naruszający kwoty wolne od egzekucji
może stanowić podstawę do skargi na czynność komornika (art. 767 KPC) oraz
odpowiedzialności odszkodowawczej (art. 23 ustawy o komornikach sądowych).

## V. Załączniki

1. Kopia paska wynagrodzenia / zaświadczenia o dochodach.
2. Dokumenty potwierdzające sytuację rodzinną i finansową (do dosłania).

---

Z poważaniem,

${signature(a)}
`;

  return {
    markdown,
    promptHash: hash([
      a.variant,
      (a.sygnatura_km ?? "").slice(0, 16),
      a.pracodawca_nazwa.slice(0, 16),
    ]),
  };
}
