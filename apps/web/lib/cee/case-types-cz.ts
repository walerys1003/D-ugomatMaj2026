/**
 * Długomat — Tier 9 — Czech-market case types.
 *
 * Czeskie odpowiedniki polskich modułów (z lokalnymi przepisami):
 *  - exekucni_namitka — sprzeciw w postępowaniu egzekucyjnym (analog komornik_skarga)
 *  - exekucni_zastaveni — wniosek o zawieszenie egzekucji
 *  - oddluzeni_navrh — wniosek o oddłużenie (czeski equivalent upadłości konsumenckiej)
 *  - exekutor_omezeni — wniosek o ograniczenie zajęć
 *  - reklamace_banka — reklamacja bankowa (Česká národní banka)
 *  - splatkovy_kalendar — wniosek o raty sądowe
 *
 * Podstawy prawne (Czech Civil Procedure Code — Občanský soudní řád, OSŘ):
 *  - § 268 OSŘ — zastavení výkonu rozhodnutí
 *  - § 389 OSŘ — oddlužení
 *  - Zákon č. 99/1963 Sb., občanský soudní řád
 *  - Zákon č. 182/2006 Sb., insolvenční zákon
 */

export type CzCaseType =
  | "exekucni_namitka"
  | "exekucni_zastaveni"
  | "oddluzeni_navrh"
  | "exekutor_omezeni"
  | "reklamace_banka"
  | "splatkovy_kalendar";

export interface CzCaseMeta {
  type: CzCaseType;
  title: string;
  description: string;
  legalBasis: string;
  deadlineDays: number | null;
  priceGroszeEquiv: number; // Cena w grošech (czeski grosz = halíř, 1/100 CZK)
  urlSlug: string;
}

export const czCaseTypeMeta: Record<CzCaseType, CzCaseMeta> = {
  exekucni_namitka: {
    type: "exekucni_namitka",
    title: "Námitka v exekučním řízení",
    description:
      "Námitka proti postupu exekutora — uplatňuje se do 15 dnů od doručení napadeného úkonu. Důvody: nesprávný postup, neoprávněné zabavení, porušení procesu.",
    legalBasis: "§ 88 zákona č. 120/2001 Sb., exekuční řád",
    deadlineDays: 15,
    priceGroszeEquiv: 49_900, // ~499 Kč
    urlSlug: "exekucni-namitka",
  },
  exekucni_zastaveni: {
    type: "exekucni_zastaveni",
    title: "Návrh na zastavení exekuce",
    description:
      "Návrh na zastavení exekuce dle § 268 OSŘ. Důvody: zánik pohledávky, nepřezkoumatelnost, nesprávný titul, splnění závazku.",
    legalBasis: "§ 268 zákona č. 99/1963 Sb., občanský soudní řád",
    deadlineDays: null,
    priceGroszeEquiv: 89_900,
    urlSlug: "exekucni-zastaveni",
  },
  oddluzeni_navrh: {
    type: "oddluzeni_navrh",
    title: "Návrh na oddlužení",
    description:
      "Insolvenční návrh spojený s návrhem na oddlužení (osobní bankrot). Po 3-5 letech splátkového kalendáře — osvobození od zbylých dluhů.",
    legalBasis: "§ 389-418 zákona č. 182/2006 Sb., insolvenční zákon",
    deadlineDays: null,
    priceGroszeEquiv: 149_900,
    urlSlug: "oddluzeni-navrh",
  },
  exekutor_omezeni: {
    type: "exekutor_omezeni",
    title: "Návrh na částečné zastavení exekuce",
    description:
      "Návrh na vyloučení části majetku ze zajištění (nezabavitelné částky, sociální dávky, pomůcky pro práci).",
    legalBasis: "§ 318-319a OSŘ",
    deadlineDays: null,
    priceGroszeEquiv: 49_900,
    urlSlug: "exekutor-omezeni",
  },
  reklamace_banka: {
    type: "reklamace_banka",
    title: "Reklamace u banky a stížnost ČNB",
    description:
      "Reklamace bankovních služeb — vrácení neoprávněných poplatků, oprava záznamů, stížnost na nesprávný postup. Eskalace k ČNB při neúspěchu.",
    legalBasis: "Zákon č. 21/1992 Sb., o bankách + zákon č. 6/1993 Sb., o ČNB",
    deadlineDays: 30,
    priceGroszeEquiv: 49_900,
    urlSlug: "reklamace-banka",
  },
  splatkovy_kalendar: {
    type: "splatkovy_kalendar",
    title: "Návrh na splátkový kalendář",
    description:
      "Návrh na splátkový kalendář soudních poplatků nebo závazků — § 9-10 zákona o soudních poplatcích.",
    legalBasis: "§ 9-10 zákona č. 549/1991 Sb., o soudních poplatcích",
    deadlineDays: null,
    priceGroszeEquiv: 39_900,
    urlSlug: "splatkovy-kalendar",
  },
};

export function listCzCaseTypes(): CzCaseMeta[] {
  return Object.values(czCaseTypeMeta);
}
