import type { Metadata } from "next";
import {
  Scale,
  Car,
  HeartHandshake,
  Banknote,
  ShieldCheck,
  Cpu,
  FileText,
  Network,
  Users,
  Lock,
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
  title: "O LexMate24 — ekosystem AI legal-tech",
  description:
    "LexMate24 to rodzina narzędzi AI, które dają zwykłym ludziom dostęp do prawa: " +
    "Długomat, Mandatomat, Rozwodomat i Alimentomat. Jeden silnik prawny, cztery problemy życiowe.",
  alternates: { canonical: "/o-lexmate24" },
};

const PRODUCTS = [
  {
    icon: Scale,
    name: "Długomat",
    tag: "Nakazy zapłaty",
    desc: "AI analizuje nakaz zapłaty i generuje sprzeciw z cytowaniem KPC/KC — zanim minie 14 dni.",
  },
  {
    icon: Car,
    name: "Mandatomat",
    tag: "Mandaty i wykroczenia",
    desc: "Analiza mandatu, wykrycie wad proceduralnych i automatyczne odwołanie do sądu lub organu.",
  },
  {
    icon: HeartHandshake,
    name: "Rozwodomat",
    tag: "Rozwód",
    desc: "Empatyczny przewodnik AI przez rozwód: pisma, podział majątku, opieka i wsparcie krok po kroku.",
  },
  {
    icon: Banknote,
    name: "Alimentomat",
    tag: "Alimenty",
    desc: "Kalkulacja alimentów na podstawie orzecznictwa i sytuacji rodzinnej — z gotowym wnioskiem.",
  },
];

export default function OLexMate24Page() {
  return (
    <>
      <PageHero
        eyebrow="Ekosystem LexMate24"
        title={
          <>
            Prawo dostępne dla{" "}
            <span className="text-dlugomat-600">każdego, nie tylko dla prawników.</span>
          </>
        }
        lede="LexMate24 to rodzina narzędzi AI, które rozkładają zawiłe procedury prawne na proste kroki. Jeden silnik prawny zasila cztery produkty — każdy rozwiązuje konkretny, stresujący problem życiowy."
        primary={{ href: "/o-dlugomacie", label: "Poznaj Długomat" }}
        secondary={{ href: "/misja", label: "Nasza misja" }}
      />

      <PageSection eyebrow="Produkty" title="Cztery problemy, jeden silnik prawny">
        <FeatureGrid cols={2}>
          {PRODUCTS.map((p) => (
            <FeatureCard key={p.name} icon={p.icon} title={`${p.name} — ${p.tag}`}>
              {p.desc}
            </FeatureCard>
          ))}
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Wspólny fundament" title="Co łączy wszystkie produkty" tinted>
        <FeatureGrid cols={3}>
          <FeatureCard icon={Cpu} title="Ten sam silnik AI">
            Modele wytrenowane na polskim prawie i orzecznictwie, metoda IRAC i cytowanie podstaw prawnych.
          </FeatureCard>
          <FeatureCard icon={FileText} title="Gotowe pisma">
            Każdy produkt kończy się dokumentem do złożenia — sprzeciwem, odwołaniem, wnioskiem czy pozwem.
          </FeatureCard>
          <FeatureCard icon={ShieldCheck} title="Zgodność i bezpieczeństwo">
            RODO, szyfrowanie, ISO 27001 i procedury powierzenia danych wspólne dla całego ekosystemu.
          </FeatureCard>
          <FeatureCard icon={Network} title="Jedno konto">
            Logujesz się raz i korzystasz ze wszystkich narzędzi LexMate24 z jednego panelu.
          </FeatureCard>
          <FeatureCard icon={Users} title="Wsparcie ludzi">
            AI robi ciężką pracę, a w razie potrzeby kierujemy do współpracujących kancelarii.
          </FeatureCard>
          <FeatureCard icon={Lock} title="Twoje dane = Twoje">
            Nie sprzedajemy danych. Możesz je w każdej chwili usunąć — zgodnie z prawem do bycia zapomnianym.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="W skrócie" title="Dlaczego budujemy ekosystem">
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Większość ludzi rezygnuje z obrony swoich praw, bo prawnik jest za drogi lub za daleko.",
              "Te same mechanizmy AI rozwiązują różne problemy — wystarczy je odpowiednio ukierunkować.",
              "Jedna platforma, jedno bezpieczeństwo, jeden standard jakości pism.",
              "Niższe koszty dzięki współdzielonej infrastrukturze = niższa cena dla użytkownika.",
              "Transparentny model: płacisz za sprawę, nie za abonament, którego nie używasz.",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Zacznij od swojego problemu"
        lede="Masz nakaz zapłaty? Zacznij od Długomat — darmowa analiza dokumentu zajmuje kilka minut."
        primary={{ href: "/zacznij", label: "Przeanalizuj dokument" }}
        secondary={{ href: "/o-dlugomacie", label: "O Długomacie" }}
      />
    </>
  );
}
