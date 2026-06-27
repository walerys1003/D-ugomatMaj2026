import type { Metadata } from "next";
import {
  Target,
  Scale,
  HandHeart,
  Eye,
  Sparkles,
  ShieldCheck,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  PageHero,
  PageSection,
  FeatureGrid,
  FeatureCard,
  StepGrid,
  StepCard,
  CheckList,
  CtaBand,
} from "@/components/marketing/premium-page";

export const metadata: Metadata = {
  title: "Misja — wyrównujemy szanse wobec prawa",
  description:
    "Wierzymy, że dostęp do skutecznej obrony prawnej nie powinien zależeć od zasobności portfela. " +
    "Misją Długomat jest danie każdemu narzędzi, którymi dotąd dysponowali tylko prawnicy.",
  alternates: { canonical: "/misja" },
};

export default function MisjaPage() {
  return (
    <>
      <PageHero
        eyebrow="Nasza misja"
        title={
          <>
            Wyrównujemy szanse{" "}
            <span className="text-dlugomat-600">w starciu z prawem.</span>
          </>
        }
        lede="Po jednej stronie sporu stoi firma z działem prawnym i automatem do masowych pozwów. Po drugiej — zwykły człowiek z listem polecanym i 14 dniami na reakcję. Naszą misją jest odwrócić tę nierówność."
        primary={{ href: "/zacznij", label: "Zacznij teraz" }}
        secondary={{ href: "/o-lexmate24", label: "Poznaj ekosystem" }}
      />

      <PageSection eyebrow="Problem" title="Prawo działa, gdy stać Cię na prawnika">
        <FeatureGrid cols={3}>
          <FeatureCard icon={Scale} title="Asymetria zasobów">
            Wierzyciele i firmy windykacyjne składają tysiące nakazów hurtowo. Pozwany jest sam.
          </FeatureCard>
          <FeatureCard icon={TrendingUp} title="Koszt blokuje obronę">
            Porada prawnika bywa droższa niż sam dług — więc ludzie nie bronią się wcale.
          </FeatureCard>
          <FeatureCard icon={Eye} title="Niewiedza = przegrana">
            Brak reakcji w terminie = prawomocny nakaz. Większość przegrywa nie w sądzie, a przez ciszę.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Nasza odpowiedź" title="Jak realizujemy misję" tinted>
        <StepGrid>
          <StepCard num={1} icon={Sparkles} title="Demokratyzujemy wiedzę">
            AI tłumaczy zawiły dokument na zrozumiały język i wskazuje, co realnie możesz zrobić.
          </StepCard>
          <StepCard num={2} icon={Target} title="Obniżamy próg wejścia">
            Darmowa analiza i płatność za sprawę zamiast drogiego abonamentu czy stawki godzinowej.
          </StepCard>
          <StepCard num={3} icon={HandHeart} title="Dajemy gotowe pisma">
            Nie zostawiamy z poradą — generujemy dokument do złożenia, z cytowaniem podstaw prawnych.
          </StepCard>
          <StepCard num={4} icon={ShieldCheck} title="Chronimy godność">
            Bez oceniania, bez stresu w kancelarii. Prywatnie, w swoim tempie, na własnych warunkach.
          </StepCard>
        </StepGrid>
      </PageSection>

      <PageSection eyebrow="Wartości" title="W co wierzymy">
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Dostęp do obrony prawnej to prawo, nie przywilej zamożnych.",
              "Technologia powinna służyć słabszej stronie sporu, nie tylko korporacjom.",
              "Transparentność: jasna cena, jasny zakres, żadnych ukrytych opłat.",
              "AI wspiera człowieka i jego decyzję — nie zastępuje go i nie udaje prawnika.",
              "Twoje dane są Twoje. Nie handlujemy nimi i nie wykorzystujemy przeciwko Tobie.",
              "Skuteczność mierzymy realnymi sprawami wygranymi przez naszych użytkowników.",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Dołącz do tych, którzy się nie poddają"
        lede="Każda obroniona sprawa to dowód, że nierówność wobec prawa da się wyrównać. Zacznij od swojej."
        primary={{ href: "/zacznij", label: "Przeanalizuj swój dokument" }}
        secondary={{ href: "/kontakt", label: "Porozmawiaj z nami" }}
      />
    </>
  );
}
