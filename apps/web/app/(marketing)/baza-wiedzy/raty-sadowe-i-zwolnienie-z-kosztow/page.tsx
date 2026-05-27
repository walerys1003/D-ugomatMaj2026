import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

const SLUG = "raty-sadowe-i-zwolnienie-z-kosztow";
const TITLE = "Raty sądowe i zwolnienie z kosztów sądowych — jak skutecznie złożyć wniosek";
const DESCRIPTION =
  "Wniosek o rozłożenie zasądzonej kwoty na raty (art. 320 KPC) oraz wniosek o zwolnienie z kosztów sądowych (art. 102 UKSC).";
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
        readingMinutes={12}
        updatedAt={UPDATED}
        lead="Art. 320 KPC pozwala sądowi rozłożyć zasądzoną kwotę na raty „w szczególnie uzasadnionych wypadkach” — w praktyce to dochody netto poniżej 2× minimum socjalnego, osoby na utrzymaniu, choroby. Art. 102 UKSC umożliwia zwolnienie z kosztów sądowych w całości lub części, jeśli dochód na członka rodziny jest zbyt niski."
        sections={[
          {
            id: "rozlozenie-na-raty",
            title: "Rozłożenie na raty — kiedy sąd je przyzna",
            content: (
              <>
                <p>Art. 320 KPC: sąd „w szczególnie uzasadnionych wypadkach może w wyroku rozłożyć na raty zasądzone świadczenie”. Sąd patrzy na:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Stałe i nieregularne dochody dłużnika.</li>
                  <li>Liczbę osób na utrzymaniu.</li>
                  <li>Wydatki stałe (czynsz, leki, alimenty, inne raty).</li>
                  <li>Postawę dłużnika — czy współpracuje, czy ukrywa się.</li>
                  <li>Realność spłaty w proponowanym terminie.</li>
                </ul>
                <p>Typowo akceptowane: 12-36 miesięcznych rat. Sąd może też przesunąć początek spłaty (np. 6 miesięcy karencji).</p>
              </>
            ),
          },
          {
            id: "zwolnienie-z-kosztow",
            title: "Zwolnienie z kosztów sądowych",
            content: (
              <>
                <p>Art. 102 ust. 1 UKSC: zwolnienie przysługuje, jeśli „nie jest w stanie ich ponieść bez uszczerbku dla utrzymania siebie i rodziny”. Standardowy próg w orzecznictwie SN: dochód na członka rodziny &lt; 2× minimum egzystencji (ok. 1 200 zł).</p>
                <p>Konieczne załączniki:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Oświadczenie o stanie rodzinnym, majątku i dochodach (formularz urzędowy).</li>
                  <li>Zaświadczenia o dochodach (PIT, umowa, decyzja ZUS).</li>
                  <li>Faktury / rachunki za wydatki stałe.</li>
                  <li>Dokumenty potwierdzające choroby / niepełnosprawność (jeśli dotyczy).</li>
                </ul>
              </>
            ),
          },
          {
            id: "termin",
            title: "Kiedy złożyć wniosek?",
            content: (
              <>
                <p><strong>Raty</strong> — najpóźniej na rozprawie poprzedzającej zamknięcie rozprawy. Zaleca się złożenie w odpowiedzi na pozew lub w piśmie procesowym.</p>
                <p><strong>Zwolnienie z kosztów</strong> — można złożyć w każdym momencie, ale przed czynnością procesową, której koszt chcesz uniknąć (np. przed wniesieniem pozwu lub apelacji).</p>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D13",
          title: "Raty sądowe + zwolnienie z kosztów",
          href: "/app/sprawy/nowa?typ=wniosek_raty_sadowe",
          description: "Dwa wnioski w jednym pakiecie. AI dobiera argumenty do Twojej sytuacji finansowej.",
          price: "99 zł",
        }}
        legalSources={[
          "art. 320 ustawy z 17 listopada 1964 r. Kodeks postępowania cywilnego",
          "art. 102 i 103 ustawy z 28 lipca 2005 r. o kosztach sądowych w sprawach cywilnych",
          "Postanowienie SN z 26 stycznia 2017 r., I CSK 24/16",
          "Postanowienie SN z 4 lipca 2019 r., IV CZ 36/19",
        ]}
      />
    </>
  );
}
