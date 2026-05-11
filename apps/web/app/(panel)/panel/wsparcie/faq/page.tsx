import * as React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Search, ChevronRight, MessageCircle, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQ - wsparcie - Dlugomat",
  description: "Najczesciej zadawane pytania kandydatow-dluznikow korzystajacych z platformy Dlugomat.",
};

type FaqCategory = {
  id: string;
  label: string;
  count: number;
};

type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
  views: number;
};

const CATEGORIES: FaqCategory[] = [
  { id: "all", label: "Wszystkie", count: 32 },
  { id: "konto", label: "Konto i logowanie", count: 6 },
  { id: "platnosci", label: "Platnosci i ugody", count: 8 },
  { id: "pisma", label: "Pisma i dokumenty", count: 7 },
  { id: "bezpieczenstwo", label: "Bezpieczenstwo", count: 5 },
  { id: "prawne", label: "Kwestie prawne", count: 6 },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "f-001",
    category: "konto",
    question: "Jak zalozyc konto w Dlugomat?",
    answer:
      "Konto zakladasz przez Profil Zaufany (e-PUAP), bank lub email + 2FA. Caly proces zajmuje 8 minut. Po rejestracji od razu zobaczysz pulpit ze stanem swojej sytuacji.",
    helpful: 124,
    views: 2340,
  },
  {
    id: "f-002",
    category: "platnosci",
    question: "Jak zmienic plan splaty?",
    answer:
      "W panelu Plan splaty klikasz Renegocjacja. System analizuje Twoja aktualna sytuacje i proponuje nowy harmonogram. Wierzyciel ma 14 dni na akceptacje.",
    helpful: 89,
    views: 1670,
  },
  {
    id: "f-003",
    category: "platnosci",
    question: "Czy moge oplacic rate karta?",
    answer:
      "Tak, akceptujemy Visa, Mastercard, BLIK, przelewy ekspresowe oraz autoryzacje SEPA. Wszystkie platnosci sa zabezpieczone 3D-Secure.",
    helpful: 67,
    views: 1240,
  },
  {
    id: "f-004",
    category: "pisma",
    question: "Czy pisma generowane przez AI sa prawnie wiazace?",
    answer:
      "Pisma generowane przez AI sa projektami. Kazde pismo musi byc zaakceptowane przez prawnika lub przez Ciebie po przeczytaniu i podpisaniu. Wtedy staje sie prawnie wiazace.",
    helpful: 156,
    views: 3120,
  },
  {
    id: "f-005",
    category: "bezpieczenstwo",
    question: "Jak chronicie moje dane?",
    answer:
      "Dane sa szyfrowane AES-256 w spoczynku i TLS 1.3 w tranzycie. Serwery w Polsce, certyfikat ISO 27001, zgodnosc z RODO. Dostep tylko z 2FA.",
    helpful: 234,
    views: 4560,
  },
  {
    id: "f-006",
    category: "prawne",
    question: "Czy mozna ogloszic upadlosc konsumencka przez Dlugomat?",
    answer:
      "Tak, system pomoze przygotowac wniosek o upadlosc konsumencka i sprawdzic warunki kwalifikacji. Sam wniosek musi zlozyc adwokat lub radca prawny.",
    helpful: 78,
    views: 1890,
  },
  {
    id: "f-007",
    category: "konto",
    question: "Co jesli zapomne hasla?",
    answer:
      "Kliknij Zapomnialem hasla na stronie logowania. Wyslemy link resetujacy na zweryfikowany email. Link wygasa po 60 minutach.",
    helpful: 45,
    views: 890,
  },
  {
    id: "f-008",
    category: "bezpieczenstwo",
    question: "Co zrobic gdy podejrzewam wlamanie na konto?",
    answer:
      "Natychmiast zmien haslo, wyloguj wszystkie sesje (Ustawienia > Sesje > Wyloguj wszystkie) i zglos sprawe przez panel Bezpieczenstwo. Reagujemy w 15 minut.",
    helpful: 92,
    views: 1450,
  },
  {
    id: "f-009",
    category: "platnosci",
    question: "Co jesli nie zaplace raty w terminie?",
    answer:
      "Wysylamy przypomnienie 3 dni przed terminem i w dniu platnosci. Po 7 dniach zwloki kontaktujemy sie z Toba osobiscie aby wspolnie znalezc rozwiazanie.",
    helpful: 67,
    views: 1340,
  },
  {
    id: "f-010",
    category: "pisma",
    question: "Czy moge wycofac wyslane pismo?",
    answer:
      "Tak, do momentu doreczenia adresatowi. Po doreczeniu pismo wywoluje skutki prawne i wycofanie nie jest mozliwe.",
    helpful: 34,
    views: 670,
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  konto: "Konto",
  platnosci: "Platnosci",
  pisma: "Pisma",
  bezpieczenstwo: "Bezpieczenstwo",
  prawne: "Prawne",
};

export default function FaqPanelPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/panel/wsparcie"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do wsparcia
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-6 w-6 text-accent-600" aria-hidden />
            <h1 className="font-display text-3xl text-dlugomat-950">Najczestsze pytania</h1>
          </div>
          <p className="text-dlugomat-700 max-w-2xl">
            Sprawdz odpowiedzi na najczesciej zadawane pytania. Jesli nie znajdziesz tego czego szukasz - skontaktuj sie z nami.
          </p>
        </header>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dlugomat-500" aria-hidden />
              <input
                type="search"
                placeholder="Szukaj w bazie wiedzy..."
                className="w-full pl-10 pr-3 py-2.5 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Szukaj w FAQ"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border focus-visible:shadow-shield-focus focus-visible:outline-none ${
                    idx === 0
                      ? "bg-dlugomat-900 text-white border-dlugomat-900"
                      : "bg-white text-dlugomat-800 border-iron-300 hover:bg-dlugomat-50"
                  }`}
                  aria-pressed={idx === 0}
                >
                  {cat.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      idx === 0 ? "bg-white/20" : "bg-iron-100 text-dlugomat-700"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-8">
          {FAQ_ITEMS.map((item) => (
            <Card key={item.id} elevation="subtle">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge tone="neutral">{CATEGORY_LABEL[item.category]}</Badge>
                    </div>
                    <h2 className="font-display text-lg text-dlugomat-950 mb-2">{item.question}</h2>
                    <p className="text-dlugomat-800 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-iron-100 flex items-center justify-between text-xs text-dlugomat-600">
                  <span>
                    Pomocne dla {item.helpful} osob z {item.views} odwiedzin
                  </span>
                  <Link
                    href={`/panel/wsparcie/faq/${item.id}`}
                    className="inline-flex items-center gap-1 text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                  >
                    Szczegoly
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card elevation="pop">
          <CardHeader>
            <CardTitle>Nie znalazles odpowiedzi?</CardTitle>
            <CardDescription>Skontaktuj sie z nami - odpowiadamy w godzinach pracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="secondary" asChild>
                <Link href="/panel/wsparcie/zglos">
                  <MessageCircle className="h-4 w-4 mr-2" aria-hidden />
                  Zglos sprawe
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="tel:+48800123456">
                  <Phone className="h-4 w-4 mr-2" aria-hidden />
                  800 123 456
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="mailto:wsparcie@dlugomat.pl">
                  <Mail className="h-4 w-4 mr-2" aria-hidden />
                  Email
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
