import type { Metadata } from "next";
import {
  ShieldCheck,
  Scale,
  Sparkles,
  Users,
  Lock,
  HeartHandshake,
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
  title: "O Długomacie — tarcza dla osób zadłużonych",
  description:
    "Długomat to polski legal-tech, który wyrównuje szanse osób zadłużonych w starciu " +
    "z funduszami i windykacją. Poznaj naszą misję, wartości i ekosystem LexMate24.",
  alternates: { canonical: "/o-dlugomacie" },
};

export default function ODlugomaciePage() {
  return (
    <>
      <PageHero
        eyebrow="O nas"
        title={
          <>
            Wyrównujemy szanse w starciu{" "}
            <span className="text-dlugomat-600">z systemem windykacji.</span>
          </>
        }
        lede="Długomat powstał z prostej obserwacji: po jednej stronie stoją fundusze i kancelarie z armią prawników, a po drugiej — zwykły człowiek z listem z sądu i 14 dniami na reakcję. Dajemy temu człowiekowi narzędzia, które wcześniej były zarezerwowane dla profesjonalistów."
        primary={{ href: "/dla-ciebie", label: "Zobacz, jak pomagamy" }}
        secondary={{ href: "/misja", label: "Nasza misja" }}
      />

      <PageSection eyebrow="Wartości" title="W co wierzymy">
        <FeatureGrid cols={3}>
          <FeatureCard icon={Scale} title="Dostęp do sprawiedliwości">
            Obrona przed bezpodstawnym roszczeniem nie powinna zależeć od tego, czy stać Cię
            na prawnika.
          </FeatureCard>
          <FeatureCard icon={Sparkles} title="AI w służbie ludzi">
            Technologia ma upełnomocniać, nie zastępować. Decyzja zawsze należy do Ciebie.
          </FeatureCard>
          <FeatureCard icon={Lock} title="Prywatność jako fundament">
            Twoje dokumenty to Twoja sprawa. Szyfrowanie, UE, RODO — bez kompromisów.
          </FeatureCard>
          <FeatureCard icon={ShieldCheck} title="Rzetelność prawna">
            Każde pismo opieramy na konkretnych przepisach i aktualnym orzecznictwie.
          </FeatureCard>
          <FeatureCard icon={HeartHandshake} title="Empatia">
            Za każdą sprawą stoi człowiek pod presją. Mówimy językiem, który rozumiesz.
          </FeatureCard>
          <FeatureCard icon={Users} title="Otwartość">
            Edukujemy. Baza wiedzy i kalkulatory są dostępne dla wszystkich, za darmo.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Ekosystem" title="Część rodziny LexMate24" tinted>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg leading-relaxed text-ink-600">
          Długomat jest jednym z czterech wyspecjalizowanych asystentów prawnych LexMate24 —
          każdy rozwiązuje jeden konkretny, dotkliwy problem.
        </p>
        <FeatureGrid cols={4}>
          <FeatureCard title="Długomat">
            Obrona przed nakazami zapłaty i windykacją.
          </FeatureCard>
          <FeatureCard title="Mandatomat">
            Analiza mandatów i odwołania od kar.
          </FeatureCard>
          <FeatureCard title="Alimentomat">
            Kalkulacja i sprawy alimentacyjne.
          </FeatureCard>
          <FeatureCard title="Rozwodomat">
            Empatyczny przewodnik przez rozwód.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Transparentność" title="Jak działamy">
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Długomat nie jest kancelarią prawną — jesteśmy narzędziem, które przygotowujesz i zatwierdzasz",
              "Generowane pisma zawsze weryfikuje użytkownik przed wysyłką",
              "Dane przetwarzane wyłącznie w Unii Europejskiej (Supabase eu-central-1)",
              "Pełna zgodność z RODO — patrz: polityka prywatności i strona RODO",
              "Bezpieczeństwo zgodne z założeniami ISO 27001 (audyt w toku)",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Dołącz do tych, którzy się nie poddali"
        lede="Sprawdź swoją sprawę za darmo i przekonaj się, że masz więcej możliwości, niż myślisz."
        primary={{ href: "/skaner-nakazu", label: "Sprawdź swoją sprawę" }}
        secondary={{ href: "/kontakt", label: "Skontaktuj się" }}
      />
    </>
  );
}
