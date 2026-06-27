import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5FeatureGrid, V5Faq, V5CtaBand, V5Testimonial, V5ComparisonTable } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: 'Mandatomat dla kancelarii · 10× szybciej, 5× więcej wygranych',
  description: 'AI-native legal OS dla kancelarii. Batch processing 50 nakazów, RAG z bazą 14k wyroków, SSO, audit log.',
};

export default function V5DlaKancelariiPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="dla kancelarii · adwokaci + radcowie"
        headline={
          <>
            10× szybszy <span className="text-[hsl(var(--v5-violet-700))]">research</span>.<br />
            5× więcej <span className="text-[hsl(var(--v5-violet-700))]">wygranych</span>.
          </>
        }
        body="Mandatomat to AI-native legal OS dla kancelarii prowadzących sprawy z firmami windykacyjnymi. Skanuj 50 nakazów dziennie zamiast 5. Generuj sprzeciwy w 90 sekund."
        ctas={[
          { label: "Demo dla kancelarii", href: "/v5/kontakt", variant: "primary" },
          { label: "Plan Enterprise", href: "/v5/cennik", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            SSO · audit log · API · onboarding 4h
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "90s", label: "Średni czas generacji sprzeciwu", sub: "VS 45 MIN MANUAL" },
          { value: "10×", label: "Wzrost wydajności kancelarii", sub: "DANE 4 KANCELARII" },
          { value: "82%", label: "Wygrywalność (kancelarie PRO)", sub: "VS 78% ŚREDNIA" },
          { value: "14k", label: "Wyroków SN/SA w bazie RAG", sub: "AKTUALIZACJA TYG." },
        ]}
      />

      <V5FeatureGrid
        eyebrow="dla profesjonalistów"
        heading="Funkcje, których adwokaci faktycznie używają."
        cols={3}
        features={[
          { icon: <span className="font-mono">⚡</span>, title: "Batch processing", body: "Wgraj 50 nakazów na raz. AI klasyfikuje, ocenia szanse, generuje pierwsze drafty równolegle.", pill: "BATCH" },
          { icon: <span className="font-mono">📚</span>, title: "RAG z bazą wyroków", body: "Retrieval z bazy 14 000+ wyroków SN/SA/SO. Cytaty automatyczne, weryfikacja przed wstawieniem." },
          { icon: <span className="font-mono">✍️</span>, title: "Custom prompty + szablony", body: "Twoje własne style pisma, klauzule, zwroty. AI uczy się stylu kancelarii w ciągu 2 tygodni." },
          { icon: <span className="font-mono">🔐</span>, title: "SSO + role-based access", body: "Aplikant ma inne uprawnienia niż radca. Audit log każdej akcji. Zgodność z OECDA." },
          { icon: <span className="font-mono">🔌</span>, title: "API + integracje", body: "Integracja z LEX, Legalis, Mecenas, Soneta Kancelaria. REST API + Webhooki dla custom." },
          { icon: <span className="font-mono">📊</span>, title: "Dashboard mecenasa", body: "Wszystkie sprawy w jednym widoku. Statusy, deadliny, prawdopodobieństwa wygranej w czasie.", pill: "DASHBOARD" },
        ]}
      />

      <V5ComparisonTable
        eyebrow="praca z AI vs bez"
        heading="Porównanie wydajności kancelarii."
        columns={[
          { label: "Manual" },
          { label: "Mandatomat", highlight: true },
        ]}
        rows={[
          { label: "Czas na 1 sprzeciw", values: ["45 min", "90 sek"] },
          { label: "Sprawy / radca / dzień", values: ["5-8", "40-50"] },
          { label: "Aktualizacja bazy wyroków", values: ["miesiąc", "tygodniowo"] },
          { label: "Wykrycie przedawnień", values: ["manual", "automatyczne"] },
          { label: "Szansa wygranej (śr.)", values: ["68%", "82%"] },
          { label: "Koszt obsługi 1 sprawy", values: ["320 zł", "62 zł"] },
        ]}
      />

      <V5Testimonial
        quote="Po wdrożeniu Mandatomat moja kancelaria obsługuje 6× więcej spraw z windykacją, przy tej samej liczbie radców. AI generuje 80% sprzeciwu — ja dokładam 20% lokalnej wiedzy. Wygrywalność wzrosła z 71% na 84%."
        author="Mecenas Andrzej Rosicki"
        role="Wspólnik zarządzający"
        org="Kancelaria Rosicki & Partnerzy"
      />

      <V5Faq
        eyebrow="FAQ · kancelarie"
        heading="Pytania od radców i adwokatów."
        items={[
          { q: "Czy moja kancelaria pozostaje autorem sprzeciwu?", a: "Tak — AI tworzy draft, który podpisujesz ty. Mandatomat jest narzędziem twojej pracy, nie zastępcą. Etyka zawodowa zachowana." },
          { q: "Czy AI cytuje wyroki, których nie ma?", a: "Nie — system używa RAG (Retrieval Augmented Generation) z weryfikacją przed cytowaniem. Każdy wyrok jest sprawdzany w bazie LEX/Legalis. Brak halucynacji." },
          { q: "Jak dokładnie wygląda onboarding kancelarii?", a: "4h: 1h prezentacja, 1h konfiguracja konta (style pism, role, SSO), 2h training na 5 realnych sprawach kancelarii. Plus 2 tygodnie supportu z dedykowanym CS." },
          { q: "Czy mogę używać Mandatomatu z LEX/Legalis?", a: "Tak — integracje direct (API LEX, API Legalis). Wyniki AI mogą być cytowane wraz z numerami LEX/Legalis." },
          { q: "Czy dostarczacie certyfikat zgodności z RODO?", a: "Tak — pełna dokumentacja DPA (Data Processing Agreement), audyt UODO 2024, certyfikat SOC2 Type I (2025), ISO 27001 (planowane Q4 2025)." },
        ]}
      />

      <V5CtaBand
        eyebrow="zacznij prowadzić 50 spraw zamiast 5"
        headline="Demo dla kancelarii. 30 minut. Bez prezentacji marketingowych."
        body="Pokażemy ci konkretne case studies kancelarii Twojego rozmiaru. Twoje pytania, twoje sprawy."
        ctas={[
          { label: "Umów demo", href: "/v5/kontakt", variant: "primary" },
          { label: "Zobacz Enterprise", href: "/v5/cennik", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
