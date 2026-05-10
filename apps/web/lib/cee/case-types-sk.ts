/**
 * Długomat — Tier 9 — Slovak-market case types.
 *
 * Slovak law (Občiansky súdny poriadok + Exekučný poriadok):
 *  - exekucna_namietka — sprzeciw w postępowaniu egzekucyjnym
 *  - exekucne_zastavenie — wniosek o zawieszenie egzekucji
 *  - osobny_bankrot — osobní bankrot (Zákon č. 7/2005 Z.z.)
 *  - reklamacia_banka — reklamacja bankowa (NBS)
 *  - splatkovy_kalendar — wniosek o raty
 */

export type SkCaseType =
  | "exekucna_namietka"
  | "exekucne_zastavenie"
  | "osobny_bankrot"
  | "reklamacia_banka"
  | "splatkovy_kalendar_sk";

export interface SkCaseMeta {
  type: SkCaseType;
  title: string;
  description: string;
  legalBasis: string;
  deadlineDays: number | null;
  priceGroszeEquiv: number;
  urlSlug: string;
}

export const skCaseTypeMeta: Record<SkCaseType, SkCaseMeta> = {
  exekucna_namietka: {
    type: "exekucna_namietka",
    title: "Námietka v exekučnom konaní",
    description:
      "Námietka proti postupu exekútora — do 14 dní od doručenia. Dôvody: neoprávnené zhabanie, procesné chyby, porušenie zákona.",
    legalBasis: "§ 50 zákona č. 233/1995 Z.z., Exekučný poriadok",
    deadlineDays: 14,
    priceGroszeEquiv: 4_900, // ~49 €
    urlSlug: "exekucna-namietka",
  },
  exekucne_zastavenie: {
    type: "exekucne_zastavenie",
    title: "Návrh na zastavenie exekúcie",
    description:
      "Návrh na zastavenie exekúcie — zánik pohľadávky, splnenie záväzku, neoprávnené tituly.",
    legalBasis: "§ 57-58 Exekučný poriadok",
    deadlineDays: null,
    priceGroszeEquiv: 8_900,
    urlSlug: "exekucne-zastavenie",
  },
  osobny_bankrot: {
    type: "osobny_bankrot",
    title: "Návrh na osobný bankrot (oddlženie)",
    description:
      "Návrh na osobný bankrot fyzickej osoby. Po 3-rokoch splátkového kalendára — osvobodenie od zvyšných dlhov.",
    legalBasis: "§ 166-170 zákona č. 7/2005 Z.z., o konkurze a reštrukturalizácii",
    deadlineDays: null,
    priceGroszeEquiv: 14_900,
    urlSlug: "osobny-bankrot",
  },
  reklamacia_banka: {
    type: "reklamacia_banka",
    title: "Reklamácia voči banke + sťažnosť NBS",
    description:
      "Reklamácia bankových služieb. Eskalácia k Národnej banke Slovenska pri neúspechu vnútornej reklamácie.",
    legalBasis: "Zákon č. 483/2001 Z.z., o bankách",
    deadlineDays: 30,
    priceGroszeEquiv: 4_900,
    urlSlug: "reklamacia-banka",
  },
  splatkovy_kalendar_sk: {
    type: "splatkovy_kalendar_sk",
    title: "Návrh na splátkový kalendár",
    description: "Návrh na splátkový kalendár súdnych poplatkov.",
    legalBasis: "Zákon č. 71/1992 Z.z., o súdnych poplatkoch",
    deadlineDays: null,
    priceGroszeEquiv: 3_900,
    urlSlug: "splatkovy-kalendar",
  },
};

export function listSkCaseTypes(): SkCaseMeta[] {
  return Object.values(skCaseTypeMeta);
}
