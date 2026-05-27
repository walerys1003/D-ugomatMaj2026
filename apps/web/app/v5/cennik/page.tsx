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
  title: "Cennik · Mandatomat V5",
  description: "Płać tylko za wygrane. 49 zł za sprzeciw, 199 zł/mc bez limitów. Bez ukrytych opłat.",
};

export default function V5CennikPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="cennik · transparentnie"
        headline={
          <>
            Płać tylko za <span className="text-[hsl(var(--v5-violet-700))]">wygrane</span>,
            a nie za próby.
          </>
        }
        body="Brak ukrytych opłat. Pierwsza analiza skanu zawsze gratis. Subskrypcja anulowana w 30 sekund — bez rozmów z handlowcem."
        ctas={[
          { label: "Zacznij za darmo", href: "/skaner-nakazu", variant: "primary" },
          { label: "Skontaktuj się z B2B", href: "/v5/dla-firm", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            VAT 23% wliczony · faktura PDF · płatność BLIK/Karta/Przelew
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "0 zł", label: "Pierwsza analiza nakazu", sub: "BEZ ZOBOWIĄZAŃ" },
          { value: "49 zł", label: "Pojedynczy sprzeciw", sub: "JEDNORAZOWO" },
          { value: "199 zł/mc", label: "Plan PRO bez limitów", sub: "ANULUJ W 30s" },
          { value: "78%", label: "Średnia skuteczność", sub: "AUDYT NIEZALEŻNY 2025" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-12 max-w-[58ch]">
            <V5Eyebrow className="mb-4">plany · 4 progi</V5Eyebrow>
            <V5Headline level="h2">
              Wybierz model dopasowany do swojej sprawy.
            </V5Headline>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
            <V5PricingTier
              name="Free"
              price="0 zł"
              period="zawsze"
              description="Idealne na start — sprawdź, co masz w nakazie."
              features={[
                "1 skan nakazu / miesiąc",
                "Klasyfikacja roszczenia (24 typy)",
                "Analiza przedawnienia",
                "Wstępna ocena szans (estymacja)",
                "Eksport PDF (z znakiem wodnym)",
              ]}
              cta={{ label: "Zacznij teraz", href: "/skaner-nakazu" }}
            />
            <V5PricingTier
              name="Solo"
              price="49 zł"
              period="/ sprawa"
              description="Płatność jednorazowa za pojedynczy sprzeciw."
              features={[
                "Pełny sprzeciw od EPU (PDF)",
                "5 zarzutów retrievalem RAG",
                "Cytaty wyroków SN/SO/SA",
                "Wzór koperty + listy poleconego",
                "Konsultacja mailowa (24h)",
              ]}
              cta={{ label: "Kup pojedynczo", href: "/skaner-nakazu" }}
            />
            <V5PricingTier
              name="PRO"
              price="199 zł"
              period="/ miesiąc"
              description="Dla osób z wieloma sprawami lub stale walczących z windykacją."
              features={[
                "Nielimitowane skany + sprzeciwy",
                "Wszystkie 8 modułów (ePU/komornik/cesja/BIK/ugoda/potrącenia/upadłość/wezwania)",
                "ePUAP submission (automatyczny)",
                "Priorytetowy support 4h",
                "Custom prompty + szablony",
                "Konsultacja video 30min/mc",
              ]}
              cta={{ label: "Start PRO", href: "/skaner-nakazu" }}
              highlight
              badge="NAJCZĘŚCIEJ WYBIERANE"
            />
            <V5PricingTier
              name="Enterprise"
              price="od 2 499 zł"
              period="/ miesiąc"
              description="Dla kancelarii i firm windykacyjnych. SLA, SSO, audit log."
              features={[
                "Nielimitowane konta + role",
                "API + Webhook + S3 eksport",
                "SSO (SAML/Google Workspace)",
                "Dedykowany Customer Success",
                "SLA 99.9% + 24/7 support",
                "Audit log (SOC2-ready)",
                "Onboarding zespołu (4h)",
              ]}
              cta={{ label: "Porozmawiajmy", href: "/v5/dla-kancelarii" }}
            />
          </div>
        </V5Container>
      </V5Section>

      <V5ComparisonTable
        eyebrow="pełna tabela funkcji"
        heading="Co dokładnie dostajesz w każdym planie."
        columns={[
          { label: "Free" },
          { label: "Solo" },
          { label: "PRO", highlight: true },
          { label: "Enterprise" },
        ]}
        rows={[
          { label: "Skany OCR / miesiąc", values: ["1", "5", "∞", "∞"] },
          { label: "Generator sprzeciwu ePU", values: [false, true, true, true] },
          { label: "Moduły zaawansowane (D2–D8)", values: [false, false, true, true] },
          { label: "ePUAP automatyczny submit", values: [false, false, true, true] },
          { label: "Cytaty wyroków SN/SA", values: [false, true, true, true] },
          { label: "Win-probability score", values: ["est.", true, true, true] },
          { label: "Audit log + eksport JSON", values: [false, false, true, true] },
          { label: "API + Webhooks", values: [false, false, false, true] },
          { label: "SSO (SAML/OIDC)", values: [false, false, false, true] },
          { label: "SLA gwarantowane", values: [false, false, "best-effort", "99.9%"] },
          { label: "Support response", values: ["48h", "24h", "4h", "1h (24/7)"] },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · cennik"
        heading="Najczęściej zadawane pytania o płatności."
        items={[
          { q: "Czy mogę anulować w dowolnym momencie?", a: "Tak — anulacja w 30 sekund w panelu /panel/billing. Brak rozmów z handlowcem, brak prób zatrzymania. Niewykorzystane dni są zwracane proporcjonalnie." },
          { q: "Czy są jakieś ukryte opłaty?", a: "Nie. Cena obejmuje wszystko: OCR, retrieval, generację, ePUAP submit, audit log. Jedyne dodatkowe koszty to oficjalne opłaty (np. opłata kancelaryjna do sądu), o których jasno informujemy przed wysłaniem." },
          { q: "Czy dostanę fakturę VAT?", a: "Tak — automatyczna faktura PDF z numerem NIP po każdej płatności. Dla firm — możliwość comiesięcznej zbiorczej faktury." },
          { q: "Czy mogę zwrócić plan PRO po opłaceniu?", a: "Tak — gwarancja zwrotu w 14 dni bez podania przyczyny (zgodnie z prawem konsumenckim UE)." },
          { q: "Czy płacę za nieskuteczny sprzeciw?", a: "W planie Solo płacisz raz, niezależnie od wyniku — ale wynik jest skuteczny w 78% przypadków (audyt 2025). W planie PRO nie ma takiego problemu, bo masz nielimitowane próby." },
          { q: "Czy mogę przenieść plan Solo na inną sprawę?", a: "Plan Solo jest przypisany do konkretnego nakazu (po skanie). Jeśli nakaz został odrzucony przez sąd na etapie skanu (np. zły OCR), automatyczne zwrot lub kredyt na kolejny." },
        ]}
      />

      <V5CtaBand
        eyebrow="zacznij teraz · zero ryzyka"
        headline="Pierwsza analiza jest darmowa. Sprzeciw kosztuje tyle, co kawa."
        body="49 zł za zwycięstwo z firmą windykacyjną, która wystawiła ci nakaz na 14 000 zł. Decyzja powinna być prosta."
        ctas={[
          { label: "Skanuj nakaz teraz", href: "/skaner-nakazu", variant: "primary" },
          { label: "Porównaj plany", href: "#", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
