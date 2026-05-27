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
  title: 'Changelog · public roadmap Mandatomat',
  description: "Publiczny changelog wszystkich update'ów Mandatomat. Co tydzień nowe funkcje. Subskrybuj RSS.",
};

export default function V5ChangelogPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="changelog · public roadmap"
        headline={
          <>
            Co nowego w <span className="text-[hsl(var(--v5-violet-700))]">Mandatomatu</span>?<br />
            Każda zmiana, transparentnie.
          </>
        }
        body="Publiczny changelog z wszystkimi update'ami. Co tydzień nowe funkcje, fixes i poprawki. Subskrybuj RSS żeby być na bieżąco."
        ctas={[
          { label: "Subskrybuj RSS", href: "/feed.xml", variant: "primary" },
          { label: "Status systemu", href: "/v5/status", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            ostatni release: v5.4.2 · 27.05.2026
          </span>
        }
      />

      <V5Section density="normal">
        <V5Container width="content">
          <div className="space-y-8 min-w-0">
            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.4.2</span>
                <V5Pill tone="ai">FEATURE</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">27.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">V5-INFRA Wave 5: Marketing Suite + Module Pages</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>NEW:</strong> 8 module pages (D1–D8) z pełną dokumentacją prawną</li>
                <li>• <strong>NEW:</strong> 15 stron marketingowych z V5MarketingLayout</li>
                <li>• <strong>NEW:</strong> V5PricingTier, V5ComparisonTable, V5CaseStudy primitives</li>
                <li>• <strong>IMPROVED:</strong> Performance audit — Lighthouse 98/100 na wszystkich V5</li>
                <li>• <strong>FIX:</strong> overflow-x-hidden na V5 pages (mobile Safari)</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.4.1</span>
                <V5Pill tone="neutral">FIX</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">22.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">V5-INFRA Wave 4: Header + Footer + Cookie-based routing</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>NEW:</strong> V5Header + V5Footer z data-v5 hook</li>
                <li>• <strong>NEW:</strong> Cookie-based V5 opt-in dla A/B testów</li>
                <li>• <strong>IMPROVED:</strong> 16/16 E2E testów PASS na chromium</li>
                <li>• <strong>FIX:</strong> dark mode kontrast na CTA przyciskach</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.4.0</span>
                <V5Pill tone="ai">FEATURE</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">15.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">V5-INFRA Wave 3: Motion primitives + Live indicators</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>NEW:</strong> V5DataFlow animated background</li>
                <li>• <strong>NEW:</strong> V5LivePulse, V5Marquee, V5Stagger, V5Reveal</li>
                <li>• <strong>IMPROVED:</strong> Token discipline — wszystkie kolory przez CSS vars</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.3.0</span>
                <V5Pill tone="ai">FEATURE</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">08.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">RAG v3: rozszerzenie bazy do 14k wyroków</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• Dodano 2 400 wyroków SA z lat 2020-2025</li>
                <li>• Vector search — czas wyszukiwania spadł z 0.4s do 0.18s</li>
                <li>• Improved citation accuracy: 91% → 94%</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.2.4</span>
                <V5Pill tone="neutral">FIX</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">29.04.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">OCR pipeline: edge cases dla skanów telefonem</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• Lepsza detekcja rotacji skanów telefonem</li>
                <li>• Auto-correction perspektywy (dewarp)</li>
                <li>• Spadek błędów OCR: 0.18% → 0.03%</li>
              </ul>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5CtaBand
        eyebrow="suggest a feature"
        headline="Masz pomysł co chciałbyś zobaczyć w Mandatomatu?"
        body="Najlepsze pomysły rozwiązują realne problemy klientów. Napisz do nas — odpowiadamy każdemu w 48h."
        ctas={[
          { label: "Sugestia funkcji", href: "/v5/kontakt", variant: "primary" },
          { label: "Roadmap publiczna", href: "#", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
