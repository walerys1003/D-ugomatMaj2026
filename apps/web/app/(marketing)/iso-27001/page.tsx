import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  ServerCog,
  FileSearch,
  KeyRound,
  Users,
  RefreshCw,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import {
  PageHero,
  PageSection,
  FeatureGrid,
  FeatureCard,
  CheckList,
  CtaBand,
} from "@/components/marketing/premium-page";

export const metadata: Metadata = {
  title: "ISO 27001 — bezpieczeństwo informacji w Długomat",
  description:
    "Długomat wdraża System Zarządzania Bezpieczeństwem Informacji zgodny z ISO/IEC 27001: " +
    "szyfrowanie, kontrola dostępu, ciągłość działania i audytowalność przetwarzania danych prawnych.",
  alternates: { canonical: "/iso-27001" },
};

export default function Iso27001Page() {
  return (
    <>
      <PageHero
        eyebrow="Bezpieczeństwo informacji"
        title={
          <>
            Twoje dokumenty chronione{" "}
            <span className="text-dlugomat-600">standardem ISO/IEC 27001.</span>
          </>
        }
        lede="Powierzasz nam nakazy, wyroki i dane osobowe — dokumenty, których nie wolno stracić ani ujawnić. Dlatego budujemy System Zarządzania Bezpieczeństwem Informacji (SZBI) zgodny z normą ISO/IEC 27001."
        primary={{ href: "/bezpieczenstwo", label: "Bezpieczeństwo" }}
        secondary={{ href: "/rodo", label: "Zgodność z RODO" }}
      />

      <PageSection eyebrow="Filary SZBI" title="Jak chronimy informacje">
        <FeatureGrid cols={3}>
          <FeatureCard icon={Lock} title="Szyfrowanie">
            Dane szyfrowane w tranzycie (TLS 1.2+) i w spoczynku (AES-256). Dokumenty nigdy nie leżą jawnie.
          </FeatureCard>
          <FeatureCard icon={KeyRound} title="Kontrola dostępu">
            Zasada najmniejszych uprawnień, uwierzytelnianie wieloskładnikowe i pełny audyt dostępów.
          </FeatureCard>
          <FeatureCard icon={FileSearch} title="Audytowalność">
            Logi zdarzeń i przetwarzania pozwalają odtworzyć, kto, kiedy i do czego miał dostęp.
          </FeatureCard>
          <FeatureCard icon={ServerCog} title="Bezpieczna infrastruktura">
            Hosting w certyfikowanych centrach danych w UE, segmentacja sieci i utwardzone systemy.
          </FeatureCard>
          <FeatureCard icon={RefreshCw} title="Ciągłość działania">
            Kopie zapasowe, plany odtworzenia po awarii (DRP/BCP) i regularne testy przywracania.
          </FeatureCard>
          <FeatureCard icon={AlertTriangle} title="Zarządzanie incydentami">
            Procedury reagowania, klasyfikacja zdarzeń i powiadamianie zgodne z wymogami prawa.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Proces" title="Ciągłe doskonalenie (PDCA)" tinted>
        <FeatureGrid cols={4}>
          <FeatureCard icon={ClipboardCheck} title="Plan">
            Analiza ryzyka, deklaracja stosowania (SoA) i polityki bezpieczeństwa.
          </FeatureCard>
          <FeatureCard icon={ServerCog} title="Do">
            Wdrożenie zabezpieczeń technicznych i organizacyjnych w codziennej pracy.
          </FeatureCard>
          <FeatureCard icon={FileSearch} title="Check">
            Audyty wewnętrzne, testy bezpieczeństwa i przegląd skuteczności kontroli.
          </FeatureCard>
          <FeatureCard icon={RefreshCw} title="Act">
            Działania korygujące i aktualizacja zabezpieczeń wobec nowych zagrożeń.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="W praktyce" title="Co to oznacza dla Ciebie i Twojej kancelarii">
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Dane przechowywane i przetwarzane wyłącznie na terenie Unii Europejskiej.",
              "Pełne szyfrowanie dokumentów — w bazie i w transmisji.",
              "Dostęp do Twoich spraw mają tylko upoważnione, uwierzytelnione osoby.",
              "Możliwość zawarcia umowy powierzenia przetwarzania (DPA) dla firm i kancelarii.",
              "Regularne audyty i testy bezpieczeństwa, w tym testy penetracyjne.",
              "Procedura zgłaszania podatności i szybkiego reagowania na incydenty.",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Bezpieczeństwo bez kompromisów"
        lede="Potrzebujesz dokumentacji zgodności lub umowy powierzenia danych dla swojej organizacji? Skontaktuj się z naszym zespołem."
        primary={{ href: "/dpa", label: "Umowa powierzenia (DPA)" }}
        secondary={{ href: "/kontakt", label: "Skontaktuj się" }}
      />
    </>
  );
}
