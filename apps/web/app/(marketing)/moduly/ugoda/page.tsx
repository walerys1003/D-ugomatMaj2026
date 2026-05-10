import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "UgodoMat — propozycja ugody z wierzycielem i harmonogram spłaty | Długomat",
  description:
    "Chcesz spłacić dług w ratach z umorzeniem części odsetek? UgodoMat wygeneruje propozycję ugody, harmonogram spłaty i pismo do wierzyciela — gotowe w 12 minut.",
  alternates: { canonical: "/moduly/ugoda" },
  openGraph: {
    title: "UgodoMat — Długomat",
    description:
      "Propozycja ugody z wierzycielem — kapitał, odsetki, raty. Harmonogram w PDF. 119 zł.",
    type: "website",
  },
};

export default function UgodaPage() {
  return (
    <ModuleLanding
      code="D7"
      title="UgodoMat"
      tagline="Propozycja ugody z wierzycielem — uczciwie, ale po Twojej stronie."
      description="Ugoda w sprawach zadłużenia jest często jedynym rozwiązaniem, które kończy sprawę bez sądu i bez komornika. Klucz to właściwa propozycja: realny harmonogram, jasne zasady umorzenia odsetek, klauzule chroniące Cię przed cofnięciem ugody. UgodoMat wyliczy ratę, którą faktycznie udźwigniesz, i przygotuje pismo zgodne z dobrymi praktykami negocjacyjnymi."
      price="119 zł"
      ctaHref="/auth/sign-up?next=/panel/sprawy/nowa?module=ugoda"
      ctaLabel="Zaproponuj ugodę — 119 zł"
      whenSignals={[
        "Wierzyciel (bank, fundusz, firma pożyczkowa) deklaruje gotowość do rozmowy.",
        "Komornik prowadzi egzekucję, ale chcesz spłacić dług szybciej i taniej.",
        "Dług narasta od lat — odsetki przekraczają już kapitał.",
        "Boisz się zająć rachunku albo wynagrodzenia i chcesz wynegocjować raty.",
        "Otrzymałeś od funduszu propozycję 'umorzenia 30%' — chcesz wynegocjować lepsze warunki.",
        "Kolejne wezwania do zapłaty grożą sprawą sądową — chcesz tego uniknąć.",
      ]}
      steps={[
        {
          title: "Podaj dane długu",
          desc: "Kapitał, odsetki naliczone, koszty, miesięczny dochód i wydatki. Sprawdzimy zdolność spłaty.",
        },
        {
          title: "Wybierz scenariusz",
          desc: "Spłata jednorazowa z umorzeniem 30-50% / raty 12-60 mies. / spłata w okresie egzekucji.",
        },
        {
          title: "AI zbuduje ofertę",
          desc: "Pismo z konkretną propozycją kwot, dat, klauzul (m.in. klauzula 'pacta sunt servanda' i klauzula salwatoryjna).",
        },
        {
          title: "Pobierz i wyślij",
          desc: "PDF + harmonogram spłaty + szablon emaila do wierzyciela. Średni czas odpowiedzi: 7-21 dni.",
        },
      ]}
      features={[
        {
          title: "Kalkulator zdolności spłaty",
          desc: "Realna analiza Twojego budżetu — proponujemy ratę, którą faktycznie udźwigniesz przez cały okres ugody.",
        },
        {
          title: "Harmonogram spłaty w PDF",
          desc: "Tabelaryczny harmonogram z datami, kwotami rat i saldem do spłaty po każdej racie.",
        },
        {
          title: "Klauzula umorzenia odsetek",
          desc: "Warunkowe umorzenie odsetek karnych w przypadku terminowej spłaty — standard w ugodach z funduszami.",
        },
        {
          title: "Klauzula 'satisfactio'",
          desc: "Po spłacie wierzyciel oświadcza, że roszczenie zostało zaspokojone w całości — chroni przed kolejnymi pozwami.",
        },
        {
          title: "Wniosek o aktualizację BIK",
          desc: "Po podpisaniu ugody pismo zobowiązujące wierzyciela do aktualizacji BIK na 'spłacone w ramach ugody'.",
        },
        {
          title: "Wzór odpowiedzi na kontroferty",
          desc: "Jeśli wierzyciel zaproponuje gorsze warunki — gotowe odpowiedzi taktyczne (3 scenariusze).",
        },
      ]}
      faq={[
        {
          q: "Czy fundusz na pewno przyjmie ugodę?",
          a: "Fundusze sekurytyzacyjne kupują pakiety wierzytelności za 5-15% nominału — każda spłata na poziomie 30-60% nominału jest dla nich realnym zyskiem. Dlatego ugoda z umorzeniem części odsetek (a często też części kapitału) to dla nich rozwiązanie korzystne. Skuteczność propozycji UgodoMat: ok. 60-70% w pierwszej iteracji, 85% po jednej rundzie negocjacji.",
        },
        {
          q: "Co jeśli wierzyciel odrzuci moją propozycję?",
          a: "Trzy ścieżki: (1) kontroferta z lekko zmienionymi warunkami — UgodoMat dostarcza wzory; (2) jeśli sprawa jest w sądzie — możesz dalej walczyć (D2 Sprzeciw, D6 Cesja); (3) jeśli nie ma żadnej szansy na spłatę — moduł D8 Upadłość-Lite. Ugoda nigdy nie jest jedyną opcją.",
        },
        {
          q: "Czy ugoda zatrzyma komornika?",
          a: "Nie automatycznie. Po zawarciu ugody wierzyciel musi cofnąć wniosek egzekucyjny do komornika — to jest klauzula, którą zawsze włączamy do projektu ugody. Bez tej klauzuli ugoda jest niebezpieczna: spłacasz raty, a komornik nadal zajmuje wynagrodzenie.",
        },
        {
          q: "Co się stanie, jeśli przestanę płacić raty?",
          a: "Standardowa klauzula 'lex commissoria' w projektach UgodoMat: opóźnienie powyżej 60 dni powoduje natychmiastową wymagalność całego pozostałego salda BEZ umorzenia odsetek. Dlatego rata musi być realna — wolimy 100 zł miesięcznie przez 5 lat niż 500 zł, których nie spłacisz.",
        },
        {
          q: "Czy mogę negocjować ugodę z bankiem przed wypowiedzeniem umowy?",
          a: "Tak — to nawet preferowane. Banki mają wewnętrzne procedury restrukturyzacyjne, w których ratę można wynegocjować bez wypowiedzenia umowy i bez wpisu do BIK. UgodoMat ma osobny wariant 'restrukturyzacja przedsądowa' — pismo do banku z powołaniem na Rekomendację R KNF.",
        },
        {
          q: "Czy ugoda powinna być u notariusza?",
          a: "Standardowo nie wymaga formy aktu notarialnego — wystarczy forma pisemna. Forma aktu notarialnego (z poddaniem się egzekucji w trybie art. 777 KPC) jest jednak częstym żądaniem funduszy — daje im uproszczone wszczęcie egzekucji w razie niepłacenia. UgodoMat wskazuje, kiedy warto to zaakceptować, a kiedy nie.",
        },
      ]}
      legalNote="Wzór ugody zgodny z art. 917-918 KC. Dodatkowe klauzule chroniące dłużnika konsumenta."
    />
  );
}
