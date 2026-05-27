import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const SLUG = "odpowiedz-na-pozew";
const TITLE = "Odpowiedź na pozew — co napisać, gdy sąd już wyznaczył rozprawę";
const DESCRIPTION =
  "Termin na odpowiedź, jakie zarzuty można podnieść, dowody, wnioski formalne i materialne. Wzór struktury pisma + lista najczęstszych błędów.";
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
        lead="Po wniesieniu pozwu (lub po skutecznym sprzeciwie od nakazu zapłaty z EPU) sąd doręcza Ci pozew z odpisami załączników i wyznacza termin na <strong>odpowiedź na pozew</strong> — zwykle 14 lub 21 dni (art. 205(1) k.p.c.). To Twoja najważniejsza szansa, żeby ustosunkować się do roszczenia, podnieść wszystkie zarzuty, wskazać dowody i wnioski. Po tym terminie sąd może pominąć spóźnione twierdzenia (art. 205(3) k.p.c. — prekluzja)."
        sections={[
          {
            id: "termin",
            title: "Termin na odpowiedź",
            content: (
              <>
                <p>
                  Sąd wyznacza termin osobno w każdej sprawie — najczęściej 14 dni od doręczenia pozwu (postępowanie cywilne zwykłe), 21 dni przy postępowaniu uproszczonym z pozwu na formularzu. Termin liczy się od dnia <strong>doręczenia</strong> pisma — nie od daty rozprawy.
                </p>
                <p>
                  Termin można <strong>przywrócić</strong> (art. 168 k.p.c.), jeśli zostałeś go pozbawiony nie z własnej winy (choroba, brak doręczenia) — wniosek składa się w terminie 7 dni od ustania przeszkody.
                </p>
              </>
            ),
          },
          {
            id: "struktura",
            title: "Struktura pisma",
            content: (
              <>
                <ol>
                  <li><strong>Oznaczenie sądu</strong>, sygnatury akt, stron (powód i pozwany);</li>
                  <li><strong>Tytuł</strong>: „Odpowiedź na pozew”;</li>
                  <li><strong>Stanowisko</strong>: „Wnoszę o oddalenie powództwa w całości / w części co do kwoty X zł”;</li>
                  <li><strong>Wnioski formalne</strong>: o przeprowadzenie rozprawy pod nieobecność / o zwolnienie od kosztów / o ustanowienie pełnomocnika z urzędu;</li>
                  <li><strong>Zarzuty merytoryczne</strong>: przedawnienie, brak legitymacji, klauzule abuzywne, nieważność umowy, częściowa spłata;</li>
                  <li><strong>Dowody</strong>: dokumenty, świadkowie (imię, nazwisko, adres, tezy dowodowe), opinia biegłego;</li>
                  <li><strong>Uzasadnienie</strong>: po kolei do każdego twierdzenia pozwu — z czym się zgadzasz, czemu zaprzeczasz;</li>
                  <li><strong>Załączniki</strong> i odpis pisma dla strony przeciwnej (oraz dla każdego z pełnomocników).</li>
                </ol>
              </>
            ),
          },
          {
            id: "zarzuty",
            title: "Jakie zarzuty warto podnieść",
            content: (
              <>
                <ul>
                  <li><strong>Przedawnienie</strong> — jeśli od daty wymagalności minęło 3 / 6 / 10 lat (patrz: <em>Przedawnienie długu</em>);</li>
                  <li><strong>Brak legitymacji czynnej cesjonariusza</strong> — jeśli pozywa fundusz, który nie udowodnił nabycia akurat Twojej wierzytelności;</li>
                  <li><strong>Klauzule abuzywne</strong> — z odwołaniem do rejestru UOKiK i orzecznictwa TSUE;</li>
                  <li><strong>Brak doręczenia wezwania do zapłaty</strong> — odsetki mogą biec dopiero od wezwania;</li>
                  <li><strong>Nieważność umowy</strong> — np. brak formy pisemnej, brak elementów istotnych umowy (essentialia negotii);</li>
                  <li><strong>Częściowe spełnienie świadczenia</strong> — dołącz potwierdzenia wpłat;</li>
                  <li><strong>Zarzut potrącenia</strong> (art. 498 k.c.) — jeśli masz wzajemne, wymagalne roszczenie wobec powoda.</li>
                </ul>
              </>
            ),
          },
          {
            id: "dowody",
            title: "Wnioski dowodowe — jak je sformułować",
            content: (
              <>
                <p>
                  Każdy dowód musi zawierać <strong>tezę dowodową</strong> — czego ma dowieść. Wzór:
                </p>
                <blockquote>
                  „Dowód: kopia umowy kredytowej z 12.05.2018 r. — na okoliczność treści § 12, w którym znajduje się klauzula indeksacyjna sprzeczna z art. 385(1) § 1 k.c. (załącznik nr 1).”
                </blockquote>
                <blockquote>
                  „Dowód: zeznania świadka Jana Kowalskiego, adres do doręczeń: ul. Przykładowa 1, 00-001 Warszawa — na okoliczność faktu wpłacenia kwoty 5 000 zł na rzecz powoda w dniu 14.06.2020 r.”
                </blockquote>
                <p>
                  Bez tezy dowodowej sąd <strong>pominie dowód</strong> (art. 235(2) § 1 pkt 6 k.p.c.).
                </p>
              </>
            ),
          },
          {
            id: "bledy",
            title: "Najczęstsze błędy",
            content: (
              <>
                <ul>
                  <li><strong>Pisanie „nie zgadzam się” bez uzasadnienia</strong> — sąd uznaje to za przyznanie faktów (art. 230 k.p.c.);</li>
                  <li><strong>Brak wniosku o oddalenie pozwu</strong> — bez wyraźnego wniosku sąd traktuje pismo jako informacyjne;</li>
                  <li><strong>Nieobecność na pierwszej rozprawie</strong> bez wniosku o rozprawę zaoczną — może skutkować <strong>wyrokiem zaocznym</strong> (art. 339 k.p.c.);</li>
                  <li><strong>Pomylone daty</strong> — np. wpisanie sygnatury akt zamiast daty rozprawy w nagłówku;</li>
                  <li><strong>Brak odpisów</strong> dla strony przeciwnej — pismo zostanie zwrócone bez wezwania do uzupełnienia.</li>
                </ul>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D6",
          title: "Odpowiedź na pozew",
          href: "/panel/nowa-sprawa",
          description: "Pełna odpowiedź na pozew z zarzutami, dowodami i wnioskami dowodowymi.",
          price: "od 79 zł",
        }}
        legalSources={[
          "Ustawa z dnia 17 listopada 1964 r. — Kodeks postępowania cywilnego, art. 168, 205(1)–205(3), 230, 235(2), 339, 498 k.c.",
          "Ustawa z dnia 4 lipca 2019 r. o zmianie ustawy — Kodeks postępowania cywilnego (Dz.U. 2019 poz. 1469) — wprowadzenie systemu prekluzji",
          "Wyrok SN z 16 lutego 2017 r., I CSK 230/16",
        ]}
      />
    </>
  );
}
