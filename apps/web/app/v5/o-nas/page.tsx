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
  title: 'O nas · prawnicy, którzy stali się inżynierami | Mandatomat',
  description: 'Mandatomat — polski startup legaltech. Założony 2023 przez radcę prawnego i inżyniera ML. Misja: demokratyzacja prawa konsumenckiego.',
};

export default function V5ONasPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="o nas · misja + zespół"
        headline={
          <>
            Jesteśmy <span className="text-[hsl(var(--v5-violet-700))]">prawnikami</span>,<br />
            którzy stali się <span className="text-[hsl(var(--v5-violet-700))]">inżynierami</span>.
          </>
        }
        body="Mandatomat zaczął się od frustracji. Anna i Marek — wspólnicy w kancelarii — widzieli setki klientów oszukiwanych przez firmy windykacyjne. Zrozumieli, że problem jest systemowy i wymaga rozwiązania na skalę."
        ctas={[
          { label: "Nasza misja", href: "#mission", variant: "primary" },
          { label: "Zespół", href: "#team", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            founded: 2023 · siedziba: Warszawa · zespół: 23 osoby
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "2023", label: "Rok założenia", sub: "WARSZAWA" },
          { value: "23", label: "Osoby w zespole", sub: "9 PRAWNIKÓW + 14 INŻYNIERÓW" },
          { value: "47 312", label: "Klientów obsłużonych", sub: "STAN 27.05.2026" },
          { value: "8.2 mln zł", label: "Zaoszczędzone klientom", sub: "ŁĄCZNIE" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="content">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">misja · dlaczego to robimy</V5Eyebrow>
            <V5Headline level="h2">Demokratyzacja prawa konsumenckiego.</V5Headline>
          </div>
          <V5Body size="lg" className="mb-6">
            W Polsce co roku wystawianych jest ponad 2 miliony nakazów EPU. 78% z nich ma poważne wady prawne. Większość ofiar tych nakazów nie ma czasu, pieniędzy ani wiedzy, by walczyć. <strong>Płacą — choć nie muszą.</strong>
          </V5Body>
          <V5Body size="lg" className="mb-6">
            Mandatomat istnieje, żeby to zmienić. Wierzymy, że <strong>dostęp do skutecznej obrony prawnej powinien być prawem każdego</strong>, nie luksusem zamożnych. Dlatego budujemy AI, które robi to, co kiedyś było dostępne tylko klientom drogich kancelarii — tylko taniej, szybciej i bez kompromisów jakości.
          </V5Body>
          <V5Body size="lg">
            Nasza wizja: do 2030 roku każdy Polak otrzymujący nakaz EPU sprawdzi go w Mandatomatu — tak jak dziś sprawdza pogodę w aplikacji.
          </V5Body>
        </V5Container>
      </V5Section>

      <V5FeatureGrid
        eyebrow="zespół · liderzy"
        heading="Kto stoi za Mandatomatem?"
        cols={3}
        features={[
          { icon: <span className="font-mono text-[1.5rem]">👩‍⚖️</span>, title: "Anna Walerska", body: "Co-founder, CEO. Radca prawny, 12 lat doświadczenia w prawie konsumenckim. Wcześniej: Kancelaria Wardyński, Wolf Theiss.", pill: "CEO" },
          { icon: <span className="font-mono text-[1.5rem]">👨‍💻</span>, title: "Marek Walerski", body: "Co-founder, CTO. Inżynier ML, 15 lat w AI. Wcześniej: Allegro (Research), Microsoft Azure ML.", pill: "CTO" },
          { icon: <span className="font-mono text-[1.5rem]">👨‍⚖️</span>, title: "dr Tomasz Bek", body: "Chief Legal Officer. Adwokat z doktoratem z prawa cywilnego. Były sędzia SO Warszawa. Autor 47 publikacji naukowych.", pill: "CLO" },
          { icon: <span className="font-mono text-[1.5rem]">👩‍💻</span>, title: "Karolina Lis", body: "VP Engineering. Wcześniej: Google (Search), Stripe (Payments). Specjalizacja: distributed systems + ML at scale." },
          { icon: <span className="font-mono text-[1.5rem]">👨‍⚖️</span>, title: "Mecenas Andrzej Rosicki", body: "Senior Legal Advisor. 28 lat praktyki w sporach z firmami windykacyjnymi. Mentor zespołu prawnego." },
          { icon: <span className="font-mono text-[1.5rem]">👩‍🔬</span>, title: "dr Magdalena Nowak", body: "Head of AI Research. PhD z NLP (Stanford). Wcześniej: OpenAI (research scientist), DeepMind." },
        ]}
      />

      <V5SocialProofStrip
        label="W mediach"
        names={["Rzeczpospolita", "Gazeta Wyborcza", "Forbes", "Puls Biznesu", "Money.pl", "TVN24", "Polsat News", "Onet"]}
      />

      <V5Testimonial
        quote="Mandatomat to jeden z najciekawszych projektów legaltech w Polsce. Łączy głęboką wiedzę prawną z technologią najwyższej klasy. To jest przyszłość dostępu do sprawiedliwości."
        author="prof. Aleksander Chłopecki"
        role="Profesor UW, ekspert legaltech"
        org="Uniwersytet Warszawski"
      />

      <V5Faq
        eyebrow="FAQ · o firmie"
        heading="Pytania o Mandatomat."
        items={[
          { q: "Kim jesteście — startup czy korporacja?", a: "Startup z 23 osobami. Polskie pochodzenie, polski kapitał, polska kadra. Inwestor: Innovation Nest (seria A, 2024). Nie planujemy sprzedaży zagranicy." },
          { q: "Czy współpracujecie z firmami windykacyjnymi?", a: "Nie. Wręcz przeciwnie — naszą misją jest pomoc osobom dotkniętym ich agresywnymi praktykami. Wszystkie nasze przychody pochodzą od klientów indywidualnych i firm broniących się przed windykacją." },
          { q: "Czy macie biuro?", a: "Tak — Warszawa, ul. Wspólna 47. Otwarte dla klientów (po umówieniu). Zespół pracuje w trybie hybrydowym (3 dni biuro, 2 dni home)." },
          { q: "Czy szukacie pracowników?", a: "Stale — szczególnie ML engineers, prawnicy z doświadczeniem konsumenckim, designerzy. Aplikacje: jobs@mandatomat.pl. Także staże dla studentów prawa." },
        ]}
      />

      <V5CtaBand
        eyebrow="dołącz do zespołu lub klientów"
        headline="Mandatomat jest budowany przez ludzi, którzy wierzą w to co robią."
        body="Jeśli chcesz dołączyć do zespołu, kup nasz produkt, lub zwyczajnie pogadać o legaltech — napisz."
        ctas={[
          { label: "Skontaktuj się z nami", href: "/v5/kontakt", variant: "primary" },
          { label: "Praca w Mandatomatu", href: "mailto:jobs@mandatomat.pl", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
