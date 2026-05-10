import type { Metadata } from "next";
import {
  KnowledgeArticle,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/components/marketing/knowledge-article";

const SLUG = "sprzeciw-od-nakazu-zaplaty-epu";
const TITLE =
  "Sprzeciw od nakazu zapłaty z EPU — kompletny przewodnik 2025";
const DESCRIPTION =
  "Co to jest e-Sąd, jak rozpoznać nakaz zapłaty, jakie zarzuty można podnieść w sprzeciwie i co się stanie po jego wniesieniu. Aktualny stan prawny + orzecznictwo SN.";
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
        category="Sąd"
        readingMinutes={12}
        updatedAt={UPDATED}
        lead="Nakaz zapłaty z e-Sądu (EPU) wydaje się nieoczekiwanie i daje tylko 14 dni na reakcję. Jeśli wniesiesz sprzeciw — nakaz traci moc i sprawa trafia do sądu rejonowego właściwego dla Twojego miejsca zamieszkania. Sprzeciw nie wymaga uzasadnienia, ale dobrze przygotowany sprzeciw z zarzutami merytorycznymi (przedawnienie, brak legitymacji, klauzule abuzywne) znacząco zwiększa szanse w dalszym postępowaniu."
        sections={[
          {
            id: "co-to-jest-epu",
            title: "Co to jest EPU i e-Sąd?",
            content: (
              <>
                <p>
                  Elektroniczne Postępowanie Upominawcze (EPU) to uproszczona
                  procedura sądowa prowadzona w całości online przez VI Wydział
                  Cywilny Sądu Rejonowego Lublin-Zachód w Lublinie — tzw.
                  e-Sąd. EPU obsługuje cała Polskę i służy do dochodzenia
                  roszczeń pieniężnych do 100 000 zł, jeżeli stan faktyczny
                  jest "nieskomplikowany" i powód uważa, że nakaz zapłaty można
                  wydać na podstawie samych dokumentów dołączonych do pozwu.
                </p>
                <p>
                  W praktyce z EPU najczęściej korzystają fundusze
                  sekurytyzacyjne (Kruk, Best, Ultimo, Hoist, Intrum) oraz
                  firmy windykacyjne — bo to procedura tania, szybka i
                  pozwalająca otrzymać tytuł wykonawczy bez przeprowadzania
                  rozprawy. Pozwany dowiaduje się o sprawie dopiero z
                  wydanego nakazu zapłaty, doręczanego pocztą.
                </p>
              </>
            ),
          },
          {
            id: "jak-rozpoznac-nakaz",
            title: "Jak rozpoznać nakaz zapłaty z EPU",
            content: (
              <>
                <p>
                  Nakaz zapłaty z EPU rozpoznasz po:
                </p>
                <ul>
                  <li>
                    <strong>Sygnaturze:</strong> rozpoczyna się od "Nc-e"
                    (np. <em>Nc-e 1234567/24</em>).
                  </li>
                  <li>
                    <strong>Sądzie:</strong> "Sąd Rejonowy Lublin-Zachód w
                    Lublinie, VI Wydział Cywilny".
                  </li>
                  <li>
                    <strong>Pouczeniu:</strong> czerwone pouczenie o 14-dniowym
                    terminie do wniesienia sprzeciwu (art. 502(1) KPC).
                  </li>
                  <li>
                    <strong>Załącznikach:</strong> elektronicznym potwierdzeniu
                    odbioru, pozwem oraz dokumentami załączonymi przez powoda.
                  </li>
                </ul>
                <p>
                  Pismo nadawane jest listem poleconym za potwierdzeniem
                  odbioru. <strong>Termin 14 dni liczy się od dnia
                  doręczenia</strong> — czyli od momentu odbioru przez Ciebie
                  lub awizowania (drugiego, jeśli pierwsze nie zostało odebrane
                  w terminie 7 dni).
                </p>
              </>
            ),
          },
          {
            id: "termin-na-sprzeciw",
            title: "Termin 14 dni — od kiedy liczyć?",
            content: (
              <>
                <p>
                  Termin biegnie od dnia <strong>doręczenia</strong>, nie od
                  dnia wydania nakazu. Decyduje data widoczna na potwierdzeniu
                  odbioru (zwrotce). Jeśli nakaz został podwójnie awizowany i
                  nie odebrałeś go — uważa się go za doręczony z upływem 14
                  dnia od pierwszego awizo (tzw. fikcja doręczenia,
                  art. 139 KPC).
                </p>
                <p>
                  Jeżeli ostatni dzień terminu wypada w sobotę, niedzielę lub
                  święto — termin upływa pierwszego następującego dnia
                  roboczego (art. 165 § 1 KPC). Decyduje data nadania pisma
                  pocztą, nie data wpływu do sądu (art. 165 § 2 KPC).
                </p>
                <p>
                  <strong>Co zrobić, jeśli przegapiłeś termin?</strong>{" "}
                  Można wnieść wniosek o przywrócenie terminu (art. 168-172
                  KPC) — ale tylko jeśli przyczyna uchybienia była niezawiniona
                  (choroba, wypadek, błędne doręczenie). Wniosek składa się w
                  ciągu 7 dni od ustania przeszkody, razem ze sprzeciwem.
                </p>
              </>
            ),
          },
          {
            id: "zarzuty-merytoryczne",
            title: "Zarzuty merytoryczne — które warto podnieść",
            content: (
              <>
                <p>
                  Choć formalnie sprzeciw nie wymaga uzasadnienia (samo
                  wniesienie sprzeciwu uchyla nakaz — art. 503 KPC), zarzuty
                  podniesione już w sprzeciwie pomagają w dalszym postępowaniu
                  — zwłaszcza gdy fundusz musi uzupełnić braki formalne
                  pozwu i może wycofać się z dochodzenia roszczenia.
                </p>

                <h3>Zarzut przedawnienia (art. 117 KC)</h3>
                <p>
                  Kluczowy w sprawach z funduszami. Roszczenia z umów
                  konsumenckich przedawniają się po <strong>6 latach</strong>{" "}
                  (od 9 lipca 2018; wcześniej 10 lat) od wymagalności.
                  Roszczenia z działalności gospodarczej —{" "}
                  <strong>3 lata</strong>. Cesja nie "odświeża" biegu
                  przedawnienia. Po skutecznym podniesieniu zarzutu sąd
                  oddala powództwo (art. 117 § 2 KC po reformie z 2018 r.
                  uwzględnia przedawnienie z urzędu w sprawach konsumenckich).
                </p>

                <h3>Zarzut braku legitymacji procesowej</h3>
                <p>
                  Jeżeli wierzycielem jest fundusz po cesji — żądamy
                  okazania pełnej dokumentacji cesji (umowy ramowej, załącznika
                  z wykazem wierzytelności, dowodu zapłaty ceny). SN
                  wielokrotnie wskazywał, że wyciąg z umowy nie zastępuje
                  pełnej dokumentacji (m.in. wyrok SN z 21 listopada 2019 r.,
                  III CSK 256/17).
                </p>

                <h3>Zarzut klauzul abuzywnych</h3>
                <p>
                  W umowach pożyczkowych i kredytach konsumenckich często
                  występują postanowienia niedozwolone (art. 385(1) KC) —
                  zawyżone prowizje, nieproporcjonalne odsetki karne, koszty
                  ubezpieczeń pozornych. Klauzula abuzywna nie wiąże
                  konsumenta — kwota dochodzona przez fundusz może okazać się
                  o wiele niższa albo zero.
                </p>

                <h3>Wniosek dowodowy</h3>
                <p>
                  Żądanie przedłożenia oryginałów: umowy pożyczki / kredytu,
                  harmonogramu spłat, historii rachunku, wezwania do zapłaty,
                  dokumentu wypowiedzenia umowy. W EPU powód dołącza często
                  tylko skany i wyciągi — wniosek dowodowy zmusza do okazania
                  pełnych dokumentów na rozprawie.
                </p>
              </>
            ),
          },
          {
            id: "jak-zlozyc-sprzeciw",
            title: "Jak złożyć sprzeciw — krok po kroku",
            content: (
              <>
                <ol>
                  <li>
                    <strong>Sprawdź sygnaturę i datę doręczenia.</strong>{" "}
                    Notuj sygnaturę "Nc-e" oraz datę z potwierdzenia odbioru.
                  </li>
                  <li>
                    <strong>Wybierz formę.</strong> Sprzeciw można wnieść:
                    elektronicznie przez portal e-Sądu (e-sad.gov.pl), pocztą
                    listem poleconym lub w biurze podawczym sądu.
                  </li>
                  <li>
                    <strong>Wypełnij formularz.</strong> Tytuł "Sprzeciw od
                    nakazu zapłaty", wskazanie sygnatury, oznaczenie stron,
                    żądanie uchylenia nakazu, ewentualnie zarzuty
                    merytoryczne.
                  </li>
                  <li>
                    <strong>Załącz dokumenty.</strong> Kopia nakazu (jeśli
                    składasz pocztą), pełnomocnictwo (jeśli reprezentuje
                    pełnomocnik), dowody na zarzuty (np. dowody spłaty).
                  </li>
                  <li>
                    <strong>Wyślij na czas.</strong> Decyduje data stempla
                    pocztowego (art. 165 § 2 KPC) — sprzeciw można nadać
                    nawet w ostatni dzień terminu.
                  </li>
                  <li>
                    <strong>Zachowaj potwierdzenie.</strong> Numer R nadania
                    listu poleconego lub potwierdzenie elektroniczne.
                  </li>
                </ol>
                <p>
                  <strong>Sprzeciw od nakazu w EPU jest wolny od opłaty</strong>{" "}
                  (art. 19 ust. 4 ustawy o kosztach sądowych w sprawach
                  cywilnych) — to jego ważna zaleta.
                </p>
              </>
            ),
          },
          {
            id: "co-po-sprzeciwie",
            title: "Co się stanie po wniesieniu sprzeciwu",
            content: (
              <>
                <p>
                  Po skutecznym wniesieniu sprzeciwu:
                </p>
                <ol>
                  <li>
                    Nakaz zapłaty <strong>traci moc w całości</strong>{" "}
                    (art. 505(36) § 1 KPC).
                  </li>
                  <li>
                    Sąd Lublin-Zachód <strong>przekazuje sprawę</strong> do
                    sądu rejonowego właściwego dla Twojego miejsca
                    zamieszkania (art. 505(37) § 1 KPC).
                  </li>
                  <li>
                    Powód zostanie wezwany do <strong>uzupełnienia braków
                    formalnych pozwu</strong> — w tym opłaty od pozwu (5%
                    wartości przedmiotu sporu) oraz pełnej dokumentacji
                    dowodowej.
                  </li>
                  <li>
                    Jeżeli powód nie uzupełni braków w terminie — sąd
                    <strong> umarza postępowanie</strong>. Statystycznie w
                    sprawach funduszy sekurytyzacyjnych dzieje się tak w
                    35-40% przypadków — bo fundusze nie mają pełnej
                    dokumentacji cesji ani oryginalnych umów.
                  </li>
                  <li>
                    Jeżeli powód uzupełni braki — odbywa się rozprawa. Sąd
                    rozpoznaje sprawę w pełnym zakresie, z możliwością
                    przesłuchania świadków i dopuszczenia dowodów. Cały proces
                    trwa zwykle <strong>6-18 miesięcy</strong>.
                  </li>
                </ol>
                <p>
                  W tym czasie nakaz nie ma klauzuli wykonalności — komornik
                  nie może prowadzić egzekucji. Jeżeli komornik już zajął
                  Twoje wynagrodzenie lub rachunek (na podstawie nakazu, który
                  został uchylony) — należy złożyć skargę na czynności
                  komornika z powołaniem na utratę mocy nakazu.
                </p>
              </>
            ),
          },
          {
            id: "najczestsze-bledy",
            title: "Najczęstsze błędy przy sprzeciwie",
            content: (
              <ul>
                <li>
                  <strong>Wysłanie po terminie.</strong> 14 dni to termin
                  zawity — bez wniosku o przywrócenie nie da się go uratować.
                </li>
                <li>
                  <strong>Brak sygnatury akt.</strong> Bez "Nc-e ..."
                  sprzeciw nie zostanie przypisany do sprawy.
                </li>
                <li>
                  <strong>Wysłanie do złego sądu.</strong> Sprzeciw kieruje
                  się do Sądu Rejonowego Lublin-Zachód, VI Wydział Cywilny
                  (e-Sąd) — nie do sądu właściwego dla miejsca zamieszkania.
                </li>
                <li>
                  <strong>Brak podpisu.</strong> Sprzeciw musi być
                  własnoręcznie podpisany — kopia podpisu (faks, ksero)
                  niewystarczająca.
                </li>
                <li>
                  <strong>Złożenie po wpłacie części długu.</strong> Sama
                  wpłata nie jest równoznaczna z uznaniem długu — ale unikaj
                  pisania w sprzeciwie zdań typu "uznaję, że zapłaciłem 500 zł"
                  bez zarzutów. Lepsza formuła: "spełniłem część świadczenia
                  bez uznania roszczenia".
                </li>
              </ul>
            ),
          },
        ]}
        relatedModule={{
          code: "D2",
          title: "Sprzeciwomat EPU",
          href: "/moduly/sprzeciw-epu",
          price: "159 zł",
          description:
            "Pełen sprzeciw z zarzutami: przedawnienie, brak legitymacji, klauzule abuzywne. Wniosek dowodowy + zwolnienie z kosztów. Walidacja Haiku 4.5. Pismo gotowe w 12 minut, zgodne z art. 503 KPC.",
        }}
        legalSources={[
          "art. 502(1)–505(37) Kodeks postępowania cywilnego (Dz.U. 2024 ze zm.)",
          "art. 117, 385(1) Kodeks cywilny",
          "art. 19 ust. 4 ustawy o kosztach sądowych w sprawach cywilnych",
          "Wyrok SN z 21 listopada 2019 r., III CSK 256/17 — wyciąg z umowy cesji nie zastępuje pełnej dokumentacji",
          "Uchwała SN z 19 października 2017 r., III CZP 49/17 — początek biegu przedawnienia w EPU",
        ]}
      />
    </>
  );
}
