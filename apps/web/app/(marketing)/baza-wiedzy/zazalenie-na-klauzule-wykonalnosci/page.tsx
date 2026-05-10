import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

const SLUG = "zazalenie-na-klauzule-wykonalnosci";
const TITLE = "Zażalenie na nadanie klauzuli wykonalności — 7 dni na działanie";
const DESCRIPTION =
  "Termin tylko 7 dni od doręczenia. Najczęstsze podstawy zażalenia: brak doręczenia tytułu, błędne oznaczenie dłużnika, sprzeczność z prawem materialnym.";
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
        category="Egzekucja"
        readingMinutes={9}
        updatedAt={UPDATED}
        lead="Klauzula wykonalności (art. 776 KPC) zamienia wyrok lub nakaz w tytuł wykonawczy — komornik może z niego prowadzić egzekucję. Termin na zażalenie to tylko 7 dni od doręczenia postanowienia (art. 795 KPC). Po tym terminie pozostaje powództwo o pozbawienie tytułu wykonalności (art. 840 KPC) — droższe i dłuższe."
        sections={[
          {
            id: "kiedy-zazalenie",
            title: "Kiedy zażalenie ma sens?",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Tytuł nie został Ci doręczony</strong> — najczęstszy zarzut przy nakazach z EPU.</li>
                <li><strong>Błędne oznaczenie strony</strong> — pomylono PESEL, NIP, dane firmy.</li>
                <li><strong>Brak wykazania zdarzenia umożliwiającego klauzulę</strong> — np. brak doręczenia wezwania, brak nadejścia terminu.</li>
                <li><strong>Tytuł nie nadaje się do egzekucji</strong> — np. zasądza świadczenie niemożliwe, zawiera klauzulę abuzywną.</li>
                <li><strong>Sprzeczność z prawem materialnym</strong> — np. przedawnienie roszczenia widoczne na pierwszy rzut oka.</li>
              </ul>
            ),
          },
          {
            id: "termin",
            title: "Termin 7 dni — od kiedy biegnie?",
            content: (
              <>
                <p>Termin liczy się od dnia doręczenia <em>postanowienia o nadaniu klauzuli</em>, a nie od dnia otrzymania zawiadomienia komorniczego.</p>
                <p>Jeśli dowiedziałeś się o klauzuli dopiero od komornika — sprawdź w aktach sprawy, kiedy doręczono Ci postanowienie. Jeśli nigdy go nie doręczono — biegnie termin od daty, kiedy dowiedziałeś się o nim w sposób umożliwiający zapoznanie się z treścią.</p>
              </>
            ),
          },
          {
            id: "skutek",
            title: "Co daje uwzględnienie zażalenia?",
            content: (
              <p>
                Sąd uchyla klauzulę — komornik traci podstawę do dalszej egzekucji i musi zwrócić zajęte kwoty (po pomniejszeniu o opłaty). Jednak sam tytuł (np. nakaz zapłaty) pozostaje — wierzyciel może go ponownie skierować do klauzuli (jeśli usunie wady).
              </p>
            ),
          },
          {
            id: "zazalenie-vs-pozbawienie",
            title: "Zażalenie a powództwo o pozbawienie tytułu",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Zażalenie</strong> — tańsze (30 zł opłaty), szybsze (1-2 miesiące), ale wymaga zarzutu formalnego.</li>
                <li><strong>Pozbawienie tytułu (art. 840 KPC)</strong> — droższe (5% wartości, max 200 tys.), dłuższe (6-18 mies.), ale obejmuje zdarzenia po powstaniu tytułu (spłata, przedawnienie po wyroku, ugoda).</li>
              </ul>
            ),
          },
        ]}
        relatedModule={{
          code: "D15",
          title: "Zażalenie na klauzulę",
          href: "/app/sprawy/nowa?typ=zazalenie_klauzula_wykonalnosci",
          description: "Pilny moduł — generuje zażalenie w 30 minut, gotowe do wysłania w 7-dniowym terminie.",
          price: "89 zł",
        }}
        legalSources={[
          "art. 776, 781-795, 840 ustawy z 17 listopada 1964 r. Kodeks postępowania cywilnego",
          "Postanowienie SN z 9 października 2014 r., I CSK 690/13",
          "Uchwała SN z 4 listopada 2011 r., III CZP 67/11",
        ]}
      />
    </>
  );
}
