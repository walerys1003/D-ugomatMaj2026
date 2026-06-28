/**
 * Tier 19 — Query expansion for legal RAG.
 *
 * Wzbogaca zapytanie użytkownika o:
 *  - synonimy domenowe (np. "nakaz zaplaty" → "nakaz zapłaty", "EPU", "e-sąd")
 *  - normalizację typografii (polskie znaki, duże/małe litery)
 *  - rozwinięcia akronimów (KPC, KK, KSH, RODO, KRS, GIODO)
 *  - HyDE (Hypothetical Document Embeddings) — LLM generuje krótką
 *    "wymyśloną" odpowiedź, którą embedujemy zamiast samego pytania.
 *    Zwykle daje +5-10 nDCG vs raw query.
 *
 * Wyjście: rozszerzona lista wariantów query do wielokrotnego retrieval.
 */

export interface ExpandedQuery {
  original: string;
  normalized: string;
  variants: string[]; // do BM25 (multi-query OR)
  hyde: string | null; // do dense retrieval
}

const ACRONYMS: Record<string, string> = {
  KPC: "Kodeks postępowania cywilnego",
  KC:  "Kodeks cywilny",
  KK:  "Kodeks karny",
  KPK: "Kodeks postępowania karnego",
  KSH: "Kodeks spółek handlowych",
  KP:  "Kodeks pracy",
  KRO: "Kodeks rodzinny i opiekuńczy",
  RODO: "Rozporządzenie o ochronie danych osobowych",
  GIODO: "Generalny Inspektor Ochrony Danych Osobowych",
  UODO: "Urząd Ochrony Danych Osobowych",
  EPU: "elektroniczne postępowanie upominawcze e-sąd",
  KRS: "Krajowy Rejestr Sądowy",
  CEIDG: "Centralna Ewidencja i Informacja o Działalności Gospodarczej",
  ZUS: "Zakład Ubezpieczeń Społecznych",
  US:  "Urząd Skarbowy",
  PIT: "podatek dochodowy od osób fizycznych",
  CIT: "podatek dochodowy od osób prawnych",
  VAT: "podatek od towarów i usług",
  TSUE: "Trybunał Sprawiedliwości Unii Europejskiej",
  ETPC: "Europejski Trybunał Praw Człowieka",
  SN:  "Sąd Najwyższy",
  TK:  "Trybunał Konstytucyjny",
};

const SYNONYMS: Array<{ key: RegExp; expansions: string[] }> = [
  { key: /\bnakaz zapla?ty\b/i, expansions: ["nakaz zapłaty", "EPU", "e-sąd", "postępowanie upominawcze"] },
  { key: /\bkomornika?\b/i, expansions: ["egzekucja komornicza", "zajęcie", "Km"] },
  { key: /\bupadlosc?i?\b/i, expansions: ["upadłość konsumencka", "ogłoszenie upadłości", "Prawo upadłościowe"] },
  { key: /\bbik\b/i, expansions: ["Biuro Informacji Kredytowej", "raport BIK", "scoring"] },
  { key: /\brozwo?d/i, expansions: ["rozwód", "separacja", "rozdzielność majątkowa"] },
  { key: /\bzachowek?\b/i, expansions: ["zachowek", "dziedziczenie", "spadek"] },
  { key: /\bspadku?\b/i, expansions: ["postępowanie spadkowe", "dział spadku", "stwierdzenie nabycia spadku"] },
  { key: /\bumowa\s+pozyczk\w*/i, expansions: ["umowa pożyczki", "chwilówka", "lichwa", "RRSO"] },
  { key: /\bpredawnienie\b/i, expansions: ["przedawnienie", "termin przedawnienia", "art. 117 KC"] },
];

export function normalizeQuery(query: string): string {
  return query
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

export function expandAcronyms(query: string): string[] {
  const variants: string[] = [];
  const tokens = query.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const upper = tokens[i].replace(/[^A-Z]/g, "");
    if (upper.length >= 2 && ACRONYMS[upper]) {
      const expanded = [...tokens];
      expanded[i] = `${tokens[i]} (${ACRONYMS[upper]})`;
      variants.push(expanded.join(" "));
    }
  }
  return variants;
}

export function expandSynonyms(query: string): string[] {
  const variants: string[] = [];
  for (const { key, expansions } of SYNONYMS) {
    if (key.test(query)) {
      for (const exp of expansions) {
        variants.push(`${query} ${exp}`);
      }
    }
  }
  return variants;
}

/**
 * HyDE — generuje krótką "wymyśloną" odpowiedź na pytanie, by embedować ją
 * zamiast samego pytania. Wywołuje LLM przez wstrzykiwany generator.
 */
export type HydeGenerator = (prompt: string) => Promise<string>;

export async function generateHyde(query: string, generator: HydeGenerator): Promise<string | null> {
  const prompt = `Napisz w 2-3 zdaniach prawniczą odpowiedź po polsku na poniższe pytanie. Wyłącznie merytoryka, bez wstępów ani odwołań do siebie. Pytanie: "${query}"`;
  try {
    const out = await generator(prompt);
    return out.trim().slice(0, 800);
  } catch {
    return null;
  }
}

export async function expandQuery(
  query: string,
  hydeGen?: HydeGenerator,
): Promise<ExpandedQuery> {
  const normalized = normalizeQuery(query);
  const acronymVariants = expandAcronyms(normalized);
  const synonymVariants = expandSynonyms(normalized);

  const unique = new Set<string>();
  unique.add(normalized);
  for (const v of acronymVariants) unique.add(v);
  for (const v of synonymVariants) unique.add(v);

  let hyde: string | null = null;
  if (hydeGen) hyde = await generateHyde(normalized, hydeGen);

  return {
    original: query,
    normalized,
    variants: Array.from(unique).slice(0, 8),
    hyde,
  };
}
