import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "big-infomonitor-krd-erif";
const TITLE = "BIG InfoMonitor, KRD, ERIF — jak działają rejestry dłużników";
const DESCRIPTION =
  "Różnice między biurami informacji gospodarczej, jak sprawdzić swoje wpisy, kiedy wierzyciel ma prawo wpisać dłużnika i jak skutecznie żądać usunięcia.";
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
        category="Rejestry"
        readingMinutes={8}
        updatedAt={UPDATED}
        lead="W Polsce działają trzy duże biura informacji gospodarczej (BIG): BIG InfoMonitor (Biuro Informacji Gospodarczej InfoMonitor S.A.), KRD (Krajowy Rejestr Długów BIG S.A.) i ERIF BIG S.A. Każde działa na podstawie ustawy z 9 kwietnia 2010 r. o udostępnianiu informacji gospodarczych i wymianie danych gospodarczych. Wpis powoduje, że Twoje dane są dostępne dla każdego, kto kupi raport — banki, operatorzy, leasingodawcy."
        sections={[
          {
            id: "kto-moze-wpisac",
            title: "Kto może wpisać dłużnika",
            content: (
              <>
                <p>
                  Wierzyciel ma prawo wpisać dłużnika do BIG, jeśli (art. 14–16 ustawy o BIG):
                </p>
                <ul>
                  <li>dług wynika z umowy (konsument: ≥ 200 zł, przedsiębiorca: ≥ 500 zł) <strong>lub</strong> z prawomocnego wyroku;</li>
                  <li>świadczenie jest <strong>wymagalne od co najmniej 30 dni</strong>;</li>
                  <li>wierzyciel <strong>wezwał dłużnika pisemnie</strong> do zapłaty (list polecony lub do rąk własnych), uprzedzając o zamiarze wpisu, i upłynął co najmniej miesiąc od doręczenia;</li>
                  <li>od daty wymagalności nie upłynęło więcej niż <strong>10 lat</strong> (wpisy z wyroku) lub <strong>6 lat</strong> (inne).</li>
                </ul>
                <p>
                  Wierzyciel <strong>nie</strong> musi mieć tytułu wykonawczego — wystarczy umowa.
                </p>
              </>
            ),
          },
          {
            id: "roznice",
            title: "Różnice między BIG-ami",
            content: (
              <>
                <ul>
                  <li><strong>BIG InfoMonitor</strong> — ścisła integracja z BIK (oba należą do Biura Informacji Kredytowej). Najwięcej danych z banków i firm pożyczkowych.</li>
                  <li><strong>KRD</strong> — największy zasięg wśród firm windykacyjnych, telekomów i e-commerce. Często stosowany jako element wezwań do zapłaty („grozimy wpisem do KRD”).</li>
                  <li><strong>ERIF</strong> — związany z grupą KRUK; wykorzystywany głównie przez fundusze sekurytyzacyjne i wierzycieli komercyjnych.</li>
                </ul>
                <p>
                  Wpis w jednym BIG <strong>nie</strong> dubluje się automatycznie w pozostałych. Sprawdź wszystkie trzy.
                </p>
              </>
            ),
          },
          {
            id: "sprawdzenie",
            title: "Jak sprawdzić swoje wpisy",
            content: (
              <>
                <p>
                  Raz na 6 miesięcy każda osoba ma prawo do <strong>bezpłatnego raportu o sobie</strong> z każdego BIG (art. 23 ustawy o BIG). Wniosek składa się przez stronę internetową biura — wymagane jest potwierdzenie tożsamości (przez bank lub mojeID).
                </p>
                <p>
                  Niezależnie od ustawy o BIG, RODO (art. 15) daje prawo do informacji o danych przetwarzanych w dowolnym momencie i bez ograniczeń liczby — wystarczy złożyć wniosek e-mailem do inspektora danych biura.
                </p>
              </>
            ),
          },
          {
            id: "usuniecie",
            title: "Jak żądać usunięcia wpisu",
            content: (
              <>
                <p>
                  Wierzyciel ma obowiązek <strong>w ciągu 14 dni</strong> wystąpić o usunięcie wpisu, jeśli (art. 29–30 ustawy o BIG):
                </p>
                <ul>
                  <li>dług został spłacony lub umorzony;</li>
                  <li>roszczenie uległo przedawnieniu;</li>
                  <li>zobowiązanie wygasło z innych przyczyn (np. nieważność umowy, klauzule abuzywne);</li>
                  <li>dane są nieaktualne lub nieprawdziwe.</li>
                </ul>
                <p>
                  Jeżeli wierzyciel <strong>nie reaguje</strong>, możesz złożyć wniosek o usunięcie/sprostowanie wprost do BIG (one ma obowiązek powiadomić wierzyciela i ocenić zasadność w ciągu 30 dni). Niezależnie — masz prawo do żądania ograniczenia przetwarzania (art. 18 RODO) oraz skargi do PUODO (uodo.gov.pl).
                </p>
              </>
            ),
          },
          {
            id: "konsekwencje",
            title: "Konsekwencje niesłusznego wpisu",
            content: (
              <>
                <p>
                  Bezprawny wpis (np. dotyczący spornego, przedawnionego lub nieistniejącego długu) może stanowić podstawę do:
                </p>
                <ul>
                  <li>roszczenia o usunięcie wpisu;</li>
                  <li>żądania <strong>zadośćuczynienia</strong> za naruszenie dóbr osobistych (art. 23, 24 i 448 k.c.) — w praktyce sądy zasądzają 2 000–10 000 zł;</li>
                  <li>roszczenia o odszkodowanie (np. utrata kredytu);</li>
                  <li>kary administracyjnej dla biura ze strony PUODO (do 20 mln EUR / 4% obrotu — RODO).</li>
                </ul>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D3",
          title: "Wniosek o usunięcie wpisu z BIG",
          href: "/panel/nowa-sprawa",
          description: "Skompletujemy wniosek z podstawą prawną (art. 29 ustawy o BIG + art. 16 RODO).",
          price: "od 39 zł",
        }}
        legalSources={[
          "Ustawa z dnia 9 kwietnia 2010 r. o udostępnianiu informacji gospodarczych i wymianie danych gospodarczych (Dz.U. 2010 nr 81 poz. 530 z późn. zm.)",
          "Rozporządzenie 2016/679 (RODO), art. 15, 16, 17, 18",
          "Wyrok SA w Warszawie z 4 lipca 2019 r., V ACa 290/18",
          "Decyzja PUODO z 30.04.2021 r. ZSPR.421.13.2019",
        ]}
      />
    </>
  );
}
