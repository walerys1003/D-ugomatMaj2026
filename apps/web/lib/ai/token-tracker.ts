import "server-only";

/**
 * Tier 3 zad. 109 — Token tracker per user + per case.
 *
 * Cel:
 *   1) Agregować zużycie tokenów AI w skali sprawy (do wystawienia w panelu).
 *   2) Agregować dzienne zużycie per user (do guardrail z zad. 110).
 *   3) Eksportować helpery do wstrzykiwania metryk w pipeline generacji.
 *
 * Źródła prawdy:
 *   - `documents.tokens_input/output/ai_cost_usd` — finalne zużycie per pismo
 *   - `validation_runs.tokens_input/output/cost_usd` — zużycie Haiku per run
 *
 * Agregacja idzie zawsze przez Postgresa (RLS-aware) — nie cache'ujemy
 * lokalnie, by uniknąć stale-data po refundach / regeneracjach.
 *
 * Guardrail (zad. 110):
 *   - daily cap: USAGE_DAILY_CAP_USD (default 5 USD / user / day)
 *   - per-case cap: USAGE_CASE_CAP_USD (default 2 USD / case)
 *   - assertWithinBudget() rzuca BudgetExceededError jeżeli próg przekroczony
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

const DAILY_CAP_USD = Number(process.env.AI_USAGE_DAILY_CAP_USD ?? "5");
const CASE_CAP_USD = Number(process.env.AI_USAGE_CASE_CAP_USD ?? "2");

export class BudgetExceededError extends Error {
  override name = "BudgetExceededError" as const;
  constructor(
    message: string,
    readonly scope: "user-daily" | "case",
    readonly spentUsd: number,
    readonly capUsd: number,
  ) {
    super(message);
  }
}

export interface UsageSummary {
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  generations: number;
  validations: number;
}

// ─── Aggregations ─────────────────────────────────────────────────────────

/**
 * Agreguje zużycie tokenów dla konkretnej sprawy.
 * Sumuje: `documents` (generator + escalator) + `validation_runs` (Haiku).
 */
export async function getCaseUsage(caseId: string): Promise<UsageSummary> {
  const supabase = createSupabaseServerClient();

  const [docs, validations] = await Promise.all([
    supabase
      .from("documents")
      .select("tokens_input, tokens_output, ai_cost_usd")
      .eq("case_id", caseId)
      .is("deleted_at", null),
    supabase
      .from("validation_runs")
      .select("tokens_input, tokens_output, cost_usd, document_id")
      .in(
        "document_id",
        // Subquery via RPC byłoby czystsze, ale to wymaga osobnej migracji.
        // Tutaj filtrujemy w aplikacji: pobieramy doc ids dla sprawy
        // i potem walidacje. Dla pism = O(documents per case) ≤ ~10.
        await supabase
          .from("documents")
          .select("id")
          .eq("case_id", caseId)
          .is("deleted_at", null)
          .then(
            (r) => (r.data ?? []).map((d) => d.id as string),
            () => [] as string[],
          ),
      ),
  ]);

  return sumUsage(
    (docs.data ?? []) as UsageRow[],
    (validations.data ?? []) as UsageRow[],
  );
}

/**
 * Agreguje dzienne zużycie usera (UTC midnight → now).
 * Używane przez guardrail przed startem nowego pipeline'u.
 */
export async function getUserDailyUsage(userId: string): Promise<UsageSummary> {
  const supabase = createSupabaseServerClient();
  const sinceIso = new Date(
    new Date().toISOString().slice(0, 10) + "T00:00:00Z",
  ).toISOString();

  const docs = await supabase
    .from("documents")
    .select("tokens_input, tokens_output, ai_cost_usd, case_id")
    .eq("user_id", userId)
    .gte("created_at", sinceIso)
    .is("deleted_at", null);

  // Validation_runs: użytkownik nie jest tam bezpośrednio — RLS przepuści
  // tylko te, których dokument należy do usera. Filtrujemy po dacie.
  const validations = await supabase
    .from("validation_runs")
    .select("tokens_input, tokens_output, cost_usd")
    .gte("created_at", sinceIso);

  return sumUsage(
    (docs.data ?? []) as UsageRow[],
    (validations.data ?? []) as UsageRow[],
  );
}

/**
 * Asercja przed wywołaniem AI. Sprawdza, czy user (i — opcjonalnie — sprawa)
 * mieszczą się w budżecie. Rzuca BudgetExceededError, jeżeli próg przekroczony.
 *
 * Pipeline (`runGenerationPipeline`) powinien wywołać to PRZED `complete()`.
 */
export async function assertWithinBudget(opts: {
  userId: string;
  caseId?: string;
}): Promise<void> {
  const daily = await getUserDailyUsage(opts.userId);
  if (daily.costUsd >= DAILY_CAP_USD) {
    throw new BudgetExceededError(
      `Dzienny limit zużycia AI został wyczerpany (${daily.costUsd.toFixed(4)} USD / ${DAILY_CAP_USD} USD). Spróbuj jutro lub skontaktuj się z supportem.`,
      "user-daily",
      daily.costUsd,
      DAILY_CAP_USD,
    );
  }
  if (opts.caseId) {
    const perCase = await getCaseUsage(opts.caseId);
    if (perCase.costUsd >= CASE_CAP_USD) {
      throw new BudgetExceededError(
        `Limit zużycia AI dla tej sprawy przekroczony (${perCase.costUsd.toFixed(4)} USD / ${CASE_CAP_USD} USD). Otwórz nową sprawę, jeżeli potrzebujesz kolejnej generacji.`,
        "case",
        perCase.costUsd,
        CASE_CAP_USD,
      );
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

interface UsageRow {
  tokens_input?: number | null;
  tokens_output?: number | null;
  ai_cost_usd?: number | null;
  cost_usd?: number | null;
}

function sumUsage(
  documents: UsageRow[],
  validations: UsageRow[],
): UsageSummary {
  let tokensInput = 0;
  let tokensOutput = 0;
  let costUsd = 0;

  for (const d of documents) {
    tokensInput += Number(d.tokens_input ?? 0);
    tokensOutput += Number(d.tokens_output ?? 0);
    costUsd += Number(d.ai_cost_usd ?? 0);
  }
  for (const v of validations) {
    tokensInput += Number(v.tokens_input ?? 0);
    tokensOutput += Number(v.tokens_output ?? 0);
    costUsd += Number(v.cost_usd ?? 0);
  }

  return {
    tokensInput,
    tokensOutput,
    costUsd,
    generations: documents.length,
    validations: validations.length,
  };
}

export const BUDGET_LIMITS = {
  dailyCapUsd: DAILY_CAP_USD,
  caseCapUsd: CASE_CAP_USD,
};
