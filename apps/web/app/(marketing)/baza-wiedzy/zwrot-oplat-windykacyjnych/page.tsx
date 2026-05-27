import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "zwrot-oplat-windykacyjnych";
const TITLE = "Zwrot opłat windykacyjnych — pozew na podstawie art. 36a UKK";
const DESCRIPTION =
  "Jak odzyskać nadpłacone koszty pozaodsetkowe z umowy pożyczki konsumenckiej. Limit z art. 36a ustawy o kredycie konsumenckim i orzecznictwo TSUE.";
const UPDATED = "2026-05-12";

export const metadata: Metadata = {
  title: `${TITLE} | Długomat`,
  description: DESCRIPTION,
  alternates: { canonical: `/baza-wiedzy/${SLUG}` },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", publishedTime: UPDATED, modifiedTime: UPDATED },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd({ title: TITLE, description: DESCRIPTION, slug: SLUG, updatedAt: UPDATED })).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd({ articleTitle: TITLE, articleSlug: SLUG })).replace(/</g, "\\u003c") }} />
      <KnowledgeArticle
        title={TITLE}
        category="Pożyczki konsumenckie"
        readingMinutes={13}
        updatedAt={UPDATED}
        lead="Art. 36a ustawy o kredycie konsumenckim wprowadza twardy limit kosztów pozaodsetkowych: 25% kwoty pożyczki + 30% rocznie, łącznie nie więcej niż 100% kapitału. Wszystko ponad ten limit jest należne zwrotowi — także po spłaceniu pożyczki. TSUE w sprawach C-779/18 i C-84/19 potwierdził, że sądy krajowe mają obowiązek z urzędu badać klauzule kosztowe."
        sections={[
          {
            id: "co-mozesz-odzyskac",
            title: "Co dokładnie możesz odzyskać",
            content: (
              <>
                <p>Pozaodsetkowe koszty kredytu (PKK) to wszystko poza odsetkami kapitałowymi:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Prowizja za udzielenie pożyczki.</li>
                  <li>Ubezpieczenie (jeśli było warunkiem udzielenia).</li>
                  <li>Opłata przygotowawcza, administracyjna.</li>
                  <li>Koszty windykacji wpisane do umowy (poza tymi z art. 481 KC — odsetki za opóźnienie).</li>
                  <li>Opłata za „aktywację" pakietu / „abonament obsługowy".</li>
                </ul>
                <p>Limit (art. 36a ust. 1): <strong>PKK ≤ 25% kapitału + 30% × (kapitał/365) × liczba dni</strong>, ale nigdy nie więcej niż 100% kapitału.</p>
              </>
            ),
          },
          {
            id: "przyklad",
            title: "Przykład obliczeniowy",
            content: (
              <p>
                Pożyczka 5 000 zł na 24 miesiące. Maksymalne PKK = 25% × 5 000 + 30% × 5 000 × (730/365) = 1 250 + 3 000 = 4 250 zł, ale limit 100% kapitału = 5 000 zł. Jeśli pożyczkodawca naliczył 6 500 zł kosztów — <strong>1 500 zł podlega zwrotowi</strong>.
              </p>
            ),
          },
          {
            id: "tsue",
            title: "Orzecznictwo TSUE",
            content: (
              <>
                <p>TSUE w wyroku z 26 marca 2020 r. C-779/18 (Mikrokasa) i z 16 lipca 2020 r. C-84/19 (Profi Credit Polska) jednoznacznie wskazał, że sądy krajowe mają obowiązek z urzędu badać klauzule dotyczące pozaodsetkowych kosztów kredytu w świetle dyrektywy 93/13/EWG o nieuczciwych warunkach umownych.</p>
              </>
            ),
          },
          {
            id: "termin-przedawnienia",
            title: "Termin przedawnienia",
            content: (
              <p>
                Roszczenie o zwrot świadczenia nienależnego z umowy pożyczki konsumenckiej przedawnia się w okresie <strong>6 lat</strong> (art. 118 KC). Termin biegnie od dnia spłaty każdej raty.
              </p>
            ),
          },
        ]}
        relatedModule={{
          code: "D10",
          title: "Zwrot opłat — pozew z wyliczeniem",
          href: "/app/sprawy/nowa?typ=pozew_zwrot_oplat_windykacyjnych",
          description: "AI wylicza nadpłatę na podstawie harmonogramu i generuje pozew z powołaniem na art. 36a UKK i orzecznictwo TSUE.",
          price: "149 zł",
        }}
        legalSources={[
          "art. 36a ustawy z 12 maja 2011 r. o kredycie konsumenckim (Dz.U. 2011 nr 126 poz. 715)",
          "art. 118, 410, 411 KC — zwrot świadczenia nienależnego",
          "Wyrok TSUE z 26 marca 2020 r., C-779/18 Mikrokasa",
          "Wyrok TSUE z 16 lipca 2020 r., C-84/19 Profi Credit Polska",
          "Uchwała SN z 26 października 2021 r., III CZP 42/20",
        ]}
      />
    </>
  );
}
