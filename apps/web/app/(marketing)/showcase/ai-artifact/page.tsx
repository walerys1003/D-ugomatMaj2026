import type { Metadata } from "next";

import { MarketingPageHero } from "@/components/marketing/page-hero";
import { Artifact } from "@/components/ai/artifact";
import { Heading, Text } from "@/components/ui/typography";

export const metadata: Metadata = {
  title: "AI Artifact — showcase | Tarcza v4",
  description:
    "Showcase prymitywu Artifact dla streamingu wyników AI — pismo, analiza, anonimizacja, transkrypcja.",
};

export default function ArtifactShowcasePage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="v4-δ · prymityw AI"
        title="Artifact — streaming AI z maszyną stanów"
        subtitle="Dedykowany panel dla wyników generatywnych: pismo, analiza, anonimizacja. Stop / kopiuj / retry. Mock i SSE w jednym API."
      />

      <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <div className="mb-10">
          <Heading level={2} className="text-ink-900">
            Cztery stany — pełna kontrola
          </Heading>
          <Text className="mt-3 text-ink-600">
            Każdy artefakt przechodzi przez{" "}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 text-[12px] text-ink-800">
              idle → streaming → done
            </code>{" "}
            z bocznym wyjściem do{" "}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 text-[12px] text-ink-800">
              error → retry
            </code>
            . Mock streamuje token-po-tokenie z konfigurowanymi MS-ami; produkcja
            wpina się przez SSE endpoint.
          </Text>
        </div>

        <div className="space-y-10">
          <Artifact
            title="Sprzeciw od nakazu zapłaty"
            subtitle="Moduł D1 · sygn. I Nc 5678/26"
            kind="letter"
            streamSource="mock"
            mockSpeed={18}
          />

          <Artifact
            title="Analiza ryzyka procesowego"
            subtitle="Sprawa #4221 · automatyczny scoring"
            kind="analysis"
            state="done"
            initialContent={`Ocena ryzyka: ŚREDNIE (5.4/10)

Główne czynniki:
  ✓ Roszczenie z umowy pożyczki konsumenckiej
  ✓ Brak dowodu doręczenia wypowiedzenia
  ⚠ Częściowe spłaty (5 wpłat × 250 zł) — uznanie długu
  ⚠ Termin przedawnienia upływa za 8 miesięcy

Rekomendacja: złożyć sprzeciw + powołać zarzut nieudowodnienia roszczenia.
Szacowana szansa wygranej: 62%.`}
          />

          <Artifact
            title="Anonimizacja korespondencji"
            subtitle="Pre-RODO redaction · 14 dokumentów"
            kind="redaction"
            state="error"
            initialContent="Częściowa anonimizacja — przerwano na pliku 7/14."
            onRetry={() => undefined}
          />
        </div>
      </section>
    </>
  );
}
