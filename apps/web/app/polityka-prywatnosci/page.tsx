import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Polityka prywatności serwisu Długomat — administrator danych, cele " +
    "przetwarzania, podstawy prawne, retencja, odbiorcy, prawa osoby " +
    "(RODO art. 13–22), kontakt z ADO, skarga do PUODO.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

const LAST_UPDATED = "10 maja 2026";

interface Section {
  id: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: "ado", title: "1. Administrator Danych Osobowych" },
  { id: "zakres", title: "2. Zakres przetwarzanych danych" },
  { id: "cele", title: "3. Cele i podstawy prawne przetwarzania" },
  { id: "retencja", title: "4. Okres przechowywania (retencja)" },
  { id: "odbiorcy", title: "5. Odbiorcy danych i podmioty przetwarzające" },
  { id: "transfer", title: "6. Transfer danych poza EOG" },
  { id: "prawa", title: "7. Twoje prawa (RODO art. 15–22)" },
  { id: "bezpieczenstwo", title: "8. Bezpieczeństwo danych" },
  { id: "cookies", title: "9. Pliki cookies i analityka" },
  { id: "zautomatyzowane", title: "10. Zautomatyzowane przetwarzanie i AI" },
  { id: "skarga", title: "11. Skarga do organu nadzorczego (PUODO)" },
  { id: "zmiany", title: "12. Zmiany polityki" },
];

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <article className="container max-w-4xl py-12 md:py-16">
          <header className="mb-10 border-b border-iron-200 pb-8 dark:border-dlugomat-800">
            <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
              Dokument prawny
            </p>
            <h1 className="mt-2 font-serif text-fluid-4xl font-semibold text-iron-900 dark:text-white">
              Polityka prywatności
            </h1>
            <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
              Niniejsza polityka opisuje, w jaki sposób serwis Długomat
              przetwarza dane osobowe użytkowników zgodnie z Rozporządzeniem
              Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia
              2016 r. (<em>RODO</em>) oraz ustawą z dnia 10 maja 2018 r.
              o ochronie danych osobowych.
            </p>
            <p className="mt-2 text-fluid-sm text-iron-500">
              Ostatnia aktualizacja: <strong>{LAST_UPDATED}</strong>
            </p>
          </header>

          <nav
            aria-label="Spis treści"
            className="mb-12 rounded-2xl border border-iron-200 bg-iron-50/60 p-6 dark:border-dlugomat-800 dark:bg-dlugomat-950"
          >
            <h2 className="text-fluid-sm font-semibold uppercase tracking-wide text-iron-500">
              Spis treści
            </h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-fluid-sm text-iron-700 transition-colors hover:text-dlugomat-700 dark:text-iron-300 dark:hover:text-white"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose prose-iron max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-semibold prose-h2:mt-12 prose-h2:scroll-mt-24 prose-h2:text-fluid-2xl prose-h3:text-fluid-lg prose-p:text-fluid-base prose-li:text-fluid-base prose-strong:text-iron-900 dark:prose-strong:text-white">
            <section id="ado">
              <h2>1. Administrator Danych Osobowych</h2>
              <p>
                Administratorem Twoich danych osobowych (dalej:{" "}
                <strong>ADO</strong>) jest podmiot prowadzący serwis Długomat
                (dalej: <strong>Serwis</strong>). Pełne dane rejestrowe
                administratora dostępne są w{" "}
                <Link href="/regulamin">Regulaminie</Link> oraz w stopce serwisu.
              </p>
              <p>
                Kontakt w sprawach związanych z ochroną danych osobowych:
              </p>
              <ul>
                <li>
                  <strong>E-mail:</strong>{" "}
                  <a href="mailto:rodo@dlugomat.pl">rodo@dlugomat.pl</a>
                </li>
                <li>
                  <strong>Korespondencja:</strong> dane korespondencyjne dostępne
                  w Regulaminie.
                </li>
              </ul>
              <p>
                Z uwagi na charakter przetwarzania, ADO nie ma obowiązku
                wyznaczenia Inspektora Ochrony Danych (IOD) w rozumieniu art.
                37 RODO. Wszelkie sprawy obsługuje bezpośrednio ADO pod adresem
                podanym powyżej.
              </p>
            </section>

            <section id="zakres">
              <h2>2. Zakres przetwarzanych danych</h2>
              <p>W zależności od korzystania z Serwisu przetwarzamy:</p>
              <ul>
                <li>
                  <strong>Dane konta:</strong> adres e-mail, hash hasła
                  (bcrypt/argon2 — nigdy hasło w postaci jawnej), data
                  utworzenia konta.
                </li>
                <li>
                  <strong>Dane identyfikacyjne strony pisma:</strong> imię,
                  nazwisko, PESEL, adres zamieszkania, opcjonalnie NIP. PESEL
                  jest <strong>szyfrowany w spoczynku (AES-256)</strong>{" "}
                  i nigdy nie jest prezentowany w pełnej postaci w panelu
                  użytkownika (maskowany jako XXX*****1234).
                </li>
                <li>
                  <strong>Dane sprawy (case data):</strong> sygnatury akt,
                  oznaczenia sądu, dane wierzyciela/komornika, kwoty roszczenia,
                  daty doręczeń. Dane te są pozyskiwane wyłącznie w zakresie
                  niezbędnym do przygotowania pisma procesowego.
                </li>
                <li>
                  <strong>Dokumenty wgrane przez użytkownika:</strong> nakazy
                  zapłaty, wezwania, korespondencja od komornika — przechowywane
                  zaszyfrowane w bucketach Supabase Storage z restrykcyjnymi
                  zasadami RLS.
                </li>
                <li>
                  <strong>Treść OCR:</strong> tekst rozpoznany z wgranych
                  obrazów/skanów. Maskowany w eksportach RODO (pierwsze 200
                  znaków).
                </li>
                <li>
                  <strong>Dane rozliczeniowe:</strong> identyfikatory transakcji
                  Stripe, status płatności, opcjonalne dane do faktury (NIP,
                  nazwa, adres).
                </li>
                <li>
                  <strong>Logi techniczne:</strong> adres IP, znacznik czasu,
                  informacje o przeglądarce — przetwarzane w celu
                  bezpieczeństwa (rate-limiting, wykrywanie nadużyć).
                </li>
              </ul>
            </section>

            <section id="cele">
              <h2>3. Cele i podstawy prawne przetwarzania</h2>
              <p>Twoje dane przetwarzamy w następujących celach:</p>
              <h3>3.1. Świadczenie usługi (art. 6 ust. 1 lit. b RODO)</h3>
              <p>
                Generowanie pism procesowych, prowadzenie konta, obsługa
                płatności i komunikacja transakcyjna — wykonanie umowy, której
                stroną jest osoba, której dane dotyczą.
              </p>
              <h3>3.2. Obowiązki prawne (art. 6 ust. 1 lit. c RODO)</h3>
              <ul>
                <li>
                  Wystawianie i przechowywanie faktur (ustawa z dnia 29 września
                  1994 r. o rachunkowości, art. 71–74 — okres 5 lat).
                </li>
                <li>
                  Obowiązki podatkowe (Ordynacja podatkowa, ustawa o VAT).
                </li>
                <li>
                  Obsługa żądań organów państwowych (sąd, prokuratura, KAS).
                </li>
              </ul>
              <h3>3.3. Prawnie uzasadnione interesy ADO (art. 6 ust. 1 lit. f RODO)</h3>
              <ul>
                <li>
                  Bezpieczeństwo Serwisu: rate-limiting, wykrywanie i
                  zapobieganie nadużyciom, monitorowanie zdarzeń zabezpieczeń
                  (CSP, edge middleware).
                </li>
                <li>
                  Dochodzenie i obrona roszczeń (do upływu terminów
                  przedawnienia).
                </li>
                <li>
                  Podnoszenie jakości usługi i analityka produktowa (wyłącznie
                  dane zagregowane, bez identyfikacji osób).
                </li>
              </ul>
              <h3>3.4. Zgoda (art. 6 ust. 1 lit. a RODO)</h3>
              <p>
                Komunikacja marketingowa, opcjonalne pliki cookies analityczne,
                opcjonalne wykorzystanie treści sprawy do trenowania modeli
                wewnętrznych. Zgoda jest{" "}
                <strong>dobrowolna i może być wycofana w każdej chwili</strong>{" "}
                bez wpływu na zgodność z prawem przetwarzania, którego dokonano
                na podstawie zgody przed jej wycofaniem.
              </p>
            </section>

            <section id="retencja">
              <h2>4. Okres przechowywania (retencja)</h2>
              <table>
                <thead>
                  <tr>
                    <th>Kategoria danych</th>
                    <th>Okres retencji</th>
                    <th>Podstawa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Konto użytkownika</td>
                    <td>Do żądania usunięcia</td>
                    <td>art. 6 ust. 1 lit. b RODO</td>
                  </tr>
                  <tr>
                    <td>Dane sprawy + wygenerowane pisma</td>
                    <td>Do żądania usunięcia (soft-delete + 30 dni)</td>
                    <td>art. 6 ust. 1 lit. b RODO</td>
                  </tr>
                  <tr>
                    <td>Faktury i dane rozliczeniowe</td>
                    <td>5 lat od końca roku obrotowego</td>
                    <td>art. 71–74 ustawy o rachunkowości</td>
                  </tr>
                  <tr>
                    <td>Logi bezpieczeństwa</td>
                    <td>12 miesięcy</td>
                    <td>art. 6 ust. 1 lit. f RODO</td>
                  </tr>
                  <tr>
                    <td>Korespondencja e-mail</td>
                    <td>3 lata (przedawnienie roszczeń konsumenckich)</td>
                    <td>art. 6 ust. 1 lit. f RODO</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Po skorzystaniu z prawa do usunięcia (
                <Link href="/panel/ustawienia/rodo">
                  panel → Twoje dane (RODO)
                </Link>
                ) Twoje dane zostają niezwłocznie usunięte (hard-delete) lub
                zanonimizowane, z wyjątkiem danych objętych obowiązkiem
                archiwizacji (np. faktur).
              </p>
            </section>

            <section id="odbiorcy">
              <h2>5. Odbiorcy danych i podmioty przetwarzające</h2>
              <p>
                ADO korzysta z następujących, starannie wybranych podmiotów
                przetwarzających (art. 28 RODO), z którymi zawarł umowy
                powierzenia przetwarzania danych:
              </p>
              <ul>
                <li>
                  <strong>Supabase, Inc.</strong> (USA, EOG: dane w regionie EU
                  Frankfurt) — hosting bazy PostgreSQL, autentykacja, Storage.
                  Standardowe Klauzule Umowne (SCC).
                </li>
                <li>
                  <strong>Stripe, Inc.</strong> (USA, oddział w Irlandii) —
                  procesor płatności kartowych. SCC + Tarcza Prywatności
                  (DPF).
                </li>
                <li>
                  <strong>Anthropic PBC</strong> (USA) — dostawca modeli AI
                  (Claude). Dane wprowadzone do modelu nie są wykorzystywane do
                  trenowania (zgodnie z polityką API).
                </li>
                <li>
                  <strong>Fakturownia Sp. z o.o.</strong> (Polska) — wystawianie
                  i przechowywanie faktur.
                </li>
                <li>
                  <strong>Vercel Inc.</strong> (USA, region EOG: fra1) — hosting
                  warstwy aplikacyjnej i edge.
                </li>
              </ul>
              <p>
                Dane mogą być również udostępnione organom państwowym (sądy,
                prokuratura, KAS) wyłącznie na podstawie wyraźnej podstawy
                prawnej.
              </p>
            </section>

            <section id="transfer">
              <h2>6. Transfer danych poza EOG</h2>
              <p>
                Niektórzy nasi dostawcy mają siedzibę poza Europejskim Obszarem
                Gospodarczym (USA). Transfer odbywa się wyłącznie w oparciu o:
              </p>
              <ul>
                <li>
                  <strong>Standardowe Klauzule Umowne</strong> Komisji
                  Europejskiej (decyzja 2021/914);
                </li>
                <li>
                  <strong>EU–US Data Privacy Framework</strong> (decyzja
                  Komisji z 10 lipca 2023 r.) tam, gdzie ma zastosowanie;
                </li>
                <li>
                  <strong>Dodatkowe środki techniczne</strong>: szyfrowanie
                  w tranzycie (TLS 1.3), szyfrowanie w spoczynku (AES-256),
                  pseudonimizacja PESEL.
                </li>
              </ul>
            </section>

            <section id="prawa">
              <h2>7. Twoje prawa (RODO art. 15–22)</h2>
              <p>Masz prawo do:</p>
              <ul>
                <li>
                  <strong>Dostępu do danych</strong> (art. 15) — zobaczenia,
                  jakie dane przetwarzamy.
                </li>
                <li>
                  <strong>Sprostowania</strong> (art. 16) — poprawienia danych
                  nieprawidłowych lub nieaktualnych.
                </li>
                <li>
                  <strong>Usunięcia</strong> (art. 17, „prawo do bycia
                  zapomnianym&rdquo;) — w panelu{" "}
                  <Link href="/panel/ustawienia/rodo">
                    /panel/ustawienia/rodo
                  </Link>
                  . Niektóre dane (faktury) podlegają obowiązkowej retencji.
                </li>
                <li>
                  <strong>Ograniczenia przetwarzania</strong> (art. 18).
                </li>
                <li>
                  <strong>Przenoszenia danych</strong> (art. 20) — eksport
                  pełnej kopii w formacie JSON, dostępny w{" "}
                  <Link href="/panel/ustawienia/rodo">
                    /panel/ustawienia/rodo
                  </Link>
                  .
                </li>
                <li>
                  <strong>Sprzeciwu</strong> (art. 21) wobec przetwarzania
                  opartego o uzasadniony interes ADO.
                </li>
                <li>
                  <strong>Niepodlegania decyzjom zautomatyzowanym</strong>{" "}
                  (art. 22) — patrz sekcja 10.
                </li>
                <li>
                  <strong>Wycofania zgody</strong> w dowolnym momencie, bez
                  wpływu na przetwarzanie sprzed wycofania.
                </li>
              </ul>
              <p>
                Realizacja praw odbywa się <strong>bez zbędnej zwłoki</strong>,
                nie później niż w ciągu miesiąca (z możliwością przedłużenia
                o 2 miesiące w sprawach skomplikowanych — art. 12 ust. 3 RODO).
              </p>
            </section>

            <section id="bezpieczenstwo">
              <h2>8. Bezpieczeństwo danych</h2>
              <p>
                Wdrażamy techniczne i organizacyjne środki ochrony danych
                osobowych adekwatne do ryzyka (art. 32 RODO):
              </p>
              <ul>
                <li>Szyfrowanie w tranzycie (TLS 1.3) i w spoczynku (AES-256).</li>
                <li>
                  Postgres Row-Level Security z trybem <code>FORCE</code> —
                  każde zapytanie wymusza politykę dostępu opartą o JWT
                  użytkownika.
                </li>
                <li>
                  Content Security Policy z nonce i <code>strict-dynamic</code>,
                  HSTS (2 lata, preload), X-Frame-Options DENY, Cross-Origin
                  Opener/Resource Policy.
                </li>
                <li>
                  Rate-limiting na warstwie edge, server-action i webhook
                  (token-bucket) — ochrona przed atakami brute-force i
                  enumeracją.
                </li>
                <li>
                  Maskowanie PESEL w UI i w eksportach. Tekst OCR maskowany
                  w eksportach RODO.
                </li>
                <li>
                  Audyt zdarzeń istotnych dla bezpieczeństwa w tabeli{" "}
                  <code>case_events</code>.
                </li>
                <li>
                  Defense-in-depth: każde server-action po przejściu rate-limit
                  weryfikuje dodatkowo własność rekordu (
                  <code>caseRow.user_id === userId</code>).
                </li>
              </ul>
            </section>

            <section id="cookies">
              <h2>9. Pliki cookies i analityka</h2>
              <p>
                Serwis stosuje wyłącznie pliki cookies <strong>niezbędne</strong>
                {" "}do prawidłowego działania (sesja, CSRF, preferencje motywu).
                Te cookies nie wymagają zgody (art. 173 ust. 3 Prawa
                telekomunikacyjnego).
              </p>
              <p>
                Cookies <strong>analityczne i marketingowe</strong> (jeśli
                w przyszłości zostaną wdrożone) będą uruchamiane wyłącznie po
                wyrażeniu jednoznacznej zgody przez baner zgody (opt-in).
                Możesz zarządzać zgodami w dowolnym momencie usuwając klucz{" "}
                <code>dlugomat:cookie-consent</code> ze swojego{" "}
                <code>localStorage</code> — przy następnej wizycie baner
                pojawi się ponownie.
              </p>
              <h3>Rodzaje cookies używanych w Serwisie</h3>
              <ul>
                <li>
                  <code>sb-access-token</code>, <code>sb-refresh-token</code> —
                  sesja Supabase Auth (niezbędne).
                </li>
                <li>
                  <code>dlugomat:theme</code> — preferencja jasny/ciemny
                  (niezbędne, opcjonalne UX).
                </li>
                <li>
                  <code>dlugomat:cookie-consent</code> — zapis Twojej decyzji
                  ws. cookies (niezbędne dla obsługi zgody).
                </li>
              </ul>
            </section>

            <section id="zautomatyzowane">
              <h2>10. Zautomatyzowane przetwarzanie i AI</h2>
              <p>
                Generowanie pism procesowych przez Długomat opiera się o duże
                modele językowe (Claude Sonnet/Haiku/Opus dostarczane przez
                Anthropic). Każde wygenerowane pismo:
              </p>
              <ul>
                <li>
                  jest <strong>asystą prawniczą</strong>, a nie poradą prawną
                  ani decyzją wywołującą skutki prawne wobec użytkownika
                  w rozumieniu art. 22 ust. 1 RODO;
                </li>
                <li>
                  podlega <strong>weryfikacji przez użytkownika</strong> przed
                  podpisaniem i złożeniem (krok review w kreatorze);
                </li>
                <li>
                  jest opcjonalnie wzbogacane o aktualne orzecznictwo
                  i przepisy z naszej bazy wiedzy (pgvector).
                </li>
              </ul>
              <p>
                Treść wprowadzona do modelu nie jest wykorzystywana przez
                dostawcę do trenowania modeli ogólnego użytku (zgodnie z polityką
                Anthropic API). Wewnętrzne fine-tuning lub trenowanie modeli na
                Twoich danych odbywa się <strong>wyłącznie po Twojej zgodzie</strong>.
              </p>
            </section>

            <section id="skarga">
              <h2>11. Skarga do organu nadzorczego (PUODO)</h2>
              <p>
                Jeżeli uważasz, że przetwarzanie Twoich danych osobowych narusza
                RODO, masz prawo złożyć skargę do organu nadzorczego:
              </p>
              <address className="not-italic">
                <strong>Prezes Urzędu Ochrony Danych Osobowych</strong>
                <br />
                ul. Stawki 2, 00-193 Warszawa
                <br />
                Tel.: 22 531 03 00
                <br />
                Strona:{" "}
                <a
                  href="https://uodo.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  uodo.gov.pl
                </a>
              </address>
              <p>
                Zachęcamy do uprzedniego kontaktu z ADO (
                <a href="mailto:rodo@dlugomat.pl">rodo@dlugomat.pl</a>) — wiele
                spraw można rozwiązać sprawniej i szybciej w trybie
                bezpośrednim.
              </p>
            </section>

            <section id="zmiany">
              <h2>12. Zmiany polityki</h2>
              <p>
                Niniejsza polityka może być aktualizowana w celu odzwierciedlenia
                zmian prawnych, technicznych lub w zakresie funkcji Serwisu.
                Każda istotna zmiana zostanie zakomunikowana użytkownikom drogą
                e-mail oraz baner informacyjnym w panelu, z odpowiednim
                wyprzedzeniem.
              </p>
              <p>
                Wersja archiwalna polityki dostępna jest na żądanie, w trybie
                kontaktu z ADO.
              </p>
            </section>
          </div>

          <footer className="mt-16 flex flex-col items-start gap-3 border-t border-iron-200 pt-8 text-fluid-sm text-iron-600 dark:border-dlugomat-800 dark:text-iron-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Masz pytania? Napisz:{" "}
              <a
                className="font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
                href="mailto:rodo@dlugomat.pl"
              >
                rodo@dlugomat.pl
              </a>
            </span>
            <Link
              href="/panel/ustawienia/rodo"
              className="rounded-md border border-dlugomat-200 px-4 py-2 font-semibold text-dlugomat-700 transition-colors hover:bg-dlugomat-50 dark:border-dlugomat-700 dark:text-dlugomat-200 dark:hover:bg-dlugomat-900"
            >
              Przejdź do panelu RODO →
            </Link>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
