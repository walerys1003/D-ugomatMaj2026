/**
 * Tier 5.3 — Centralized cache tags for Next.js revalidateTag().
 *
 * Każdy tag jest stabilną stringową etykietą; użytkowy kod woła:
 *   revalidateTag(cacheTags.legalKnowledge());
 *   revalidateTag(cacheTags.case(caseId));
 *
 * Trzymanie ich w jednym miejscu zapobiega rozjazdom (literówki, niespójne
 * konwencje) między miejscem `fetch({ next: { tags: [...] } })` a miejscem
 * inwalidacji w server actions.
 */

export const cacheTags = {
  // Marketing / publiczne treści — odświeżane sporadycznie (CMS-like).
  landing: () => "landing",
  pricing: () => "pricing",
  knowledgeBase: () => "knowledge-base",
  knowledgeArticle: (slug: string) => `knowledge-article:${slug}`,
  legalKnowledge: () => "legal-knowledge",

  // Sprawy i dokumenty — odświeżane natychmiast po mutacji.
  cases: (userId: string) => `cases:user:${userId}`,
  case: (caseId: string) => `case:${caseId}`,
  documents: (caseId: string) => `case:${caseId}:documents`,
  document: (docId: string) => `document:${docId}`,
  deadlines: (userId: string) => `deadlines:user:${userId}`,

  // Płatności / faktury — odświeżane po webhooku Stripe.
  payments: (userId: string) => `payments:user:${userId}`,

  // Admin (Tier 5.4 placeholder).
  promptTemplates: () => "prompt-templates",
} as const;

/**
 * Zalecane revalidate intervals (w sekundach) — używane w `revalidate`
 * eksportach segmentu i w `next: { revalidate: ... }` przy fetch.
 *
 * UWAGA: Tier 5.1 CSP middleware wymusza header `cache-control` poza
 * panelem; te wartości nie konfliktują z security headers, bo dotyczą
 * Next.js Data Cache (po stronie serwera), nie HTTP cache klienta.
 */
export const revalidate = {
  /** Treści publiczne typu CMS — landing, cennik, jak to działa. */
  marketing: 60 * 60 * 6, // 6h
  /** Baza wiedzy — artykuły zmieniają się rzadko. */
  knowledgeBase: 60 * 60 * 24, // 24h
  /** Pojedynczy artykuł bazy wiedzy. */
  knowledgeArticle: 60 * 60 * 12, // 12h
  /** Dane dynamiczne, ale dopuszczalna 1-min nieświeżość (lista spraw w panelu). */
  shortLived: 60, // 1 min
  /** Zawsze świeże (no cache). */
  none: 0,
} as const;

export type CacheTag = ReturnType<(typeof cacheTags)[keyof typeof cacheTags]>;
