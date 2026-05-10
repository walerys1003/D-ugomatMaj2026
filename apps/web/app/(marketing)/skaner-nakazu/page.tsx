import type { Metadata } from "next";
import { ModuleLanding } from "@/components/marketing/module-landing";

export const metadata: Metadata = {
  title: "Skaner Nakazu — sprawdź pismo z sądu w 2 minuty | Długomat",
  description:
    "Darmowy skaner pism procesowych. Wczytaj nakaz zapłaty, wezwanie z e-Sądu lub list od komornika — sprawdzimy przedawnienie, wskażemy terminy i podpowiemy co zrobić jako pierwsze.",
  alternates: { canonical: "/skaner-nakazu" },
  openGraph: {
    title: "Skaner Nakazu — Długomat",
    description:
      "DARMOWE: rozpoznanie pisma z sądu / komornika i ocena Twoich opcji w 2 minuty.",
    type: "website",
  },
};

export default function SkanerNakazuPage() {
  return (
    <ModuleLanding
      code="D1"
      title="Skaner Nakazu"
      tagline="Wczytaj nakaz, sprawdź czy roszczenie jest przedawnione, dowiedz się co masz zrobić jako pierwsze."
      description="Wystarczy zdjęcie pisma z aparatu telefonu. OCR wyciągnie sygnaturę, kwotę, datę wymagalności i wierzyciela. W 30 sekund powiemy Ci, ile masz dni na reakcję i które moduły Długomatu są dla Ciebie."
      price="DARMOWE"
      ctaHref="/auth/sign-up?next=/panel/skaner"
      ctaLabel="Zeskanuj pismo — DARMOWE"
      whenSignals={[
        "Dostałeś nakaz zapłaty z e-Sądu (EPU) i nie wiesz, czy się odwołać.",
        "Komornik przysłał zawiadomienie o wszczęciu egzekucji.",
        "Masz pismo od funduszu sekurytyzacyjnego (Kruk, Best, Ultimo, Hoist) z żądaniem zapłaty.",
        "Nie pamiętasz, kiedy zaciągnąłeś dług — chcesz sprawdzić, czy się przedawnił.",
        "Otrzymałeś pozew i widzisz tylko datę rozprawy — nie wiesz, na co masz czas.",
        "Bank lub firma pożyczkowa wzywa do zapłaty pod groźbą sądu.",
      ]}
      steps={[
        {
          title: "Zrób zdjęcie",
          desc: "Aparatem telefonu albo skanerem. PDF też zadziała. Plik nigdy nie opuszcza serwerów w UE.",
        },
        {
          title: "OCR rozpozna treść",
          desc: "Wyciągniemy sygnaturę, kwotę, datę, wierzyciela i podstawę roszczenia. Sprawdzisz dane przed kolejnym krokiem.",
        },
        {
          title: "Ocena sytuacji",
          desc: "Algorytm sprawdzi przedawnienie, terminy procesowe i wskaże, które moduły są dla Ciebie odpowiednie.",
        },
        {
          title: "Plan działania",
          desc: "Konkretne kroki: ile masz dni, co napisać, czy potrzebujesz sprzeciwu, skargi czy ugody.",
        },
      ]}
      features={[
        {
          title: "Rozpoznanie typu pisma",
          desc: "Nakaz EPU, nakaz upominawczy, wezwanie do zapłaty, zawiadomienie komornika, raport BIK — automatyczna klasyfikacja.",
        },
        {
          title: "Detekcja przedawnienia",
          desc: "Sprawdzimy, czy minęły 3 lata (roszczenia z działalności gospodarczej) lub 6 lat (pozostałe) od wymagalności.",
        },
        {
          title: "Liczenie terminów",
          desc: "Termin sprzeciwu (14 dni), zarzutów (2 tygodnie), skargi na komornika (7 dni) — z konkretną datą.",
        },
        {
          title: "Wskazanie zarzutów",
          desc: "Jakie zarzuty merytoryczne masz dostępne: brak legitymacji, przedawnienie, nieważność cesji, klauzule abuzywne.",
        },
        {
          title: "Mapa modułów",
          desc: "Po skanie wiesz dokładnie, czy idziesz do D2 (sprzeciw), D3 (komornik), D6 (cesja) czy D7 (ugoda).",
        },
        {
          title: "Bez konta z karty",
          desc: "Pełen skan dostępny po darmowej rejestracji emailem. Nigdy nie prosimy o kartę przy D1.",
        },
      ]}
      faq={[
        {
          q: "Czy skaner naprawdę jest darmowy?",
          a: "Tak. D1 Skaner Nakazu to nasze zobowiązanie wobec użytkowników — diagnoza problemu prawnego musi być dostępna dla każdego, niezależnie od sytuacji finansowej. Płacisz tylko, jeśli zdecydujesz się wygenerować konkretne pismo (D2–D8).",
        },
        {
          q: "Co dokładnie skaner mi powie?",
          a: "Po pierwsze: jakie to pismo i kto jest wierzycielem. Po drugie: ile masz dni na reakcję (z konkretną datą). Po trzecie: czy roszczenie wygląda na przedawnione. Po czwarte: jakie masz opcje i ile kosztuje każda z nich w Długomacie.",
        },
        {
          q: "Czy moje pismo jest bezpiecznie przetworzone?",
          a: "Plik jest szyfrowany TLS 1.3 w transmisji i AES-256 na serwerach Supabase w UE. OCR przetwarzamy lokalnie (Tesseract) lub przez AWS Textract w regionie eu-central-1. Po 30 dniach od skanu plik jest automatycznie usuwany.",
        },
        {
          q: "Co jeśli pismo jest niewyraźne lub zepsute?",
          a: "Jeśli OCR nie wyciągnie kluczowych danych, poprosimy Cię o ich ręczne uzupełnienie. Możesz też zaczynać sprawę bez skanu — wystarczy formularz w odpowiednim module.",
        },
        {
          q: "Czy skaner zastąpi prawnika?",
          a: "Nie. Skaner pomaga zrozumieć sytuację i wybrać kierunek. Jeśli sprawa jest skomplikowana (np. spadek, wspólnik dewelopera, frankowicz) — przekierujemy Cię do współpracującej kancelarii.",
        },
      ]}
      legalNote="Skaner Nakazu jest narzędziem informacyjnym — nie stanowi opinii prawnej w rozumieniu art. 4 ust. 1 ustawy o radcach prawnych."
    />
  );
}
