import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "Upadłość-Lite — wniosek o upadłość konsumencką | Długomat",
  description:
    "Wniosek o upadłość konsumencką: formularz urzędowy + uzasadnienie + spis majątku + plan spłaty. Przygotowany zgodnie z art. 491 Prawa upadłościowego.",
  alternates: { canonical: "/moduly/upadlosc" },
  openGraph: {
    title: "Upadłość-Lite — Długomat",
    description:
      "Wniosek o upadłość konsumencką — formularz + uzasadnienie + spis majątku. 249 zł.",
    type: "website",
  },
};

export default function UpadloscPage() {
  return (
    <ModuleLanding
      code="D8"
      title="Upadłość-Lite"
      tagline="Wniosek o upadłość konsumencką — kiedy nic innego już nie zadziała."
      description="Upadłość konsumencka jest ostatecznym narzędziem prawnym dla osób, które straciły zdolność spłaty zobowiązań. Po reformie z 2020 r. procedura jest zdecydowanie prostsza — kluczem jest dobrze przygotowany wniosek z uzasadnieniem niewypłacalności, kompletnym spisem wierzytelności i majątku oraz propozycją planu spłaty. Upadłość-Lite generuje wszystkie te elementy w jednym pakiecie."
      price="249 zł"
      ctaHref="/sign-up?next=/panel/sprawy/nowa?module=upadlosc"
      ctaLabel="Złóż wniosek — 249 zł"
      whenSignals={[
        "Twoje miesięczne zobowiązania znacząco przekraczają dochody — od ponad 3 miesięcy.",
        "Komornik prowadzi egzekucję, ale nie wystarcza na zaspokojenie wszystkich wierzycieli.",
        "Masz wielu wierzycieli (3+) i nie jesteś w stanie ich obsłużyć.",
        "Próbowałeś ugód, ale wierzyciele odmawiają lub raty są nierealne.",
        "Niewypłacalność wynika z okoliczności od Ciebie niezależnych (utrata pracy, choroba, rozwód).",
        "Posiadasz aktywa, które chcesz uporządkować w trybie likwidacyjnym pod nadzorem syndyka.",
      ]}
      steps={[
        {
          title: "Spis zobowiązań",
          desc: "Wczytaj umowy / nakazy / pisma egzekucyjne. OCR rozpozna wierzycieli, kwoty i daty wymagalności.",
        },
        {
          title: "Spis majątku",
          desc: "Nieruchomości, pojazdy, wartościowe rzeczy, oszczędności, wynagrodzenie, świadczenia. Z wycenami orientacyjnymi.",
        },
        {
          title: "AI zbuduje wniosek",
          desc: "Formularz urzędowy + uzasadnienie niewypłacalności + opis okoliczności + propozycja planu spłaty.",
        },
        {
          title: "Pobierz i złóż",
          desc: "PDF do sądu rejonowego (właściwy ze względu na miejsce zamieszkania). Opłata sądowa: 30 zł.",
        },
      ]}
      features={[
        {
          title: "Formularz urzędowy",
          desc: "Wzór z Rozporządzenia Min. Sprawiedliwości — kompletnie wypełniony Twoimi danymi.",
        },
        {
          title: "Uzasadnienie niewypłacalności",
          desc: "Konkretny opis sytuacji finansowej z chronologią wydarzeń, źródłami niewypłacalności, próbami zaradzenia.",
        },
        {
          title: "Spis wierzytelności",
          desc: "Pełna tabela z nazwami wierzycieli, kwotami głównymi i odsetkami, sygnaturami spraw, statusem (sporne/bezsporne).",
        },
        {
          title: "Spis majątku",
          desc: "Aktywa z wycenami orientacyjnymi, świadczenia chronione, dochody bieżące, koszty utrzymania.",
        },
        {
          title: "Propozycja planu spłaty",
          desc: "Plan na 12-36 miesięcy uwzględniający Twoje realne możliwości, z wyliczeniem rat dla każdego wierzyciela.",
        },
        {
          title: "Wniosek o zwolnienie z kosztów",
          desc: "Dla osób w trudnej sytuacji — automatycznie dołączony, jeśli dochody na to wskazują (próg ustawowy).",
        },
      ]}
      faq={[
        {
          q: "Kto może ogłosić upadłość konsumencką?",
          a: "Każda osoba fizyczna nieprowadząca działalności gospodarczej, która stała się niewypłacalna (art. 491(1) Prawa upadłościowego). Po reformie z 2020 r. nie wymaga się już, aby niewypłacalność powstała w okolicznościach niezawinionych — zawiniona niewypłacalność wpływa tylko na długość planu spłaty (do 7 lat zamiast 3).",
        },
        {
          q: "Co dokładnie dzieje się po złożeniu wniosku?",
          a: "Sąd rozpoznaje wniosek (zwykle 2-4 miesiące). Jeśli go uwzględni, wydaje postanowienie o ogłoszeniu upadłości — od tej chwili: zatrzymują się wszystkie egzekucje, syndyk obejmuje majątek, naliczanie odsetek ustaje. Po likwidacji majątku sąd ustala plan spłaty (3-7 lat) lub od razu umarza zobowiązania (jeśli nie ma majątku ani dochodu).",
        },
        {
          q: "Czy stracę dom / mieszkanie?",
          a: "Nieruchomość zwykle wchodzi do masy upadłości i jest sprzedawana przez syndyka. Z kwoty sprzedaży otrzymujesz świadczenie na wynajem (12-24 miesiące czynszu) i wracasz na rynek najmu. Wyjątki: jeśli mieszkanie jest jedynym i ma niską wartość, lub jeśli rodzina ma w nim część udziału. Plan spłaty bez sprzedaży nieruchomości jest możliwy, ale rzadki.",
        },
        {
          q: "Czy upadłość zniszczy mi BIK na zawsze?",
          a: "Wpis w BIK i KRD utrzymuje się przez okres planu spłaty + 5 lat po jego wykonaniu. Praktycznie oznacza to 8-10 lat z ograniczonym dostępem do kredytu. Po tym okresie wracasz do normalnej zdolności kredytowej. Alternatywnie — utrzymywanie nieobsługiwanych długów również niszczy BIK, tylko bez końcowego umorzenia.",
        },
        {
          q: "Czy długi alimentacyjne też zostaną umorzone?",
          a: "Nie. Z planu spłaty / umorzenia wyłączone są: alimenty bieżące i przyszłe, kary grzywny, odszkodowania za czyny niedozwolone (umyślne), świadczenia za choroby i wypadki. Kapitał alimentów zaległych wchodzi do masy. Pozostałe długi (kredyty, pożyczki, czynsz, faktury) — podlegają umorzeniu po wykonaniu planu.",
        },
        {
          q: "Ile kosztuje cała procedura?",
          a: "Opłata sądowa od wniosku: 30 zł. Wynagrodzenie syndyka pokrywane jest z masy upadłości (lub z budżetu państwa, jeśli masa nie wystarcza). Długomat za przygotowanie kompletu dokumentów: 249 zł. Łącznie ok. 280 zł — wielokrotnie mniej niż adwokat (3000-8000 zł). Nie zalecamy upadłości jako pierwszego rozwiązania — zawsze warto wpierw spróbować ugody (D7) lub upadłości tylko części długów przez sprzeciwy (D2).",
        },
      ]}
      legalNote="Wniosek zgodny z art. 491(1)-491(24) Prawa upadłościowego. Wzór formularza z Rozporządzenia MS. Upadłość-Lite nie zastępuje konsultacji z radcą prawnym przy złożonych przypadkach."
    />
  );
}
