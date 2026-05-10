/**
 * Długomat — Tier 9 — Romanian-market case types.
 *
 * Romanian law:
 *  - Codul de procedură civilă (Legea nr. 134/2010)
 *  - Legea nr. 151/2015 — insolvenţa persoanelor fizice (consumer bankruptcy)
 *  - Codul muncii (Legea nr. 53/2003) — labor
 */

export type RoCaseType =
  | "contestatie_executare"
  | "suspendare_executare"
  | "insolventa_persoana_fizica"
  | "plangere_banca"
  | "esalonare_plata";

export interface RoCaseMeta {
  type: RoCaseType;
  title: string;
  description: string;
  legalBasis: string;
  deadlineDays: number | null;
  priceGroszeEquiv: number; // in bani (1/100 RON) — or EUR cents
  urlSlug: string;
}

export const roCaseTypeMeta: Record<RoCaseType, RoCaseMeta> = {
  contestatie_executare: {
    type: "contestatie_executare",
    title: "Contestaţie la executare",
    description:
      "Contestaţie împotriva actelor de executare silită — în termen de 15 zile de la comunicare.",
    legalBasis: "Art. 712-720 Codul de procedură civilă",
    deadlineDays: 15,
    priceGroszeEquiv: 4_900,
    urlSlug: "contestatie-executare",
  },
  suspendare_executare: {
    type: "suspendare_executare",
    title: "Cerere de suspendare a executării silite",
    description:
      "Cerere de suspendare a executării silite până la soluţionarea contestaţiei.",
    legalBasis: "Art. 718 Codul de procedură civilă",
    deadlineDays: null,
    priceGroszeEquiv: 8_900,
    urlSlug: "suspendare-executare",
  },
  insolventa_persoana_fizica: {
    type: "insolventa_persoana_fizica",
    title: "Cerere de deschidere a procedurii de insolvenţă a persoanei fizice",
    description:
      "Cerere conform Legii 151/2015 — plan de rambursare 5 ani, apoi liberare de datorii.",
    legalBasis: "Legea nr. 151/2015 privind procedura insolvenţei persoanelor fizice",
    deadlineDays: null,
    priceGroszeEquiv: 14_900,
    urlSlug: "insolventa-persoana-fizica",
  },
  plangere_banca: {
    type: "plangere_banca",
    title: "Plângere împotriva băncii + sesizare BNR",
    description:
      "Plângere bancară + escaladare la Banca Naţională a României / ANPC.",
    legalBasis: "OUG nr. 50/2010 privind contractele de credit pentru consumatori",
    deadlineDays: 30,
    priceGroszeEquiv: 4_900,
    urlSlug: "plangere-banca",
  },
  esalonare_plata: {
    type: "esalonare_plata",
    title: "Cerere de eşalonare a plăţii",
    description: "Cerere de eşalonare a taxelor judiciare de timbru.",
    legalBasis: "OUG nr. 80/2013 privind taxele judiciare de timbru",
    deadlineDays: null,
    priceGroszeEquiv: 3_900,
    urlSlug: "esalonare-plata",
  },
};

export function listRoCaseTypes(): RoCaseMeta[] {
  return Object.values(roCaseTypeMeta);
}
