import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Download, Shield, Building2, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Tier 5 zad. 214 — Strona z szablonem DPA (Data Processing Agreement)
// dla klientów B2B (kancelarie, biura księgowe, biura rachunkowe)
// którzy używają Długomatu w imieniu swoich klientów.
// Zgodnie z RODO art. 28 — umowa powierzenia jest WYMAGANA gdy podmiot
// trzeci powierza nam dane osobowe swoich klientów.

export const metadata: Metadata = {
  title: "Umowa powierzenia danych (DPA) — Długomat dla B2B",
  description:
    "Szablon Data Processing Agreement (DPA) dla kancelarii prawnych, biur księgowych i firm doradczych korzystających z Długomatu w imieniu klientów. Zgodne z RODO art. 28.",
  alternates: { canonical: "/dpa" },
  openGraph: {
    title: "DPA — umowa powierzenia danych | Długomat",
    description:
      "Szablon umowy powierzenia danych zgodny z RODO art. 28 dla klientów B2B.",
    type: "article",
  },
};

interface Section {
  num: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: readonly Section[] = [
  {
    num: "§1",
    title: "Definicje",
    body: (
      <>
        <p>Użyte w umowie pojęcia oznaczają:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>
            <strong>RODO</strong> — Rozporządzenie Parlamentu Europejskiego
            i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r.
          </li>
          <li>
            <strong>Administrator</strong> — Klient B2B (kancelaria, biuro
            rachunkowe, doradca) korzystający z Długomatu w imieniu
            klientów-osób fizycznych lub firm.
          </li>
          <li>
            <strong>Procesor</strong> — Długomat sp. z o.o. (NIP: TBD,
            KRS: TBD) jako podmiot przetwarzający w imieniu Administratora.
          </li>
          <li>
            <strong>Podmiot danych</strong> — końcowy klient Administratora
            (dłużnik), którego dane są przetwarzane w celu wygenerowania pism.
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "§2",
    title: "Przedmiot powierzenia",
    body: (
      <>
        <p>
          Administrator powierza Procesorowi przetwarzanie danych osobowych
          podmiotów danych w celu i w zakresie niezbędnym do świadczenia
          usługi platformy Długomat (generowanie pism procesowych, OCR,
          archiwizacja, kalkulatory).
        </p>
        <p>
          <strong>Kategorie danych:</strong> imię, nazwisko, PESEL, NIP, adres
          zamieszkania, adres e-mail, numer telefonu, dane finansowe (kwoty
          długu, terminy, oprocentowanie), treści dokumentów (nakazy zapłaty,
          BIK, korespondencja od komorników).
        </p>
        <p>
          <strong>Kategorie podmiotów danych:</strong> osoby fizyczne
          (dłużnicy), przedsiębiorcy (JDG), członkowie rodziny w sprawach
          spadkowych.
        </p>
      </>
    ),
  },
  {
    num: "§3",
    title: "Czas trwania powierzenia",
    body: (
      <p>
        Powierzenie obowiązuje przez czas trwania umowy głównej (subskrypcja
        Długomat dla B2B) oraz przez 30 dni po jej rozwiązaniu — wyłącznie
        w celu zwrotu lub usunięcia danych. Wyjątek: dokumenty księgowe
        i fiskalne, które Procesor archiwizuje przez 5 lat zgodnie z ustawą
        o rachunkowości.
      </p>
    ),
  },
  {
    num: "§4",
    title: "Obowiązki Procesora",
    body: (
      <>
        <p>Procesor zobowiązuje się do:</p>
        <ol className="ml-6 list-decimal space-y-1">
          <li>
            przetwarzania danych <em>wyłącznie</em> na udokumentowane
            polecenie Administratora (w tym poprzez konfigurację konta);
          </li>
          <li>
            zapewnienia, że osoby upoważnione do przetwarzania zobowiązały
            się do zachowania tajemnicy lub podlegają odpowiedniemu
            ustawowemu obowiązkowi tajemnicy;
          </li>
          <li>
            wdrożenia środków technicznych i organizacyjnych z art. 32 RODO
            (szczegóły w Załączniku 1);
          </li>
          <li>
            pomocy Administratorowi w realizacji żądań podmiotów danych
            (eksport, usunięcie, sprostowanie) — SLA: 5 dni roboczych;
          </li>
          <li>
            niezwłocznego (≤ 24h) zgłaszania naruszeń ochrony danych na
            adres e-mail wskazany przez Administratora;
          </li>
          <li>
            usunięcia lub zwrotu wszystkich danych po zakończeniu umowy oraz
            usunięcia istniejących kopii (z wyjątkiem wymaganych prawem);
          </li>
          <li>
            udostępnienia Administratorowi informacji niezbędnych do wykazania
            spełnienia obowiązków oraz umożliwienia audytu (raz do roku
            podczas standardowych godzin pracy, z 14-dniowym wyprzedzeniem).
          </li>
        </ol>
      </>
    ),
  },
  {
    num: "§5",
    title: "Podpowierzenie (subprocesorzy)",
    body: (
      <>
        <p>
          Administrator wyraża <strong>ogólną zgodę</strong> na korzystanie
          z poniższej listy subprocesorów. Procesor zobowiązuje się
          poinformować Administratora o zamiarze dodania lub zmiany
          subprocesora z 30-dniowym wyprzedzeniem (e-mail).
        </p>
        <div className="overflow-x-auto rounded-lg border border-iron-200 dark:border-dlugomat-700">
          <table className="w-full text-fluid-xs">
            <thead className="bg-iron-50 dark:bg-dlugomat-800">
              <tr>
                <th className="p-2 text-left">Subprocesor</th>
                <th className="p-2 text-left">Cel</th>
                <th className="p-2 text-left">Lokalizacja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-200 dark:divide-dlugomat-700">
              <tr>
                <td className="p-2">Supabase Inc.</td>
                <td className="p-2">Hosting bazy danych + auth + storage</td>
                <td className="p-2">EU (Frankfurt)</td>
              </tr>
              <tr>
                <td className="p-2">Vercel Inc.</td>
                <td className="p-2">Hosting aplikacji (CDN + edge)</td>
                <td className="p-2">EU + globalny CDN</td>
              </tr>
              <tr>
                <td className="p-2">APIPod / Anthropic</td>
                <td className="p-2">Generowanie pism (LLM Claude)</td>
                <td className="p-2">EU/US (zero retention)</td>
              </tr>
              <tr>
                <td className="p-2">AWS Textract</td>
                <td className="p-2">OCR (fallback)</td>
                <td className="p-2">EU (Frankfurt)</td>
              </tr>
              <tr>
                <td className="p-2">Stripe Payments Europe Ltd.</td>
                <td className="p-2">Płatności kartą</td>
                <td className="p-2">EU (Irlandia)</td>
              </tr>
              <tr>
                <td className="p-2">Resend Inc.</td>
                <td className="p-2">Wysyłka e-maili transakcyjnych</td>
                <td className="p-2">EU/US</td>
              </tr>
              <tr>
                <td className="p-2">SMSAPI sp. z o.o.</td>
                <td className="p-2">Wysyłka SMS</td>
                <td className="p-2">PL</td>
              </tr>
              <tr>
                <td className="p-2">Fakturownia sp. z o.o.</td>
                <td className="p-2">Wystawianie faktur VAT</td>
                <td className="p-2">PL</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Aktualna lista jest dostępna pod adresem{" "}
          <Link href="/dpa" className="underline">
            dlugomat.pl/dpa
          </Link>{" "}
          i obowiązuje strony bez konieczności podpisywania aneksów.
        </p>
      </>
    ),
  },
  {
    num: "§6",
    title: "Transfer danych poza EOG",
    body: (
      <p>
        Procesor zapewnia, że transfer danych do państw trzecich (USA — np.
        Vercel edge, Anthropic) odbywa się wyłącznie na podstawie standardowych
        klauzul umownych (SCC) zatwierdzonych decyzją Komisji 2021/914
        oraz, gdzie to ma zastosowanie, w oparciu o decyzje stwierdzające
        odpowiedni stopień ochrony (np. EU-US Data Privacy Framework
        z dn. 10 lipca 2023 r.).
      </p>
    ),
  },
  {
    num: "§7",
    title: "Odpowiedzialność i kary",
    body: (
      <>
        <p>
          Procesor odpowiada za szkody wyrządzone przetwarzaniem niezgodnym
          z RODO lub umową — z wyjątkiem przypadków, w których nie ponosi
          winy.
        </p>
        <p>
          Limit odpowiedzialności Procesora: <strong>12-krotność</strong>{" "}
          miesięcznej opłaty subskrypcyjnej Administratora, chyba że szkoda
          wynikła z winy umyślnej lub rażącego niedbalstwa.
        </p>
      </>
    ),
  },
  {
    num: "Załącznik 1",
    title: "Środki techniczne i organizacyjne (art. 32 RODO)",
    body: (
      <ul className="ml-6 list-disc space-y-1">
        <li>
          <strong>Szyfrowanie at-rest</strong>: AES-256-GCM (PESEL, NIP, OCR
          payload) — pgcrypto + APP_ENCRYPTION_KEY w vault.
        </li>
        <li>
          <strong>Szyfrowanie in-transit</strong>: TLS 1.3, HSTS preload,
          CSP nonce per request.
        </li>
        <li>
          <strong>Row-Level Security FORCE</strong> dla wszystkich tabel
          z danymi osobowymi (Postgres RLS).
        </li>
        <li>
          <strong>RBAC</strong>: 3 role (user / moderator / admin), audit
          log w <code>case_events</code>.
        </li>
        <li>
          <strong>MFA</strong> dla kont admin (TOTP).
        </li>
        <li>
          <strong>Backupy</strong>: PITR 7 dni + nightly off-site
          (S3 + AES-256-CBC, retencja 30 dni).
        </li>
        <li>
          <strong>Antywirus</strong>: ClamAV skan plików upload (REQUIRE_CLAMAV).
        </li>
        <li>
          <strong>Rate-limiting</strong>: 120 req/min per IP, server-action
          guards 30 req/min per user.
        </li>
        <li>
          <strong>CSRF</strong>: double-submit cookie pattern dla wszystkich
          mutacji.
        </li>
        <li>
          <strong>Pen-test</strong>: annual third-party penetration test;
          checklist w <code>docs/pen-test-checklist.md</code>.
        </li>
        <li>
          <strong>DR drill</strong>: kwartalne ćwiczenie restore z S3.
        </li>
        <li>
          <strong>Logging</strong>: brak logowania pełnych PESEL / treści
          pism — tylko hashe + metadane.
        </li>
      </ul>
    ),
  },
];

export default function DpaPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 lg:py-16">
      <div className="mb-8 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-dlugomat-700 dark:text-dlugomat-300" />
        <Badge variant="outline">B2B</Badge>
        <Badge variant="outline">RODO art. 28</Badge>
      </div>

      <h1 className="text-fluid-3xl font-extrabold tracking-tight text-iron-900 dark:text-iron-50">
        Umowa powierzenia przetwarzania danych (DPA)
      </h1>
      <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
        Szablon umowy dla kancelarii prawnych, biur rachunkowych i doradców,
        którzy korzystają z Długomatu w imieniu swoich klientów. Zgodne
        z art. 28 RODO.
      </p>

      <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-fluid-sm text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-100">
        <strong>Uwaga:</strong> ten szablon ma charakter informacyjny.
        Finalna wersja DPA jest podpisywana e-podpisem przez obie strony
        po zawarciu umowy B2B. Skontaktuj się z nami, by otrzymać wersję
        dopasowaną do Twojej kancelarii / biura.
      </div>

      <Card className="mt-8 border-2 border-dlugomat-200 dark:border-dlugomat-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-fluid-xl">
            <FileText className="h-5 w-5" />
            Pobierz szablon DPA
          </CardTitle>
          <CardDescription>
            Wersja PDF — wypełnij dane swojej firmy i odeślij podpisaną.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="mailto:bok@dlugomat.pl?subject=Pro%C5%9Bba%20o%20DPA">
              <Mail className="mr-2 h-4 w-4" />
              Poproś o DPA mailem
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="/legal/dpa-dlugomat-template.pdf"
              target="_blank"
              rel="noopener"
            >
              <Download className="mr-2 h-4 w-4" />
              Pobierz PDF (wkrótce)
            </a>
          </Button>
        </CardContent>
      </Card>

      <article className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section
            key={s.num}
            id={s.num.toLowerCase().replace(/[^a-z0-9]/g, "-")}
            className="border-l-2 border-dlugomat-300 pl-5 dark:border-dlugomat-600"
          >
            <h2 className="text-fluid-xl font-bold text-iron-900 dark:text-iron-50">
              <span className="font-mono text-dlugomat-700 dark:text-dlugomat-300">
                {s.num}
              </span>{" "}
              {s.title}
            </h2>
            <div className="mt-3 space-y-3 text-fluid-sm text-iron-700 dark:text-iron-200">
              {s.body}
            </div>
          </section>
        ))}
      </article>

      <div className="mt-12 rounded-2xl bg-dlugomat-50 p-6 dark:bg-dlugomat-900/40">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 shrink-0 text-dlugomat-700 dark:text-dlugomat-300" />
          <div>
            <h3 className="text-fluid-lg font-semibold text-iron-900 dark:text-iron-50">
              Kontakt z IOD (Inspektorem Ochrony Danych)
            </h3>
            <p className="mt-2 text-fluid-sm text-iron-700 dark:text-iron-200">
              Wszelkie pytania dotyczące umowy powierzenia, audytu lub
              naruszeń kieruj na adres:{" "}
              <a
                href="mailto:rodo@dlugomat.pl"
                className="font-semibold underline"
              >
                rodo@dlugomat.pl
              </a>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-12 text-fluid-xs text-iron-500 dark:text-iron-400">
        Ostatnia aktualizacja: 10 maja 2026 r. — wersja 1.0. Zmiany szablonu
        obowiązują od daty publikacji; obowiązujące podpisane DPA pozostają
        w mocy do czasu zawarcia aneksu.
      </p>
    </div>
  );
}
