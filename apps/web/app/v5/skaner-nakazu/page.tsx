import type { Metadata } from "next";

import {
  V5MarketingLayout,
  V5HeroSimple,
  V5FeatureGrid,
  V5StepsList,
  V5Faq,
  V5CtaBand,
  V5StatBand,
} from "@/components/v5/marketing";
import { V5Pill } from "@/components/v5/primitives";

export const metadata: Metadata = {
  title: "Skaner Nakazu · Procedural intelligence engine",
  description:
    "Wczytaj nakaz zapłaty (PDF/zdjęcie) — AI w 12 minut wygeneruje sprzeciw z uzasadnieniem prawnym.",
};

export default function V5SkanerNakazuPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="Skaner nakazu · Procedural intelligence"
        headline="Wczytaj nakaz — wyjdź ze sprzeciwem."
        body="OCR + NLP + retrieval z bazy 14 000 orzeczeń. Audit-grade reasoning. Win-probability score. EPUAP signature. Wszystko w 12 minut."
        ctas={[
          { label: "Wczytaj nakaz teraz", href: "/skaner-nakazu" },
          { label: "Zobacz demo", href: "/v5/jak-to-dziala" },
        ]}
        meta={
          <div className="flex flex-wrap gap-2">
            <V5Pill tone="ai">412ms OCR</V5Pill>
            <V5Pill tone="ok">78% średnia win-rate</V5Pill>
            <V5Pill tone="audit">Ed25519 audit chain</V5Pill>
          </div>
        }
      />

      <V5StatBand
        stats={[
          { value: "412ms", label: "Czas OCR + NLP", sub: "p50 latency" },
          { value: "78%", label: "Średnia win-rate", sub: "vs 41% bez AI" },
          { value: "14 000+", label: "Orzeczeń w bazie", sub: "SN + SA + SO" },
          { value: "0.03%", label: "Error rate", sub: "30-day SLO" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="Co dzieje się pod maską"
        heading="Pełny pipeline od skanu do sprzeciwu"
        features={[
          { title: "1. OCR (Tesseract + custom NLP)", body: "Rozpoznanie sygnatury, kwoty, wierzyciela, podstawy prawnej. 412ms na 1 stronę.", pill: "AI" },
          { title: "2. Klasyfikacja modułu", body: "AI decyduje: D1 sprzeciw EPU? D2 skarga? D3 zarzut cesji? — automatycznie." },
          { title: "3. Retrieval (vector DB)", body: "Wyszukiwanie podobnych spraw + orzecznictwa. Cosine similarity > 0.85.", pill: "vector" },
          { title: "4. IRAC reasoning", body: "Issue → Rule → Application → Conclusion. Każdy krok udokumentowany.", pill: "audit" },
          { title: "5. Win-probability engine", body: "Bayesian model na 847+ podobnych sprawach. Wynik 0-100% + lista czynników." },
          { title: "6. Pismo + EPUAP signature", body: "PDF + XML do e-Sądu. Podpis kwalifikowany lub EPUAP. Audit chain Ed25519.", pill: "Ed25519" },
        ]}
      />

      <V5StepsList
        eyebrow="Twoja perspektywa"
        heading="3 kroki od skanu do wysłanego sprzeciwu"
        steps={[
          { title: "Wczytaj PDF lub zrób zdjęcie", body: "Drop-zone w przeglądarce lub mobile camera. AI obsługuje słabej jakości skany.", meta: "0:00 → 0:30" },
          { title: "AI wykonuje pełną analizę", body: "OCR + klasyfikacja + retrieval + reasoning. 412ms total. Widzisz każdy krok.", meta: "0:30 → 1:30" },
          { title: "Zatwierdź i wyślij", body: "Edytor live preview. Kliknij Sign with EPUAP. Sprzeciw idzie do e-Sądu.", meta: "1:30 → 12:00" },
        ]}
      />

      <V5Faq
        eyebrow="FAQ"
        heading="Najczęstsze pytania o Skaner"
        items={[
          { q: "Czy skaner obsługuje zdjęcie z telefonu?", a: "Tak. Custom NLP poradzi sobie ze słabymi skanami, przekrzywieniami, częściowo widoczną treścią." },
          { q: "Co jeśli AI źle rozpozna kwotę?", a: "Widzisz wynik OCR przed przejściem do generowania. Możesz poprawić każde pole manualnie." },
          { q: "Czy skaner działa dla wszystkich rodzajów nakazów?", a: "EPU, nakazy zapłaty z postępowania upominawczego, postępowania nakazowego, z wekslem — wszystkie." },
          { q: "Jak długo przechowujecie skany?", a: "30 dni w plan Solo, 1 rok w plan Pro. Możesz usunąć w każdym momencie (RODO art. 17)." },
        ]}
      />

      <V5CtaBand
        eyebrow="Skaner gotowy"
        headline="Wczytaj nakaz teraz. Sprzeciw za 12 minut."
        ctas={[
          { label: "Wczytaj nakaz", href: "/skaner-nakazu" },
          { label: "Cennik", href: "/v5/cennik", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
