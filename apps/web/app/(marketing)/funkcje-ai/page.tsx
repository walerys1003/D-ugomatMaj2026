import type { Metadata } from "next";
import { Scan, Scale, FileText, ShieldCheck, Search, GitBranch, BookOpen, Cpu } from "lucide-react";
import { PageHero, PageSection, FeatureGrid, FeatureCard, StepGrid, StepCard, CheckList, CtaBand } from "@/components/marketing/premium-page";

export const metadata: Metadata = {
  title: "Funkcje AI — silnik prawny Długomat",
  description:
    "OCR, analiza dokumentów metodą IRAC, wykrywanie przedawnienia i klauzul abuzywnych, " +
    "generowanie pism z cytowaniem KPC/KC. Poznaj silnik AI Długomat.",
  alternates: { canonical: "/funkcje-ai" },
};

export default function FunkcjeAiPage() {
  return (
    <>
      <PageHero
        eyebrow="AI · Polskie prawo · 2026"
        title={
          <>
            Sztuczna inteligencja{" "}
            <span className="text-dlugomat-600">w służbie prawa.</span>
          </>
        }
        lede="Długomat nie jest chatbotem. To wyspecjalizowany silnik prawny: czyta dokumenty, rozumuje metodą IRAC, sprawdza fakty w bazie przepisów i orzeczeń, a na końcu pisze gotowe pismo — z konkretnymi podstawami prawnymi."
        primary={{ href: "/skaner-nakazu", label: "Wypróbuj skaner AI" }}
        secondary={{ href: "/cennik", label: "Zobacz plany" }}
      />

      <PageSection
        eyebrow="Możliwości"
        title="Co potrafi silnik AI"
        lede="Sześć rdzennych zdolności, które razem zamieniają stos pism w jasną strategię obrony."
      >
        <FeatureGrid cols={3}>
          <FeatureCard icon={Scan} title="OCR + ekstrakcja danych">
            Odczyt skanu lub zdjęcia: sygnatura, strony, kwota, podstawa roszczenia, terminy.
          </FeatureCard>
          <FeatureCard icon={Scale} title="Analiza metodą IRAC">
            Issue · Rule · Application · Conclusion — przejrzysty ślad rozumowania prawnego.
          </FeatureCard>
          <FeatureCard icon={Search} title="Wykrywanie przedawnienia">
            Liczy bieg terminów (art. 118 KC) i sygnalizuje, gdy roszczenie jest przedawnione.
          </FeatureCard>
          <FeatureCard icon={ShieldCheck} title="Klauzule abuzywne">
            Skan umów kredytowych i pożyczkowych pod kątem niedozwolonych postanowień.
          </FeatureCard>
          <FeatureCard icon={FileText} title="Generowanie pism">
            Sprzeciw EPU, zarzuty, skargi komornicze, wnioski BIK — z cytowaniem przepisów.
          </FeatureCard>
          <FeatureCard icon={BookOpen} title="Cytowanie źródeł">
            Każdy argument podparty konkretnym artykułem KPC/KC lub orzeczeniem SN/SO.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Pod maską" title="Jak AI dochodzi do pisma" tinted>
        <StepGrid>
          <StepCard num={1} icon={Scan} title="Odczyt dokumentu" time="OCR">
            Tesseract.js + fallback Textract zamienia obraz w ustrukturyzowane dane.
          </StepCard>
          <StepCard num={2} icon={Cpu} title="Klasyfikacja sprawy" time="model">
            AI rozpoznaje typ roszczenia i dobiera właściwy moduł (D1–D8).
          </StepCard>
          <StepCard num={3} icon={GitBranch} title="Rozumowanie IRAC" time="reasoning">
            Sprawdza fakty względem przepisów i buduje argumentację z cytatami.
          </StepCard>
          <StepCard num={4} icon={FileText} title="Redakcja pisma" time="output">
            Składa gotowy dokument w poprawnym formacie procesowym, gotowy do podpisu.
          </StepCard>
        </StepGrid>
      </PageSection>

      <PageSection eyebrow="Zaufanie" title="Dlaczego możesz polegać na wynikach">
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Model oparty na Claude Sonnet — najnowsza generacja, dostrojona do polskiego prawa",
              "Retrieval z aktualnej bazy przepisów i orzeczeń (nie 'halucynacje' z pamięci)",
              "Walidator drugiego modelu sprawdza spójność i kompletność pisma",
              "Każde twierdzenie ma źródło — możesz zweryfikować zanim wyślesz",
              "Człowiek zawsze w pętli: pismo zatwierdzasz Ty, przed złożeniem w sądzie",
              "Dane przetwarzane w UE, szyfrowane, zgodne z RODO",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Zobacz silnik AI w akcji"
        lede="Wgraj dokument i obserwuj, jak AI rozkłada Twoją sprawę krok po kroku. Pierwsza analiza za darmo."
        primary={{ href: "/skaner-nakazu", label: "Uruchom analizę AI" }}
        secondary={{ href: "/baza-wiedzy", label: "Przeglądaj bazę wiedzy" }}
      />
    </>
  );
}
