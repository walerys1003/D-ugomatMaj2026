/**
 * Tier 4 module shim — `@/lib/auth/server-auth`
 *
 * Standaryzowany helper auth dla Route Handlerów (`app/api/.../route.ts`).
 * Konwencja konsumentów:
 *   const auth = await getAuthenticatedUser(req);
 *   if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
 *   // auth.user.id dostępne dalej
 *
 * Wewnętrznie używa `createSupabaseServerClient()` z `supabase-server.ts`
 * (czyli klienta związanego z cookiesami requesta, RLS enforced).
 *
 * Sygnatura zachowuje wsteczną kompatybilność z 30+ miejscami importu.
 */
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { User } from "@supabase/supabase-js";

export type AuthenticatedUserResult =
  | { ok: true; user: User }
  | { ok: false; reason: "unauthenticated" | "server_error"; status: 401 | 500 };

/**
 * Wyciąga zalogowanego użytkownika z aktualnego requestu (cookies / JWT).
 *
 * Argument `_req` jest opcjonalny — niektóre handlery przekazują NextRequest
 * dla spójności sygnatur, ale `createSupabaseServerClient()` pobiera cookies
 * z `next/headers` (action scope), więc parametr nie jest wykorzystywany
 * bezpośrednio. Akceptujemy go dla zgodności typów u konsumentów.
 */
export async function getAuthenticatedUser(
  _req?: NextRequest
): Promise<AuthenticatedUserResult> {
  try {
    const sb = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await sb.auth.getUser();
    if (error || !user) {
      return { ok: false, reason: "unauthenticated", status: 401 };
    }
    return { ok: true, user };
  } catch {
    return { ok: false, reason: "server_error", status: 500 };
  }
}

/**
 * Wariant rzucający — używany tam, gdzie wolimy try/catch zamiast guard clauses.
 * Zwraca samego `User` lub rzuca `Error` z polem `.status`.
 */
export async function requireAuth(req?: NextRequest): Promise<User> {
  const r = await getAuthenticatedUser(req);
  if (!r.ok) {
    const err = new Error(r.reason) as Error & { status: number };
    err.status = r.status;
    throw err;
  }
  return r.user;
}

/**
 * Lekka pomocnicza informacja — czy w ogóle jest jakiś user, bez rzucania.
 * Przydatne dla endpointów które dają branchowane odpowiedzi (np. publiczny
 * fallback + bogatszy widok dla zalogowanych).
 */
export async function getOptionalUser(req?: NextRequest): Promise<User | null> {
  const r = await getAuthenticatedUser(req);
  return r.ok ? r.user : null;
}
