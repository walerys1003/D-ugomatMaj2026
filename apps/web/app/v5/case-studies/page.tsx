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
  title: 'Case studies · 47 312 wygranych spraw, 8.2 mln zł zaoszczędzone | Mandatomat',
  description: 'Realne sprawy, realne wygrane. 3 lata pracy AI Mandatomatu w sprawach z firmami windykacyjnymi.',
};

export default function V5CaseStudiesPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="case studies · sprawy klientów"
        headline={
          <>
            Realne sprawy. <span className="text-[hsl(var(--v5-violet-700))]">Realne wygrane</span>.<br />
            Realne kwoty zaoszczędzone.
          </>
        }
        body="3 lata pracy Mandatomatu = 47 312 wygranych sprzeciwów. Tu pokazujemy najciekawsze sprawy — anonimizowane, ale prawdziwe. Z dokumentacją."
        ctas={[
          { label: "Zobacz wszystkie", href: "#cases", variant: "primary" },
          { label: "Filtruj po typie", href: "#filters", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            47 312 wygranych · 8.2 mln zł zaoszczędzone · 3 lata
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "47 312", label: "Wygranych sprzeciwów", sub: "3 LATA" },
          { value: "8.2 mln zł", label: "Zaoszczędzone klientom", sub: "ŁĄCZNIE" },
          { value: "173 zł", label: "Średnia oszczędność / sprawę", sub: "MIN: 47 ZŁ, MAX: 89 000 ZŁ" },
          { value: "78%", label: "Wygranych spraw", sub: "AUDYT 2025" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">historie · 3 reprezentatywne</V5Eyebrow>
            <V5Headline level="h2">Sprawy, w których AI zrobiło różnicę.</V5Headline>
          </div>
          <div className="grid gap-5 lg:grid-cols-3 min-w-0">
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <V5Pill tone="ai">D1 · sprzeciw-epu</V5Pill>
                <V5Pill tone="ok">WYGRANA</V5Pill>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">"Cesjonariusz zniknął"</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-3 flex-1 [text-wrap:pretty]">Pani Anna z Wrocławia. Nakaz EPU 23 400 zł od cesjonariusza. AI w 4 min wykryło, że firma straciła licencję KNF 8 mc temu. Sprzeciw oparty na braku legitymacji procesowej.</p>
              <V5Hairline className="mb-3" />
              <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                Zaoszczędzone: <span className="text-[hsl(var(--v5-ok))] font-semibold">23 400 zł</span>
              </div>
            </V5Surface>
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <V5Pill tone="ai">D2 · komornik</V5Pill>
                <V5Pill tone="ok">WYGRANA</V5Pill>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">"Egzekucja świadczenia 800+"</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-3 flex-1 [text-wrap:pretty]">Pan Marek z Lublina. Komornik zajął świadczenie 800+ (zwolnione z egzekucji art. 833 § 6 KPC). Skarga + zawiadomienie sądu opiekuńczego. Środki zwrócone w 11 dni.</p>
              <V5Hairline className="mb-3" />
              <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                Zwrócone: <span className="text-[hsl(var(--v5-ok))] font-semibold">3 200 zł</span>
              </div>
            </V5Surface>
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <V5Pill tone="ai">D4 · BIK</V5Pill>
                <V5Pill tone="ok">USUNIĘTE</V5Pill>
              </div>
              <h3 className="text-[1.125rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">"Negatywny wpis BIK po 12 latach"</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-3 flex-1 [text-wrap:pretty]">Pani Beata z Krakowa. Wpis BIK z 2013 r. blokował kredyt hipoteczny. Wniosek o usunięcie zgodnie z RODO + skarga do UODO. Wpis usunięty w 6 tygodni. Kredyt 480k otrzymany.</p>
              <V5Hairline className="mb-3" />
              <div className="text-[0.75rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
                Efekt: <span className="text-[hsl(var(--v5-ok))] font-semibold">kredyt 480 000 zł</span>
              </div>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5Testimonial
        quote="Wystawili nam nakaz na 89 000 zł za rzekomy dług sprzed 11 lat. AI Mandatomatu w 8 minut zidentyfikowało 3 fundamentalne błędy: przedawnienie (6 lat), brak zawiadomienia o cesji (art. 512 k.c.), niewłaściwy sąd. Sprzeciw zaakceptowany, sprawa umorzona."
        author="Anna Kowalska"
        role="Klientka indywidualna"
        org="Wrocław · sprawa z 03.2025"
      />

      <V5FeatureGrid
        eyebrow="podział spraw"
        heading="Statystyki naszych klientów."
        cols={4}
        features={[
          { title: "Osoby fizyczne", body: "82% naszych klientów. Sprawy z firmami windykacyjnymi, BIK, komornikami.", pill: "82%" },
          { title: "Małe firmy", body: "13% klientów. Faktury, cesje, B2B przedawnienie (2 lata).", pill: "13%" },
          { title: "Średnie firmy", body: "3% klientów. Sprawy o wyższych wartościach, audyt portfela.", pill: "3%" },
          { title: "Kancelarie", body: "2% klientów. Plan Enterprise — używają jako narzędzie pracy.", pill: "2%" },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · case studies"
        heading="O publikowanych sprawach."
        items={[
          { q: "Czy te historie są prawdziwe?", a: "Tak — wszystkie publikowane sprawy są anonimizowane, ale prawdziwe. Mamy zgody klientów na publikację. Dane (kwoty, daty) zgodne ze stanem faktycznym." },
          { q: "Dlaczego nie pokazujecie wszystkich 47 tysięcy spraw?", a: "Publikowanie wymaga zgody klienta. Pokazujemy tylko te, na które dostaliśmy zgodę (około 200 spraw). Pełne statystyki agregowane — tak." },
          { q: "Czy mogę przesłać moją historię?", a: "Tak — jeśli wygrałeś dzięki Mandatomatu, napisz na stories@mandatomat.pl. Jeśli się zgodzisz, opublikujemy historię (z anonimizacją). Dostaniesz miesiąc PRO gratis." },
          { q: "Czy każda sprawa kończy się wygraną?", a: "Nie — średnia skuteczność to 78%. Czasem dług jest realny i prawnie nie można nic zrobić. Wtedy nasza rola to powiedzieć Ci to wprost — i pomóc wynegocjować rozłożenie na raty." },
        ]}
      />

      <V5CtaBand
        eyebrow="dołącz do 47 312 osób"
        headline="Twoja sprawa może być następną historią wygranej."
        body="Pierwsza analiza nakazu zawsze gratis. Sprawdź czy masz szansę, zanim wpłacisz złotówkę."
        ctas={[
          { label: "Sprawdź swoją sprawę", href: "/skaner-nakazu", variant: "primary" },
          { label: "Zobacz wszystkie case studies", href: "#", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
