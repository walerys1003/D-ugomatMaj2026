import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "wniosek-o-korekte-bik";
const TITLE = "Wniosek o korektę BIK — jak usunąć negatywny wpis (2025)";
const DESCRIPTION =
  "Art. 105a Prawa bankowego, RODO art. 16, droga przez Rzecznika Finansowego. Kiedy bank musi zaktualizować wpis, kiedy go usunąć i co zrobić, gdy odmawia.";
const UPDATED = "2025-04-22";

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
            buildArticleJsonLd({
              title: TITLE,
              description: DESCRIPTION,
              slug: SLUG,
              updatedAt: UPDATED,
            })
          ).replace(/</g, "\\u003c"),
        }}
      />
      {/* Tier 5 zad. 228 — BreadcrumbList rich result */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd({
              articleTitle: TITLE,
              articleSlug: SLUG,
            })
          ).replace(/</g, "\\u003c"),
        }}
      />
      <KnowledgeArticle
        title={TITLE}
        category="Rejestry"
        readingMinutes={9}
        updatedAt={UPDATED}
        lead="Negatywny wpis w BIK może blokować Ci dostęp do kredytu na lata — nawet jeśli zobowiązanie zostało dawno spłacone albo było obarczone błędem. Bank ma obowiązek przekazywać do BIK wyłącznie dane prawdziwe i aktualne (art. 105a Prawa bankowego), a Ty masz prawo żądać sprostowania (RODO art. 16) i — w wielu przypadkach — usunięcia danych (RODO art. 17, art. 105a ust. 4-5 PB)."
        sections={[
          {
            id: "co-zbiera-bik",
            title: "Co zbiera BIK i kto może to widzieć",
            content: (
              <>
                <p>
                  Biuro Informacji Kredytowej S.A. prowadzi rejestr informacji
                  o kredytach, pożyczkach, kartach kredytowych i limitach w
                  rachunkach bieżących. Dane przekazują tam banki i SKOK-i, a
                  od 2018 r. także firmy pożyczkowe. BIK przechowuje:
                </p>
                <ul>
                  <li>
                    Dane identyfikacyjne (imię, nazwisko, PESEL, adres).
                  </li>
                  <li>
                    Dane o zobowiązaniu (rodzaj, kwota, data udzielenia,
                    harmonogram spłaty).
                  </li>
                  <li>
                    Dane o przebiegu spłaty (terminowe, opóźnione, zaległe) —
                    aktualizowane co miesiąc.
                  </li>
                  <li>
                    Dane historyczne — przez okres przewidziany w art. 105a
                    Prawa bankowego.
                  </li>
                </ul>
                <p>
                  Dostęp do informacji mają inne banki przy rozpatrywaniu
                  wniosków kredytowych — i to one decydują, czy negatywny wpis
                  zablokuje Ci kredyt. Sam BIK nie ocenia zdolności kredytowej.
                </p>
              </>
            ),
          },
          {
            id: "ile-trzyma-wpis",
            title: "Jak długo wpis pozostaje w BIK",
            content: (
              <>
                <p>
                  Reguła ogólna (art. 105a ust. 4 Prawa bankowego):
                </p>
                <ul>
                  <li>
                    <strong>5 lat od dnia wygaśnięcia zobowiązania</strong>{" "}
                    (czyli zwykle od pełnej spłaty) — jeśli dłużnik na
                    przetwarzanie wyraził zgodę.
                  </li>
                  <li>
                    <strong>5 lat od daty powstania zaległości</strong> — jeśli
                    zaległość przekraczała 60 dni i bank uprzedził dłużnika
                    pisemnie. Te dane mogą być przetwarzane bez zgody dłużnika
                    (art. 105a ust. 5 PB).
                  </li>
                  <li>
                    <strong>12 lat</strong> — w odniesieniu do statystyk
                    zbiorczych przygotowywanych przez BIK (już po
                    anonimizacji).
                  </li>
                </ul>
                <p>
                  Dla zobowiązań spłacanych terminowo BIK przechowuje historię
                  domyślnie przez cały okres umowy + 5 lat po jej zakończeniu —
                  ale tę pozytywną historię można nawet utrzymywać dłużej (jest
                  korzystna dla dłużnika).
                </p>
              </>
            ),
          },
          {
            id: "kiedy-mozna-zadac-korekty",
            title: "Kiedy można żądać korekty albo usunięcia",
            content: (
              <>
                <h3>Sprostowanie (RODO art. 16)</h3>
                <p>
                  Jeżeli wpis jest <strong>nieprawdziwy lub nieaktualny</strong>{" "}
                  — np.:
                </p>
                <ul>
                  <li>
                    pokazuje opóźnienie, którego faktycznie nie było (błąd po
                    stronie banku),
                  </li>
                  <li>
                    nie odzwierciedla pełnej spłaty po ugodzie / restrukturyzacji,
                  </li>
                  <li>
                    pokazuje zobowiązanie cudze — kradzież tożsamości,
                    pomyłkowy przypis,
                  </li>
                  <li>
                    zawiera nieaktualne saldo (saldo do spłaty po wpłacie nie
                    zostało zaktualizowane).
                  </li>
                </ul>

                <h3>Usunięcie (RODO art. 17, art. 105a ust. 4 PB)</h3>
                <p>
                  Można żądać usunięcia w następujących sytuacjach:
                </p>
                <ul>
                  <li>
                    minęło 5 lat od wygaśnięcia zobowiązania (jeśli była
                    zgoda) lub od powstania zaległości (jeśli nie było zgody),
                  </li>
                  <li>
                    przetwarzanie nigdy nie miało podstawy prawnej (np. cesja
                    była nieskuteczna),
                  </li>
                  <li>
                    sprzeciwiasz się przetwarzaniu i nie istnieją nadrzędne
                    podstawy prawne po stronie administratora (art. 21 RODO),
                  </li>
                  <li>
                    bank był zobowiązany do usunięcia danych z mocy prawa, ale
                    tego nie zrobił.
                  </li>
                </ul>

                <h3>Ograniczenie przetwarzania (RODO art. 18)</h3>
                <p>
                  Jeśli kwestionujesz prawidłowość wpisu, ale bank prowadzi
                  weryfikację — możesz żądać oznaczenia danych jako "spornych"
                  na czas weryfikacji.
                </p>
              </>
            ),
          },
          {
            id: "droga-reklamacji",
            title: "Droga reklamacji — krok po kroku",
            content: (
              <>
                <ol>
                  <li>
                    <strong>Pobierz raport BIK.</strong> Darmowy raport raz na
                    6 miesięcy z bik.pl (po zalogowaniu profilem zaufanym lub
                    bankowością elektroniczną).
                  </li>
                  <li>
                    <strong>Reklamacja do banku</strong> — który przekazał dane.
                    BIK nie zmieni wpisu z własnej inicjatywy; to bank musi
                    wystawić korektę. Pismo z powołaniem na art. 105a PB +
                    RODO art. 16 albo 17 + ustawa o reklamacjach.
                  </li>
                  <li>
                    Bank ma <strong>30 dni na odpowiedź</strong> (15 dni w
                    sprawach prostych; w wyjątkowych sytuacjach do 60 dni z
                    uzasadnieniem). Brak odpowiedzi = uznanie reklamacji za
                    rozpoznaną zgodnie z żądaniem konsumenta (ustawa o
                    reklamacjach z 2015 r.).
                  </li>
                  <li>
                    Równolegle — <strong>wniosek do BIK</strong> w trybie RODO
                    art. 16/17 na adres bok@bik.pl. BIK przekazuje sprawę do
                    banku, ale rejestruje datę wniosku, co bywa użyteczne w
                    dalszym postępowaniu.
                  </li>
                  <li>
                    Po zatwierdzeniu korekty BIK aktualizuje dane w cyklu
                    miesięcznym. Pełna ścieżka: 30-60 dni.
                  </li>
                </ol>
              </>
            ),
          },
          {
            id: "co-jesli-bank-odmowil",
            title: "Co jeśli bank odmówił",
            content: (
              <>
                <p>
                  Trzy ścieżki dalszego działania (warto uruchomić równolegle):
                </p>
                <h3>1. Skarga do Rzecznika Finansowego</h3>
                <p>
                  Wniosek o pomoc Rzecznika Finansowego (rf.gov.pl). Postępowanie
                  bezpłatne, średnio 60-90 dni. RF wydaje stanowisko, które bank
                  uwzględnia w 60-70% przypadków. Można też złożyć wniosek o
                  pozasądowe rozwiązanie sporu.
                </p>
                <h3>2. Skarga do UODO</h3>
                <p>
                  Urząd Ochrony Danych Osobowych (uodo.gov.pl) — jeżeli
                  uważasz, że przetwarzanie narusza RODO. UODO może nałożyć na
                  bank karę pieniężną i nakazać korektę / usunięcie. Procedura
                  długa (6-18 miesięcy), ale skuteczna w sprawach poważnych
                  naruszeń.
                </p>
                <h3>3. Powództwo cywilne</h3>
                <p>
                  Pozew o nakazanie usunięcia / sprostowania wpisu oraz
                  ewentualnie o odszkodowanie za szkodę (np. odmowa kredytu
                  hipotecznego z powodu błędnego wpisu, art. 24 KC w zw. z art.
                  448 KC). Postępowanie sądowe trwa 12-24 miesięcy, ale
                  wyrokiem sąd może zobowiązać bank pod groźbą kary.
                </p>
              </>
            ),
          },
          {
            id: "po-cesji",
            title: "Wpis po cesji wierzytelności",
            content: (
              <>
                <p>
                  Cesja wierzytelności (art. 509 KC) na rzecz funduszu
                  sekurytyzacyjnego nie powinna automatycznie pogarszać Twojego
                  wpisu w BIK. Po cesji:
                </p>
                <ul>
                  <li>
                    Bank powinien zamknąć wpis na "spłacony / wygaszony przez
                    cesję", a nie utrzymywać go jako aktywny dług.
                  </li>
                  <li>
                    Fundusz, który nabył wierzytelność, <strong>nie ma
                    bezpośredniego dostępu do BIK</strong> — może przetwarzać
                    Twoje dane wyłącznie zgodnie z art. 105a ust. 4-5 PB i
                    tylko przez bank, który mu sprzedał wierzytelność.
                  </li>
                  <li>
                    Jeżeli wpis o opóźnieniach utrzymuje się po cesji — można
                    żądać jego usunięcia z powołaniem na utratę podstawy
                    prawnej przetwarzania.
                  </li>
                </ul>
                <p>
                  W praktyce wiele banków (zwłaszcza po dawnych pożyczkach)
                  utrzymuje wpisy o opóźnieniach jeszcze długo po cesji. Pismo
                  z powołaniem na art. 6 ust. 1 RODO (brak podstawy prawnej) i
                  żądaniem usunięcia jest skuteczne w 70-80% przypadków w
                  pierwszej iteracji.
                </p>
              </>
            ),
          },
          {
            id: "bik-vs-big",
            title: "BIK a BIG-i (InfoMonitor, KRD, ERIF)",
            content: (
              <>
                <p>
                  BIK i Biura Informacji Gospodarczej to różne instytucje:
                </p>
                <ul>
                  <li>
                    <strong>BIK</strong> — kredyty bankowe i pożyczki, ścisły
                    reżim Prawa bankowego, długie okresy przetwarzania.
                  </li>
                  <li>
                    <strong>BIG-i (BIG InfoMonitor, KRD, ERIF, KBIG)</strong> —
                    działają na podstawie ustawy o udostępnianiu informacji
                    gospodarczych. Każdy przedsiębiorca może wpisać dłużnika
                    (czynsz, abonament telekomunikacyjny, faktury B2C). Wpis
                    można usunąć od ręki w trybie ustawowego wniosku do biura.
                  </li>
                </ul>
                <p>
                  W przypadku BIG-ów po spłacie zobowiązania wpis musi zostać
                  usunięty w terminie 14 dni (art. 21 ust. 2 ustawy o
                  udostępnianiu informacji gospodarczych). Pismo do biura
                  informacji gospodarczej + równoległe pismo do wierzyciela —
                  skuteczność blisko 100% w sprawach z udokumentowaną spłatą.
                </p>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D5",
          title: "BIK-Fix",
          href: "/moduly/bik",
          price: "129 zł",
          description:
            "Reklamacja do banku (art. 105a PB) + wniosek do BIK (RODO art. 16) + skarga do Rzecznika Finansowego + pakiet RODO (art. 15-17). Kompletny zestaw pism gotowy do wysyłki.",
        }}
        legalSources={[
          "art. 105a Prawo bankowe",
          "art. 15-18, 21 RODO (Rozporządzenie 2016/679)",
          "Ustawa z 5 sierpnia 2015 r. o reklamacjach (Dz.U. 2024 ze zm.)",
          "Ustawa z 9 kwietnia 2010 r. o udostępnianiu informacji gospodarczych",
          "art. 24, 448 Kodeks cywilny — ochrona dóbr osobistych",
          "Wyrok WSA w Warszawie z 23 listopada 2018 r., II SA/Wa 552/18 — przesłanki usunięcia danych z BIK",
        ]}
      />
    </>
  );
}
ierpnia 2015 r. o reklamacjach (Dz.U. 2024 ze zm.)",
          "Ustawa z 9 kwietnia 2010 r. o udostępnianiu informacji gospodarczych",
          "art. 24, 448 Kodeks cywilny — ochrona dóbr osobistych",
          "Wyrok WSA w Warszawie z 23 listopada 2018 r., II SA/Wa 552/18 — przesłanki usunięcia danych z BIK",
        ]}
      />
    </>
  );
}
