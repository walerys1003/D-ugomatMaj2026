import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "Sprzeciw od nakazu zapłaty z EPU — pismo w 12 minut | Długomat",
  description:
    "Dostałeś nakaz zapłaty z e-Sądu? Masz 14 dni na sprzeciw. Sprzeciwomat EPU wygeneruje gotowe pismo procesowe ze wszystkimi zarzutami — brak legitymacji, przedawnienie, klauzule abuzywne.",
  alternates: { canonical: "/moduly/sprzeciw-epu" },
  // W10-6 — dynamic OG via /api/og/[slug]
  openGraph: {
    title: "Sprzeciwomat EPU — Długomat",
    description:
      "Sprzeciw od nakazu zapłaty z e-Sądu. Pismo ze wszystkimi zarzutami w 12 minut. 159 zł.",
    type: "website",
    url: "/moduly/sprzeciw-epu",
    images: [
      {
        url: `/api/og/sprzeciw-epu?title=${encodeURIComponent(
          "Sprzeciwomat EPU",
        )}&subtitle=${encodeURIComponent(
          "Sprzeciw od nakazu zapłaty z e-Sądu · 159 zł",
        )}&kind=module`,
        width: 1200,
        height: 630,
        alt: "Sprzeciwomat EPU — Długomat",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sprzeciwomat EPU — Długomat",
    description: "Sprzeciw od nakazu zapłaty z EPU. 14 dni → 12 minut. 159 zł.",
    images: [
      `/api/og/sprzeciw-epu?title=${encodeURIComponent(
        "Sprzeciwomat EPU",
      )}&subtitle=${encodeURIComponent(
        "Sprzeciw EPU · 159 zł",
      )}&kind=module`,
    ],
  },
};

export default function SprzeciwEpuPage() {
  return (
    <ModuleLanding
      code="D2"
      title="Sprzeciwomat EPU"
      tagline="Sprzeciw od nakazu zapłaty z e-Sądu — masz 14 dni, my potrzebujemy 12 minut."
      description="Po wniesieniu skutecznego sprzeciwu nakaz zapłaty traci moc, a sprawa trafia do sądu rejonowego właściwego dla Twojego miejsca zamieszkania. To jest Twoje konstytucyjne prawo — sprzeciw nie wymaga uzasadnienia, ale dobrze przygotowany sprzeciw z zarzutami merytorycznymi znacząco zwiększa szanse w dalszym postępowaniu."
      price="159 zł"
      ctaHref="/sign-up?next=/panel/sprawy/nowa?module=sprzeciw_epu"
      ctaLabel="Złóż sprzeciw — 159 zł"
      whenSignals={[
        "Nakaz zapłaty pochodzi z VI Wydziału Cywilnego SR Lublin-Zachód (e-Sąd, EPU).",
        "Pismo dostałeś na poczcie z czerwonym pouczeniem o 14-dniowym terminie.",
        "Wierzycielem jest fundusz sekurytyzacyjny (Kruk, Best, Ultimo, Hoist, Intrum).",
        "Roszczenie dotyczy długu sprzed 3+ lat (potencjalne przedawnienie).",
        "Otrzymałeś nakaz, choć nigdy nie zawierałeś umowy z funduszem (cesja).",
        "Kwota w nakazie zawiera odsetki, prowizje lub opłaty, których wysokości nie znasz.",
      ]}
      steps={[
        {
          title: "Wczytaj nakaz",
          desc: "OCR wyciągnie sygnaturę (Nc-e), kwotę, wierzyciela i datę doręczenia. Sprawdzisz dane.",
        },
        {
          title: "Wybierz zarzuty",
          desc: "Kreator zaproponuje zarzuty na podstawie skanu: przedawnienie, brak legitymacji, klauzule abuzywne.",
        },
        {
          title: "AI zbuduje pismo",
          desc: "Claude Sonnet 4.5 z bazą orzeczeń SN i SO przygotuje sprzeciw zgodny z art. 503 KPC.",
        },
        {
          title: "Pobierz i wyślij",
          desc: "PDF z sygnaturą, adresem sądu i listą załączników. Wysyłka pocztą lub przez ePUAP.",
        },
      ]}
      features={[
        {
          title: "Zarzut przedawnienia (art. 117 KC)",
          desc: "Z konkretnym wskazaniem terminu i orzecznictwa SN. Skuteczny zarzut blokuje całe roszczenie.",
        },
        {
          title: "Zarzut braku legitymacji",
          desc: "Jeśli wierzycielem jest fundusz po cesji — żądamy okazania pełnej dokumentacji cesji.",
        },
        {
          title: "Zarzuty klauzul abuzywnych",
          desc: "Wskazanie postanowień niedozwolonych w umowie pożyczki / kredytu konsumenckiego.",
        },
        {
          title: "Wniosek dowodowy",
          desc: "Żądanie przedłożenia oryginałów umów, harmonogramu spłat i historii rachunku.",
        },
        {
          title: "Wniosek o zwolnienie z kosztów",
          desc: "Jeśli Twoja sytuacja na to pozwala — automatycznie dołączymy oświadczenie o stanie majątkowym.",
        },
        {
          title: "Walidacja Haiku 4.5",
          desc: "Drugi model AI sprawdza kompletność pisma i terminy. Niski wynik → automatyczny retry z korektami.",
        },
      ]}
      faq={[
        {
          q: "Co się stanie po wniesieniu sprzeciwu?",
          a: "Nakaz zapłaty traci moc. Sąd Lublin-Zachód przekaże sprawę do sądu rejonowego właściwego dla Twojego miejsca zamieszkania. Otrzymasz wezwanie do uzupełnienia braków formalnych pozwu (jeśli były) i dopiero wtedy odbędzie się rozprawa. Cały proces trwa zwykle 6–18 miesięcy.",
        },
        {
          q: "Czy muszę uzasadnić sprzeciw?",
          a: "Formalnie — nie. Sam sprzeciw bez uzasadnienia wystarczy, żeby uchylić nakaz. Ale zarzuty merytoryczne (przedawnienie, brak legitymacji) podniesione już w sprzeciwie wzmacniają Twoją pozycję na rozprawie i mogą doprowadzić do oddalenia powództwa.",
        },
        {
          q: "Czy sprzeciw należy opłacić?",
          a: "Sprzeciw od nakazu w EPU jest wolny od opłaty (art. 19 ust. 4 UKSC) — to jego ważna zaleta. Tylko jeśli sąd po przekazaniu sprawy wezwie powoda do uzupełnienia opłaty pozwu.",
        },
        {
          q: "Mam tylko 3 dni do końca terminu — zdążę?",
          a: "Tak, jeśli masz pismo i podstawowe dokumenty. Pełen proces w Długomacie to 12 minut. Sprzeciw można wysłać listem poleconym na ostatni dzień terminu (decyduje data stempla pocztowego) lub złożyć w biurze podawczym sądu.",
        },
        {
          q: "Co jeśli przegapiłem 14-dniowy termin?",
          a: "Jeśli przegapiłeś termin nie ze swojej winy (np. z powodu choroby, błędnego doręczenia), możesz złożyć wniosek o przywrócenie terminu wraz ze sprzeciwem. Długomat wygeneruje wniosek razem z pismem — ale działać trzeba szybko (7 dni od ustania przeszkody).",
        },
        {
          q: "Czy sprzeciw zatrzyma komornika?",
          a: "Sam sprzeciw zatrzymuje wykonanie nakazu — nakaz traci klauzulę wykonalności. Jeśli komornik już zajął rachunek, dodatkowo skorzystaj z modułu D3 KomornikShield i D4 PotrąceniaStop.",
        },
      ]}
      legalNote="Pismo zgodne z art. 503-505 KPC. Wzór aktualizowany przy zmianach przepisów."
    />
  );
}
