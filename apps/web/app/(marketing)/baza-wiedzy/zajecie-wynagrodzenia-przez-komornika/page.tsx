import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "zajecie-wynagrodzenia-przez-komornika";
const TITLE = "Zajęcie wynagrodzenia przez komornika — co możesz zrobić";
const DESCRIPTION =
  "Procedura zajęcia wynagrodzenia, obowiązki pracodawcy, limity potrąceń, zbieg egzekucji i jak skutecznie odzyskać nadpłacone kwoty.";
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
        readingMinutes={10}
        updatedAt={UPDATED}
        lead="Zajęcie wynagrodzenia (art. 880–888 k.p.c.) to najczęstsza metoda egzekucji. Komornik wysyła do pracodawcy zawiadomienie, a ten od najbliższej wypłaty potrąca odpowiednią część i przekazuje na rachunek depozytowy komornika. Pracownik dowiaduje się zwykle dopiero z paska wypłaty. Kluczowe ograniczenia: 50% potrąceń przy długach niealimentacyjnych, kwota wolna na poziomie minimalnej krajowej netto, ochrona umów zlecenia (od 2019 r.)."
        sections={[
          {
            id: "procedura",
            title: "Jak wygląda procedura",
            content: (
              <>
                <ol>
                  <li>Komornik wysyła do pracodawcy <strong>zawiadomienie o zajęciu wynagrodzenia</strong> (art. 881 k.p.c.) ze wskazaniem tytułu wykonawczego, kwoty zadłużenia, danych wierzyciela.</li>
                  <li>Pracodawca w terminie 7 dni musi udzielić odpowiedzi: czy zatrudnia dłużnika, jaką pensję otrzymuje, czy są inne zajęcia (art. 882 k.p.c.).</li>
                  <li>Od najbliższej wypłaty pracodawca potrąca odpowiednią część (max. 50% pensji netto, lub 60% przy alimentach) i przekazuje na rachunek komornika.</li>
                  <li>Zajęcie obowiązuje do momentu pełnego zaspokojenia roszczenia albo do odwołania przez komornika.</li>
                </ol>
              </>
            ),
          },
          {
            id: "limity",
            title: "Ile może zająć komornik",
            content: (
              <>
                <p>
                  Granice potrąceń (art. 87 k.p.):
                </p>
                <ul>
                  <li><strong>Alimenty</strong>: do 60% wynagrodzenia, bez kwoty wolnej;</li>
                  <li><strong>Inne należności</strong> (kredyty, mandaty, faktury): do 50% wynagrodzenia, z zachowaniem kwoty wolnej = minimalna krajowa netto (2025: 3 510 zł);</li>
                  <li><strong>Zaliczki pieniężne udzielone pracownikowi</strong>: do 25% wynagrodzenia;</li>
                  <li><strong>Łącznie wszystkie zajęcia</strong> nie mogą przekroczyć 50% (lub 3/5 przy alimentach).</li>
                </ul>
                <p>
                  Jeśli pracujesz na pół etatu, kwota wolna jest <strong>proporcjonalnie zmniejszana</strong> (uchwała SN III PZP 4/12).
                </p>
              </>
            ),
          },
          {
            id: "umowa-zlecenie",
            title: "Umowa zlecenia i o dzieło",
            content: (
              <>
                <p>
                  Od 1 stycznia 2019 r. art. 833 § 2(1) k.p.c. nakazuje stosować <strong>odpowiednio</strong> przepisy o ochronie wynagrodzenia za pracę do zleceń, jeżeli jest to świadczenie powtarzające się i jedyne lub główne źródło utrzymania. Aby skorzystać z ochrony, należy złożyć u komornika oświadczenie z wskazaniem zleceniodawcy i wysokości umowy.
                </p>
                <p>
                  Komornik nie pyta z urzędu — to <em>Ty</em> musisz zainicjować zastosowanie kwoty wolnej. Wzór wniosku: „Wnoszę o zastosowanie do umowy zlecenia z [zleceniodawca] przepisów art. 87–87(1) k.p. zgodnie z art. 833 § 2(1) k.p.c.”
                </p>
              </>
            ),
          },
          {
            id: "zbieg",
            title: "Zbieg egzekucji — wielu komorników naraz",
            content: (
              <>
                <p>
                  Jeśli równolegle prowadzi egzekucję kilku komorników (np. komornik A z tytułu kredytu i komornik B z tytułu alimentów), pracodawca <strong>nie sumuje potrąceń</strong>. Stosuje art. 773 k.p.c. — wszystkie zajęcia łącznie nie mogą przekroczyć dopuszczalnego limitu (50% lub 60%).
                </p>
                <p>
                  Przy zbiegu komornika sądowego i administracyjnego (np. ZUS, US) — rozstrzyga Sąd Rejonowy lub <strong>łącznie</strong> prowadzi egzekucję komornik, który pierwszy zaczął (po nowelizacji z 2018 r.).
                </p>
              </>
            ),
          },
          {
            id: "co-zrobic",
            title: "Co możesz zrobić",
            content: (
              <>
                <ol>
                  <li><strong>Zażądaj odpisu tytułu wykonawczego</strong> — sprawdź, czy długu nie zapłaciłeś już wcześniej, czy nie jest przedawniony, czy w ogóle dotyczy Ciebie;</li>
                  <li><strong>Skarga na czynności komornika</strong> (art. 767 k.p.c.) w terminie 7 dni od dowiedzenia się o nieprawidłowości — jeśli przekroczono limity, pominięto kwotę wolną, zajęto wynagrodzenie z umowy zlecenia bez weryfikacji oświadczenia;</li>
                  <li><strong>Wniosek o ograniczenie egzekucji</strong> — art. 883–884 k.p.c., jeśli sytuacja życiowa się zmieniła (utrata pracy, choroba);</li>
                  <li><strong>Wniosek o rozłożenie należności na raty</strong> — można złożyć wprost do wierzyciela, a po uzyskaniu zgody komornik egzekucję zawiesza;</li>
                  <li><strong>Zażalenie na postanowienie o nadaniu klauzuli wykonalności</strong> — jeśli klauzula została nadana mimo wadliwego doręczenia nakazu zapłaty (najczęstsza furtka po starych sprawach EPU);</li>
                </ol>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D5",
          title: "Skarga na komornika + ograniczenie egzekucji",
          href: "/panel/nowa-sprawa",
          description: "Pakiet pism procesowych: skarga + wniosek o kwotę wolną + ograniczenie egzekucji.",
          price: "od 69 zł",
        }}
        legalSources={[
          "Ustawa z dnia 17 listopada 1964 r. — Kodeks postępowania cywilnego, art. 767, 773, 833, 880–888",
          "Ustawa z dnia 26 czerwca 1974 r. — Kodeks pracy, art. 87–87(1)",
          "Ustawa z dnia 22 marca 2018 r. o komornikach sądowych (Dz.U. 2018 poz. 771)",
          "Uchwała SN z dnia 19 lipca 2012 r., III PZP 4/12",
        ]}
      />
    </>
  );
}
