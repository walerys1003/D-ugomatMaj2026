import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "upadlosc-konsumencka";
const TITLE = "Upadłość konsumencka — kompletny przewodnik 2025";
const DESCRIPTION =
  "Kto może ogłosić upadłość konsumencką, jak wygląda procedura po nowelizacji z 2020 r., ile trwa plan spłaty i czym jest umorzenie zobowiązań bez ustalenia planu.";
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
        category="Upadłość"
        readingMinutes={14}
        updatedAt={UPDATED}
        lead="Upadłość konsumencka po nowelizacji z 24 marca 2020 r. jest dużo łatwiej dostępna — sąd nie bada już moralności dłużnika na etapie ogłoszenia, tylko niewypłacalność. Plan spłaty trwa zwykle 36 miesięcy, a w przypadkach „lekkomyślności rażącej” do 84 miesięcy. Po jego wykonaniu pozostałe długi są umarzane. W skrajnych przypadkach (np. ciężka choroba) sąd może umorzyć długi bez ustalania planu."
        sections={[
          {
            id: "kto-moze",
            title: "Kto może ogłosić upadłość konsumencką?",
            content: (
              <>
                <p>
                  Każda osoba fizyczna nieprowadząca działalności gospodarczej, która jest <strong>niewypłacalna</strong> — czyli nie wykonuje swoich wymagalnych zobowiązań pieniężnych od co najmniej 3 miesięcy (art. 11 ust. 1 Prawa upadłościowego).
                </p>
                <p>
                  Po nowelizacji z 2020 r. zniesiono przesłankę „dłużnik doprowadził do niewypłacalności umyślnie lub wskutek rażącego niedbalstwa” na etapie ogłoszenia. Te okoliczności są oceniane dopiero przy ustalaniu długości planu spłaty.
                </p>
              </>
            ),
          },
          {
            id: "procedura",
            title: "Jak wygląda procedura",
            content: (
              <>
                <ol>
                  <li><strong>Wniosek o ogłoszenie upadłości</strong> składa się na urzędowym formularzu w sądzie rejonowym właściwym dla miejsca zamieszkania (opłata 30 zł).</li>
                  <li>Sąd ogłasza upadłość — od tej chwili egzekucje są zawieszone, odsetki przestają biec, komornik nie może zająć rachunku.</li>
                  <li>Syndyk obejmuje majątek (mieszkanie, samochód, oszczędności) i sprzedaje go w ramach masy upadłości.</li>
                  <li>Sąd ustala <strong>plan spłaty</strong> wierzycieli (zwykle 36 miesięcy, maks. 84 przy rażącej lekkomyślności).</li>
                  <li>Po wykonaniu planu — sąd umarza pozostałe długi (art. 491(15) Prawa upadłościowego).</li>
                </ol>
              </>
            ),
          },
          {
            id: "co-z-mieszkaniem",
            title: "Co z mieszkaniem i samochodem?",
            content: (
              <>
                <p>
                  Mieszkanie wejdzie do masy upadłości i zostanie sprzedane przez syndyka. Z uzyskanej ceny dłużnikowi przysługuje kwota odpowiadająca <strong>przeciętnemu czynszowi za 12–24 miesiące najmu</strong> w tej samej miejscowości (art. 491(13) Prawa upadłościowego) — pieniądze te są wolne od zajęcia i służą zapewnieniu rodzinie dachu nad głową.
                </p>
                <p>
                  Samochód i przedmioty codziennego użytku do określonej wartości pozostają u dłużnika (art. 829 k.p.c. stosowany odpowiednio).
                </p>
              </>
            ),
          },
          {
            id: "umorzenie",
            title: "Umorzenie bez planu spłaty",
            content: (
              <>
                <p>
                  Jeżeli dłużnik trwale nie jest w stanie dokonać żadnych spłat (ciężka choroba, podeszły wiek, brak perspektyw na pracę), sąd może umorzyć zobowiązania <strong>bez ustalania planu spłaty</strong> (art. 491(16) Prawa upadłościowego). To rozwiązanie najbardziej radykalne — pełne oddłużenie od dnia uprawomocnienia postanowienia.
                </p>
              </>
            ),
          },
          {
            id: "wady",
            title: "Wady upadłości — co tracisz",
            content: (
              <>
                <ul>
                  <li><strong>Wpis do CBDU</strong> (Centralny Rejestr Beneficjentów Rzeczywistych dla upadłości) — informacja publiczna przez 10 lat;</li>
                  <li><strong>Niemożność prowadzenia działalności gospodarczej</strong> w trakcie postępowania;</li>
                  <li><strong>Trudności z kredytem</strong> przez 5–7 lat po zakończeniu (BIK przechowuje informację 5 lat od wykonania planu);</li>
                  <li><strong>Niektóre długi nie podlegają umorzeniu</strong>: alimenty, kary grzywny, odszkodowania za czyny niedozwolone, zobowiązania powstałe po ogłoszeniu upadłości (art. 491(21) PrUp).</li>
                </ul>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D8",
          title: "Analiza wykonalności upadłości",
          href: "/panel/nowa-sprawa",
          description: "Sprawdzimy, czy upadłość jest najlepszą opcją w Twojej sytuacji.",
          price: "od 79 zł",
        }}
        legalSources={[
          "Ustawa z dnia 28 lutego 2003 r. — Prawo upadłościowe, art. 491(1)–491(24)",
          "Ustawa z dnia 30 sierpnia 2019 r. o zmianie ustawy — Prawo upadłościowe (Dz.U. 2019 poz. 1802)",
          "Postanowienie SN z dnia 22 lutego 2017 r., I CSK 273/16",
        ]}
      />
    </>
  );
}
