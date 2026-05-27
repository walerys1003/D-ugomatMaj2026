import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "wniosek-zwolnienie-kosztow-sadowych";
const TITLE = "Wniosek o zwolnienie z kosztów sądowych — szczegółowy przewodnik";
const DESCRIPTION =
  "Jak prawidłowo wypełnić oświadczenie o stanie rodzinnym, jakie dokumenty załączyć, kiedy sąd przyzna zwolnienie częściowe a kiedy całkowite.";
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
        category="Procedura sądowa"
        readingMinutes={10}
        updatedAt={UPDATED}
        lead="Zwolnienie z kosztów sądowych (art. 102 UKSC) to droga dla osób, które nie są w stanie ponieść opłat sądowych bez uszczerbku dla utrzymania siebie i rodziny. Sąd ocenia sytuację majątkową na podstawie urzędowego oświadczenia. W praktyce: dochód netto na członka rodziny poniżej ok. 1 200-1 500 zł daje wysoką szansę na zwolnienie."
        sections={[
          {
            id: "oswiadczenie",
            title: "Oświadczenie o stanie rodzinnym — formularz",
            content: (
              <>
                <p>Formularz jest urzędowy (rozporządzenie Ministra Sprawiedliwości z 28 września 2002 r.). Zawiera:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Dane wnioskodawcy + osób pozostających we wspólnym gospodarstwie.</li>
                  <li>Wszystkie źródła dochodów (umowa, działalność, renta, alimenty, zasiłki, 500+, darowizny).</li>
                  <li>Majątek: nieruchomości, samochody, oszczędności, papiery wartościowe, biżuteria powyżej 5 tys. zł.</li>
                  <li>Stałe wydatki (czynsz, media, leki, raty, alimenty wypłacane).</li>
                  <li>Zobowiązania (kredyty, pożyczki, zaległości).</li>
                </ul>
              </>
            ),
          },
          {
            id: "co-zalaczyc",
            title: "Co dołączyć?",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li>PIT-y za ostatnie 2 lata (najlepiej z UPO).</li>
                <li>Zaświadczenia o zarobkach z pracy (3 ostatnie miesiące).</li>
                <li>Decyzje ZUS (renta, emerytura, świadczenia).</li>
                <li>Decyzje gminne (500+, świadczenia rodzinne).</li>
                <li>Wyciągi bankowe (jeśli dochody nie wynikają z PIT).</li>
                <li>Faktury / rachunki za stałe wydatki.</li>
                <li>Zaświadczenia o chorobach (jeśli wpływają na wydatki / zdolność do pracy).</li>
                <li>Akt urodzenia dzieci, decyzje o niepełnosprawności.</li>
              </ul>
            ),
          },
          {
            id: "calkowite-czesciowe",
            title: "Zwolnienie całkowite vs. częściowe",
            content: (
              <>
                <p><strong>Całkowite</strong> — gdy wnioskodawca w ogóle nie jest w stanie ponieść opłat (typowo: bezrobotny bez majątku, osoba na zasiłku stałym).</p>
                <p><strong>Częściowe</strong> — gdy dochód pozwala na pokrycie części kosztów (np. zwolnienie z 75% opłaty, reszta płatna w ratach).</p>
              </>
            ),
          },
          {
            id: "konsekwencje-falszywe",
            title: "Konsekwencje fałszywego oświadczenia",
            content: (
              <p>
                Świadome zatajenie majątku lub dochodów to przestępstwo z art. 233 KK (do 8 lat pozbawienia wolności). Ponadto sąd cofa zwolnienie i nakazuje zwrot kosztów wraz z karą — typowo dwukrotność opłaty (art. 102 ust. 6 UKSC).
              </p>
            ),
          },
        ]}
        relatedModule={{
          code: "D14",
          title: "Wniosek o zwolnienie z kosztów sądowych",
          href: "/app/sprawy/nowa?typ=wniosek_zwolnienie_kosztow_sadowych",
          description: "Kreator z 12 sekcjami oświadczenia. AI dopasowuje argumenty do Twojej sytuacji.",
          price: "79 zł",
        }}
        legalSources={[
          "art. 102-103, 109 ustawy z 28 lipca 2005 r. o kosztach sądowych w sprawach cywilnych",
          "Rozporządzenie Ministra Sprawiedliwości z 28 września 2002 r. (Dz.U. 2002 nr 167 poz. 1373)",
          "Postanowienie SN z 9 marca 2017 r., I CSK 350/16",
          "art. 233 KK — odpowiedzialność za fałszywe zeznania/oświadczenia",
        ]}
      />
    </>
  );
}
