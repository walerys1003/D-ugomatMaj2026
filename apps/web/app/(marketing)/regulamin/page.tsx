import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regulamin serwisu Długomat",
  description:
    "Regulamin świadczenia usług drogą elektroniczną w serwisie Długomat. Zakres usług, prawa i obowiązki stron, reklamacje, odstąpienie od umowy.",
  alternates: { canonical: "/regulamin" },
};

const UPDATED = "22 kwietnia 2025";

export default function RegulaminPage() {
  return (
    <article className="container py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-ink-200 pb-8 dark:border-dlugomat-800">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Dokumenty prawne
          </p>
          <h1 className="mt-2 text-balance text-fluid-5xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Regulamin serwisu Długomat
          </h1>
          <p className="mt-3 text-fluid-sm text-ink-500">
            Wersja obowiązująca od: {UPDATED}
          </p>
        </header>

        <div className="prose prose-iron mt-10 max-w-none dark:prose-invert">
          <h2>§ 1. Postanowienia ogólne</h2>
          <ol>
            <li>
              Niniejszy regulamin (dalej: <strong>Regulamin</strong>) określa
              zasady świadczenia usług drogą elektroniczną w serwisie
              internetowym Długomat dostępnym pod adresem dlugomat.pl (dalej:{" "}
              <strong>Serwis</strong>).
            </li>
            <li>
              Usługodawcą jest Długomat sp. z o.o. z siedzibą w Warszawie, ul.
              Przykładowa 1, 00-001 Warszawa, NIP 000-000-00-00, KRS 0000000000
              (dalej: <strong>Usługodawca</strong>).
            </li>
            <li>
              Regulamin jest udostępniany nieodpłatnie pod adresem
              dlugomat.pl/regulamin w sposób umożliwiający jego pobranie,
              odtwarzanie, utrwalanie i wydrukowanie.
            </li>
            <li>
              Usługodawca świadczy usługi technologiczne polegające na
              generowaniu wzorów pism procesowych przy użyciu modeli AI.{" "}
              <strong>
                Usługodawca nie jest kancelarią prawną w rozumieniu Prawa o
                adwokaturze ani ustawy o radcach prawnych
              </strong>{" "}
              i nie świadczy pomocy prawnej w indywidualnych sprawach.
            </li>
          </ol>

          <h2>§ 2. Definicje</h2>
          <ul>
            <li>
              <strong>Użytkownik</strong> — osoba fizyczna, która korzysta z
              Serwisu, w tym zarejestrowana w Serwisie.
            </li>
            <li>
              <strong>Konto</strong> — indywidualny profil Użytkownika w
              Serwisie, dostępny po rejestracji.
            </li>
            <li>
              <strong>Moduł</strong> — wyodrębniona usługa Serwisu generująca
              pismo procesowe określonego typu (D1-D8).
            </li>
            <li>
              <strong>Pismo</strong> — dokument w formacie PDF wygenerowany
              przez Serwis na podstawie danych podanych przez Użytkownika.
            </li>
            <li>
              <strong>Konsument</strong> — Użytkownik będący osobą fizyczną
              dokonującą czynności prawnej niezwiązanej bezpośrednio z jej
              działalnością gospodarczą lub zawodową (art. 22(1) KC).
            </li>
          </ul>

          <h2>§ 3. Zakres usług</h2>
          <ol>
            <li>
              Serwis udostępnia następujące usługi:
              <ul>
                <li>
                  <strong>D1 Skaner Nakazu</strong> — bezpłatne rozpoznanie
                  pisma procesowego (OCR), ocena terminów reakcji i
                  rekomendacja dalszego działania.
                </li>
                <li>
                  <strong>D2-D8</strong> — odpłatne moduły generujące pisma
                  procesowe (sprzeciw EPU, skargi komornicze, ochrona kwoty
                  wolnej, korekta BIK, weryfikacja cesji, propozycja ugody,
                  wniosek o upadłość konsumencką).
                </li>
              </ul>
            </li>
            <li>
              Aktualny zakres modułów i ich cennik dostępne są na stronie
              dlugomat.pl/cennik. Zmiany cen nie obejmują usług już opłaconych.
            </li>
            <li>
              Usługodawca dokłada starań, aby Pisma były zgodne z aktualnym
              stanem prawnym i orzecznictwem sądów polskich.{" "}
              <strong>
                Generowane Pisma stanowią wzory pism procesowych — nie zastępują
                porady prawnej w indywidualnej sprawie.
              </strong>{" "}
              Użytkownik ponosi odpowiedzialność za weryfikację Pisma przed
              jego wysłaniem.
            </li>
          </ol>

          <h2>§ 4. Rejestracja i Konto</h2>
          <ol>
            <li>
              Korzystanie z Modułów odpłatnych wymaga rejestracji Konta. Skaner
              Nakazu (D1) dostępny jest po założeniu darmowego Konta bez
              podawania danych płatniczych.
            </li>
            <li>
              W procesie rejestracji Użytkownik podaje adres e-mail i hasło. Po
              potwierdzeniu adresu e-mail Konto jest aktywne.
            </li>
            <li>
              Użytkownik zobowiązuje się do podania prawdziwych danych i
              ochrony danych logowania przed dostępem osób trzecich.
              Usługodawca nie ponosi odpowiedzialności za działania osób, które
              uzyskały dostęp do Konta z powodu zaniedbania Użytkownika.
            </li>
            <li>
              Użytkownik może w każdej chwili usunąć Konto w panelu (Ustawienia
              → RODO). Usunięcie Konta jest nieodwracalne i powoduje trwałe
              usunięcie wszystkich danych przypisanych do Użytkownika, z
              zastrzeżeniem dokumentów księgowych przechowywanych przez okres
              wymagany przepisami prawa podatkowego (5 lat).
            </li>
          </ol>

          <h2>§ 5. Zawarcie umowy i płatności</h2>
          <ol>
            <li>
              Umowa o świadczenie usługi odpłatnej zawierana jest w chwili
              kliknięcia przycisku "Zamawiam i płacę" oraz dokonania płatności.
            </li>
            <li>
              Płatności obsługiwane są przez Stripe Payments Europe Ltd. Serwis
              nie przechowuje danych kart płatniczych — są one przekazywane
              bezpośrednio do operatora płatności.
            </li>
            <li>
              Wszystkie ceny podane w Serwisie są cenami brutto (zawierają 23%
              VAT). Faktura VAT wystawiana jest automatycznie przez system
              Fakturownia w terminie 24 godzin od dokonania płatności i
              przesyłana na adres e-mail Użytkownika.
            </li>
            <li>
              Po zaksięgowaniu płatności Użytkownik uzyskuje natychmiastowy
              dostęp do generowania Pisma w wybranym Module.
            </li>
          </ol>

          <h2>§ 6. Prawa i obowiązki Użytkownika</h2>
          <ol>
            <li>
              Użytkownik zobowiązuje się do:
              <ul>
                <li>podawania prawdziwych danych w formularzach Modułów,</li>
                <li>
                  korzystania z Pism wygenerowanych w Serwisie wyłącznie w
                  swoich własnych sprawach,
                </li>
                <li>
                  weryfikacji Pisma przed jego podpisaniem i wysłaniem do sądu /
                  organu / kontrahenta,
                </li>
                <li>
                  niepodejmowania działań mogących destabilizować pracę Serwisu
                  (m.in. ataków DoS, prób obejścia zabezpieczeń, nadużycia API).
                </li>
              </ul>
            </li>
            <li>
              Użytkownik ma prawo do:
              <ul>
                <li>
                  korzystania z Modułów zgodnie z ich przeznaczeniem,
                </li>
                <li>
                  pobierania wygenerowanych Pism w formacie PDF bez
                  ograniczenia czasowego (przez okres istnienia Konta),
                </li>
                <li>
                  uzyskania bezpłatnej korekty Pisma w terminie 30 dni od
                  zakupu, jeżeli sąd zwrócił Pismo z powodu braku formalnego,
                </li>
                <li>
                  zgłaszania reklamacji zgodnie z § 8 Regulaminu,
                </li>
                <li>
                  odstąpienia od umowy zgodnie z § 9 Regulaminu.
                </li>
              </ul>
            </li>
          </ol>

          <h2>§ 7. Odpowiedzialność Usługodawcy</h2>
          <ol>
            <li>
              Usługodawca dokłada wszelkich starań, aby Serwis działał
              prawidłowo i bez przerw, jednak nie gwarantuje ciągłości pracy
              Serwisu. Przerwy techniczne komunikowane są w panelu i poprzez
              e-mail, jeżeli wpływają na trwającą sprawę Użytkownika.
            </li>
            <li>
              Usługodawca nie ponosi odpowiedzialności za skutki podjętych
              przez Użytkownika decyzji procesowych, w szczególności za
              odrzucenie / oddalenie pisma przez sąd lub organ z przyczyn
              merytorycznych.
            </li>
            <li>
              Odpowiedzialność Usługodawcy wobec Konsumenta z tytułu rękojmi
              regulują przepisy Kodeksu cywilnego. Wobec przedsiębiorców
              odpowiedzialność jest ograniczona do wysokości zapłaconej ceny za
              dany Moduł.
            </li>
            <li>
              Usługodawca nie ponosi odpowiedzialności za działania osób
              trzecich, w szczególności operatorów płatności, dostawców
              infrastruktury (Supabase, Vercel) i modeli AI (Anthropic).
            </li>
          </ol>

          <h2>§ 8. Reklamacje</h2>
          <ol>
            <li>
              Użytkownik może złożyć reklamację dotyczącą działania Serwisu
              wysyłając wiadomość na adres pomoc@dlugomat.pl. W reklamacji
              należy podać: imię i nazwisko, adres e-mail powiązany z Kontem,
              numer sprawy lub zamówienia oraz opis problemu.
            </li>
            <li>
              Usługodawca rozpoznaje reklamację w terminie 14 dni od jej
              otrzymania. W przypadkach skomplikowanych termin może być
              przedłużony do 30 dni z uzasadnieniem przesyłanym Użytkownikowi.
            </li>
            <li>
              Brak odpowiedzi na reklamację Konsumenta w terminie 30 dni
              uznaje się za uznanie reklamacji zgodnie z żądaniem Konsumenta
              (ustawa z 5 sierpnia 2015 r. o reklamacjach).
            </li>
            <li>
              Konsument ma prawo do skorzystania z pozasądowych sposobów
              rozpoznawania reklamacji i dochodzenia roszczeń, w tym:
              postępowania przed Rzecznikiem Finansowym (rf.gov.pl),
              postępowania mediacyjnego przy Wojewódzkim Inspektorze Inspekcji
              Handlowej, platformy ODR Komisji Europejskiej
              (ec.europa.eu/consumers/odr).
            </li>
          </ol>

          <h2>§ 9. Odstąpienie od umowy</h2>
          <ol>
            <li>
              Konsument ma prawo odstąpić od umowy zawartej na odległość bez
              podania przyczyny w terminie 14 dni od dnia zawarcia umowy
              (zgodnie z ustawą z 30 maja 2014 r. o prawach konsumenta).
            </li>
            <li>
              Aby odstąpić od umowy, Konsument przesyła oświadczenie o
              odstąpieniu na adres pomoc@dlugomat.pl. Wzór oświadczenia
              dostępny jest na żądanie.
            </li>
            <li>
              <strong>Wyjątek:</strong> Prawo do odstąpienia nie przysługuje, jeśli
              Pismo zostało przez Użytkownika pobrane w wersji finalnej (PDF)
              przed upływem terminu odstąpienia — zgodnie z art. 38 pkt 13
              ustawy o prawach konsumenta (treści cyfrowe dostarczone na
              wyraźne żądanie Konsumenta przed upływem terminu odstąpienia).
              Konsument wyraża zgodę na rozpoczęcie świadczenia przed upływem
              tego terminu w chwili kliknięcia "Pobierz PDF".
            </li>
            <li>
              W przypadku skutecznego odstąpienia Usługodawca zwraca pełną
              kwotę uiszczoną przez Konsumenta w terminie 14 dni od otrzymania
              oświadczenia, na rachunek użyty do zapłaty.
            </li>
          </ol>

          <h2>§ 10. Ochrona danych osobowych</h2>
          <ol>
            <li>
              Administratorem danych osobowych Użytkowników jest Usługodawca.
            </li>
            <li>
              Szczegółowe informacje o przetwarzaniu danych osobowych zawiera
              Polityka Prywatności dostępna pod adresem{" "}
              <Link href="/polityka-prywatnosci" className="font-medium">
                dlugomat.pl/polityka-prywatnosci
              </Link>
              .
            </li>
            <li>
              Użytkownik ma prawo do żądania dostępu do swoich danych (art. 15
              RODO), ich sprostowania (art. 16), usunięcia (art. 17),
              ograniczenia przetwarzania (art. 18), portowalności (art. 20)
              oraz wniesienia sprzeciwu (art. 21). Realizacja praw dostępna w
              panelu (Ustawienia → RODO).
            </li>
          </ol>

          <h2>§ 11. Zmiany Regulaminu</h2>
          <ol>
            <li>
              Usługodawca zastrzega sobie prawo do zmiany Regulaminu w
              przypadku zmian przepisów prawa, wprowadzania nowych Modułów lub
              istotnej zmiany sposobu świadczenia usług.
            </li>
            <li>
              Zmiany Regulaminu są komunikowane Użytkownikom drogą elektroniczną
              z wyprzedzeniem co najmniej 14 dni. Użytkownik, który nie
              akceptuje zmian, może w tym terminie usunąć Konto bez ponoszenia
              kosztów.
            </li>
            <li>
              Zmiany nie obejmują usług już opłaconych — do nich stosuje się
              wersję Regulaminu obowiązującą w chwili zawarcia umowy.
            </li>
          </ol>

          <h2>§ 12. Postanowienia końcowe</h2>
          <ol>
            <li>
              W sprawach nieuregulowanych Regulaminem stosuje się przepisy
              prawa polskiego, w szczególności Kodeksu cywilnego, ustawy o
              prawach konsumenta, ustawy o świadczeniu usług drogą
              elektroniczną oraz RODO.
            </li>
            <li>
              Sądem właściwym do rozstrzygania sporów jest sąd właściwy
              miejscowo dla Konsumenta. W sporach z przedsiębiorcami sądem
              właściwym jest sąd właściwy dla siedziby Usługodawcy.
            </li>
            <li>
              Jeżeli którekolwiek z postanowień Regulaminu okaże się nieważne
              lub bezskuteczne, pozostałe postanowienia pozostają w mocy.
            </li>
          </ol>
        </div>

        <div className="mt-12 rounded-xl border border-ink-200 bg-ink-50/60 p-5 text-fluid-sm text-ink-600 dark:border-dlugomat-800 dark:bg-dlugomat-950/40 dark:text-ink-300">
          <p>
            <strong className="text-dlugomat-900 dark:text-ink-50">
              Pytania o regulamin?
            </strong>{" "}
            Napisz na{" "}
            <a
              href="mailto:pomoc@dlugomat.pl"
              className="font-medium text-dlugomat-700 underline-offset-2 hover:underline dark:text-dlugomat-200"
            >
              pomoc@dlugomat.pl
            </a>{" "}
            — odpowiemy w 24h roboczych.
          </p>
        </div>
      </div>
    </article>
  );
}
