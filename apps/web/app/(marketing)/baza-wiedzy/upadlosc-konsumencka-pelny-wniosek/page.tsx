import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

const SLUG = "upadlosc-konsumencka-pelny-wniosek";
const TITLE = "Upadłość konsumencka — pełny wniosek krok po kroku";
const DESCRIPTION =
  "Jak prawidłowo wypełnić wniosek o upadłość konsumencką: wykaz majątku, wykaz wierzycieli, spis wydatków, dokumenty dochodowe, opłaty.";
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
        category="Upadłość"
        readingMinutes={18}
        updatedAt={UPDATED}
        lead="Pełny wniosek o upadłość konsumencką to nie tylko formularz, ale komplet załączników: wykaz majątku pod rygorem odpowiedzialności karnej (art. 522 PrUp), wykaz wierzycieli z dokładnymi kwotami, spis wydatków, dokumenty dochodowe za 3 lata. Opłata wynosi 30 zł, można też wystąpić o zwolnienie. Sąd ma 2 miesiące na rozpoznanie."
        sections={[
          {
            id: "kiedy-pelny-wniosek",
            title: "Kiedy potrzebny jest pełny wniosek (a nie uproszczony)?",
            content: (
              <>
                <p>Pełny wniosek (na formularzu KRS-W11) jest wymagany, gdy:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posiadasz znaczący majątek (nieruchomość, samochód powyżej 20 tys. zł, oszczędności).</li>
                  <li>Liczba wierzycieli przekracza 5.</li>
                  <li>Suma zobowiązań przekracza 100 tys. zł.</li>
                  <li>Spór dotyczy wysokości lub istnienia wierzytelności.</li>
                  <li>Posiadasz aktywa za granicą.</li>
                </ul>
              </>
            ),
          },
          {
            id: "wykaz-majatku",
            title: "Wykaz majątku — najczęstsze błędy",
            content: (
              <>
                <p>Wykaz musi obejmować <strong>wszystko</strong>: nieruchomości, udziały, samochody, biżuterię, środki na kontach (też dewizowych), wierzytelności, prawa majątkowe.</p>
                <p>Zatajenie nawet drobnego majątku to przestępstwo z art. 522 ustawy Prawo upadłościowe (do 5 lat pozbawienia wolności). Sąd weryfikuje wykaz z bazami KRS, CEIDG, KW (księgi wieczyste), CBE (Centralna Baza Ewidencji Pojazdów).</p>
              </>
            ),
          },
          {
            id: "wykaz-wierzycieli",
            title: "Wykaz wierzycieli — wymagane dane",
            content: (
              <>
                <p>Dla każdego wierzyciela wpisz:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Pełną nazwę i adres (z KRS lub CEIDG).</li>
                  <li>Kwotę kapitału, odsetek (na dzień złożenia wniosku) i kosztów.</li>
                  <li>Tytuł wierzytelności (umowa pożyczki nr X z dnia Y, nakaz zapłaty z sygnaturą Z).</li>
                  <li>Czy jest zabezpieczona (np. hipoteką, zastawem).</li>
                  <li>Czy jest wymagalna / sporna.</li>
                </ul>
              </>
            ),
          },
          {
            id: "plan-splaty",
            title: "Plan spłaty — co to jest i ile trwa?",
            content: (
              <>
                <p>Po ogłoszeniu upadłości syndyk sporządza projekt planu spłaty na 36 miesięcy (standard) lub 84 miesięcy (przy „rażącym niedbalstwie" — art. 491<sup>15</sup> PrUp).</p>
                <p>W szczególnych przypadkach (ciężka choroba, niezdolność do pracy, brak majątku) sąd może orzec <strong>umorzenie bez ustalenia planu spłaty</strong> (art. 491<sup>16</sup> PrUp).</p>
              </>
            ),
          },
          {
            id: "oplaty-zwolnienie",
            title: "Opłaty i zwolnienie z kosztów",
            content: (
              <>
                <p>Opłata stała: <strong>30 zł</strong> (art. 76a ust. 1 ustawy o kosztach sądowych).</p>
                <p>Jeśli nie stać Cię — złóż <em>razem</em> z wnioskiem oświadczenie o stanie rodzinnym, majątku, dochodach i wniosek o zwolnienie z kosztów. Sąd rozpatrzy go w pierwszej kolejności.</p>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D9",
          title: "Upadłość-Pro — pełny wniosek",
          href: "/app/sprawy/nowa?typ=upadlosc_pelny_wniosek",
          description: "Kreator pełnego wniosku z 25 załącznikami. AI sprawdza spójność wykazu majątku z wykazem wierzycieli.",
          price: "199 zł",
        }}
        legalSources={[
          "art. 11, 491¹–491²⁴ ustawy z 28 lutego 2003 r. Prawo upadłościowe (Dz.U. 2003 nr 60 poz. 535)",
          "art. 522 PrUp — odpowiedzialność karna za zatajenie majątku",
          "art. 76a ustawy o kosztach sądowych w sprawach cywilnych — opłata stała 30 zł",
          "Postanowienie SN z 16 czerwca 2021 r., III CZP 25/21 — przesłanki umorzenia bez planu spłaty",
        ]}
      />
    </>
  );
}
