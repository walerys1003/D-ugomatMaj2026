import { z } from "zod";

/**
 * Walidacja zmiennych środowiskowych (audyt #11).
 *
 * Cel: wykryć BRAK krytycznych zmiennych jak najwcześniej (na starcie / w build),
 * zamiast dostawać niejasne 500 w runtime. Dzielimy na:
 *   - server (sekrety, nigdy do klienta),
 *   - public (NEXT_PUBLIC_*, bezpieczne w bundle).
 *
 * Tryb działania:
 *   - W produkcji (`NODE_ENV=production`) brak WYMAGANEJ zmiennej rzuca błąd.
 *   - Poza produkcją (dev/test, DEV_PREVIEW) logujemy ostrzeżenie i nie blokujemy,
 *     aby umożliwić podgląd UI bez pełnego backendu.
 *
 * UWAGA: importuj wyłącznie po stronie serwera (server-only).
 */

const isProd = process.env.NODE_ENV === "production";
const devPreview = process.env.NEXT_PUBLIC_DEV_PREVIEW === "1";

/** Zmienna wymagana na produkcji, opcjonalna gdzie indziej. */
const requiredInProd = (name: string) =>
  z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (isProd && !devPreview && (!val || val.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Brak wymaganej zmiennej środowiskowej: ${name}`,
        });
      }
    });

const serverSchema = z.object({
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: requiredInProd("SUPABASE_SERVICE_ROLE_KEY"),
  // AI — przynajmniej jeden backend musi być dostępny (sprawdzamy niżej).
  APIPOD_API_KEY: z.string().optional(),
  APIPOD_BASE_URL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  // Budżet AI — opcjonalny, ale silnie zalecany.
  AI_USAGE_DAILY_CAP_USD: z.coerce.number().nonnegative().optional(),
  AI_USAGE_CASE_CAP_USD: z.coerce.number().nonnegative().optional(),
  // Payments
  STRIPE_SECRET_KEY: requiredInProd("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredInProd("STRIPE_WEBHOOK_SECRET"),
  // Cron — wymagany na produkcji (chroni /api/cron/*).
  CRON_SECRET: requiredInProd("CRON_SECRET"),
  // Security
  ENCRYPTION_KEY: requiredInProd("ENCRYPTION_KEY"),
  // Rate-limit backend (opcjonalny — fallback in-memory).
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: requiredInProd("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredInProd("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
});

export interface EnvValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Waliduje środowisko. Zwraca wynik zamiast rzucać — caller decyduje co zrobić.
 * Wywoływane przez `assertEnv()` (rzuca w prod) oraz przez health-check.
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const server = serverSchema.safeParse(process.env);
  const pub = publicSchema.safeParse(process.env);

  if (!server.success) {
    for (const issue of server.error.issues) errors.push(issue.message);
  }
  if (!pub.success) {
    for (const issue of pub.error.issues) errors.push(issue.message);
  }

  // Reguła krzyżowa: musi istnieć przynajmniej jeden backend AI.
  const hasApipod = !!process.env.APIPOD_API_KEY && !!process.env.APIPOD_BASE_URL;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  if (isProd && !devPreview && !hasApipod && !hasAnthropic) {
    errors.push(
      "Brak skonfigurowanego backendu AI (APIPOD_API_KEY+APIPOD_BASE_URL lub ANTHROPIC_API_KEY).",
    );
  }

  // Ostrzeżenia (nie blokują) — brak budget capów = ryzyko kosztowe.
  if (!process.env.AI_USAGE_DAILY_CAP_USD) {
    warnings.push(
      "AI_USAGE_DAILY_CAP_USD nie ustawione — brak dziennego limitu kosztów AI.",
    );
  }
  if (!process.env.UPSTASH_REDIS_REST_URL && isProd) {
    warnings.push(
      "Brak UPSTASH_REDIS_REST_URL — rate-limit działa in-memory (nieskuteczny przy >1 instancji).",
    );
  }

  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Rzuca błąd gdy walidacja nie przejdzie (tylko produkcja).
 * Wywołaj raz na starcie procesu (np. w instrumentation.ts).
 */
export function assertEnv(): void {
  const result = validateEnv();
  if (result.warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.warn("[env] Ostrzeżenia:\n  - " + result.warnings.join("\n  - "));
  }
  if (!result.ok && isProd && !devPreview) {
    throw new Error(
      "[env] Walidacja środowiska nie powiodła się:\n  - " +
        result.errors.join("\n  - "),
    );
  }
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] Brakujące zmienne (non-prod, nieblokujące):\n  - " +
        result.errors.join("\n  - "),
    );
  }
}
