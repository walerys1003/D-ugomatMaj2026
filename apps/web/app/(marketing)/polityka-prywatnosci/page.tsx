import * as React from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  FileText,
  Mail,
  Calendar,
  ChevronRight,
  Download,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Polityka prywatnosci - Dlugomat",
  description: "Zasady przetwarzania danych osobowych zgodnie z RODO w platformie Dlugomat.",
};

const SECTIONS = [
  { id: "administrator", title: "Administrator danych", paragraphs: 2 },
  { id: "podstawa-prawna", title: "Podstawy prawne przetwarzania", paragraphs: 5 },
  { id: "kategorie-danych", title: "Kategorie przetwarzanych danych", paragraphs: 4 },
  { id: "cele", title: "Cele przetwarzania", paragraphs: 6 },
  { id: "odbiorcy", title: "Odbiorcy danych", paragraphs: 3 },
  { id: "okres", title: "Okres przechowywania", paragraphs: 4 },
  { id: "prawa", title: "Prawa osoby, ktorej dane dotycza", paragraphs: 8 },
  { id: "bezpieczenstwo", title: "Bezpieczenstwo danych", paragraphs: 5 },
  { id: "transfer", title: "Przekazywanie poza EOG", paragraphs: 2 },
  { id: "iod", title: "Inspektor Ochrony Danych", paragraphs: 2 },
];

const KEY_POINTS = [
  {
    icon: Shield,
    title: "Pelna zgodnosc z RODO",
    description: "Przetwarzamy dane zgodnie z rozporzadzeniem UE 2016/679 i polska ustawa o ochronie danych osobowych.",
  },
  {
    icon: Lock,
    title: "Szyfrowanie end-to-end",
    description: "AES-256 w spoczynku, TLS 1.3 w tranzycie. Klucze rotowane co 90 dni przez dedykowany KMS.",
  },
  {
    icon: Globe,
    title: "Dane wylacznie w UE",
    description: "Wszystkie serwery zlokalizowane w regionie Warszawa (eu-central-1). Nigdy nie transferujemy poza EOG.",
  },
  {
    icon: FileText,
    title: "Audyt co kwartal",
    description: "Niezalezne audyty bezpieczenstwa danych. Ostatni audyt: marzec 2026. Pelny raport dostepny na zadanie.",
  },
];

const RIGHTS = [
  { right: "Prawo dostepu (art. 15 RODO)", description: "Wgla d we wszystkie swoje dane przechowywane w systemie." },
  { right: "Prawo do sprostowania (art. 16)", description: "Korekta nieprawidlowych lub niekompletnych danych." },
  { right: "Prawo do usuniecia (art. 17)", description: "Tzw. prawo do bycia zapomnianym - usuniecie danych." },
  { right: "Prawo do ograniczenia (art. 18)", description: "Zatrzymanie przetwarzania bez kasowania danych." },
  { right: "Prawo do przenoszenia (art. 20)", description: "Eksport danych w strukturalnym formacie." },
  { right: "Prawo sprzeciwu (art. 21)", description: "Sprzeciw wobec przetwarzania na podstawie prawnie uzasadnionych interesow." },
  { right: "Prawo wniesienia skargi", description: "Skarga do Prezesa Urzedu Ochrony Danych Osobowych (UODO)." },
];

