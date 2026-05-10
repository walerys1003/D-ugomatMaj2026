import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "cesja-wierzytelnosci-fundusze";
const TITLE = "Cesja wierzytelności — gdy Twój dług kupuje fundusz";
const DESCRIPTION =
  "Co to jest cesja, jak rozpoznać legitymację czynną funduszu sekurytyzacyjnego, jakie dokumenty musi przedstawić powód i kiedy cesja jest nieskuteczna.";
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
        category="Sąd"
        readingMinutes={10}
        updatedAt={UPDATED}
        lead="Banki i operatorzy telefonów regularnie sprzedają portfele długów funduszom sekurytyzacyjnym (Kruk, Best, Ultimo, Hoist, Intrum, GetBack). Fundusz, aby pozwać Cię w sądzie, musi udowodnić, że <strong>skutecznie</strong> nabył wierzytelność — i to konkretną, indywidualnie oznaczoną. Brak załącznika z wyciągiem z umowy cesji to najczęstszy powód oddalania pozwów funduszy."
        sections={[
          {
            id: "co-to-jest",
            title: "Co to jest cesja wierzytelności?",
            content: (
              <>
                <p>
                  Cesja (przelew wierzytelności) to umowa, na mocy której wierzyciel (cedent) przenosi na osobę trzecią (cesjonariusza) wierzytelność wobec dłużnika — bez jego zgody (art. 509 § 1 k.c.). Razem z wierzytelnością przechodzą wszystkie związane z nią prawa, w tym zaległe odsetki (art. 509 § 2 k.c.).
                </p>
                <p>
                  Dłużnik o cesji powinien zostać <strong>zawiadomiony</strong> (art. 512 k.c.) — jeśli zapłaci „staremu” wierzycielowi w dobrej wierze, nadal zwolni się z długu.
                </p>
              </>
            ),
          },
          {
            id: "legitymacja",
            title: "Legitymacja czynna — co musi pokazać fundusz",
            content: (
              <>
                <p>
                  W procesie fundusz musi udowodnić <strong>trzy rzeczy</strong> (uchwała SN III CZP 18/14, II CSK 273/13):
                </p>
                <ol>
                  <li>Umowę cesji (datę zawarcia, strony, podpisy);</li>
                  <li>Załącznik z indywidualnym oznaczeniem Twojej wierzytelności (imię, nazwisko, PESEL, numer umowy, kwota);</li>
                  <li>Zapłatę ceny — wynika z umowy lub potwierdzenia przelewu.</li>
                </ol>
                <p>
                  W praktyce fundusze załączają anonimizowany wyciąg, w którym wszystko poza Twoim wierszem jest zamazane. SN dopuścił tę praktykę, ale wymaga, aby było jasno widoczne: numer porządkowy, Twoje dane, kwota nominalna i data wymagalności.
                </p>
              </>
            ),
          },
          {
            id: "zarzuty",
            title: "Jakie zarzuty można podnieść?",
            content: (
              <>
                <ul>
                  <li><strong>Brak legitymacji czynnej</strong> — fundusz nie udowodnił, że nabył <em>akurat tę</em> wierzytelność.</li>
                  <li><strong>Brak zawiadomienia o cesji</strong> (art. 512 k.c.) — wpływa na rozłożenie ciężaru dowodu zapłat dokonanych w dobrej wierze.</li>
                  <li><strong>Przedawnienie</strong> — cesja nie przerywa biegu przedawnienia, więc fundusz odziedziczył pozostały czas (zwykle bardzo krótki, bo banki sprzedają długi w ostatniej chwili).</li>
                  <li><strong>Klauzule abuzywne w pierwotnej umowie</strong> — nawet po cesji konsument zachowuje prawo do podniesienia abuzywności (TSUE C-415/11 Aziz, C-260/18 Dziubak).</li>
                </ul>
              </>
            ),
          },
          {
            id: "praktyka",
            title: "Praktyka — jak działa fundusz",
            content: (
              <>
                <p>
                  Fundusz najpierw wysyła wezwanie do zapłaty (często z propozycją 30–70% rabatu — to znak, że sam wie, iż roszczenie jest ryzykowne). Następnie składa pozew w EPU (e-Sąd Lublin-Zachód), bo to tanio i szybko. Jeśli wniesiesz sprzeciw — nakaz traci moc, sprawa trafia do Twojego sądu rejonowego, a fundusz musi <em>realnie</em> udowodnić roszczenie.
                </p>
                <p>
                  Statystycznie po wniesieniu sprzeciwu od nakazu EPU około 40% spraw funduszowych jest umarzanych albo oddalanych — bo fundusz nie chce inwestować w pełne postępowanie dowodowe.
                </p>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D7",
          title: "Sprzeciw przeciw funduszowi",
          href: "/panel/nowa-sprawa",
          description: "Sprzeciw od nakazu zapłaty z zarzutem braku legitymacji czynnej cesjonariusza.",
          price: "od 59 zł",
        }}
        legalSources={[
          "Ustawa z dnia 23 kwietnia 1964 r. — Kodeks cywilny, art. 509–518",
          "Uchwała SN z dnia 12 marca 2014 r., III CZP 18/14",
          "Wyrok SN z dnia 25 marca 2014 r., II CSK 273/13",
          "Wyrok TSUE z dnia 14 czerwca 2012 r., C-618/10 Banco Español de Crédito",
        ]}
      />
    </>
  );
}
