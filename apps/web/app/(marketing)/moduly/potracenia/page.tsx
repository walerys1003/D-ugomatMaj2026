import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "PotrąceniaStop — odblokuj kwotę wolną i wstrzymaj zajęcie wynagrodzenia | Długomat",
  description:
    "Pracodawca lub bank zajął całe wynagrodzenie? Pismo do pracodawcy o kwotę wolną, wniosek do banku o odblokowanie 75% minimalnego wynagrodzenia — gotowe w 12 minut.",
  alternates: { canonical: "/moduly/potracenia" },
  openGraph: {
    title: "PotrąceniaStop — Długomat",
    description:
      "Wstrzymaj zajęcie wynagrodzenia, odblokuj kwotę wolną na koncie. Od 79 zł.",
    type: "website",
  },
};

export default function PotraceniaPage() {
  return (
    <ModuleLanding
      code="D4"
      title="PotrąceniaStop"
      tagline="Wstrzymaj zajęcie wynagrodzenia, odblokuj kwotę wolną na koncie bankowym."
      description="Pracodawca i bank mają obowiązek pozostawić Ci kwotę wolną — minimalne wynagrodzenie netto z wynagrodzenia za pracę i 75% minimalnego wynagrodzenia na rachunku. Często tego nie robią — bo nie wiedzą, bo źle zinterpretowali zajęcie albo bo wysłali zbyt szeroko. PotrąceniaStop wygeneruje pismo, które przywraca Twoje uprawnienia w 7 dni."
      price="od 79 zł"
      ctaHref="/sign-up?next=/panel/sprawy/nowa?module=potracenia"
      ctaLabel="Odblokuj kwotę wolną — od 79 zł"
      whenSignals={[
        "Pracodawca przelał Ci 0 zł lub kwotę poniżej minimalnego wynagrodzenia.",
        "Bank zablokował cały rachunek — nie możesz wypłacić nawet na żywność.",
        "Komornik zajął rachunek, na który wpływa świadczenie 500+ albo alimenty.",
        "Egzekwowane są alimenty, ale komornik zajmuje też wynagrodzenie z innego tytułu.",
        "Zajęcie obejmuje świadczenie pielęgnacyjne, emeryturę socjalną lub stypendium.",
        "Pracodawca potrąca Ci więcej niż 50% wynagrodzenia (a egzekwowany jest dług niealimentacyjny).",
      ]}
      steps={[
        {
          title: "Wybierz źródło zajęcia",
          desc: "Zajęcie wynagrodzenia (art. 87 KP) czy zajęcie rachunku (art. 54 Prawa bankowego)? Inne pismo, inny adresat.",
        },
        {
          title: "Podaj kwoty",
          desc: "Wynagrodzenie brutto/netto, liczba dzieci, czy są alimenty w tle. Algorytm wyliczy kwotę wolną.",
        },
        {
          title: "AI przygotuje pismo",
          desc: "Do pracodawcy lub do banku — z konkretnymi przepisami i wyliczeniem należnej Ci kwoty.",
        },
        {
          title: "Pobierz i wyślij",
          desc: "PDF + wersja email gotowa do wklejenia. Bank zwykle reaguje w 3–7 dni, pracodawca przy najbliższej wypłacie.",
        },
      ]}
      features={[
        {
          title: "Pismo do pracodawcy",
          desc: "Powołanie na art. 87 i 871 KP — minimalne wynagrodzenie netto pozostawione w dyspozycji pracownika.",
        },
        {
          title: "Pismo do banku",
          desc: "Wniosek o uwolnienie kwoty wolnej zgodnie z art. 54 Prawa bankowego — 75% minimalnego miesięcznie.",
        },
        {
          title: "Wniosek o ochronę 500+",
          desc: "Świadczenia rodzinne i wychowawcze są w 100% wolne od egzekucji (art. 833 § 6 KPC). Pismo do banku + skarga.",
        },
        {
          title: "Korekta błędnego potrącenia",
          desc: "Żądanie zwrotu kwot pobranych ponad limit — z odsetkami od dnia bezprawnego potrącenia.",
        },
        {
          title: "Pismo do komornika",
          desc: "Informacja o świadczeniach chronionych — z żądaniem natychmiastowego zwolnienia środków.",
        },
        {
          title: "Wzór dla pracownika",
          desc: "Krótka informacja, którą wręczasz pracodawcy — bez prawniczego żargonu, do podpisu i archiwum HR.",
        },
      ]}
      faq={[
        {
          q: "Ile dokładnie wynosi kwota wolna w 2025?",
          a: "Z wynagrodzenia za pracę (zwykły dług): minimalne wynagrodzenie netto pracownika zatrudnionego w pełnym wymiarze, czyli ok. 3261 zł netto przy 4242 zł brutto. Z rachunku bankowego: 75% minimalnego wynagrodzenia miesięcznie (ok. 3181 zł brutto), licząc od początku miesiąca. Przy długu alimentacyjnym pracodawca może potrącić do 60% wynagrodzenia, ale i tak musi zostawić Ci minimalną kwotę netto.",
        },
        {
          q: "Czy świadczenie 500+ można zająć?",
          a: "Nie. Świadczenia rodzinne, wychowawcze (500+), świadczenie pielęgnacyjne, alimenty otrzymywane, dodatek mieszkaniowy — wszystkie są w 100% wolne od egzekucji (art. 833 § 6 i 7 KPC). Jeżeli komornik je zajął — należy złożyć wniosek o wyłączenie spod egzekucji + skargę na czynność komornika.",
        },
        {
          q: "Pracodawca twierdzi, że musi zająć tyle, ile podał komornik — co zrobić?",
          a: "Pracodawca jest organem pomocniczym egzekucji (dłużnikiem zajętej wierzytelności) i ma własny obowiązek prawny stosowania kwoty wolnej — nawet jeśli komornik tego nie zaznaczył. Pismo z powołaniem na art. 87 KP rozwiązuje problem w 90% przypadków. Jeśli to nie zadziała, kolejny krok to skarga na czynność komornika.",
        },
        {
          q: "Bank zablokował cały rachunek — jak długo to potrwa?",
          a: "Po złożeniu wniosku o uwolnienie kwoty wolnej bank ma obowiązek zwolnić część środków w terminie maksymalnie 7 dni. W praktyce duże banki (PKO BP, mBank, Santander) reagują w 1–3 dni od otrzymania pisma e-mailem na adres BOK ds. egzekucji.",
        },
        {
          q: "Mam dwa rachunki — czy kwota wolna obowiązuje na każdym?",
          a: "Nie — kwota wolna jest wspólna dla wszystkich rachunków dłużnika. Dłużnik może wskazać bank, w którym chce ją wykorzystać (najczęściej ten z bieżącymi wpływami). Reszta rachunków pozostaje zajęta do pełnej kwoty.",
        },
        {
          q: "Czy pismo wystarczy, czy muszę iść do sądu?",
          a: "W większości przypadków pismo do pracodawcy / banku wystarcza. Sąd wkracza dopiero, gdy pracodawca lub bank zignoruje wniosek — wtedy konieczna jest skarga na czynność komornika (D3 KomornikShield) lub powództwo o zwrot kwot bezprawnie pobranych.",
        },
      ]}
      legalNote="Pisma zgodne z art. 87, 871 KP, art. 833 § 6 KPC, art. 54 Prawa bankowego."
    />
  );
}
