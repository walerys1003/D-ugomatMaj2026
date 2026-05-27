import type { Metadata } from "next";
import {
  V5MarketingLayout,
  V5HeroSimple,
  V5StatBand,
  V5FeatureGrid,
  V5StepsList,
  V5Faq,
  V5CtaBand,
  V5Testimonial,
  V5ComparisonTable,
  V5PricingTier,
  V5SocialProofStrip,
  V5IconBullet,
  V5Logos,
} from "@/components/v5/marketing";
import {
  V5Container,
  V5Section,
  V5Surface,
  V5Eyebrow,
  V5Headline,
  V5Body,
  V5Pill,
  V5Hairline,
  V5Button,
} from "@/components/v5/primitives";

export const metadata: Metadata = {
  title: 'Precedensy · baza 14k wyroków SN i SA z AI search | Mandatomat',
  description: '14 000 wyroków SN i SA. Pełnotekstowe wyszukiwanie semantyczne. Aktualizacja codzienna.',
};

export default function V5PrecedensyPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="precedensy · orzecznictwo SN/SA"
        headline={
          <>
            14 000 wyroków SN i SA.<br />
            <span className="text-[hsl(var(--v5-violet-700))]">Pełnotekstowe wyszukiwanie</span> z AI.
          </>
        }
        body="Baza orzecznictwa Sądu Najwyższego i sądów apelacyjnych w sprawach konsumenckich i windykacyjnych. Wyszukiwanie semantyczne — pytaj zwykłym językiem."
        ctas={[
          { label: "Szukaj w precedensach", href: "#search", variant: "primary" },
          { label: "Najnowsze wyroki", href: "#latest", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            update: codziennie · źródło: bazy SN/SA + LEX
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "14 247", label: "Wyroków SN/SA w bazie", sub: "STAN 27.05.2026" },
          { value: "+47", label: "Nowych wyroków / tydzień", sub: "ŚREDNIA 12 MC" },
          { value: "0.18s", label: "Czas wyszukiwania", sub: "VECTOR SEARCH" },
          { value: "94%", label: "Dokładność cytowania", sub: "AUDYT QA" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="jak działa baza"
        heading="Wyszukiwanie nowej generacji."
        features={[
          { icon: <span className="font-mono">🔍</span>, title: "Wyszukiwanie semantyczne", body: "Pytaj zwykłym językiem: 'kiedy SN uznał przedawnienie cesji'. AI rozumie intencję, nie tylko słowa kluczowe.", pill: "AI" },
          { icon: <span className="font-mono">📋</span>, title: "Pełne teksty wyroków", body: "Nie tylko tezy — pełne uzasadnienia, składy, daty rozpraw. Wyroki w formie HTML + PDF." },
          { icon: <span className="font-mono">🏷️</span>, title: "Tagi i kategorie", body: "Każdy wyrok otagowany: typ roszczenia, charakter strony, rok, sąd. Filtruj 1-klikiem.", pill: "47 TAGÓW" },
          { icon: <span className="font-mono">🔗</span>, title: "Cross-reference", body: "Każdy wyrok pokazuje powiązane wyroki, artykuły KC/KPC, komentarze ekspertów." },
          { icon: <span className="font-mono">💾</span>, title: "Eksport do sprzeciwu", body: "Wybrane wyroki — eksport do PDF lub bezpośrednio do generatora sprzeciwu AI." },
          { icon: <span className="font-mono">📈</span>, title: "Trendy orzecznicze", body: "Czy SN zaostrza/łagodzi linię? Wykresy zmian orzecznictwa w czasie." },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">3 kluczowe wyroki</V5Eyebrow>
            <V5Headline level="h2">Najczęściej cytowane w sprzeciwach.</V5Headline>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 min-w-0">
            <V5Surface variant="raised" className="p-6">
              <V5Pill tone="ai" className="mb-3">SN 2024</V5Pill>
              <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-2">III CZP 18/24</div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Przedawnienie cesji</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))]">SN: cesja nie przerywa biegu przedawnienia. Cesjonariusz wchodzi w sytuację cedenta.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <V5Pill tone="ai" className="mb-3">SA WAW 2025</V5Pill>
              <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-2">VI ACa 312/25</div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Doręczenie EPU</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))]">SA: brak skutecznego doręczenia nakazu = sprzeciw w terminie 14 dni od faktycznego dowiedzenia się.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <V5Pill tone="ai" className="mb-3">SN 2025</V5Pill>
              <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))] mb-2">II CSK 89/25</div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Legitymacja cesjonariusza</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))]">SN: cesjonariusz musi dowieść skuteczność cesji. Brak dowodu = sprawa do oddalenia.</p>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5Faq
        eyebrow="FAQ · precedensy"
        heading="O bazie orzecznictwa."
        items={[
          { q: "Skąd bierzecie wyroki?", a: "Oficjalne bazy: orzeczenia.sn.pl, orzeczenia sądów apelacyjnych, LEX (subskrypcja Enterprise), Legalis. Każdy wyrok ma link do źródła." },
          { q: "Czy baza jest aktualna?", a: "Codzienna aktualizacja — bot pobiera nowe wyroki z baz SN/SA. Pełny pipeline: pobranie → klasyfikacja → tagi → indeksacja w 24h." },
          { q: "Czy mogę cytować wyroki w sprzeciwie?", a: "Tak — to jest właśnie cel. W planach Solo/PRO generator AI automatycznie cytuje znalezione wyroki w sprzeciwie." },
          { q: "Czy macie wyroki sądów rejonowych/okręgowych?", a: "Tylko wyroki publikowane — głównie SN, SA. Wyroki SO i SR rzadko publikowane, ale jeśli istnieją w bazach, są indeksowane." },
        ]}
      />

      <V5CtaBand
        eyebrow="darmowy dostęp · zaloguj się"
        headline="14 000 wyroków SN i SA. Wyszukiwanie semantyczne. Darmowe na zawsze."
        body="Założenie konta zajmuje 30 sekund. Pełen dostęp do bazy precedensów, bez opłat, bez subskrypcji."
        ctas={[
          { label: "Załóż darmowe konto", href: "/skaner-nakazu", variant: "primary" },
          { label: "Zobacz przykładowy wyrok", href: "#", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
