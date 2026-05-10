import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "CesjaCheck — weryfikacja umowy cesji i zarzut braku legitymacji | Długomat",
  description:
    "Fundusz sekurytyzacyjny żąda zapłaty po cesji długu? CesjaCheck zweryfikuje legitymację procesową i wygeneruje pismo z zarzutem braku legitymacji oraz wnioskiem dowodowym.",
  alternates: { canonical: "/moduly/cesja" },
  openGraph: {
    title: "CesjaCheck — Długomat",
    description:
      "Weryfikacja cesji + zarzut braku legitymacji procesowej. 149 zł.",
    type: "website",
  },
};

export default function CesjaPage() {
  return (
    <ModuleLanding
      code="D6"
      title="CesjaCheck"
      tagline="Fundusz po cesji żąda zapłaty? Zweryfikuj legitymację — często jej po prostu nie mają."
      description="Cesja wierzytelności (art. 509 KC) wymaga skutecznej umowy między pierwotnym wierzycielem a funduszem oraz prawidłowego zawiadomienia dłużnika. W praktyce fundusze sekurytyzacyjne (Kruk, Best, Ultimo, Hoist, Intrum) bardzo często nie potrafią wykazać pełnego łańcucha cesji — bo umowy są pakietowe, niekompletne, a czasem dotyczą wierzytelności, których w pakiecie w ogóle nie było."
      price="149 zł"
      ctaHref="/auth/sign-up?next=/panel/sprawy/nowa?module=cesja"
      ctaLabel="Sprawdź cesję — 149 zł"
      whenSignals={[
        "Otrzymałeś pismo od funduszu (Kruk, Best, Ultimo, Hoist, Intrum), z którym nigdy nie zawierałeś umowy.",
        "Fundusz pozywa Cię o dług, który zaciągnąłeś w banku lub firmie pożyczkowej dawno temu.",
        "Nie otrzymałeś formalnego zawiadomienia o cesji od pierwotnego wierzyciela.",
        "Fundusz nie przedstawił pełnej umowy cesji — tylko 'wyciąg' lub 'oświadczenie'.",
        "W łańcuchu cesji jest kilku pośredników (np. bank → SPV → fundusz inwestycyjny).",
        "Kwota dochodzona przez fundusz różni się od kwoty z pierwotnej umowy.",
      ]}
      steps={[
        {
          title: "Wczytaj pismo funduszu",
          desc: "OCR rozpozna nazwę funduszu, numer pakietu cesji, datę nabycia, kwotę dochodzoną.",
        },
        {
          title: "Sprawdzimy łańcuch",
          desc: "Algorytm wskaże pytania dowodowe: kompletność cesji, ciągłość przelewu, zawiadomienie dłużnika.",
        },
        {
          title: "AI zbuduje pismo",
          desc: "Zarzut braku legitymacji + wniosek o przedłożenie pełnej dokumentacji + zarzut przedawnienia (jeśli pasuje).",
        },
        {
          title: "Pobierz i wyślij",
          desc: "PDF gotowy do złożenia w sądzie razem ze sprzeciwem (D2) lub jako odpowiedź na pozew.",
        },
      ]}
      features={[
        {
          title: "Zarzut braku legitymacji procesowej",
          desc: "Fundusz musi wykazać, że nabył konkretnie tę wierzytelność — nie wystarczy 'pakiet'. Ciężar dowodu po jego stronie.",
        },
        {
          title: "Wniosek o pełną dokumentację cesji",
          desc: "Żądanie przedłożenia umowy cesji w całości, załączników z wykazem wierzytelności, dowodu zapłaty ceny.",
        },
        {
          title: "Zarzut braku zawiadomienia",
          desc: "Art. 512 KC — bez zawiadomienia dłużnik może zwolnić się z długu wpłacając do pierwotnego wierzyciela.",
        },
        {
          title: "Zarzut przedawnienia",
          desc: "Cesja nie przerywa biegu przedawnienia. Liczymy od pierwotnej wymagalności wobec banku, nie od cesji.",
        },
        {
          title: "Zarzut nieważności klauzul",
          desc: "Jeśli pierwotna umowa zawierała klauzule abuzywne — fundusz nabył wierzytelność z tym 'wadą'.",
        },
        {
          title: "Mapa orzecznictwa SN",
          desc: "Powołanie konkretnych sygnatur (m.in. III CZP 36/19, II CSK 481/17) wzmacniających każdy zarzut.",
        },
      ]}
      faq={[
        {
          q: "Czy fundusz w ogóle ma prawo mnie pozwać?",
          a: "Tak — pod warunkiem, że skutecznie nabył wierzytelność. Cesja jest legalna (art. 509 KC), ale fundusz musi wykazać pełen łańcuch: umowa pierwotna → cesja → ewentualne dalsze cesje → on. Jeśli choć jedno ogniwo jest niewykazane, nie ma legitymacji procesowej i powództwo powinno zostać oddalone.",
        },
        {
          q: "Co to jest 'wyciąg z umowy cesji' i czy wystarcza w sądzie?",
          a: "Fundusze często składają 'wyciąg' — kilka stron z notarialnym poświadczeniem. SN wielokrotnie wskazywał, że wyciąg nie zastępuje pełnej umowy: dłużnik ma prawo zweryfikować, czy jego wierzytelność rzeczywiście była objęta pakietem, jaka była cena nabycia, czy nabywca w ogóle zapłacił. Brak pełnej dokumentacji = brak legitymacji.",
        },
        {
          q: "Czy zarzut braku legitymacji wystarczy, by wygrać?",
          a: "Często tak — ale dobry sprzeciw / odpowiedź na pozew łączy kilka zarzutów: braku legitymacji + przedawnienia + klauzul abuzywnych + wadliwego zawiadomienia. Każdy z nich osobno może wygrać sprawę. Razem znacząco zmniejszają szanse funduszu.",
        },
        {
          q: "Co zrobić, jeśli wpłacałem do funduszu, a teraz okazuje się, że cesja była nieskuteczna?",
          a: "Wpłaty dokonane w dobrej wierze do nabywcy chronione są art. 512 KC, jeśli nie zostałeś zawiadomiony. Jeśli zawiadomienie było — wpłaty są skuteczne. Jeśli pierwotny wierzyciel próbuje teraz dochodzić tych samych kwot, masz zarzut zapłaty z dowodami przelewów.",
        },
        {
          q: "Czy fundusz może odzyskać dług sprzed 10 lat?",
          a: "Co do zasady nie — roszczenia z umów konsumenckich przedawniają się po 6 latach (od 2018 r.; wcześniej 10 lat) od wymagalności. Roszczenia z działalności gospodarczej — 3 lata. Cesja nie 'odświeża' biegu przedawnienia. Nawet jeśli fundusz nabył wierzytelność rok temu — liczymy od pierwotnej daty wymagalności wobec banku.",
        },
        {
          q: "CesjaCheck a Sprzeciwomat (D2) — który wybrać?",
          a: "Jeśli masz nakaz EPU od funduszu — D2 Sprzeciwomat zawiera zarzut cesji jako jeden z elementów. CesjaCheck (D6) wybiera się, gdy: (1) jesteś już po sprzeciwie i przygotowujesz się do rozprawy, (2) odpowiadasz na pozew zwykły (nie EPU), (3) chcesz pełnej, rozbudowanej analizy cesji — z opinią prawną i mapą orzecznictwa.",
        },
      ]}
      legalNote="Pismo zgodne z art. 509-518 KC, art. 6 KC. Mapa orzecznictwa SN aktualizowana co kwartał."
    />
  );
}
