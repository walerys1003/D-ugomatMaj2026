import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5FeatureGrid, V5StepsList, V5Faq, V5CtaBand, V5Testimonial, V5SocialProofStrip } from "@/components/v5/marketing";

export const metadata: Metadata = {
  title: "Mandatomat dla firm · audyt nakazów B2B w 24h",
  description: "Twoja firma dostała nakaz? Audyt prawny w 24h. Wykrycie przedawnień, generator sprzeciwu B2B, integracja z księgowością.",
};

export default function V5DlaFirmPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="dla firm · księgowe + windykacja własna"
        headline={
          <>
            Twoja firma dostała nakaz?<br />
            Nie płać dopóki nie sprawdzisz <span className="text-[hsl(var(--v5-violet-700))]">czy to prawda</span>.
          </>
        }
        body="78% nakazów wystawianych przez firmy windykacyjne ma poważne wady prawne — przedawnienie, brak legitymacji procesowej, niewłaściwe doręczenie. Sprawdź swoje nakazy przed zapłatą."
        ctas={[
          { label: "Audyt nakazów w 24h", href: "/skaner-nakazu", variant: "primary" },
          { label: "Cennik B2B", href: "/v5/cennik", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            faktura VAT · NDA standard · księgowość gotowa
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "412ms", label: "Średni czas OCR", sub: "PER NAKAZ" },
          { value: "<24h", label: "Czas raportu audytu", sub: "GWARANCJA" },
          { value: "78%", label: "Skuteczność sprzeciwów", sub: "DANE 2025" },
          { value: "0 zł", label: "Audyt pierwszego nakazu", sub: "BEZ ZOBOWIĄZAŃ" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="dla biznesu"
        heading="Co Mandatomat robi dla firm?"
        features={[
          { icon: <span className="font-mono">📋</span>, title: "Audyt nakazu", body: "Pełna analiza prawna każdego nakazu skierowanego do twojej firmy — w 24h od skanu.", pill: "EXPRESS" },
          { icon: <span className="font-mono">⚠️</span>, title: "Wykrycie przedawnień", body: "Automatyczna identyfikacja roszczeń przedawnionych — w B2B to 2 lata (art. 554 k.c.).", pill: "RAG" },
          { icon: <span className="font-mono">🏛️</span>, title: "Generator sprzeciwu B2B", body: "Sprzeciw uwzględniający specyfikę B2B — czynności w obrocie gospodarczym, faktury, salda." },
          { icon: <span className="font-mono">📊</span>, title: "Raport zarządczy PDF", body: "Raport dla zarządu — koszt sprawy, prawdopodobieństwo wygranej, rekomendacja działań.", pill: "C-LEVEL" },
          { icon: <span className="font-mono">🔌</span>, title: "Integracja z księgowością", body: "Eksport CSV/XML do iFirma, Comarch ERP, Symfonia. API dla własnych systemów." },
          { icon: <span className="font-mono">🛡️</span>, title: "Ochrona reputacji", body: "Walka o usunięcie wpisów z BIG/KRD po wygranym sprzeciwie. Zgodność z RODO." },
        ]}
      />

      <V5StepsList
        eyebrow="proces · 4 kroki"
        heading="Jak to wygląda w twojej firmie?"
        steps={[
          { title: "Audyt + NDA", body: "Wysyłasz PDF nakazu mailem lub przez panel. Podpisujemy NDA. Audyt prawny w 24h." },
          { title: "Raport + rekomendacja", body: "Otrzymujesz raport zarządczy: koszt, ryzyko, prawdopodobieństwo, rekomendacja (zapłacić/walczyć)." },
          { title: "Generator sprzeciwu", body: "Jeśli walka — generujemy gotowy sprzeciw + załączniki. Twój księgowy lub prawnik tylko podpisuje." },
          { title: "Submit + monitoring", body: "Składamy do sądu (ePUAP) lub przez kuriera. Monitorujemy postępy. Reagujemy na pisma." },
        ]}
      />

      <V5SocialProofStrip
        label="Zaufały nam firmy"
        names={["Kancelaria Bek-Bek", "Spółdzielnia Mieszkaniowa Bałtyk", "FHU MarTrans", "Bistro Pierogarnia 12", "Hotel Wschód *", "Drogeria Adriana", "DAM-BUD Sp. z o.o.", "PHU Karol Olszewski"]}
      />

      <V5Testimonial
        quote="Mandatomat zaoszczędził naszej firmie 47 000 zł. Cesjonariusz wystawił nakaz na fakturę z 2019 roku, którą my zapłaciliśmy w 2020. AI w 8 minut znalazło dowód zapłaty w naszych systemach i wygenerowało sprzeciw. Sąd odrzucił nakaz po 6 tygodniach."
        author="Marek Boczarski"
        role="Prezes zarządu"
        org="DAM-BUD Sp. z o.o."
      />

      <V5Faq
        eyebrow="FAQ · firmy"
        heading="Pytania od księgowych, prezesów, prawników in-house."
        items={[
          { q: "Czy podpisujecie NDA przed wysłaniem dokumentów?", a: "Tak — standardowe NDA wysyłamy w 1h po zgłoszeniu. Dla większych klientów również NDA na warunkach klienta po review prawnym (max 48h)." },
          { q: "Jak długo trwa pełen audyt nakazu B2B?", a: "Standard: 24h od otrzymania PDF. Express (płatność dodatkowa): 4h. W pilnych przypadkach (np. ostatni dzień na sprzeciw) — w godzinę." },
          { q: "Czy macie integrację z naszą księgowością?", a: "Tak — bezpośrednie integracje z iFirma, Comarch Optima/ERP, Symfonia, wfirma, fakturownia. Dla custom ERP — API REST + Webhook." },
          { q: "Czy nasz prawnik może korzystać z systemu?", a: "Tak — plan Enterprise zawiera multi-seat (5+ użytkowników z różnymi rolami). Prawnik ma pełen dostęp do raportów i może akceptować/odrzucać generowane sprzeciwy." },
          { q: "Czy obsługujecie sprawy z firmami zagranicznymi?", a: "Tak — sprawy z UE (Brussels I, EuKWN) oraz spoza UE (Konwencja haska). Zespół prawników z doświadczeniem cross-border." },
        ]}
      />

      <V5CtaBand
        eyebrow="zaproś księgowego · zaproś prezesa"
        headline="Twoja firma zasługuje na obronę. Audyt pierwszego nakazu jest darmowy."
        body="Wyślij PDF nakazu mailem na audit@mandatomat.pl lub wgraj w panelu. Otrzymasz raport zarządczy w 24h. Bez zobowiązań."
        ctas={[
          { label: "Audyt darmowy 24h", href: "/skaner-nakazu", variant: "primary" },
          { label: "Umów rozmowę B2B", href: "/v5/kontakt", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
