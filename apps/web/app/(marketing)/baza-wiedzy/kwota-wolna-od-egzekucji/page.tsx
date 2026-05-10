import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "kwota-wolna-od-egzekucji";
const TITLE = "Kwota wolna od egzekucji — ile komornik musi Ci zostawić";
const DESCRIPTION =
  "Minimalne wynagrodzenie wolne od potrąceń, kwoty wolne na rachunku bankowym (75% minimalnej krajowej × 1) i jak je odzyskać, jeśli komornik zajął więcej.";
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
        category="Egzekucja"
        readingMinutes={9}
        updatedAt={UPDATED}
        lead="Komornik nie może zająć całego wynagrodzenia ani całego rachunku bankowego. Kodeks pracy (art. 87–87(1)) gwarantuje, że na koncie pracownika zostaje co najmniej minimalna krajowa (przy długach niealimentacyjnych), a w banku — kwota wolna w wysokości 75% minimalnego wynagrodzenia miesięcznie (art. 54 Prawa bankowego). W 2025 r. to odpowiednio 4 666 zł netto i 3 499,50 zł brutto."
        sections={[
          {
            id: "wynagrodzenie",
            title: "Wynagrodzenie z umowy o pracę",
            content: (
              <>
                <p>
                  Przy długu <strong>niealimentacyjnym</strong> komornik może zająć maksymalnie 50% wynagrodzenia netto, ale na koncie musi zostać kwota odpowiadająca minimalnej krajowej netto (2025: 3 510 zł). Jeśli pracujesz na pół etatu — kwota wolna proporcjonalnie maleje.
                </p>
                <p>
                  Przy długu <strong>alimentacyjnym</strong> ochrona jest słabsza: komornik może zająć do 60% pensji i kwota wolna nie obowiązuje (art. 87(1) § 2 k.p.).
                </p>
              </>
            ),
          },
          {
            id: "konto",
            title: "Rachunek bankowy — 75% minimalnej krajowej",
            content: (
              <>
                <p>
                  Art. 54 ust. 1 Prawa bankowego: wolne od zajęcia są środki na rachunku w każdym miesiącu kalendarzowym do wysokości <strong>75% minimalnego wynagrodzenia brutto</strong> (2025: 3 499,50 zł). Kwota odnawia się co miesiąc — bank musi sam ją wyliczyć i wypłacić Ci na żądanie.
                </p>
                <p>
                  <strong>Pułapka</strong>: jeśli na konto wpływa wynagrodzenie już <em>po</em> potrąceniu komorniczym, kwota wolna w banku liczy się od nowa od tej wpłaty.
                </p>
              </>
            ),
          },
          {
            id: "umowa-zlecenie",
            title: "Umowa zlecenie i B2B",
            content: (
              <>
                <p>
                  Do umów zlecenie i o dzieło stosuje się <strong>odpowiednio</strong> przepisy o ochronie wynagrodzenia (art. 833 § 2(1) k.p.c., obowiązuje od 2019 r.), pod warunkiem że jest to jedyne lub główne źródło utrzymania. Trzeba złożyć u komornika oświadczenie ze wskazaniem płatnika i wysokości umowy.
                </p>
                <p>
                  Przedsiębiorca na B2B kwoty wolnej nie ma — komornik może zająć cały rachunek firmowy.
                </p>
              </>
            ),
          },
          {
            id: "zwrot",
            title: "Co zrobić, jeśli komornik zajął za dużo",
            content: (
              <>
                <ol>
                  <li>Złóż <strong>skargę na czynności komornika</strong> w terminie 7 dni od momentu, gdy dowiedziałeś się o nieprawidłowości (art. 767 k.p.c.) — patrz nasz artykuł „Skarga na czynności komornika”.</li>
                  <li>Złóż wniosek o <strong>zwolnienie spod egzekucji</strong> kwoty wolnej (art. 833 § 6 k.p.c.).</li>
                  <li>Jeśli bank pominął kwotę wolną — złóż reklamację, a jeśli odmówi — skargę do Rzecznika Finansowego (rf.gov.pl, bezpłatnie).</li>
                </ol>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D5",
          title: "Skarga na czynności komornika",
          href: "/panel/nowa-sprawa",
          description: "Wygenerujemy skargę z dokładnym wyliczeniem nadwyżki zajęcia.",
          price: "od 59 zł",
        }}
        legalSources={[
          "Ustawa z dnia 26 czerwca 1974 r. — Kodeks pracy, art. 87–87(1)",
          "Ustawa z dnia 29 sierpnia 1997 r. — Prawo bankowe, art. 54",
          "Ustawa z dnia 17 listopada 1964 r. — Kodeks postępowania cywilnego, art. 767, 833",
          "Rozporządzenie RM z 14.09.2024 r. ws. wysokości minimalnego wynagrodzenia (Dz.U. 2024 poz. 1390)",
        ]}
      />
    </>
  );
}
