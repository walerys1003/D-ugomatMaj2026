/**
 * Helper do server actions — łączy rate-limit (per user_id) z auth check.
 *
 * Server actions w Next.js 14 NIE są chronione przez middleware (middleware
 * działa tylko na żądania nawigacyjne, nie na akcje). Każda akcja, która
 * wykonuje drogie operacje (AI, payment) musi sama wywołać `guardAction()`.
 *
 * Wzorzec użycia:
 *
 *   "use server";
 *   export async function generateDocumentAction(caseId: string) {
 *     const { userId } = await guardAction({
 *       profile: "documentGenerate",
 *       key: "generate-doc",
 *     });
 *     // ... reszta logiki
 *   }
 */
import { headers } from "next/headers";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";

import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
  type RateLimitConfig,
} from "./rate-limit";

export class ActionRateLimitError extends Error {
  constructor(
    public readonly retryAfterMs: number,
    public readonly key: string,
  ) {
    super(
      `Zbyt wiele żądań — spróbuj ponownie za ${Math.ceil(
        retryAfterMs / 1000,
      )} s.`,
    );
    this.name = "ActionRateLimitError";
  }
}

export class ActionUnauthenticatedError extends Error {
  constructor() {
    super("Sesja wygasła — zaloguj się ponownie.");
    this.name = "ActionUnauthenticatedError";
  }
}

interface GuardOptions {
  /** Profil z `RATE_LIMIT_PROFILES`. */
  profile: keyof typeof RATE_LIMIT_PROFILES;
  /** Suffix klucza — pozwala mieć osobne buckety per akcja. */
  key: string;
  /** Czy wymagać zalogowanego usera (default: true). */
  requireAuth?: boolean;
  /** Custom config — nadpisuje profile gdy podany. */
  customConfig?: RateLimitConfig;
}

interface GuardResult {
  /** ID zalogowanego usera (gdy requireAuth=true). */
  userId: string | null;
  /** Liczba pozostałych tokenów w bucketcie. */
  remaining: number;
}

/**
 * Wywołuje rate-limit + auth check. Rzuca przy odrzuceniu.
 * Zwraca user_id (lub null gdy requireAuth=false i niezalogowany).
 */
export async function guardAction(opts: GuardOptions): Promise<GuardResult> {
  const requireAuth = opts.requireAuth ?? true;

  // 1) Auth check (najpierw — bezpieczniej rate-limitować po user_id)
  let userId: string | null = null;
  if (requireAuth) {
    const supabase = createSupabaseServerClient();
    const { data: u, error } = await supabase.auth.getUser();
    if (error || !u.user) {
      throw new ActionUnauthenticatedError();
    }
    userId = u.user.id;
  }

  // 2) Rate-limit — preferujemy klucz po user_id (dokładniejszy niż IP),
  //    fallback na IP gdy niezalogowany.
  const h = headers();
  const ip = clientIdFromHeaders(h);
  const subject = userId ? `user:${userId}` : `ip:${ip}`;
  const fullKey = `action:${opts.key}:${subject}`;

  const config = opts.customConfig ?? RATE_LIMIT_PROFILES[opts.profile];
  const rl = rateLimit(fullKey, config);
  if (!rl.allowed) {
    throw new ActionRateLimitError(rl.resetMs, fullKey);
  }

  return { userId, remaining: rl.remaining };
}
