/**
 * Długomat — Tier 8 — SEO landing page generator (programmatic SEO).
 *
 * Generuje meta + structured data dla landing pages per:
 *  - case_type (np. /sprzeciw-od-nakazu-zaplaty)
 *  - city/region (np. /komornik-warszawa, /upadlosc-krakow) — long-tail
 *  - intent ("jak napisać X", "wzór X", "ile kosztuje X")
 *
 * Każdy landing zawiera:
 *  - hero z CTA "Wygeneruj pismo"
 *  - 3-step explainer (jak działa Długomat)
 *  - case study / testimonial
 *  - FAQ (z FAQPage schema.org)
 *  - cennik (Product schema)
 *  - related articles z baza-wiedzy (LinkList)
 *
 * Cel: zająć top-10 Google na frazy long-tail "wzór sprzeciwu od nakazu zapłaty",
 * "jak napisać skargę na komornika", "upadłość konsumencka 2026".
 */
import type { CaseType } from "@/lib/db/types";
import { caseTypeMeta } from "@/lib/cases/case-types";

export interface LandingPageMeta {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intentKeyword: string;
  caseType: CaseType | null;
  city?: string;
  faqs: Array<{ question: string; answer: string }>;
  ctaPrimary: string;
  ctaSecondary: string;
  schemaJsonLd: Array<Record<string, unknown>>;
}

const POLISH_CITIES_TIER1 = [
  "Warszawa",
  "Kraków",
  "Łódź",
  "Wrocław",
  "Poznań",
  "Gdańsk",
  "Szczecin",
  "Bydgoszcz",
  "Lublin",
  "Białystok",
  "Katowice",
];

const INTENT_PREFIXES = [
  { prefix: "wzor", label: "Wzór" },
  { prefix: "jak-napisac", label: "Jak napisać" },
  { prefix: "ile-kosztuje", label: "Ile kosztuje" },
  { prefix: "termin", label: "Termin" },
];

/**
 * Generuje listę slugów dla pełnej macierzy (case_type × intent × city).
 * Dla MVP — case_type × intent (bez city, bo jest 11×4×17 = 748 stron).
 */
export function listLandingSlugs(): string[] {
  const slugs: string[] = [];
  const types = Object.keys(caseTypeMeta) as CaseType[];
  for (const type of types) {
    const meta = caseTypeMeta[type];
    if (!meta) continue;
    const baseSlug = (meta.urlSlug ?? type).replace(/_/g, "-");
    slugs.push(baseSlug);
    for (const intent of INTENT_PREFIXES) {
      slugs.push(`${intent.prefix}-${baseSlug}`);
    }
  }
  return slugs;
}

export function buildLandingMeta(slug: string): LandingPageMeta | null {
  const types = Object.keys(caseTypeMeta) as CaseType[];
  let matchedType: CaseType | null = null;
  let matchedIntent: { prefix: string; label: string } | null = null;

  for (const intent of INTENT_PREFIXES) {
    if (slug.startsWith(`${intent.prefix}-`)) {
      matchedIntent = intent;
      const rest = slug.slice(intent.prefix.length + 1);
      for (const type of types) {
        const meta = caseTypeMeta[type];
        const tSlug = (meta?.urlSlug ?? type).replace(/_/g, "-");
        if (rest === tSlug) {
          matchedType = type;
          break;
        }
      }
      if (matchedType) break;
    }
  }

  if (!matchedType) {
    for (const type of types) {
      const meta = caseTypeMeta[type];
      const tSlug = (meta?.urlSlug ?? type).replace(/_/g, "-");
      if (slug === tSlug) {
        matchedType = type;
        break;
      }
    }
  }

  if (!matchedType) return null;

  const meta = caseTypeMeta[matchedType];
  if (!meta) return null;

  const intentLabel = matchedIntent ? matchedIntent.label : "";
  const title = matchedIntent
    ? `${intentLabel} ${meta.title.toLowerCase()} | Długomat 2026`
    : `${meta.title} — wzór + generator AI | Długomat`;
  const h1 = matchedIntent
    ? `${intentLabel} ${meta.title.toLowerCase()} (2026)`
    : `${meta.title} — gotowy wzór w 5 minut`;

  const description = matchedIntent
    ? `${intentLabel} ${meta.title.toLowerCase()} — sprawdzone wzory, krok po kroku, gotowe do druku w 5 minut. Generator AI Długomat 2026.`
    : `${meta.title} — generator AI Długomat tworzy gotowe pismo na podstawie polskiego prawa. Pierwsze pismo za darmo.`;

  const faqs = buildFaqs(meta);

  const schemaJsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: meta.title,
      description: meta.description ?? description,
      offers: {
        "@type": "Offer",
        priceCurrency: "PLN",
        price: ((meta.priceGrosze ?? 0) / 100).toFixed(2),
        availability: "https://schema.org/InStock",
      },
      brand: { "@type": "Brand", name: "Długomat" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Długomat", item: "https://dlugomat.pl/" },
        { "@type": "ListItem", position: 2, name: meta.title },
      ],
    },
  ];

  return {
    slug,
    title,
    description,
    h1,
    intentKeyword: matchedIntent?.prefix ?? "wzor",
    caseType: matchedType,
    faqs,
    ctaPrimary: "Wygeneruj pismo teraz",
    ctaSecondary: "Pierwsze pismo za darmo",
    schemaJsonLd,
  };
}

function buildFaqs(meta: { title: string; priceGrosze?: number; description?: string }): Array<{
  question: string;
  answer: string;
}> {
  const price = meta.priceGrosze ? (meta.priceGrosze / 100).toFixed(2) : "29,00";
  return [
    {
      question: `Ile kosztuje ${meta.title.toLowerCase()}?`,
      answer: `W Długomat ${meta.title.toLowerCase()} kosztuje ${price} zł brutto (z VAT). Pierwsze pismo dla nowych użytkowników jest darmowe (plan Free).`,
    },
    {
      question: `Czy ${meta.title.toLowerCase()} jest zgodne z polskim prawem?`,
      answer: `Tak. Każde pismo Długomat zawiera prawidłowe podstawy prawne (KC, KPC, KPK, KKW) i jest weryfikowane przez Hallucination Guard 2.0 — ochronę przed błędami AI.`,
    },
    {
      question: "Jak długo trwa wygenerowanie pisma?",
      answer: "Generacja pisma trwa średnio 30-90 sekund. Po zakończeniu otrzymujesz PDF gotowy do druku oraz wersję edytowalną.",
    },
    {
      question: "Czy mogę zmienić treść pisma po generacji?",
      answer: "Tak. Każde pismo można edytować przez funkcję 'Multi-turn revision' — opisujesz zmianę po polsku, a AI ją wprowadza zachowując poprawność prawną.",
    },
    {
      question: "Jakie są terminy ustawowe?",
      answer: meta.description ? `${meta.description.slice(0, 200)}...` : "Każde pismo ma określony termin ustawowy (np. 14 dni na sprzeciw, 7 dni na zażalenie). Długomat pilnuje terminów i wysyła powiadomienia.",
    },
  ];
}
