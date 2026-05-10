/**
 * Długomat — Tier 9 — Hungarian-market case types.
 *
 * Hungarian law:
 *  - Polgári perrendtartás (2016. évi CXXX. törvény) — civil procedure
 *  - Bírósági végrehajtásról szóló 1994. évi LIII. törvény — court execution
 *  - 2015. évi CV. törvény — természetes személyek adósságrendezése (debt relief)
 */

export type HuCaseType =
  | "vegrehajtas_kifogas"
  | "vegrehajtas_szunetelteto"
  | "csod_eljaras"
  | "bank_panasz"
  | "reszletfizetes";

export interface HuCaseMeta {
  type: HuCaseType;
  title: string;
  description: string;
  legalBasis: string;
  deadlineDays: number | null;
  priceGroszeEquiv: number; // in fillér (1/100 HUF) — or EUR cents if Forint→EUR
  urlSlug: string;
}

export const huCaseTypeMeta: Record<HuCaseType, HuCaseMeta> = {
  vegrehajtas_kifogas: {
    type: "vegrehajtas_kifogas",
    title: "Kifogás végrehajtási eljárásban",
    description:
      "Kifogás a végrehajtó intézkedése ellen — 15 napon belül a kézbesítéstől.",
    legalBasis: "1994. évi LIII. törvény 217. §",
    deadlineDays: 15,
    priceGroszeEquiv: 4_900,
    urlSlug: "vegrehajtas-kifogas",
  },
  vegrehajtas_szunetelteto: {
    type: "vegrehajtas_szunetelteto",
    title: "Végrehajtás szüneteltetése iránti kérelem",
    description:
      "Kérelem a végrehajtás szüneteltetésére — méltányosság, részletfizetés, fizetési halasztás.",
    legalBasis: "1994. évi LIII. törvény 50. §",
    deadlineDays: null,
    priceGroszeEquiv: 8_900,
    urlSlug: "vegrehajtas-szunetelteto",
  },
  csod_eljaras: {
    type: "csod_eljaras",
    title: "Természetes személy adósságrendezése",
    description:
      "Magánszemély csődeljárása — 5 éves törlesztési időszak után mentesítés.",
    legalBasis: "2015. évi CV. törvény",
    deadlineDays: null,
    priceGroszeEquiv: 14_900,
    urlSlug: "csod-eljaras",
  },
  bank_panasz: {
    type: "bank_panasz",
    title: "Panasz a bank ellen + MNB eljárás",
    description: "Banki panasz, eszkalálás MNB pénzügyi fogyasztóvédelemhez.",
    legalBasis: "2013. évi CXXXIX. törvény az MNB-ről",
    deadlineDays: 30,
    priceGroszeEquiv: 4_900,
    urlSlug: "bank-panasz",
  },
  reszletfizetes: {
    type: "reszletfizetes",
    title: "Részletfizetési kérelem",
    description: "Bírósági illeték részletfizetése iránti kérelem.",
    legalBasis: "1990. évi XCIII. törvény az illetékekről",
    deadlineDays: null,
    priceGroszeEquiv: 3_900,
    urlSlug: "reszletfizetes",
  },
};

export function listHuCaseTypes(): HuCaseMeta[] {
  return Object.values(huCaseTypeMeta);
}
