import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "ugoda-z-wierzycielem";
const TITLE = "Ugoda z wierzycielem — kiedy negocjować, czego nie podpisywać";
const DESCRIPTION =
  "Jak prowadzić negocjacje z bankiem lub funduszem, czego unikać w treści ugody, kiedy warto, a kiedy lepiej iść do sądu. Wzór klauzul ochronnych.";
const UPDATED = "2025-05-01";

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
        category="Negocjacja"
        readingMinutes={9}
        updatedAt={UPDATED}
        lead="Ugoda (art. 917 k.c.) to umowa, w której strony czynią sobie wzajemne ustępstwa, aby zakończyć spór. Dobrze napisana ugoda kończy sprawę raz na zawsze. Źle napisana — przerywa bieg przedawnienia, uznaje cały dług i daje wierzycielowi tytuł wykonawczy. Zanim cokolwiek podpiszesz, sprawdź czy roszczenie w ogóle istnieje, czy nie jest przedawnione i czy nie zawiera klauzul abuzywnych."
        sections={[
          {
            id: "kiedy-warto",
            title: "Kiedy warto negocjować",
            content: (
              <>
                <ul>
                  <li>Roszczenie jest <strong>bezsporne</strong> (np. zaległe alimenty), a Ty masz środki na częściową spłatę;</li>
                  <li>Wierzyciel oferuje znaczny rabat (40–80%) — typowo fundusze sekurytyzacyjne na końcu okresu przedawnienia;</li>
                  <li>Chcesz uniknąć wpisu w KRD/BIG po wyroku;</li>
                  <li>Sprawa egzekucyjna już trwa, a koszty komornicze rosną z każdym miesiącem.</li>
                </ul>
              </>
            ),
          },
          {
            id: "kiedy-nie",
            title: "Kiedy lepiej iść do sądu",
            content: (
              <>
                <ul>
                  <li>Roszczenie jest <strong>przedawnione</strong> — podpisanie ugody to uznanie długu i utrata zarzutu przedawnienia (art. 123 § 1 pkt 2 k.c.);</li>
                  <li>Wierzyciel <strong>nie udowodnił legitymacji czynnej</strong> (cesja);</li>
                  <li>Umowa pierwotna zawiera klauzule abuzywne — w sądzie część długu może odpaść;</li>
                  <li>Wierzyciel grozi „natychmiastową egzekucją” — to zazwyczaj manipulacja: bez tytułu wykonawczego komornik nic nie zrobi.</li>
                </ul>
              </>
            ),
          },
          {
            id: "czego-unikac",
            title: "Pułapki — czego unikać w treści ugody",
            content: (
              <>
                <ol>
                  <li><strong>Klauzula uznania długu w całości</strong> — „Dłużnik uznaje roszczenie w wysokości X zł” — to przerywa przedawnienie i daje wierzycielowi argument w przyszłym procesie.</li>
                  <li><strong>Klauzula natychmiastowej wykonalności</strong> — niektóre ugody zawierają oświadczenie o poddaniu się egzekucji (art. 777 § 1 pkt 4 k.p.c.), które jest <em>od razu</em> tytułem egzekucyjnym — bez sądu.</li>
                  <li><strong>Wysokie kary umowne za opóźnienie</strong> — np. 500 zł za każdy dzień;</li>
                  <li><strong>Klauzula „nie kwestionuje ugody w sądzie”</strong> — narusza prawo do sądu (art. 45 Konstytucji), ale w praktyce zniechęca.</li>
                  <li><strong>Brak klauzuli pełnego zwolnienia z długu</strong> po wykonaniu ugody — bez niej wierzyciel może żądać reszty.</li>
                </ol>
              </>
            ),
          },
          {
            id: "wzor",
            title: "Klauzule, które warto zawrzeć",
            content: (
              <>
                <blockquote>
                  „§ Z dniem dokonania ostatniej wpłaty przewidzianej w § X niniejszej ugody wierzyciel zwalnia dłużnika z całego pozostałego zobowiązania wynikającego z umowy nr [...]. Wierzyciel oświadcza, że po wykonaniu ugody nie będzie dochodzić od dłużnika żadnych dalszych roszczeń z tytułu wskazanego stosunku prawnego.”
                </blockquote>
                <blockquote>
                  „§ Wierzyciel zobowiązuje się do wystąpienia w terminie 14 dni od wykonania ugody o usunięcie wpisu dłużnika z rejestrów BIG / BIK / KRD / ERIF.”
                </blockquote>
                <blockquote>
                  „§ Wierzyciel oświadcza, że w przypadku jakichkolwiek opóźnień w spłacie nie nalicza kar umownych przekraczających maksymalne odsetki za opóźnienie z art. 481 § 2(1) k.c.”
                </blockquote>
              </>
            ),
          },
          {
            id: "po-podpisaniu",
            title: "Po podpisaniu — co dalej",
            content: (
              <>
                <p>
                  Trzymaj <strong>oryginał</strong> ugody i każdy dowód wpłaty przez 10 lat. Po ostatniej wpłacie zażądaj pisemnego potwierdzenia całkowitej spłaty (art. 462 k.c. — pokwitowanie). Sprawdź w BIK po 30 dniach, czy wpis został zaktualizowany — jeśli nie, złóż reklamację.
                </p>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D4",
          title: "Propozycja ugody z wierzycielem",
          href: "/panel/nowa-sprawa",
          description: "Wygenerujemy ugodę z klauzulami ochronnymi i propozycją rozłożenia na raty.",
          price: "od 49 zł",
        }}
        legalSources={[
          "Ustawa z dnia 23 kwietnia 1964 r. — Kodeks cywilny, art. 917–918 (ugoda), 462 (pokwitowanie), 123 (przerwanie biegu przedawnienia)",
          "Ustawa z dnia 17 listopada 1964 r. — Kodeks postępowania cywilnego, art. 777",
          "Wyrok SN z 28 stycznia 2010 r., I CSK 211/09",
        ]}
      />
    </>
  );
}
