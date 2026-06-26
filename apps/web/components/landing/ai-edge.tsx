import { Gavel, Percent, ShieldCheck, Brain, Search } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { ReasoningTrace } from "@/components/showcase/reasoning-trace";
import { cn } from "@/lib/utils";

/**
 * AIEdge — sekcja wyróżników „dlaczego my" (redesign 03 §6, fix LP-1).
 *
 * Eksponuje flagowe funkcje backendu, które dziś nie mają miejsca na landingu
 * (docs/redesign/01 §2): wirtualny sędzia, szansa wygranej, walidator cytatów,
 * analiza IRAC, RAG po precedensach. To one odróżniają Długomat od „kolejnego
 * generatora pism".
 *
 * Lewa kolumna: 5 wyróżników. Prawa kolumna: ŻYWY dowód — ReasoningTrace
 * (IRAC) renderowany jako realny artefakt, nie marketingowy obrazek.
 *
 * Tokeny kanoniczne wyłącznie.
 */

interface Edge {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  copy: string;
  endpoint: string;
}

const EDGES: Edge[] = [
  {
    icon: Gavel,
    title: "Wirtualny sędzia",
    copy: "Symulujemy argumenty za i przeciw, zanim złożysz pismo.",
    endpoint: "cases/virtual-judge",
  },
  {
    icon: Percent,
    title: "Prawdopodobieństwo wygranej",
    copy: "Model ocenia siłę Twoich zarzutów na bazie przepisów i orzeczeń.",
    endpoint: "cases/win-probability",
  },
  {
    icon: ShieldCheck,
    title: "Walidator cytatów",
    copy: "Anty-halucynacja: cytujemy tylko realne, zweryfikowane przepisy.",
    endpoint: "ai/citation-verifier",
  },
  {
    icon: Brain,
    title: "Analiza IRAC",
    copy: "Issue–Rule–Application–Conclusion — tak myśli prawnik.",
    endpoint: "ai/irac",
  },
  {
    icon: Search,
    title: "Baza orzecznicza (RAG)",
    copy: "Semantyczne przeszukanie precedensów, nie wyszukiwanie po słowach.",
    endpoint: "ai/rag/search",
  },
];

export function AIEdge() {
  return (
    <Section tone="default" density="regular" aria-labelledby="aiedge-heading">
      <div className="mb-10 flex flex-col gap-3">
        <Eyebrow tone="brand" withDot>
          Dlaczego Długomat, a nie szablon z internetu
        </Eyebrow>
        <Heading level={2} id="aiedge-heading" className="max-w-[22ch]">
          To nie generator tekstu. To legal OS.
        </Heading>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
        {/* LEWA — wyróżniki */}
        <ul className="grid gap-4 sm:grid-cols-2">
          {EDGES.map((e) => {
            const Icon = e.icon;
            return (
              <li
                key={e.endpoint}
                className={cn(
                  "flex gap-3 rounded-lg border border-ink-200 bg-card p-4 shadow-sm",
                  "last:sm:col-span-2"
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-700/20 dark:text-dlugomat-300">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-ink-900 dark:text-white">
                    {e.title}
                  </h3>
                  <Text size="sm" tone="muted" className="mt-0.5">
                    {e.copy}
                  </Text>
                </div>
              </li>
            );
          })}
        </ul>

        {/* PRAWA — żywy dowód: IRAC */}
        <div className="rounded-xl border border-ink-200 bg-card p-5 shadow-md lg:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="size-4 text-dlugomat-600" aria-hidden />
            <span className="text-[12.5px] font-semibold uppercase tracking-[0.05em] text-ink-500">
              Analiza sprawy — na żywo
            </span>
          </div>
          <ReasoningTrace />
        </div>
      </div>
    </Section>
  );
}
