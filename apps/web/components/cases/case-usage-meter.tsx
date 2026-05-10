import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BUDGET_LIMITS, getCaseUsage } from "@/lib/ai/token-tracker";

/**
 * Tier 3 zad. 109 — Widget zużycia AI dla sprawy.
 *
 * Renderuje pasek z agregatem tokens_input/output + koszt USD + procent
 * względem `caseCapUsd` (BUDGET_LIMITS). Server Component — agregacja
 * w Postgresie przez `getCaseUsage()`.
 *
 * Używane w `/panel/sprawa/[id]/page.tsx` w sekcji PostGenerationView,
 * gdy `status >= 'generated'` (mamy już co liczyć).
 */
export async function CaseUsageMeter({ caseId }: { caseId: string }) {
  let usage;
  try {
    usage = await getCaseUsage(caseId);
  } catch {
    return null; // graceful — jeżeli RLS / migracja nie aktywna, schowaj
  }

  if (usage.generations === 0 && usage.validations === 0) {
    return null;
  }

  const totalTokens = usage.tokensInput + usage.tokensOutput;
  const capPct = Math.min(
    100,
    Math.round((usage.costUsd / BUDGET_LIMITS.caseCapUsd) * 100),
  );
  const tone =
    capPct >= 90 ? "danger" : capPct >= 70 ? "warning" : "success";

  return (
    <div
      role="region"
      aria-label="Zużycie AI w tej sprawie"
      className="rounded-xl border border-iron-200 bg-iron-50/40 p-4 text-fluid-xs dark:border-iron-800 dark:bg-iron-900/40"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium text-iron-800 dark:text-iron-200">
          <Sparkles className="size-3.5 text-shield-600" aria-hidden />
          Zużycie AI w tej sprawie
        </div>
        <Badge tone={tone}>{capPct}% z limitu</Badge>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-iron-700 dark:text-iron-300 sm:grid-cols-4">
        <Stat label="Generacji" value={String(usage.generations)} />
        <Stat label="Walidacji (Haiku)" value={String(usage.validations)} />
        <Stat label="Tokenów" value={formatThousands(totalTokens)} />
        <Stat
          label="Koszt USD"
          value={`$${usage.costUsd.toFixed(4)}`}
          hint={`limit $${BUDGET_LIMITS.caseCapUsd.toFixed(2)}`}
        />
      </dl>
      <p className="mt-3 text-iron-500 dark:text-iron-400">
        Koszt AI to wydatek po naszej stronie — dla Ciebie sprawa jest rozliczana
        ryczałtowo wg cennika modułu (D-{caseId.slice(0, 4)}).
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="text-iron-500 dark:text-iron-400">{label}</dt>
      <dd className="font-semibold text-iron-900 dark:text-iron-100">
        {value}
        {hint && (
          <span className="ml-1 font-normal text-iron-500 dark:text-iron-400">
            ({hint})
          </span>
        )}
      </dd>
    </div>
  );
}

function formatThousands(n: number): string {
  return new Intl.NumberFormat("pl-PL").format(n);
}
