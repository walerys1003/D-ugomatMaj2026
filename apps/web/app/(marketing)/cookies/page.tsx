import type { Metadata } from "next";
import {
  Cookie,
  ShieldCheck,
  BarChart3,
  Settings2,
  Megaphone,
  ToggleRight,
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
  title: "Polityka cookies — Długomat",
  description:
    "Jak Długomat używa plików cookies i podobnych technologii: rodzaje plików, cele, " +
    "okres przechowywania oraz jak zarządzać zgodami i preferencjami.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Prywatność"
        title={
          <>
            Polityka{" "}
            <span className="text-dlugomat-600">plików cookies.</span>
          </>
        }
        lede="Używamy plików cookies, aby serwis działał poprawnie, był bezpieczny i wygodny. Poniżej wyjaśniamy, jakich plików używamy, w jakim celu i jak możesz nimi zarządzać."
        primary={{ href: "/polityka-prywatnosci", label: "Polityka prywatności" }}
        secondary={{ href: "/rodo", label: "RODO" }}
      />

      <PageSection eyebrow="Rodzaje cookies" title="Czego używamy i po co">
        <FeatureGrid cols={2}>
          <FeatureCard icon={ShieldCheck} title="Niezbędne">
            Wymagane do działania serwisu: logowanie, sesja, bezpieczeństwo. Nie można ich wyłączyć.
          </FeatureCard>
          <FeatureCard icon={Settings2} title="Funkcjonalne">
            Zapamiętują Twoje preferencje, np. język interfejsu czy ostatnio używany moduł.
          </FeatureCard>
          <FeatureCard icon={BarChart3} title="Analityczne">
            Pomagają zrozumieć, jak korzystasz z serwisu, byśmy mogli go ulepszać. Wymagają zgody.
          </FeatureCard>
          <FeatureCard icon={Megaphone} title="Marketingowe">
            Pozwalają mierzyć skuteczność działań i wyświetlać dopasowane treści. Wymagają zgody.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Twoja kontrola" title="Jak zarządzać zgodami" tinted>
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Przy pierwszej wizycie wybierasz, na które kategorie cookies się zgadzasz.",
              "Zgody możesz w każdej chwili zmienić lub cofnąć w ustawieniach prywatności.",
              "Pliki niezbędne działają zawsze — bez nich serwis nie funkcjonuje poprawnie.",
              "Możesz też usunąć i zablokować cookies w ustawieniach swojej przeglądarki.",
              "Wyłączenie niektórych plików może ograniczyć dostępność części funkcji.",
            ]}
          />
        </div>
      </PageSection>

      <PageSection eyebrow="Szczegóły" title="Okres przechowywania i dostawcy">
        <FeatureGrid cols={3}>
          <FeatureCard icon={Cookie} title="Sesyjne">
            Usuwane automatycznie po zamknięciu przeglądarki — służą bieżącej obsłudze wizyty.
          </FeatureCard>
          <FeatureCard icon={Cookie} title="Trwałe">
            Pozostają na urządzeniu przez określony czas, by zapamiętać Twoje preferencje.
          </FeatureCard>
          <FeatureCard icon={ToggleRight} title="Zewnętrzne">
            Część plików pochodzi od zaufanych dostawców (np. analityka). Działają tylko za Twoją zgodą.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <CtaBand
        title="Masz pytania o dane?"
        lede="Skontaktuj się z naszym inspektorem ochrony danych — odpowiemy na pytania dotyczące cookies i prywatności."
        primary={{ href: "/kontakt", label: "Skontaktuj się" }}
        secondary={{ href: "/polityka-prywatnosci", label: "Polityka prywatności" }}
      />
    </>
  );
}
