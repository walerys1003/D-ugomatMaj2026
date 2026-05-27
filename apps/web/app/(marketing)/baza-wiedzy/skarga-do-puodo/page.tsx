import type { Metadata } from "next";
import { KnowledgeArticle, buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "skarga-do-puodo";
const TITLE = "Skarga do PUODO — naruszenia RODO przez wierzycieli i windykatorów";
const DESCRIPTION =
  "Jak skutecznie złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych. Najczęstsze naruszenia, wzór, czego unikać.";
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
        category="Ochrona danych"
        readingMinutes={10}
        updatedAt={UPDATED}
        lead="Skarga do PUODO to skuteczne narzędzie wobec windykatorów, którzy nękają telefonami, przekazują dane sąsiadom lub pracodawcom, albo wpisują do BIG dane przedawnione. Postępowanie jest bezpłatne, prowadzi PUODO. Kara dla naruszyciela może wynieść do 4% rocznego obrotu lub 20 mln EUR (art. 83 RODO)."
        sections={[
          {
            id: "kiedy-skarga",
            title: "Kiedy złożyć skargę?",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li>Windykator dzwoni do sąsiadów, rodziny, pracodawcy — naruszenie zasady minimalizacji danych (art. 5 ust. 1 lit. c RODO).</li>
                <li>Dane są przetwarzane mimo żądania ich usunięcia (art. 17 RODO) lub sprzeciwu (art. 21).</li>
                <li>Wpis w BIK/KRD/ERIF dotyczy przedawnionego długu lub jest błędny.</li>
                <li>Pracownik banku/sklepu kopiuje dowód osobisty bez podstawy prawnej.</li>
                <li>Mailing reklamowy mimo cofnięcia zgody.</li>
              </ul>
            ),
          },
          {
            id: "jak-zlozyc",
            title: "Jak złożyć skargę — krok po kroku",
            content: (
              <>
                <ol className="list-decimal pl-6 space-y-2">
                  <li><strong>Najpierw zwróć się do administratora</strong> — pisemnie wezwij do zaprzestania naruszenia (art. 77 RODO daje takie prawo, ale dobrze ma to przedstawić w skardze).</li>
                  <li><strong>Zbierz dowody</strong>: screeny SMS, nagrania rozmów (zgodne z art. 6 RODO), kopie pism, świadków.</li>
                  <li><strong>Wypełnij wniosek</strong>: formularz na stronie uodo.gov.pl lub samodzielne pismo (musi zawierać dane Twoje + administratora + opis naruszenia + załączniki).</li>
                  <li><strong>Wyślij</strong>: ePUAP, poczta tradycyjna, osobiście. UWAGA: email nie jest skuteczny.</li>
                </ol>
              </>
            ),
          },
          {
            id: "co-dalej",
            title: "Co dzieje się po złożeniu skargi?",
            content: (
              <ol className="list-decimal pl-6 space-y-1">
                <li>PUODO bada sprawę — może żądać wyjaśnień od administratora (zwykle 30-60 dni).</li>
                <li>Jeśli stwierdzi naruszenie — wydaje decyzję: nakaz, ostrzeżenie, kara pieniężna.</li>
                <li>Od decyzji można się odwołać do WSA w Warszawie w terminie 30 dni.</li>
              </ol>
            ),
          },
          {
            id: "blad-czesty",
            title: "Najczęstsze błędy w skardze",
            content: (
              <ul className="list-disc pl-6 space-y-1">
                <li>Brak załączników z dowodami — PUODO pozostawia skargę bez rozpoznania.</li>
                <li>Skarga dotyczy „obrazy uczuć" zamiast naruszenia konkretnego artykułu RODO.</li>
                <li>Brak wcześniejszego kontaktu z administratorem.</li>
                <li>Wniesienie skargi przez email zamiast ePUAP/poczty.</li>
              </ul>
            ),
          },
        ]}
        relatedModule={{
          code: "D12",
          title: "Skarga PUODO",
          href: "/app/sprawy/nowa?typ=skarga_puodo",
          description: "Generator skargi z prawidłową kwalifikacją naruszenia, listą dowodów i adresem PUODO.",
          price: "59 zł",
        }}
        legalSources={[
          "Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z 27 kwietnia 2016 r. (RODO)",
          "Ustawa z 10 maja 2018 r. o ochronie danych osobowych (Dz.U. 2018 poz. 1000)",
          "Decyzje PUODO — dostępne w wyszukiwarce na uodo.gov.pl",
        ]}
      />
    </>
  );
}
