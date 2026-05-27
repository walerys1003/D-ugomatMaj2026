import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Scale, Gavel, FileText, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MarketingPageHero,
  MarketingCtaBanner,
} from "@/components/marketing/page-hero";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";

export const metadata: Metadata = {
  title: "Baza wiedzy — pisma procesowe, długi, komornik, BIK | Długomat",
  description:
    "Praktyczne artykuły o sprzeciwach od nakazów zapłaty, skargach na komornika, korekcie BIK, cesji wierzytelności. Aktualne stan prawny + orzecznictwo SN.",
  alternates: { canonical: "/baza-wiedzy" },
};

interface ArticleEntry {
  slug: string;
  title: string;
  category: "Sąd" | "Egzekucja" | "Rejestry" | "Negocjacja" | "Upadłość" | "Podstawy";
  readingMinutes: number;
  excerpt: string;
  available: boolean;
}

const ARTICLES: readonly ArticleEntry[] = [
  {
    slug: "sprzeciw-od-nakazu-zaplaty-epu",
    title: "Sprzeciw od nakazu zapłaty z EPU — kompletny przewodnik 2025",
    category: "Sąd",
    readingMinutes: 12,
    excerpt:
      "Co to jest e-Sąd, jak rozpoznać nakaz zapłaty, jakie zarzuty można podnieść w sprzeciwie i co się stanie po jego wniesieniu.",
    available: true,
  },
  {
    slug: "skarga-na-czynnosci-komornika",
    title: "Skarga na czynności komornika — 7 dni na reakcję",
    category: "Egzekucja",
    readingMinutes: 10,
    excerpt:
      "Kiedy można złożyć skargę, do jakiego sądu, w jakim terminie i jakie naruszenia komornika są najczęstszą podstawą uchylenia czynności.",
    available: true,
  },
  {
    slug: "wniosek-o-korekte-bik",
    title: "Wniosek o korektę BIK — jak usunąć negatywny wpis",
    category: "Rejestry",
    readingMinutes: 9,
    excerpt:
      "Art. 105a Prawa bankowego, RODO art. 16, droga przez Rzecznika Finansowego. Kiedy bank musi zaktualizować wpis, a kiedy go usunąć.",
    available: true,
  },
  {
    slug: "przedawnienie-dlugu",
    title: "Przedawnienie długu — kiedy bank traci prawo do egzekucji",
    category: "Podstawy",
    readingMinutes: 11,
    excerpt:
      "Terminy 3/6/10 lat, jak podnieść zarzut przedawnienia, co przerywa bieg terminu, art. 117 § 2(1) k.c. — badanie z urzędu w sprawach konsumenckich.",
    available: true,
  },
  {
    slug: "kwota-wolna-od-egzekucji",
    title: "Kwota wolna od egzekucji — ile komornik musi Ci zostawić",
    category: "Egzekucja",
    readingMinutes: 9,
    excerpt:
      "Minimalna krajowa netto wolna przy długach niealimentacyjnych, 75% minimalnej brutto na rachunku bankowym, ochrona umów zlecenia.",
    available: true,
  },
  {
    slug: "cesja-wierzytelnosci-fundusze",
    title: "Cesja wierzytelności — gdy Twój dług kupuje fundusz",
    category: "Sąd",
    readingMinutes: 10,
    excerpt:
      "Co to jest cesja, jak rozpoznać legitymację czynną funduszu (Kruk, Best, Ultimo), jakie dokumenty musi przedstawić powód.",
    available: true,
  },
  {
    slug: "upadlosc-konsumencka",
    title: "Upadłość konsumencka — kompletny przewodnik 2025",
    category: "Upadłość",
    readingMinutes: 14,
    excerpt:
      "Kto może ogłosić upadłość po nowelizacji 2020, procedura, plan spłaty 36/84 miesięcy, umorzenie bez planu, co z mieszkaniem i samochodem.",
    available: true,
  },
  {
    slug: "klauzule-abuzywne-w-umowach-kredytowych",
    title: "Klauzule abuzywne w umowach kredytowych — jak je rozpoznać",
    category: "Sąd",
    readingMinutes: 11,
    excerpt:
      "Art. 385(1) k.c., rejestr klauzul UOKiK, orzecznictwo TSUE (Dziubak, Aziz), jak skutecznie podnieść zarzut abuzywności.",
    available: true,
  },
  {
    slug: "ugoda-z-wierzycielem",
    title: "Ugoda z wierzycielem — kiedy negocjować, czego nie podpisywać",
    category: "Negocjacja",
    readingMinutes: 9,
    excerpt:
      "Pułapki uznania długu, klauzule poddania się egzekucji, wzory klauzul ochronnych, kiedy ugoda przerywa przedawnienie.",
    available: true,
  },
  {
    slug: "zajecie-wynagrodzenia-przez-komornika",
    title: "Zajęcie wynagrodzenia przez komornika — co możesz zrobić",
    category: "Egzekucja",
    readingMinutes: 10,
    excerpt:
      "Procedura zajęcia, obowiązki pracodawcy, limity 50%/60%, ochrona umów zlecenia od 2019 r., zbieg egzekucji wielu komorników.",
    available: true,
  },
  {
    slug: "big-infomonitor-krd-erif",
    title: "BIG InfoMonitor, KRD, ERIF — jak działają rejestry dłużników",
    category: "Rejestry",
    readingMinutes: 8,
    excerpt:
      "Różnice między biurami informacji gospodarczej, kiedy wierzyciel ma prawo wpisać dłużnika, jak skutecznie żądać usunięcia wpisu.",
    available: true,
  },
  {
    slug: "odpowiedz-na-pozew",
    title: "Odpowiedź na pozew — co napisać, gdy sąd wyznaczył rozprawę",
    category: "Sąd",
    readingMinutes: 11,
    excerpt:
      "Termin 14/21 dni, struktura pisma, zarzuty merytoryczne, prekluzja dowodowa po nowelizacji 2019, najczęstsze błędy procesowe.",
    available: true,
  },
] as const;

