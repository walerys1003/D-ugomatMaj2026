import type { Metadata } from "next";
import { ShieldCheck, Scan, FileText, Scale, Sparkles, Lock, Wallet } from "lucide-react";
import { PageHero, PageSection, FeatureGrid, FeatureCard, StepGrid, StepCard, CheckList, CtaBand } from "@/components/marketing/premium-page";

export const metadata: Metadata = {
  title: "Dla Ciebie — przejmij kontrolę nad swoim długiem",
  description:
    "Masz nakaz zapłaty, pismo od komornika albo windykatora? Długomat analizuje " +
    "dokument przez AI, wykrywa błędy i generuje profesjonalne pismo procesowe w 12 minut.",
  alternates: { canonical: "/dla-ciebie" },
};

export default function DlaCiebiePage() {
  return (
    <>
      <PageHero
        eyebrow="Dla osób fizycznych"
        title={
          <>
            Dług to nie wyrok.{" "}
            <span className="text-dlugomat-600">To dokument do zakwestionowania.</span>
          </>
        }
        lede="Dostałeś nakaz zapłaty z e-sądu, pismo od komornika albo windykatora? Nie panikuj i nie ignoruj. Długomat w kilka minut rozłoży Twoją sprawę na czynniki pierwsze i przygotuje pismo, które realnie broni Twoich praw."
        primary={{ href: "/skaner-nakazu", label: "Sprawdź dokumenty za darmo" }}
        secondary={{ href: "/jak-to-dziala", label: "Zobacz jak to działa" }}
      >
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-500">
          <Lock className="size-4 text-dlugomat-600" aria-hidden />
          Bezpiecznie. Poufnie. Zgodnie z prawem.
        </p>
      </PageHero>

      <PageSection
        eyebrow="Twoja sytuacja"
        title="Rozpoznajesz którąś z tych historii?"
        lede="Każdego roku przez polskie e-sądy przechodzi ~2,5 mln spraw. Większość kończy się prawomocnym nakazem tylko dlatego, że nikt nie złożył sprzeciwu w terminie."
      >
        <FeatureGrid cols={3}>
          <FeatureCard icon={FileText} title="Nakaz zapłaty z EPU">
            Przyszedł list z e-sądu w Lublinie. Masz 14 dni na sprzeciw — inaczej nakaz się
            uprawomocni i trafi do komornika.
          </FeatureCard>
          <FeatureCard icon={Scale} title="Dług sprzed lat">
            Firma windykacyjna żąda spłaty pożyczki sprzed 7 lat. Możliwe, że roszczenie jest
            już przedawnione.
          </FeatureCard>
          <FeatureCard icon={Wallet} title="Zajęcie wynagrodzenia">
            Komornik zajął pensję lub konto. Sprawdź, czy zachowano kwotę wolną od egzekucji.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Jak to działa" title="Cztery kroki do Twojej obrony" tinted>
        <StepGrid>
          <StepCard num={1} icon={Scan} title="Wgraj nakaz zapłaty" time="~5 s">
            Zrób zdjęcie lub wgraj PDF. OCR odczyta dokument, nawet ze skanu telefonem.
          </StepCard>
          <StepCard num={2} icon={Sparkles} title="Analiza AI" time="~90 s">
            AI wykrywa błędy formalne, przedawnienie, klauzule abuzywne i ocenia szanse.
          </StepCard>
          <StepCard num={3} icon={FileText} title="Profesjonalne pismo" time="~2 min">
            Otrzymujesz sprzeciw / zarzuty z cytowaniem konkretnych przepisów KPC i KC.
          </StepCard>
          <StepCard num={4} icon={ShieldCheck} title="Złóż w sądzie lub ePUAP" time="gotowe">
            Pobierz PDF, podpisz i wyślij — albo złóż elektronicznie przez ePUAP.
          </StepCard>
        </StepGrid>
      </PageSection>

      <PageSection
        eyebrow="Co dostajesz"
        title="Wszystko czego potrzebujesz, żeby się bronić"
      >
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Analiza AI dokumentu — błędy formalne, przedawnienie, legitymacja wierzyciela",
              "Gotowe pismo procesowe z cytowaniem przepisów (KPC, KC, ustawy szczególne)",
              "Asystent terminów — pilnuje kluczowych dat (D+14, D+7)",
              "Baza wiedzy: przewodniki krok po kroku po każdym typie pisma",
              "Kalkulatory: odsetki, przedawnienie, koszty postępowania, kwota wolna",
              "Bezpieczeństwo: dane szyfrowane AES-256, przechowywane w UE, zgodne z RODO",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Sprawdź swoją sprawę. Za darmo."
        lede="Pierwsza analiza dokumentu nic nie kosztuje. Zobacz, na czym stoisz, zanim zapłacisz za cokolwiek."
        primary={{ href: "/skaner-nakazu", label: "Sprawdź dokumenty za darmo" }}
        secondary={{ href: "/cennik", label: "Zobacz cennik" }}
      />
    </>
  );
}
