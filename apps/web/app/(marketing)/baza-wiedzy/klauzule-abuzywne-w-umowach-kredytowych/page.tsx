import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "klauzule-abuzywne-w-umowach-kredytowych";
const TITLE = "Klauzule abuzywne w umowach kredytowych — jak je rozpoznać";
const DESCRIPTION =
  "Co to są klauzule niedozwolone (art. 385(1) k.c.), rejestr UOKiK, orzecznictwo TSUE (Dziubak, Aziz) i jak podnieść zarzut abuzywności w sprawach kredytów konsumenckich.";
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
        readingMinutes={11}
        updatedAt={UPDATED}
        lead="Klauzula abuzywna to zapis umowy zawartej z konsumentem, który kształtuje jego prawa i obowiązki sprzecznie z dobrymi obyczajami, rażąco naruszając jego interesy (art. 385(1) § 1 k.c.). Klauzule abuzywne nie wiążą konsumenta — sąd ma obowiązek badać je z urzędu (TSUE C-243/08 Pannon, C-415/11 Aziz). Najgłośniejsza polska sprawa to wyrok TSUE C-260/18 Dziubak (3 października 2019) dotyczący kredytów frankowych."
        sections={[
          {
            id: "definicja",
            title: "Co to jest klauzula abuzywna?",
            content: (
              <>
                <p>
                  Art. 385(1) § 1 k.c. definiuje cztery przesłanki niedozwolonego postanowienia:
                </p>
                <ol>
                  <li>umowa jest zawarta z <strong>konsumentem</strong> (osobą fizyczną nieprowadzącą działalności, dla której umowa nie jest bezpośrednio związana z biznesem);</li>
                  <li>postanowienie <strong>nie zostało indywidualnie uzgodnione</strong> — czyli pochodzi z wzorca umownego (regulamin, OWU, tabela opłat);</li>
                  <li><strong>kształtuje prawa i obowiązki sprzecznie z dobrymi obyczajami</strong>;</li>
                  <li><strong>rażąco narusza interesy</strong> konsumenta.</li>
                </ol>
                <p>
                  Skutek: klauzula <strong>nie wiąże konsumenta</strong> ze skutkiem od momentu zawarcia umowy (ex tunc). Reszta umowy obowiązuje, chyba że bez klauzuli nie da się jej wykonać — wtedy upada w całości.
                </p>
              </>
            ),
          },
          {
            id: "typowe",
            title: "Najczęstsze klauzule abuzywne",
            content: (
              <>
                <ul>
                  <li><strong>Zmienne opłaty bez wskazania metody przeliczania</strong> („opłata uzależniona od kosztów banku”);</li>
                  <li><strong>Opłaty za monity</strong> w wysokości nieadekwatnej do rzeczywistych kosztów (np. 30 zł za SMS);</li>
                  <li><strong>Klauzule indeksacyjne</strong> w kredytach frankowych (kurs ustalany jednostronnie przez bank, brak ograniczeń ryzyka kursowego);</li>
                  <li><strong>Klauzule jurysdykcyjne</strong> wyznaczające sąd siedziby banku (sprzeczne z art. 17 Rozporządzenia Bruksela I bis);</li>
                  <li><strong>Klauzule prolongacyjne</strong> wydłużające termin spłaty z drastycznie podwyższonym oprocentowaniem;</li>
                  <li><strong>Ubezpieczenie niskiego wkładu</strong> doliczane jednostronnie do kosztów kredytu.</li>
                </ul>
                <p>
                  Każde z tych postanowień znajdziesz w <strong>Rejestrze klauzul niedozwolonych UOKiK</strong> (dawniej prowadzonym przez Sąd Ochrony Konkurencji i Konsumentów).
                </p>
              </>
            ),
          },
          {
            id: "rejestr",
            title: "Rejestr klauzul niedozwolonych UOKiK",
            content: (
              <>
                <p>
                  Rejestr <a href="https://www.rejestr.uokik.gov.pl">rejestr.uokik.gov.pl</a> zawiera wszystkie klauzule, które prawomocnie zostały uznane za niedozwolone w postępowaniu o uznanie postanowień wzorca umowy. Wpis ma skutek <strong>rozszerzony</strong> — działa wobec wszystkich przedsiębiorców stosujących identyczny lub zbliżony zapis (uchwała SN III CZP 17/15).
                </p>
                <p>
                  Przed sporządzeniem sprzeciwu zawsze warto sprawdzić, czy umowa, której dotyczy sprawa, nie zawiera klauzul figurujących już w rejestrze — taki argument jest praktycznie nie do podważenia.
                </p>
              </>
            ),
          },
          {
            id: "tsue",
            title: "Orzecznictwo TSUE — co zmieniło Dziubak",
            content: (
              <>
                <p>
                  Wyrok TSUE z 3 października 2019 r. (C-260/18 Dziubak vs. Raiffeisen Bank) doprecyzował, że jeśli klauzula indeksacyjna w kredycie frankowym jest abuzywna i nie da się jej zastąpić innym przepisem dyspozytywnym, umowa może <strong>upaść w całości</strong>. To otworzyło drogę do tzw. „odfrankowienia” umów lub ich unieważnienia.
                </p>
                <p>
                  Linia orzecznicza została utrwalona uchwałami SN III CZP 11/20, III CZP 6/21 (zasada równowartości świadczeń) oraz uchwałą całej Izby Cywilnej z 25 kwietnia 2024 r. (III CZP 25/22).
                </p>
              </>
            ),
          },
          {
            id: "jak-podniesc",
            title: "Jak skutecznie podnieść zarzut abuzywności",
            content: (
              <>
                <ol>
                  <li>Wypisz <strong>konkretne paragrafy</strong> umowy lub regulaminu, które uważasz za abuzywne (cytaty in extenso).</li>
                  <li>Wskaż, w jaki sposób naruszają dobre obyczaje i rażąco godzą w Twoje interesy.</li>
                  <li>Powołaj się na <strong>analogiczne wpisy w rejestrze UOKiK</strong> (numer wpisu + data).</li>
                  <li>Wskaż skutki: jeżeli klauzula dotyczy istotnego elementu (cena, kurs), umowa powinna upaść; jeżeli marginalnego — tylko ta klauzula odpada.</li>
                  <li>Wniosek końcowy: o oddalenie pozwu / o ustalenie nieważności umowy.</li>
                </ol>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D2",
          title: "Sprzeciw z zarzutem abuzywności",
          href: "/panel/nowa-sprawa",
          description: "Sprzeciw od nakazu zapłaty z odwołaniem do rejestru UOKiK i orzecznictwa TSUE.",
          price: "od 69 zł",
        }}
        legalSources={[
          "Ustawa z dnia 23 kwietnia 1964 r. — Kodeks cywilny, art. 385(1)–385(3)",
          "Dyrektywa Rady 93/13/EWG z 5 kwietnia 1993 r. o nieuczciwych warunkach w umowach konsumenckich",
          "Wyrok TSUE z 3.10.2019 r., C-260/18 Dziubak",
          "Wyrok TSUE z 14.06.2012 r., C-618/10 Banco Español de Crédito",
          "Uchwała SN z 25.04.2024 r., III CZP 25/22",
        ]}
      />
    </>
  );
}
