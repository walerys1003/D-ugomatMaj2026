import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "KomornikShield — skarga na komornika i ograniczenie egzekucji | Długomat",
  description:
    "Komornik zajął wynagrodzenie, rachunek bankowy lub ruchomości? Skarga na czynności komornika (7 dni), wniosek o ograniczenie egzekucji, kwota wolna od zajęcia — pisma w 12 minut.",
  alternates: { canonical: "/moduly/komornik" },
  openGraph: {
    title: "KomornikShield — Długomat",
    description:
      "Skarga na czynności komornika, ograniczenie egzekucji, kwota wolna. Pisma od 79 zł.",
    type: "website",
  },
};

export default function KomornikPage() {
  return (
    <ModuleLanding
      code="D3"
      title="KomornikShield"
      tagline="Komornik zajął więcej niż mu wolno? Wiesz dokładnie, jakie pismo i do kogo wysłać."
      description="Komornik nie ma nieograniczonej władzy. Kodeks postępowania cywilnego określa limity zajęć, kwoty wolne od egzekucji i tryby zaskarżenia każdej czynności. KomornikShield wskaże dokładnie, które przepisy zostały naruszone i wygeneruje pismo procesowe — skargę, wniosek o ograniczenie albo wniosek o wyłączenie spod egzekucji."
      price="od 79 zł"
      ctaHref="/sign-up?next=/panel/sprawy/nowa?module=komornik"
      ctaLabel="Zatrzymaj komornika — od 79 zł"
      whenSignals={[
        "Komornik zajął całe wynagrodzenie zamiast pozostawić kwotę wolną.",
        "Egzekucja toczy się mimo, że nakaz zapłaty był uchylony lub jest sprzeciw.",
        "Komornik zajął przedmioty potrzebne do pracy (laptop, narzędzia, samochód służbowy).",
        "Otrzymałeś zajęcie świadczenia chronionego (500+, alimenty, świadczenie pielęgnacyjne).",
        "Komornik nie doręczył Ci postanowienia o wszczęciu egzekucji.",
        "Koszty egzekucji wydają się rażąco wygórowane w stosunku do długu.",
      ]}
      steps={[
        {
          title: "Wczytaj pismo komornika",
          desc: "Zawiadomienie o wszczęciu egzekucji, postanowienie o zajęciu, wezwanie. OCR wyciągnie sygnaturę Km/Kmp.",
        },
        {
          title: "Wskaż naruszenie",
          desc: "Kreator pyta o konkrety: co zostało zajęte, jakie świadczenia masz, ile wynosi Twoje wynagrodzenie.",
        },
        {
          title: "AI dobierze tryb",
          desc: "Skarga na czynność (7 dni), wniosek o ograniczenie (art. 833 KPC), wniosek o wyłączenie (art. 829 KPC).",
        },
        {
          title: "Pobierz i wyślij",
          desc: "PDF z adresem właściwego sądu rejonowego (sąd nadzoru, nie komornik). Termin liczymy od dnia czynności.",
        },
      ]}
      features={[
        {
          title: "Skarga na czynność (art. 767 KPC)",
          desc: "Pismo do sądu rejonowego nadzorującego komornika. 7 dni od dowiedzenia się o czynności. Bezpłatna.",
        },
        {
          title: "Wniosek o ograniczenie egzekucji",
          desc: "Powołanie się na kwotę wolną (art. 833 § 6 KPC) — minimalne wynagrodzenie netto plus 50% zwiększenia na każde dziecko.",
        },
        {
          title: "Wniosek o wyłączenie spod egzekucji",
          desc: "Art. 829 KPC — przedmioty niezbędne do życia codziennego, narzędzia pracy, leki, świadczenia rodzinne.",
        },
        {
          title: "Zarzut przedawnienia tytułu",
          desc: "6 lat od uprawomocnienia tytułu wykonawczego — po tym terminie egzekucja nie powinna być prowadzona.",
        },
        {
          title: "Wniosek o obniżenie kosztów",
          desc: "Jeśli koszty komornicze są nieproporcjonalne — pismo do sądu z żądaniem ich obniżenia.",
        },
        {
          title: "Zażalenie na postanowienie",
          desc: "Jeżeli sąd oddalił skargę — pismo o ponowne rozpoznanie sprawy w sądzie wyższej instancji.",
        },
      ]}
      faq={[
        {
          q: "Ile wynosi kwota wolna od zajęcia?",
          a: "Z wynagrodzenia za pracę: minimalne wynagrodzenie netto (4242 zł brutto = ok. 3261 zł netto w 2025) + 50% nadwyżki ponad to (chyba że egzekwowane są alimenty — wtedy wolna jest tylko kwota minimalna). Z rachunku bankowego: 75% minimalnego wynagrodzenia miesięcznie (art. 54 Prawa bankowego). Świadczenia 500+, alimenty otrzymywane, świadczenie pielęgnacyjne — w 100% wolne od egzekucji.",
        },
        {
          q: "Jak długo mam na skargę?",
          a: "7 dni od dnia, w którym dowiedziałeś się o czynności komornika (art. 767 § 4 KPC). Termin liczy się od doręczenia postanowienia, nie od jego wydania. Skargę składa się do sądu rejonowego, przy którym działa komornik — nie do samego komornika.",
        },
        {
          q: "Czy skarga zatrzyma egzekucję?",
          a: "Sama skarga nie wstrzymuje egzekucji. Razem ze skargą Długomat składa wniosek o zawieszenie postępowania egzekucyjnego (art. 821 KPC). Sąd rozpatruje go z urzędu i może wstrzymać egzekucję do czasu rozpoznania skargi.",
        },
        {
          q: "Komornik zajął całe wynagrodzenie — co robić od razu?",
          a: "Po pierwsze: skarga na czynność (7 dni). Po drugie: pismo do pracodawcy z informacją o kwocie wolnej (zwykle wystarcza, jeśli pracodawca źle zinterpretował zajęcie). Po trzecie: jeśli zajęcie wynika z prawomocnego tytułu — moduł D4 PotrąceniaStop pomoże w odblokowaniu kwoty wolnej.",
        },
        {
          q: "Czy mogę zaskarżyć całą egzekucję, nie tylko jedną czynność?",
          a: "Tak — przez powództwo przeciwegzekucyjne (art. 840-842 KPC). Wnosi się je do sądu, w którym wydano tytuł wykonawczy. To jednak procedura długa i wiąże się z opłatą sądową — najpierw warto wykorzystać szybsze instrumenty (skarga, wniosek o ograniczenie).",
        },
        {
          q: "Komornik zajął rachunek z 500+ — co zrobić?",
          a: "To częsta i nielegalna praktyka. Świadczenie 500+ jest w 100% wolne od egzekucji (art. 833 § 6 KPC). Wniosek o wyłączenie spod egzekucji + skarga na czynność komornika. Bank zwykle zwraca środki w ciągu 7 dni od orzeczenia sądu.",
        },
      ]}
      legalNote="Pisma zgodne z art. 767, 821, 829, 833, 840 KPC. Wzory aktualizowane co kwartał."
    />
  );
}
