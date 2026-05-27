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
  title: 'Kontakt · pisz do nas, odpowiadamy w 4h | Mandatomat',
  description: '6 kanałów kontaktu. Biuro Warszawa. Odpowiedź email w 4h (PRO) lub 24h (Free).',
};

export default function V5KontaktPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="kontakt · pisz do nas"
        headline={
          <>
            Napisz do nas. <span className="text-[hsl(var(--v5-violet-700))]">Odpowiadamy w 4h</span> (PRO) lub 24h (Free).
          </>
        }
        body="Wszystkie kanały kontaktu w jednym miejscu. Wybierz odpowiednie ze względu na pilność i temat. Bez bota — odpowiada żywy człowiek."
        ctas={[
          { label: "Napisz email", href: "mailto:hello@mandatomat.pl", variant: "primary" },
          { label: "Umów rozmowę", href: "#schedule", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            biuro: pon-pt 9:00-17:00 · email: 24/7
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "4h", label: "Średni czas odpowiedzi PRO", sub: "GODZINY ROBOCZE" },
          { value: "24h", label: "Średni czas odpowiedzi Free", sub: "7 DNI" },
          { value: "9", label: "Osób w support team", sub: "POLSKI + ENG" },
          { value: "98%", label: "Pozytywnych ocen", sub: "CSAT SCORE" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="6 kanałów"
        heading="Wybierz najlepszy dla siebie."
        features={[
          { icon: <span className="font-mono">✉️</span>, title: "Email ogólny", body: "hello@mandatomat.pl — wszystko, co nie jest pilne. Odpowiedź w 24h.", pill: "GENERAL" },
          { icon: <span className="font-mono">🚨</span>, title: "Pilne · sprawa prawna", body: "urgent@mandatomat.pl — ostatni dzień na sprzeciw, awaria krytyczna. Odpowiedź w 4h.", pill: "URGENT" },
          { icon: <span className="font-mono">💼</span>, title: "B2B + Enterprise", body: "enterprise@mandatomat.pl — kancelarie, firmy 50+, NDA, custom contracts. Odpowiedź w 2h.", pill: "B2B" },
          { icon: <span className="font-mono">🛡️</span>, title: "Bezpieczeństwo + RODO", body: "security@mandatomat.pl, iod@mandatomat.pl — zgłoszenia incydentów, żądania RODO." },
          { icon: <span className="font-mono">👔</span>, title: "Praca", body: "jobs@mandatomat.pl — CV + krótkie info o tobie. ML engineers, prawnicy, designerzy, staże." },
          { icon: <span className="font-mono">📰</span>, title: "Prasa + media", body: "press@mandatomat.pl — wywiady, dane statystyczne, prelekcje. Press kit w 24h." },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="content">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">biuro · Warszawa</V5Eyebrow>
            <V5Headline level="h2">Możesz przyjść osobiście (po umówieniu).</V5Headline>
          </div>
          <V5Surface variant="raised" className="p-8">
            <div className="grid gap-8 sm:grid-cols-2 min-w-0">
              <div>
                <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mb-3">adres</div>
                <p className="text-[1rem] text-[hsl(var(--v5-ink-900))] mb-1">Mandatomat sp. z o.o.</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">ul. Wspólna 47/15</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">00-684 Warszawa</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Polska</p>
              </div>
              <div>
                <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mb-3">dane prawne</div>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">NIP: 7011234567</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">REGON: 525123456</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">KRS: 0001012345</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Kapitał: 250 000 zł</p>
              </div>
            </div>
            <V5Hairline className="my-6" />
            <div className="font-mono text-[0.875rem] text-[hsl(var(--v5-ink-500))]">
              godziny biura: <span className="text-[hsl(var(--v5-ink-900))]">pon-pt 9:00-17:00</span> · spotkania osobiste tylko po wcześniejszym umówieniu (link Calendly w mailu)
            </div>
          </V5Surface>
        </V5Container>
      </V5Section>

      <V5Faq
        eyebrow="FAQ · kontakt"
        heading="Częste pytania."
        items={[
          { q: "Czy mogę zadzwonić zamiast pisać?", a: "Plan Free/Solo: nie — to byłby brak skalowania. Plan PRO: tak, 30 min/mc na rozmowę video z support. Plan Enterprise: tak, dedykowany Customer Success Manager, dostępny telefonicznie 9-17." },
          { q: "Jak długo czeka się na odpowiedź?", a: "Email: 24h (Free), 4h (PRO), 1h (Enterprise). Wszystkie odpowiadane w godzinach roboczych (9-17 pon-pt). Krytyczne sprawy — telefon awaryjny dla Enterprise 24/7." },
          { q: "Czy mogę przyjść do biura bez umawiania?", a: "Nie polecamy — zespół pracuje hybrydowo, biuro jest częściowo pusto. Po umówieniu (Calendly link w mailu) zawsze ktoś będzie." },
          { q: "Czy odpowiada bot czy człowiek?", a: "ZAWSZE człowiek. Nie używamy chatbotów. Czasem AI sugeruje supportowi pierwszą wersję odpowiedzi, ale każda jest reviewed i wysyłana przez konkretnego specjalistę." },
        ]}
      />

      <V5CtaBand
        eyebrow="zacznij teraz"
        headline="Napisz: hello@mandatomat.pl"
        body="Albo zacznij od skanu nakazu — może odpowiedź jest już w naszej bazie wiedzy."
        ctas={[
          { label: "Wyślij email", href: "mailto:hello@mandatomat.pl", variant: "primary" },
          { label: "Skanuj nakaz", href: "/skaner-nakazu", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
