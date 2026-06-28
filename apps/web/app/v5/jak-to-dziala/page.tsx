import type { Metadata } from "next";

import {
  V5MarketingLayout,
  V5HeroSimple,
  V5StepsList,
  V5FeatureGrid,
  V5Faq,
  V5CtaBand,
  V5StatBand,
  V5Testimonial,
} from "@/components/v5/marketing";
import { V5Body, V5Container, V5Eyebrow, V5Headline, V5Section, V5Surface, V5Hairline } from "@/components/v5/primitives";
import { V5Reveal } from "@/components/v5/motion";

export const metadata: Metadata = {
  title: "Jak to działa · Mandatomat V5",
  description:
    "Pełny przewodnik po procedural intelligence engine. Od skanu nakazu do wysłanego sprzeciwu — z pełnym audit chain.",
};

export default function V5JakToDzialaPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="Pełny przewodnik · 6 minut"
        headline="Jak działa AI legal infrastructure."
        body="Pokażemy Ci każdy krok pipeline — od OCR po podpis EPUAP. Bez magicznych skrótów, z pełną prowenancją decyzji AI."
        ctas={[{ label: "Wczytaj nakaz", href: "/v5/skaner-nakazu" }]}
      />

      <V5StatBand
        stats={[
          { value: "12 min", label: "Czas total", sub: "od skanu do podpisu" },
          { value: "412ms", label: "OCR + NLP", sub: "median" },
          { value: "847+", label: "Spraw bazowych", sub: "wzorzec ML" },
          { value: "Ed25519", label: "Audit chain", sub: "każda decyzja AI" },
        ]}
      />

      <V5StepsList
        eyebrow="6 kroków pipeline"
        heading="Twoja sprawa krok po kroku"
        steps={[
          { title: "Skan nakazu", body: "PDF lub fotka z telefonu. OCR + NLP rozpoznają wszystkie pola.", meta: "Etap 1" },
          { title: "Klasyfikacja modułu", body: "AI decyduje czy to D1/D2/.../D8 — automatycznie kieruje do właściwego workflow.", meta: "Etap 2" },
          { title: "Retrieval orzecznictwa", body: "Vector DB szuka podobnych spraw. Cosine similarity > 0.85.", meta: "Etap 3" },
          { title: "IRAC reasoning", body: "Issue → Rule → Application → Conclusion. Z confidence score.", meta: "Etap 4" },
          { title: "Win-probability", body: "Bayesian model wylicza szansę powodzenia + lista czynników.", meta: "Etap 5" },
          { title: "Generowanie + EPUAP", body: "PDF + XML do e-Sądu. Podpis EPUAP. Audit chain signed.", meta: "Etap 6" },
        ]}
      />

      <V5Section density="compact">
        <V5Container width="content">
          <V5Reveal>
            <V5Surface variant="elevated" className="p-8">
              <V5Eyebrow className="mb-4">Transparency · Audit chain</V5Eyebrow>
              <V5Headline level="h3" className="mb-4">
                Każda decyzja AI ma podpis cyfrowy
              </V5Headline>
              <V5Body size="lg" className="mb-6">
                Mandatomat nie jest czarną skrzynką. Każdy krok rozumowania jest
                podpisany kluczem Ed25519, każde cytowanie orzecznictwa
                rejestrowane w audit chain, każda zmiana wersji pisma — z hashem.
              </V5Body>
              <V5Hairline className="mb-6" />
              <ul className="space-y-3 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>Provenance</strong> · źródło każdego cytatu (uchwała SN, art. k.c., wyrok SA)</li>
                <li>• <strong>Reasoning trace</strong> · pełen IRAC chain z confidence score per krok</li>
                <li>• <strong>Retrieval log</strong> · jakie sprawy AI brało pod uwagę, z similarity score</li>
                <li>• <strong>Signature</strong> · Ed25519 dla każdej wersji + TSA timestamp</li>
              </ul>
            </V5Surface>
          </V5Reveal>
        </V5Container>
      </V5Section>

      <V5FeatureGrid
        eyebrow="Co robi za Ciebie AI"
        heading="6 najczęstszych zarzutów, które AI wykrywa automatycznie"
        features={[
          { title: "Przedawnienie 3-letnie", body: "art. 118 k.c. — z urzędu od 2018. AI sprawdzi datę wymagalności + nakazu.", pill: "art. 118" },
          { title: "Brak legitymacji czynnej", body: "Cesja bez zawiadomienia? Łańcuch przelewów przerwany? Wykrywam.", pill: "art. 509" },
          { title: "Brak doręczenia wezwania", body: "Sprzedaż dłużnikowi długu wymaga uprzedniego wezwania — często brak.", pill: "art. 471" },
          { title: "Błędne odsetki", body: "Odsetki kapitałowe vs ustawowe? Max 2× ustawowe (art. 359 k.c.)?", pill: "art. 359" },
          { title: "Wzorzec sądu", body: "Niektóre sądy rejonowe mają wyraźny pro-konsumencki kierunek." },
          { title: "Spóźnienie sprzeciwu", body: "Termin to 14 dni od doręczenia. AI wylicza dokładnie + przypomina." },
        ]}
      />

      <V5Section density="compact">
        <V5Container width="content">
          <V5Reveal>
            <V5Testimonial
              quote="Pokazałem audit chain mojemu prawnikowi — był pod wrażeniem. Każdy zarzut z konkretną uchwałą SN, każdy fragment uzasadnienia z odpowiednim artykułem. Lepsze niż wiele wystąpień, które pisałem latami."
              author="Mecenas Andrzej R."
              role="Adwokat"
              org="Kancelaria Warszawa-Wola"
            />
          </V5Reveal>
        </V5Container>
      </V5Section>

      <V5Faq
        eyebrow="FAQ"
        heading="Najczęstsze pytania o pipeline"
        items={[
          { q: "Czy AI zastępuje prawnika?", a: "Nie. AI generuje pisma na podstawie obowiązujących przepisów, ale finalna decyzja należy do Ciebie. W sprawach o wysokie kwoty zalecamy konsultację." },
          { q: "Jak dokładny jest OCR?", a: "Dla nowoczesnych skanów (300+ DPI) > 99.5%. Dla zdjęć z telefonu > 97%. Możesz poprawić każde pole manualnie." },
          { q: "Czy mogę zobaczyć reasoning chain?", a: "Tak, w pełni — kliknij Audit Chain w panelu sprawy. Zobaczysz każdy krok IRAC z confidence score + cytatami." },
          { q: "Skąd AI bierze orzecznictwo?", a: "Publiczne bazy SN/SA + nasza własna baza 14 000+ wyroków sądów rejonowych zindeksowanych przez NLP." },
        ]}
      />

      <V5CtaBand
        eyebrow="Wszystko jasne?"
        headline="Wczytaj swój nakaz."
        body="Pełny pipeline trwa 12 minut. Nie ryzykujesz nic — pierwsze pismo w planie Free za darmo."
        ctas={[
          { label: "Wczytaj nakaz", href: "/v5/skaner-nakazu" },
          { label: "Cennik", href: "/v5/cennik", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