const CATEGORIES = [
  {
    key: "Sąd",
    icon: Scale,
    desc: "Sprzeciwy, zarzuty, odpowiedzi na pozew, zażalenia.",
  },
  {
    key: "Egzekucja",
    icon: Gavel,
    desc: "Skargi na komornika, ograniczenie egzekucji, kwota wolna.",
  },
  {
    key: "Rejestry",
    icon: FileText,
    desc: "BIK, BIG InfoMonitor, KRD, ERIF — wpisy i ich korekta.",
  },
  {
    key: "Negocjacja",
    icon: Shield,
    desc: "Ugody, restrukturyzacja, propozycje spłaty.",
  },
  {
    key: "Upadłość",
    icon: BookOpen,
    desc: "Upadłość konsumencka, plan spłaty, oddłużenie.",
  },
  {
    key: "Podstawy",
    icon: BookOpen,
    desc: "Słownik pojęć, terminy procesowe, podstawowe prawa dłużnika.",
  },
] as const;

export default function BazaWiedzyPage() {
  // Tier 5 zad. 228 — Schema.org JSON-LD: BreadcrumbList + ItemList artykułów.
  // Google używa ItemList do prezentacji jako "carousel" w wynikach.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Baza wiedzy",
        item: `${BASE_URL}/baza-wiedzy`,
      },
    ],
  };
  const available = ARTICLES.filter((a) => a.available);
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Baza wiedzy Długomat",
    description:
      "Artykuły o sprzeciwach od nakazów zapłaty, skargach komorniczych, korekcie BIK i innych instrumentach obrony dłużnika.",
    numberOfItems: available.length,
    itemListElement: available.map((article, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${BASE_URL}/baza-wiedzy/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* HERO — Tarcza v4 unified */}
      <MarketingPageHero
        eyebrow="Baza wiedzy"
        title="Wiedza, która Cię chroni."
        subtitle="Bez prawniczego żargonu. Konkretne pytania, konkretne odpowiedzi — z aktualnymi przepisami, terminami i orzecznictwem Sądu Najwyższego."
      />

      {/* CATEGORIES */}
      <section className="container py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Kategorie
          </p>
          <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Po prostu wybierz, co Cię dotyczy.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = ARTICLES.filter((a) => a.category === cat.key && a.available).length;
            return (
              <Card key={cat.key} elevation="subtle">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="text-fluid-lg">{cat.key}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <CardDescription className="text-fluid-sm">
                    {cat.desc}
                  </CardDescription>
                  <Badge tone="neutral">
                    {count} {count === 1 ? "artykuł" : "artykułów"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ARTICLES */}
      <section className="bg-ink-50/60 py-20 sm:py-24 dark:bg-dlugomat-950/40">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Flagowe artykuły
            </p>
            <h2 className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              Zacznij od najczęstszych spraw.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.filter((a) => a.available).map((article) => (
              <Link
                key={article.slug}
                href={`/baza-wiedzy/${article.slug}`}
                className="group block rounded-md focus-visible:shadow-shield-focus focus-visible:outline-none"
              >
                <Card
                  elevation="subtle"
                  className="h-full transition-shadow duration-base group-hover:shadow-pop"
                >
                  <CardHeader className="gap-3">
                    <div className="flex items-center gap-2">
                      <Badge tone="info">{article.category}</Badge>
                      <span className="text-fluid-xs text-ink-500">
                        {article.readingMinutes} min czytania
                      </span>
                    </div>
                    <CardTitle className="text-fluid-lg leading-snug">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between gap-3">
                    <CardDescription>{article.excerpt}</CardDescription>
                    <ArrowRight
                      className="size-5 shrink-0 text-dlugomat-600 transition-transform duration-base group-hover:translate-x-0.5 dark:text-dlugomat-300"
                      aria-hidden
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <p className="mt-12 text-center text-fluid-sm text-ink-600 dark:text-ink-300">
            Kolejne artykuły publikujemy co tydzień. Aktualizujemy istniejące przy
            każdej zmianie przepisów. Wszystkie powołania do KPC, KC i orzeczeń
            SN są aktualne na dzień publikacji.
          </p>
        </div>
      </section>

      {/* CTA — Tarcza v4 unified */}
      <section className="container py-20 sm:py-24">
        <MarketingCtaBanner
          title="Wiedza to dopiero pierwszy krok."
          subtitle="Po przeczytaniu artykułu często wiesz, czego potrzebujesz. Skaner Nakazu pokaże Ci, czy nie ma dodatkowych szans (np. przedawnienie), o których nie pomyślałeś."
          primaryCta={{ href: "/skaner-nakazu", label: "Zeskanuj pismo — DARMOWE" }}
        />
      </section>
    </>
  );
}
