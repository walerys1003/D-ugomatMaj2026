import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "FAQ — najczestsze pytania o Dlugomat",
  description:
    "Odpowiedzi na 24 najczestsze pytania o Dlugomat: bezpieczenstwo, cennik, jakosc pism, zwroty, integracje, RODO.",
  alternates: { canonical: "/faq" },
};

interface FAQItem {
  q: string;
  a: string;
}

interface FAQGroup {
  category: string;
  items: ReadonlyArray<FAQItem>;
}

const FAQ: readonly FAQGroup[] = [
  {
    category: "Jak to dziala",
    items: [
      {
        q: "Kim jest Dlugomat — kancelaria czy software?",
        a: "Software wzbogacony o nadzor prawnikow. Generujemy pisma automatycznie, ale kazdy szablon jest weryfikowany przez czlonkow naszej rady prawnej. Nie reprezentujemy Cie w sadzie.",
      },
      {
        q: "Czy moge uzyc Dlugomatu bez prawnika?",
        a: "Tak. 78% naszych klientow obsluguje sprawe samodzielnie z pomoca skanera nakazu, generatora pism i bazy wiedzy. Sprawy ponizej 10 000 zl niemal zawsze nadaja sie do self-service.",
      },
      {
        q: "Ile trwa wygenerowanie pisma?",
        a: "Sprzeciw od nakazu EPU: 15–25 minut. Skomplikowane zarzuty: 30–60 minut. Pakiet komorniczy (4 pisma): 90 minut. Mozesz przerwac w dowolnym momencie i wrocic pozniej.",
      },
      {
        q: "Czy obsluguje sprawy z calej Polski?",
        a: "Tak. Procedura cywilna i KPC sa jednakowe w calym kraju. Mamy zintegrowana baze 372 sadow rejonowych i okregowych z aktualnymi adresami i kontami bankowymi do oplat.",
      },
    ],
  },
  {
    category: "Cennik i platnosci",
    items: [
      {
        q: "Czy jest abonament miesieczny?",
        a: "Nie. Placisz tylko za pojedyncze pisma (79–249 zl) lub pakiety tematyczne. Skaner nakazu jest darmowy. Plany firmowe (Kancelaria, Enterprise) maja abonament miesieczny.",
      },
      {
        q: "Czy dostaje fakture VAT?",
        a: "Tak, automatycznie. Po pierwszej platnosci podaj NIP w panelu, a faktury VAT trafia na e-mail oraz beda dostepne w sekcji Finanse.",
      },
      {
        q: "Co jesli pismo nie pomoglo?",
        a: "Mamy gwarancje jakosci: jezeli sad odrzuci pismo z powodu bledu formalnego, ktory pochodzi z naszego szablonu, zwracamy 100% oplaty i pokrywamy ponowne wniesienie.",
      },
    ],
  },
  {
    category: "Bezpieczenstwo i prywatnosc",
    items: [
      {
        q: "Gdzie sa przechowywane moje dane?",
        a: "W centrach danych OVHcloud Warszawa (primary) i Frankfurt (replica). Zero transferu poza EOG bez Twojej zgody. Szyfrowanie AES-256 w spoczynku, TLS 1.3 w tranzycie.",
      },
      {
        q: "Czy moge usunac swoje konto?",
        a: "Tak. W sekcji Ustawienia → Konto → Usuniecie. Twoje dane sa usuwane natychmiast, oprocz dokumentow ksiegowych (faktury) przechowywanych przez 5 lat zgodnie z ustawa.",
      },
      {
        q: "Czy Dlugomat jest zgodny z RODO?",
        a: "Tak. DPA dostepne dla wszystkich klientow. Inspektor Ochrony Danych: iod@dlugomat.pl. Pelne prawa: dostep, sprostowanie, usuniecie, ograniczenie, przenoszenie, sprzeciw.",
      },
      {
        q: "Czy uzywacie moich danych do trenowania AI?",
        a: "Nigdy bez Twojej wyraznej zgody. Default: NIE. W panelu Ustawienia mozesz dobrowolnie wlaczyc 'Pomoz nam ulepszac AI' (anonimizacja danych).",
      },
    ],
  },
  {
    category: "Jakosc i prawnicy",
    items: [
      {
        q: "Kto pisze szablony pism?",
        a: "Zespol 4 adwokatow z doswiadczeniem 8–15 lat w postepowaniu cywilnym i windykacyjnym. Senior review co kwartal, audyt rocznym przez rade naukowa.",
      },
      {
        q: "Co jesli moja sprawa jest nietypowa?",
        a: "Pakiet konsultacji indywidualnej (99 zl / 30 min) z prawnikiem na chacie. Albo polecenie do sprawdzonej kancelarii partnerskiej w Twoim regionie.",
      },
      {
        q: "Jak czesto aktualizujecie szablony?",
        a: "Po kazdej istotnej zmianie KPC, KC lub orzeczeniu SN. Sredio 8–12 aktualizacji rocznie. Historia zmian dostepna w changelogu publicznym.",
      },
    ],
  },
  {
    category: "Integracje i API",
    items: [
      {
        q: "Czy macie API dla firm?",
        a: "Tak, w planie Pro i wyzej. REST API, OAuth 2.0, OpenAPI 3.1. SDK dla Node.js, Python i PHP. Webhooks dla wszystkich istotnych zdarzen.",
      },
      {
        q: "Z jakimi systemami sie integrujecie?",
        a: "Salesforce, HubSpot, Okta, Azure AD, Stripe, SendGrid, S3, GitHub, Slack. Pelna lista: /integracje. Custom integracje w planie Enterprise.",
      },
    ],
  },
];

const QUICK_LINKS = [
  { label: "Skanuj swoje pismo", href: "/skaner-nakazu" },
  { label: "Cennik i pakiety", href: "/cennik" },
  { label: "Bezpieczenstwo", href: "/bezpieczenstwo" },
  { label: "Kontakt", href: "/kontakt" },
];

export default function FAQPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <HelpCircle className="mr-1 h-3 w-3" />
            FAQ
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Najczestsze pytania
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Krotkie, uczciwe odpowiedzi. Bez korporacyjnej waty.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_LINKS.map((l) => (
              <Button key={l.href} asChild variant="secondary" size="sm">
                <Link href={l.href}>{l.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {FAQ.map((group) => (
          <div key={group.category} className="mb-10">
            <h2 className="font-display text-2xl text-slate-900">{group.category}</h2>
            <p className="mt-1 text-sm text-slate-500">{group.items.length} pytan</p>
            <div className="mt-6 space-y-3">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 font-display text-base text-slate-900">
                    {item.q}
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <Card elevation="pop" urgency="normal">
          <CardHeader>
            <CardTitle>Nie znalazles odpowiedzi?</CardTitle>
            <CardDescription>Wsparcie odpowiada w 4 godziny w dni robocze.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href="/kontakt">
                  Napisz do wsparcia
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="mailto:pomoc@dlugomat.pl">pomoc@dlugomat.pl</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
