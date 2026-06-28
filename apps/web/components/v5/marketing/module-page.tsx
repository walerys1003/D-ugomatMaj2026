/**
 * V5-INFRA · Module page template (Wave 5 · Agent B2)
 * --------------------------------------------------------------------------
 * Single source of truth for module pages. Mounts under /v5/moduly/[slug].
 */
import * as React from "react";

import { V5MarketingLayout, V5HeroSimple, V5FeatureGrid, V5StepsList, V5Faq, V5CtaBand, V5StatBand, V5Testimonial } from "@/components/v5/marketing";
import { V5Container, V5Pill, V5Section } from "@/components/v5/primitives";
import { V5Reveal } from "@/components/v5/motion";
import { V5FaqJsonLd, V5ServiceJsonLd } from "@/components/v5/seo/json-ld";

export type ModulePageData = {
  slug: string;
  code: string;          // "D1", "D2", ...
  eyebrow: string;       // "Moduł D1 · Sprzeciw od EPU"
  headline: string;
  body: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  stats: { value: string; label: string; sub?: string }[];
  features: { icon?: React.ReactNode; title: string; body: string; pill?: string }[];
  steps: { title: string; body: string; meta?: string }[];
  faq: { q: string; a: string }[];
  testimonial?: { quote: string; author: string; role?: string; org?: string };
  legalBasis: { article: string; label: string }[];
};

export function V5ModulePage({ data }: { data: ModulePageData }) {
  return (
    <V5MarketingLayout>
      {/* SEO: Schema.org Service + FAQ JSON-LD */}
      <V5ServiceJsonLd
        name={`Mandatomat ${data.code} — ${data.eyebrow}`}
        description={data.body}
        serviceType="LegalService"
      />
      <V5FaqJsonLd items={data.faq} />

      <V5HeroSimple
        eyebrow={data.eyebrow}
        headline={data.headline}
        body={data.body}
        ctas={[
          data.ctaPrimary,
          ...(data.ctaSecondary ? [data.ctaSecondary] : []),
        ]}
        meta={
          <div className="flex flex-wrap gap-2">
            {data.legalBasis.map((l) => (
              <V5Pill key={l.article} tone="audit">
                {l.article} · {l.label}
              </V5Pill>
            ))}
          </div>
        }
      />

      <V5StatBand stats={data.stats} />

      <V5FeatureGrid
        eyebrow="Co dostajesz"
        heading="Procedural intelligence — pełny zestaw"
        features={data.features}
        cols={3}
      />

      <V5StepsList
        eyebrow="Jak to działa"
        heading={`Proces ${data.code} · 4 kroki, 12 minut`}
        steps={data.steps}
      />

      {data.testimonial && (
        <V5Section density="compact">
          <V5Container width="content">
            <V5Reveal>
              <V5Testimonial {...data.testimonial} />
            </V5Reveal>
          </V5Container>
        </V5Section>
      )}

      <V5Faq
        eyebrow="FAQ"
        heading="Najczęstsze pytania"
        items={data.faq}
      />

      <V5CtaBand
        eyebrow={`Moduł ${data.code} · gotowy do działania`}
        headline={`Wygeneruj ${data.code} w 12 minut`}
        body="AI-native legal infrastructure. Audit-grade reasoning. Signed evidence chain."
        ctas={[
          { label: data.ctaPrimary.label, href: data.ctaPrimary.href, variant: "primary" },
          { label: "Zobacz cennik", href: "/v5/cennik", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
