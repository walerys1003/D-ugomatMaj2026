import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "skarga-na-czynnosci-komornika";
const TITLE = "Skarga na czynności komornika — 7 dni na reakcję (2025)";
const DESCRIPTION =
  "Kiedy można złożyć skargę, do jakiego sądu, w jakim terminie i jakie naruszenia komornika są najczęstszą podstawą uchylenia czynności. Praktyczny przewodnik z aktualnym KPC.";
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
        category="Egzekucja"
        readingMinutes={10}
        updatedAt={UPDATED}
        lead="Skarga na czynności komornika to podstawowy instrument ochrony dłużnika w postępowaniu egzekucyjnym. Termin jest krótki — 7 dni od dnia, w którym dowiedziałeś się o czynności. Skarga jest bezpłatna i może doprowadzić do uchylenia zajęcia, zwrotu pobranych środków, a w skrajnych przypadkach — do umorzenia całego postępowania egzekucyjnego."
        sections={[
          {
            id: "podstawa-prawna",
            title: "Podstawa prawna i istota skargi",
            content: (
              <>
                <p>
                  Skarga na czynność komornika uregulowana jest w art. 767 KPC.
                  Można ją wnieść <strong>na każdą czynność albo zaniechanie
                  czynności komornika</strong>, którym strona uważa się za
                  pokrzywdzoną. Skargę rozpoznaje sąd rejonowy, przy którym
                  działa komornik (sąd nadzoru) — nie sam komornik.
                </p>
                <p>
                  Istotą skargi jest kontrola legalności i prawidłowości
                  czynności egzekucyjnych. Sąd nie bada zasadności tytułu
                  wykonawczego (do tego służy powództwo przeciwegzekucyjne, art.
                  840 KPC) — tylko czy konkretna czynność komornika została
                  podjęta zgodnie z przepisami.
                </p>
              </>
            ),
          },
          {
            id: "termin-7-dni",
            title: "Termin 7 dni — od kiedy liczyć?",
            content: (
              <>
                <p>
                  Zgodnie z art. 767 § 4 KPC skargę wnosi się w terminie
                  <strong> tygodnia od dnia czynności</strong>, gdy strona była
                  przy niej obecna albo została o jej terminie zawiadomiona, w
                  innych przypadkach — od dnia zawiadomienia o dokonaniu
                  czynności, a w braku zawiadomienia — od dnia powzięcia
                  wiadomości przez skarżącego.
                </p>
                <p>
                  W praktyce termin liczy się najczęściej od:
                </p>
                <ul>
                  <li>
                    daty doręczenia postanowienia komornika listem poleconym,
                  </li>
                  <li>
                    daty otrzymania zawiadomienia o zajęciu wynagrodzenia /
                    rachunku,
                  </li>
                  <li>
                    daty, w której pierwszy raz dowiedziałeś się o czynności
                    (np. od pracodawcy informującego o zajęciu).
                  </li>
                </ul>
                <p>
                  Jeżeli ostatni dzień terminu wypada w dzień ustawowo wolny od
                  pracy — termin upływa pierwszego następującego dnia roboczego
                  (art. 165 § 1 KPC). Decyduje data stempla pocztowego nadania
                  pisma (art. 165 § 2 KPC).
                </p>
              </>
            ),
          },
          {
            id: "co-mozna-zaskarzyc",
            title: "Co konkretnie można zaskarżyć",
            content: (
              <>
                <p>
                  Najczęstsze podstawy skargi z praktyki:
                </p>
                <ul>
                  <li>
                    <strong>Zajęcie całego wynagrodzenia</strong> bez
                    pozostawienia kwoty wolnej (art. 87 KP, art. 833 § 6 KPC).
                  </li>
                  <li>
                    <strong>Zajęcie świadczenia chronionego</strong> — 500+,
                    alimenty otrzymywane, świadczenie pielęgnacyjne, dodatek
                    mieszkaniowy. Wszystkie są w 100% wolne od egzekucji.
                  </li>
                  <li>
                    <strong>Zajęcie przedmiotów wyłączonych spod egzekucji</strong>{" "}
                    (art. 829 KPC) — narzędzia pracy, leki, ubrania, żywność,
                    przedmioty osobiste, zwierzęta gospodarskie potrzebne do
                    życia, święte księgi i przedmioty kultu.
                  </li>
                  <li>
                    <strong>Niedoręczenie postanowienia</strong> o wszczęciu
                    egzekucji albo o zajęciu — naruszenie prawa do informacji
                    (art. 805 § 1 KPC).
                  </li>
                  <li>
                    <strong>Zawyżone koszty egzekucyjne</strong> — niezgodne z
                    rozporządzeniem o opłatach komorniczych albo
                    nieproporcjonalne do dochodzonego świadczenia.
                  </li>
                  <li>
                    <strong>Egzekucja po przedawnieniu tytułu</strong> — tytuł
                    wykonawczy przedawnia się po 6 latach od uprawomocnienia
                    (art. 125 § 1 KC).
                  </li>
                  <li>
                    <strong>Egzekucja na podstawie nakazu, który utracił moc</strong>{" "}
                    — np. po skutecznym sprzeciwie w EPU.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: "kwota-wolna",
            title: "Kwota wolna od zajęcia — najczęstsze nieporozumienie",
            content: (
              <>
                <p>
                  Kwota wolna jest najczęstszą podstawą skargi i jednocześnie
                  najczęstszym błędem komorników i pracodawców. Dwa odrębne
                  reżimy:
                </p>
                <h3>Z wynagrodzenia za pracę (art. 87 KP)</h3>
                <p>
                  Pracodawca <strong>zawsze musi pozostawić</strong> kwotę
                  równą minimalnemu wynagrodzeniu netto (4242 zł brutto = ok.
                  3261 zł netto w 2025), niezależnie od podanego przez
                  komornika zajęcia. Wyjątek: przy długach alimentacyjnych
                  można potrącić do 60% wynagrodzenia, ale i tak przy pełnym
                  etacie minimalna kwota netto musi zostać.
                </p>
                <h3>Z rachunku bankowego (art. 54 Prawa bankowego)</h3>
                <p>
                  Bank musi udostępnić dłużnikowi <strong>75% minimalnego
                  wynagrodzenia miesięcznie</strong> (ok. 3181 zł brutto
                  liczone od początku miesiąca, niezależnie od źródła
                  wpływów). Świadczenia 500+, alimenty, świadczenie
                  pielęgnacyjne — w 100% wolne, niezależnie od kwoty.
                </p>
                <p>
                  Jeżeli pracodawca lub bank zignorują kwotę wolną — pierwszym
                  krokiem jest pismo z powołaniem na art. 87 KP / 54 PB. Drugim
                  — skarga na czynność komornika (jeśli to on źle
                  sformułował zajęcie) lub powództwo o zwrot bezprawnie
                  pobranych kwot.
                </p>
              </>
            ),
          },
          {
            id: "jak-zlozyc-skarge",
            title: "Jak złożyć skargę — krok po kroku",
            content: (
              <>
                <ol>
                  <li>
                    <strong>Ustal sygnaturę.</strong> Z pisma komornika
                    odczytaj sygnaturę typu "Km 123/24" (egzekucja świadczeń
                    pieniężnych) lub "Kmp" (alimenty).
                  </li>
                  <li>
                    <strong>Ustal sąd nadzoru.</strong> Sąd Rejonowy, przy
                    którym działa komornik — informacja na pieczątce
                    komorniczej i na pierwszej stronie postanowienia.
                  </li>
                  <li>
                    <strong>Sformułuj zarzut.</strong> Konkretna czynność (np.
                    "zajęcie wynagrodzenia z dnia 12.04.2025") + przepis
                    naruszony (np. "art. 87 § 2 KP — brak pozostawienia kwoty
                    minimalnego wynagrodzenia netto") + żądanie (np.
                    "uchylenie zajęcia w zakresie przekraczającym kwotę
                    wolną").
                  </li>
                  <li>
                    <strong>Dołącz dokumenty.</strong> Kopia zaskarżanego
                    pisma, dowód wynagrodzenia (np. PIT-11 albo trzy ostatnie
                    paski wypłat), dowody na wskazane okoliczności.
                  </li>
                  <li>
                    <strong>Wniosek dodatkowy.</strong> Razem ze skargą warto
                    złożyć wniosek o zawieszenie postępowania egzekucyjnego
                    (art. 821 KPC) — sąd może wstrzymać dalsze czynności do
                    czasu rozpoznania skargi.
                  </li>
                  <li>
                    <strong>Wyślij na czas.</strong> Sąd rejonowy — adres z
                    pisma komornika. Listem poleconym za potwierdzeniem
                    odbioru. Decyduje data nadania pisma na poczcie.
                  </li>
                </ol>
                <p>
                  <strong>Skarga jest wolna od opłaty</strong> — żadne koszty
                  sądowe ani opłaty kancelaryjne nie obowiązują. Sąd ma 14 dni
                  na rozpoznanie sprawy (art. 767(4) § 1 KPC).
                </p>
              </>
            ),
          },
          {
            id: "co-po-skardze",
            title: "Co się dzieje po wniesieniu skargi",
            content: (
              <>
                <ol>
                  <li>
                    Sąd przekazuje skargę komornikowi, który ma{" "}
                    <strong>3 dni</strong> na sporządzenie pisemnego
                    uzasadnienia swojej czynności i przesłanie akt do sądu.
                  </li>
                  <li>
                    Sąd rozpoznaje skargę na posiedzeniu niejawnym (bez
                    rozprawy) w terminie tygodnia od wpływu akt (art. 767(4) § 1
                    KPC).
                  </li>
                  <li>
                    Sąd wydaje postanowienie:
                    <ul>
                      <li>
                        <strong>uwzględnia skargę</strong> i uchyla / zmienia
                        czynność komornika; w wielu przypadkach nakazuje zwrot
                        pobranych nienależnie środków;
                      </li>
                      <li>
                        <strong>oddala skargę</strong>, jeśli czynność była
                        prawidłowa.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Na postanowienie sądu I instancji przysługuje{" "}
                    <strong>zażalenie</strong> w terminie tygodnia od jego
                    doręczenia (art. 7672 KPC). Zażalenie rozpoznaje sąd
                    okręgowy.
                  </li>
                </ol>
                <p>
                  Skarga sama w sobie nie wstrzymuje egzekucji — komornik może
                  prowadzić dalsze czynności do czasu prawomocnego rozstrzygnięcia.
                  Dlatego razem ze skargą warto złożyć wniosek o zawieszenie
                  egzekucji (art. 821 KPC).
                </p>
              </>
            ),
          },
          {
            id: "co-jesli-skarga-oddalona",
            title: "Co jeśli skarga zostanie oddalona",
            content: (
              <>
                <p>
                  Trzy ścieżki dalszego działania:
                </p>
                <ol>
                  <li>
                    <strong>Zażalenie do sądu okręgowego</strong> w terminie
                    tygodnia. Sąd II instancji bada sprawę ponownie i może
                    zmienić rozstrzygnięcie sądu rejonowego.
                  </li>
                  <li>
                    <strong>Powództwo przeciwegzekucyjne</strong> (art. 840-842
                    KPC) — jeżeli kwestionujesz zasadność całego tytułu
                    wykonawczego (np. dług został spłacony, jest przedawniony,
                    został umorzony). To procedura długa, ale skuteczna.
                  </li>
                  <li>
                    <strong>Wniosek o ograniczenie egzekucji</strong> (art. 833
                    KPC) lub <strong>o wyłączenie spod egzekucji</strong> (art.
                    829) — jeżeli skarga dotyczyła konkretnej czynności, a Ty
                    chcesz jednocześnie chronić określone przedmioty / kwoty
                    przed dalszymi zajęciami.
                  </li>
                </ol>
              </>
            ),
          },
        ]}
        relatedModule={{
          code: "D3",
          title: "KomornikShield",
          href: "/moduly/komornik",
          price: "od 79 zł",
          description:
            "Skarga na czynność komornika (7 dni), wniosek o ograniczenie egzekucji, wyłączenie spod egzekucji, zażalenie. Pakiet komorniczy (4 pisma) za 199 zł — najlepsza wartość.",
        }}
        legalSources={[
          "art. 767-7672, 805, 821, 829, 833, 840-842 Kodeks postępowania cywilnego",
          "art. 87 § 2, 871 Kodeks pracy",
          "art. 54 Prawo bankowe",
          "art. 125 § 1 Kodeks cywilny — przedawnienie tytułu wykonawczego",
          "Rozporządzenie Min. Sprawiedliwości z 14 sierpnia 2008 r. ws. opłat komorniczych (z późn. zm.)",
          "Postanowienie SN z 14 lutego 2019 r., IV CSK 19/18 — kwota wolna od zajęcia",
        ]}
      />
    </>
  );
}