const DATA_CATEGORIES = [
  { category: "Dane identyfikacyjne", items: "Imie, nazwisko, PESEL, NIP, data urodzenia" },
  { category: "Dane kontaktowe", items: "Adres email, numer telefonu, adres korespondencyjny" },
  { category: "Dane finansowe", items: "Numer rachunku, historia platnosci, zadluzenie, BIK" },
  { category: "Dane behawioralne", items: "Logi logowania, IP, sesje, klikniecia, czas spedzony w panelu" },
  { category: "Dane prawne", items: "Sprawy sadowe, pisma procesowe, wyroki, ugody" },
];

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <section className="bg-white border-b border-iron-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge tone="info" className="mb-4">Dokumenty prawne</Badge>
            <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-4">
              Polityka prywatnosci
            </h1>
            <p className="text-xl text-dlugomat-700 mb-6">
              Twoje dane sa najwazniejsze. Wyjasniamy precyzyjnie jakie dane zbieramy, w jakim celu i jak chronimy
              prywatnosc kazdego uzytkownika platformy Dlugomat.
            </p>
            <div className="flex items-center gap-3 text-sm text-dlugomat-600">
              <Calendar className="h-4 w-4" aria-hidden />
              <span>Obowiazuje od: 1 marca 2026</span>
              <span className="text-dlugomat-300">|</span>
              <span>Wersja 2026.1</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {KEY_POINTS.map((kp) => {
              const Icon = kp.icon;
              return (
                <Card key={kp.title} elevation="subtle">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-accent-50 text-accent-700 mb-3">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-medium text-dlugomat-950 mb-1">{kp.title}</h3>
                    <p className="text-sm text-dlugomat-700">{kp.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <nav aria-label="Spis tresci" className="lg:col-span-1 order-2 lg:order-1">
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-base">Spis tresci</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-1.5 text-sm">
                    {SECTIONS.map((s, idx) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="block py-1 text-dlugomat-700 hover:text-dlugomat-950 focus-visible:shadow-shield-focus rounded"
                        >
                          <span className="text-dlugomat-500 mr-1">{idx + 1}.</span>
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </nav>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
              <Card id="administrator">
                <CardHeader>
                  <CardTitle>1. Administrator danych</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-dlugomat-800 leading-relaxed">
                  <p>
                    Administratorem Twoich danych osobowych jest Dlugomat sp. z o.o. z siedziba w Warszawie (00-867),
                    przy ul. Chlodnej 51, wpisana do rejestru przedsiebiorcow KRS pod numerem 0000987654, NIP 5252876543.
                  </p>
                  <p>
                    Mozesz skontaktowac sie z nami poprzez email na adres{" "}
                    <a
                      href="mailto:rodo@dlugomat.pl"
                      className="text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                    >
                      rodo@dlugomat.pl
                    </a>{" "}
                    lub pisemnie na adres siedziby z dopiskiem &quot;Ochrona danych&quot;.
                  </p>
                </CardContent>
              </Card>

              <Card id="kategorie-danych">
                <CardHeader>
                  <CardTitle>3. Kategorie przetwarzanych danych</CardTitle>
                  <CardDescription>Pelna lista typow danych zbieranych w platformie</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {DATA_CATEGORIES.map((cat) => (
                      <li
                        key={cat.category}
                        className="p-3 rounded-md border border-iron-200 bg-white"
                      >
                        <div className="font-medium text-dlugomat-950 text-sm">{cat.category}</div>
                        <div className="text-sm text-dlugomat-700 mt-0.5">{cat.items}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card id="prawa">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent-600" aria-hidden />
                    7. Twoje prawa
                  </CardTitle>
                  <CardDescription>Pelna lista uprawnien wynikajacych z RODO</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {RIGHTS.map((r) => (
                      <li key={r.right} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                        <div>
                          <div className="font-medium text-dlugomat-950 text-sm">{r.right}</div>
                          <div className="text-sm text-dlugomat-700">{r.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 rounded-md bg-accent-50 border border-accent-200">
                    <p className="text-sm text-dlugomat-800">
                      Aby skorzystac z dowolnego prawa, skontaktuj sie z nami przez panel ustawien lub na adres{" "}
                      <a
                        href="mailto:rodo@dlugomat.pl"
                        className="text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                      >
                        rodo@dlugomat.pl
                      </a>
                      . Odpowiadamy w terminie do 30 dni.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card id="bezpieczenstwo">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-accent-600" aria-hidden />
                    8. Bezpieczenstwo danych
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-dlugomat-800 leading-relaxed">
                  <p>
                    Stosujemy techniczne i organizacyjne srodki bezpieczenstwa zgodnie z art. 32 RODO oraz standardami
                    ISO/IEC 27001:2022. Wszystkie dane sa szyfrowane: AES-256 w spoczynku, TLS 1.3 w tranzycie. Klucze
                    kryptograficzne sa zarzadzane przez dedykowany system KMS z rotacja co 90 dni.
                  </p>
                  <p>
                    Dostep do danych osobowych maja wylacznie uprawnieni pracownicy po przejsciu wieloskladnikowej
                    autoryzacji (MFA). Kazda operacja na danych jest rejestrowana w niezmiennym dzienniku audytu
                    przechowywanym przez 7 lat.
                  </p>
                </CardContent>
              </Card>

              <Card id="iod">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-accent-600" aria-hidden />
                    10. Inspektor Ochrony Danych
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-dlugomat-800 leading-relaxed">
                  <p>
                    Powolalismy Inspektora Ochrony Danych (IOD) - mec. Krystyna Wisniewska, radca prawny, ekspert RODO
                    z 12-letnim doswiadczeniem.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="p-3 rounded-md border border-iron-200 bg-white">
                      <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Email IOD</div>
                      <a
                        href="mailto:iod@dlugomat.pl"
                        className="text-sm font-medium text-accent-700 hover:text-accent-900 focus-visible:shadow-shield-focus rounded"
                      >
                        iod@dlugomat.pl
                      </a>
                    </div>
                    <div className="p-3 rounded-md border border-iron-200 bg-white">
                      <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Telefon</div>
                      <div className="text-sm font-medium text-dlugomat-950">+48 22 123 45 67 wew. 200</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="pop">
                <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-dlugomat-950">Pelna polityka prywatnosci PDF</p>
                    <p className="text-sm text-dlugomat-700">Wszystkie 10 sekcji w jednym dokumencie</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary">
                      <Download className="h-4 w-4 mr-2" aria-hidden />
                      Pobierz PDF
                    </Button>
                    <Button variant="primary" asChild>
                      <Link href="/kontakt">
                        Pytania o RODO
                        <ChevronRight className="h-4 w-4 ml-2" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
