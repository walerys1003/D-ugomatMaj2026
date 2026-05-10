import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "przedawnienie-dlugu";
const TITLE = "Przedawnienie długu — kiedy bank traci prawo do egzekucji";
const DESCRIPTION =
  "Terminy przedawnienia z Kodeksu cywilnego (3 lata, 6 lat, 10 lat), jak skutecznie podnieść zarzut przedawnienia i jakie czynności przerywają bieg terminu.";
const UPDATED = "2025-05-01";

export const metadata: Metadata = {
  title: `${TITLE} | Długomat`,
  description: DESCRIPTION,
  alternates: { canonical: `/baza-wiedzy/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    publishedTime: UPDATED,
    modifiedTime: UPDATED,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({ title: TITLE, description: DESCRIPTION, slug: SLUG, updatedAt: UPDATED }),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd({ articleTitle: TITLE, articleSlug: SLUG }),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <KnowledgeArticle
        title={TITLE}
        category="Podstawy"
        readingMinutes={11}
        updatedAt={UPDATED}
        lead="Przedawnienie to instytucja, która chroni dłużnika przed bezterminową niepewnością. Po upływie terminu (najczęściej 3 lata dla roszczeń związanych z działalnością gospodarczą, 6 lat dla pozostałych) wierzyciel nadal może dochodzić długu w sądzie, ale Ty masz prawo podnieść zarzut przedawnienia — i sąd musi pozew oddalić. Od 2018 r. sąd bada przedawnienie z urzędu w sprawach konsumenckich (art. 117 § 2(1) k.c.)."
        sections={[
          {
            id: "terminy",
            title: "Terminy przedawnienia — które dotyczy Twojej sprawy?",
            content: (
              <>
                <p>
                  Kodeks cywilny przewiduje trzy podstawowe terminy:
                </p>
                <ul>
                  <li><strong>3 lata</strong> — roszczenia związane z działalnością gospodarczą oraz roszczenia o świadczenia okresowe (np. czynsz, raty kredytu, abonament telefoniczny);</li>
                  <li><strong>6 lat</strong> — roszczenia ogólne, jeżeli przepis szczególny nie stanowi inaczej (art. 118 k.c. po nowelizacji z 2018 r.);</li>
                  <li><strong>10 lat</strong> — roszczenia stwierdzone prawomocnym wyrokiem sądu lub tytułem egzekucyjnym (art. 125 k.c.).</li>
                </ul>
                <p>
                  W praktyce długi z kart kredytowych, pożyczek pozabankowych i abonamentów przedawniają się po <strong>3 latach</strong>, ponieważ pochodzą od przedsiębiorcy. Termin biegnie od dnia wymagalności — czyli od dnia, w którym wierzyciel mógł najwcześniej żądać zapłaty.
                </p>
              </>
            ),
          },
          {
            id: "od-kiedy",
            title: "Od kiedy liczy się termin?",
            content: (
              <>
                <p>
                  Termin biegnie od dnia wymagalności roszczenia (art. 120 k.c.). Dla rat kredytu — każda rata przedawnia się osobno, licząc od dnia, w którym była wymagalna. Dla limitu w karcie kredytowej — od dnia, w którym bank wypowiedział umowę i postawił saldo w stan natychmiastowej wymagalności.
                </p>
                <p>
                  Jeśli umowa nie określała terminu wymagalności (np. pożyczka „na żądanie”), termin biegnie od dnia, w którym wierzyciel mógł najwcześniej wezwać do zapłaty.
                </p>
              </>
            ),
          },
          {
            id: "przerwanie",
            title: "Co przerywa bieg przedawnienia?",
            content: (
              <>
                <p>
                  Bieg przedawnienia <strong>przerywa</strong> (art. 123 k.c.):
                </p>
                <ul>
                  <li>czynność przed sądem lub innym organem powołanym do dochodzenia roszczeń (np. pozew, wniosek o nadanie klauzuli wykonalności, wniosek do komornika);</li>
                  <li>uznanie roszczenia przez dłużnika (np. podpisanie ugody, częściowa spłata, prośba o rozłożenie na raty);</li>
                  <li>wszczęcie mediacji.</li>
                </ul>
                <p>
                  Po każdym przerwaniu termin biegnie od nowa. <strong>Uwaga</strong>: samo wezwanie do zapłaty <em>nie</em> przerywa przedawnienia. Cesja wierzytelności (sprzedaż długu funduszowi) również nie przerywa biegu — nowy wierzyciel „dziedziczy” pozostały czas.
                </p>
              </>
            ),
          },
          {
            id: "zarzut",
            title: "Jak podnieść zarzut przedawnienia?",
            content: (
              <>
                <p>
                  Zarzut przedawnienia podnosi się w pierwszym piśmie procesowym — w sprzeciwie od nakazu zapłaty albo w odpowiedzi na pozew. Wzór:
                </p>
                <blockquote>
                  „Podnoszę zarzut przedawnienia roszczenia. Roszczenie stało się wymagalne w dniu [data], a pozew został wniesiony w dniu [data], czyli po upływie [3/6] lat. Roszczenie jest związane z działalnością gospodarczą powoda, zatem zastosowanie ma art. 118 in fine k.c.”
                </blockquote>
                <p>
                  Od 2018 r. sąd w sprawach przeciwko konsumentom bada przedawnienie z urzędu (art. 117 § 2(1) k.c.) — nawet jeśli pozwany nie podniósł zarzutu. Mimo to <strong>zawsze warto</strong> podnieść zarzut samodzielnie, aby uniknąć przeoczenia.
                </p>
              </>
            ),
          },
          {
            id: "pulapki",
            title: "Pułapki — czego unikać",
            content: (
              <>
                <ul>
                  <li><strong>Nie podpisuj „ugody” telefonicznej</strong> — operator nagrywa rozmowę, a jedno „dobrze, zapłacę 50 zł” może zostać zinterpretowane jako uznanie długu (art. 123 § 1 pkt 2 k.c.).</li>
                  <li><strong>Nie wpłacaj „dobrowolnie” złotówki na poczet starego długu</strong> — częściowa zapłata = uznanie = przerwanie biegu.</li>
                  <li><strong>Sprawdź dokładnie datę wymagalności</strong> — windykatorzy często liczą od daty wystawienia faktury, a powinno być od daty płatności + 1 dzień.</li>
                </ul>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D2",
          title: "Sprzeciw od nakazu zapłaty",
          href: "/panel/nowa-sprawa",
          description: "Wygenerujemy sprzeciw z zarzutem przedawnienia w 5 minut.",
          price: "od 49 zł",
        }}
        legalSources={[
          "Ustawa z dnia 23 kwietnia 1964 r. — Kodeks cywilny, art. 117–125",
          "Wyrok SN z dnia 16 lutego 2012 r., III CZP 91/11",
          "Wyrok SN z dnia 19 listopada 2014 r., II CSK 196/14",
          "Ustawa z dnia 13 kwietnia 2018 r. o zmianie ustawy — Kodeks cywilny (Dz.U. 2018 poz. 1104)",
        ]}
      />
    </>
  );
}
