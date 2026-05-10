import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "BIK-Fix — wniosek o korektę negatywnego wpisu w BIK | Długomat",
  description:
    "Negatywny wpis w BIK blokuje Ci kredyt? Wniosek o korektę BIK + reklamacja do banku — pisma w 12 minut. Średnio 30 dni do skutku.",
  alternates: { canonical: "/moduly/bik" },
  openGraph: {
    title: "BIK-Fix — Długomat",
    description:
      "Wniosek o korektę negatywnego wpisu w BIK + pismo do banku. 129 zł.",
    type: "website",
  },
};

export default function BikPage() {
  return (
    <ModuleLanding
      code="D5"
      title="BIK-Fix"
      tagline="Negatywny wpis w BIK blokuje kredyt? Wniosek o korektę z konkretną podstawą prawną."
      description="Bank ma obowiązek przekazywać do BIK wyłącznie dane prawdziwe i aktualne (art. 105a Prawa bankowego). Niewłaściwy wpis można zmienić — w trybie reklamacji do banku, a jeśli to nie pomoże, w trybie żądania korekty bezpośrednio do BIK i Rzecznika Finansowego. BIK-Fix wygeneruje pismo z konkretnymi podstawami prawnymi i wyliczeniami."
      price="129 zł"
      ctaHref="/auth/sign-up?next=/panel/sprawy/nowa?module=bik"
      ctaLabel="Skoryguj wpis BIK — 129 zł"
      whenSignals={[
        "BIK pokazuje opóźnienie, którego nigdy nie miałeś (np. po cesji długu).",
        "Spłaciłeś zobowiązanie, ale wpis o opóźnieniach wciąż widnieje po latach.",
        "Bank przekazał dane mimo, że upłynęło 5 lat od spłaty (art. 105a ust. 4-5).",
        "W BIK figuruje umowa, której nigdy nie zawierałeś (kradzież tożsamości).",
        "Otrzymałeś odmowę kredytu hipotecznego z powodu starego wpisu.",
        "Po ugodzie z bankiem wpis nie został zaktualizowany na 'spłacony'.",
      ]}
      steps={[
        {
          title: "Pobierz raport BIK",
          desc: "Darmowy raport raz na 6 miesięcy z bik.pl. Wczytaj PDF — wyciągniemy wszystkie wpisy.",
        },
        {
          title: "Oznacz sporny wpis",
          desc: "Wskaż, który wpis jest błędny i dlaczego: spłacony, przedawniony, nieprawdziwy, po cesji.",
        },
        {
          title: "AI zbuduje pismo",
          desc: "Reklamacja do banku + równoległy wniosek do BIK — zgodne z art. 105a Prawa bankowego i RODO.",
        },
        {
          title: "Pobierz i wyślij",
          desc: "PDF do banku + wzór elektroniczny do BIK przez bok@bik.pl. Termin reakcji: 30 dni roboczych.",
        },
      ]}
      features={[
        {
          title: "Reklamacja do banku",
          desc: "Pismo z art. 105a Prawa bankowego + ustawa o reklamacjach. Bank ma 30 dni na odpowiedź.",
        },
        {
          title: "Wniosek do BIK",
          desc: "Bezpośrednie żądanie aktualizacji / usunięcia wpisu w trybie RODO art. 16 (sprostowanie).",
        },
        {
          title: "Skarga do Rzecznika Finansowego",
          desc: "Jeśli bank odrzuci reklamację — automatyczne pismo do RF (rf.gov.pl) z całą dokumentacją.",
        },
        {
          title: "Wniosek o usunięcie po 5 latach",
          desc: "Art. 105a ust. 4 Prawa bankowego — bank musi usunąć dane po 5 latach od spłaty (z wyjątkami).",
        },
        {
          title: "Pismo po cesji",
          desc: "Jeśli dług był przedmiotem cesji — żądanie usunięcia wpisu o opóźnieniach z okresu po cesji.",
        },
        {
          title: "Pakiet RODO",
          desc: "Wniosek o dostęp do danych (art. 15) + sprostowanie (art. 16) + usunięcie (art. 17) — w jednym piśmie.",
        },
      ]}
      faq={[
        {
          q: "Jak długo wpis pozostaje w BIK?",
          a: "Standardowo 5 lat od dnia wygaśnięcia zobowiązania (spłaty) — zgodnie z art. 105a ust. 4 Prawa bankowego. Wyjątek: jeśli zaległość wynosiła ponad 60 dni i bank Cię uprzedził — może przetwarzać dane przez 5 lat od ich powstania, nawet po spłacie. Przedawnione roszczenia (3 lub 6 lat) — można żądać usunięcia w trybie RODO.",
        },
        {
          q: "Bank odpisał mi, że wszystko jest OK — co dalej?",
          a: "Trzy ścieżki równolegle: (1) skarga do Rzecznika Finansowego (rf.gov.pl) — bezpłatna, średnio 60-90 dni; (2) skarga do UODO (uodo.gov.pl) jeśli przetwarzanie narusza RODO; (3) pozew cywilny o nakazanie usunięcia wpisu. Długomat generuje wszystkie trzy pisma w pakiecie.",
        },
        {
          q: "Ile czasu zajmuje korekta?",
          a: "Bank ma 30 dni na odpowiedź na reklamację (15 w sprawach prostych). Jeśli zatwierdzi korektę — BIK aktualizuje dane w cyklu miesięcznym. Cały proces 30-60 dni. Przy oporze banku — 3-6 miesięcy przez Rzecznika.",
        },
        {
          q: "Czy mogę usunąć każdy wpis?",
          a: "Nie — wpisy o aktualnie spłacanych kredytach (zgodnie z harmonogramem) nie podlegają usunięciu. BIK-Fix usuwa: błędne wpisy, przedawnione, po 5 latach od spłaty, wpisy o cesji, kradzieży tożsamości, oraz takie, gdzie bank nie ma podstawy prawnej do dalszego przetwarzania.",
        },
        {
          q: "Co z BIG InfoMonitor i KRD?",
          a: "BIG-i (BIG InfoMonitor, KRD, ERIF) działają inaczej niż BIK — wpis można usunąć od ręki przez ustawowy wniosek do biura w trybie ustawy o udostępnianiu informacji gospodarczych. Długomat generuje pismo do BIG równolegle, jeśli wskażesz taki wpis.",
        },
        {
          q: "Czy BIK-Fix gwarantuje usunięcie?",
          a: "Nie — żadne pismo nie daje gwarancji, bo decyzja zależy od banku/BIK. Ale skuteczność reklamacji opartej na art. 105a + RODO + art. 16-17 to ok. 70% w pierwszym kroku. Pozostałe 30% rozwiązują pisma do RF i pozwy. Cena 129 zł obejmuje cały pakiet.",
        },
      ]}
      legalNote="Pisma zgodne z art. 105a Prawa bankowego, ustawą o reklamacjach, art. 15-17 RODO."
    />
  );
}
