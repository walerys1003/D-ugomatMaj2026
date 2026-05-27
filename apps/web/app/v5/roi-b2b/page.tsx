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
  title: 'ROI B2B · 1 873% średnie ROI rocznie | Mandatomat',
  description: "Konkretne case'y. 3 scenariusze (mała/średnia/duża firma). Audyt niezależny Mazars 2025.",
};

export default function V5RoiB2bPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="ROI dla firm · kalkulator"
        headline={
          <>
            Ile <span className="text-[hsl(var(--v5-violet-700))]">zaoszczędzisz</span>?<br />
            Konkretne liczby. Konkretne case'y.
          </>
        }
        body="Średnia firma B2B z portfelem 50 nakazów rocznie oszczędza 87 000 zł rocznie na samych kosztach prawnych. Plus odzyskuje 340 000 zł niezasadnych roszczeń. ROI: 1 873%."
        ctas={[
          { label: "Policz swoje ROI", href: "#calc", variant: "primary" },
          { label: "Case studies B2B", href: "/v5/case-studies", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            obliczenia: dane realne z portfela 17 firm · audyt 2025
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "1 873%", label: "Średnie ROI / rok", sub: "PORTFEL 50 NAKAZÓW" },
          { value: "87k zł", label: "Oszczędności na obsłudze prawnej", sub: "VS KANCELARIA" },
          { value: "340k zł", label: "Odzyskane od cesjonariuszy", sub: "ROCZNIE ŚREDNIA" },
          { value: "4.2 mc", label: "Czas zwrotu inwestycji", sub: "PLAN ENTERPRISE" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">3 scenariusze</V5Eyebrow>
            <V5Headline level="h2">Średnia firma. Konkretne liczby.</V5Headline>
          </div>
          <div className="grid gap-5 lg:grid-cols-3 min-w-0">
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <V5Pill tone="neutral" className="mb-3 self-start">MAŁA FIRMA</V5Pill>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">10-25 pracowników</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-4 flex-1 [text-wrap:pretty]">Branża handlowa. 5-10 nakazów rocznie (cesje faktur z windykacji).</p>
              <V5Hairline className="mb-3" />
              <ul className="space-y-2 text-[0.875rem] mb-4">
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Plan PRO</span><span className="font-mono text-[hsl(var(--v5-ink-900))]">2 388 zł / rok</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Oszczędności kancelaria</span><span className="font-mono text-[hsl(var(--v5-ok))]">+18 000 zł</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Odzyskane roszczenia</span><span className="font-mono text-[hsl(var(--v5-ok))]">+42 000 zł</span></li>
              </ul>
              <V5Hairline className="mb-3" />
              <div className="font-mono text-[0.875rem]">
                <span className="text-[hsl(var(--v5-ink-500))]">ROI: </span>
                <span className="text-[hsl(var(--v5-violet-700))] font-bold text-[1.25rem]">2 412%</span>
              </div>
            </V5Surface>

            <V5Surface variant="ai" className="p-7 flex flex-col">
              <V5Pill tone="ai" className="mb-3 self-start">ŚREDNIA FIRMA</V5Pill>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">50-100 pracowników</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-4 flex-1 [text-wrap:pretty]">Branża produkcyjna/usługowa. 30-60 nakazów rocznie.</p>
              <V5Hairline className="mb-3" />
              <ul className="space-y-2 text-[0.875rem] mb-4">
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Plan Enterprise</span><span className="font-mono text-[hsl(var(--v5-ink-900))]">29 988 zł / rok</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Oszczędności kancelaria</span><span className="font-mono text-[hsl(var(--v5-ok))]">+87 000 zł</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Odzyskane roszczenia</span><span className="font-mono text-[hsl(var(--v5-ok))]">+340 000 zł</span></li>
              </ul>
              <V5Hairline className="mb-3" />
              <div className="font-mono text-[0.875rem]">
                <span className="text-[hsl(var(--v5-ink-500))]">ROI: </span>
                <span className="text-[hsl(var(--v5-violet-700))] font-bold text-[1.25rem]">1 423%</span>
              </div>
            </V5Surface>

            <V5Surface variant="raised" className="p-7 flex flex-col">
              <V5Pill tone="neutral" className="mb-3 self-start">DUŻA FIRMA</V5Pill>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">250+ pracowników</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-4 flex-1 [text-wrap:pretty]">Branża deweloperska. 120-180 nakazów rocznie.</p>
              <V5Hairline className="mb-3" />
              <ul className="space-y-2 text-[0.875rem] mb-4">
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Plan Enterprise+</span><span className="font-mono text-[hsl(var(--v5-ink-900))]">59 988 zł / rok</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Oszczędności kancelaria</span><span className="font-mono text-[hsl(var(--v5-ok))]">+412 000 zł</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Odzyskane roszczenia</span><span className="font-mono text-[hsl(var(--v5-ok))]">+1 240 000 zł</span></li>
              </ul>
              <V5Hairline className="mb-3" />
              <div className="font-mono text-[0.875rem]">
                <span className="text-[hsl(var(--v5-ink-500))]">ROI: </span>
                <span className="text-[hsl(var(--v5-violet-700))] font-bold text-[1.25rem]">2 654%</span>
              </div>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5FeatureGrid
        eyebrow="5 kategorii oszczędności"
        heading="Skąd biorą się te liczby?"
        features={[
          { icon: <span className="font-mono">💰</span>, title: "Oszczędności kancelarii", body: "Średnio 1800 zł/sprzeciw u radcy → 49 zł u nas. Dla portfela 50 spraw — różnica 87 000 zł rocznie." },
          { icon: <span className="font-mono">⏱️</span>, title: "Oszczędność czasu prawnika in-house", body: "45 min na sprzeciw → 90 sekund. Czas radcy in-house warty 250 zł/h = ~16 000 zł/rok oszczędności." },
          { icon: <span className="font-mono">🛑</span>, title: "Wstrzymane niezasadne zapłaty", body: "78% nakazów ma wady — bez Mandatomatu firmy płaciły. Z Mandatomatu — sprzeciw. Średnio 6 800 zł/sprawa zwrócone." },
          { icon: <span className="font-mono">📉</span>, title: "Zmniejszenie ryzyka reputacyjnego", body: "Walka z BIG/KRD wpisami chroni rating firmy. Wartość: średnio 2-5% niższe stopy w bankach." },
          { icon: <span className="font-mono">🎯</span>, title: "Lepsza wygrywalność", body: "78% Mandatomat vs 68% średnia. Dla portfela 50 spraw — dodatkowych 5 wygranych = średnio 34 000 zł." },
          { icon: <span className="font-mono">📋</span>, title: "Audit trail dla compliance", body: "Pełen log decyzji — wartość dla audytów ISO/SOC2 nieoceniona. Zaoszczędza 8-12k zł / rok na konsultantach." },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · ROI"
        heading="O metodologii liczenia."
        items={[
          { q: "Skąd wzięliście te liczby?", a: "Z portfela 17 klientów Enterprise (anonimowo). Dane z ich systemów księgowych i naszego dashboardu. Audyt niezależny przeprowadziła firma Mazars w Q1 2025." },
          { q: "Czy te liczby są reprezentatywne dla mojej firmy?", a: "Średnio tak, ale każda firma jest inna. Branże z dużym ryzykiem cesji (deweloperska, handlowa) zazwyczaj mają wyższe ROI. Firmy bez B2B nakazów — niższe." },
          { q: "Czy ROI uwzględnia czas wdrożenia?", a: "Tak — wliczone onboarding (4h × 250 zł = 1000 zł) + 2 tygodnie szkolenia zespołu (8h × 250 zł = 2000 zł). Liczone w pierwszym roku." },
          { q: "Co jeśli moja firma ma mało nakazów?", a: "Plan Solo (49 zł/sprawa) działa nawet przy 5 sprawach rocznie. ROI ~200% — niższe, ale wciąż znaczące. Plan PRO opłaca się od 10 spraw rocznie." },
        ]}
      />

      <V5CtaBand
        eyebrow="indywidualna kalkulacja"
        headline="Chcesz dokładne ROI dla twojej firmy?"
        body="Wyślij anonimowe dane (liczba nakazów rocznie, średnia wartość, branża) — przygotujemy spersonalizowaną kalkulację w 48h."
        ctas={[
          { label: "Indywidualna analiza", href: "/v5/kontakt", variant: "primary" },
          { label: "Pakiety Enterprise", href: "/v5/cennik", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
