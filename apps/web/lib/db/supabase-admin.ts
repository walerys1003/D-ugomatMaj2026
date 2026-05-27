/**
 * Tier 4 module shim — `@/lib/db/supabase-admin`
 *
 * Cienki adapter wokół `createSupabaseAdminClient` z `supabase-server.ts`.
 * Konwencja konsumentów: `const supabase = getSupabaseAdmin();`
 *
 * Powstał, by `next build` przechodził dla ~25 route'ów / lib'ów importujących
 * z tej ścieżki, zanim zostaną zmigrowane bezpośrednio do `supabase-server.ts`.
 *
 * Semantyka: identyczna jak `createSupabaseAdminClient` — service-role,
 * bypass RLS. NIGDY nie wywoływać w kontekstach niezautoryzowanych.
 *
 * W środowisku bez `SUPABASE_SERVICE_ROLE_KEY` rzuca w runtime czytelny błąd
 * (nie blokuje build-time, bo body funkcji wykonuje się dopiero przy callu).
 */
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import type { Database } from "@/lib/db/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Zwraca service-role klienta Supabase typowanego przez `Database`.
 * Singleton w obrębie jednego request scope (Next.js i tak izoluje).
 */
let _cached: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_cached) return _cached;
  _cached = createSupabaseAdminClient() as unknown as SupabaseClient<Database>;
  return _cached;
}

/**
 * Reset cache — używany w testach.
 */
export function __resetSupabaseAdminCache() {
  _cached = null;
}

/**
 * Alias dla kodu który importował `supabaseAdmin` jako wartość (nie funkcję).
 * Zalecane: używać `getSupabaseAdmin()` — pozwala uniknąć inicjalizacji w
 * module top-level (czyli rzucania błędu o brakującym ENV w czasie buildu).
 */
export const supabaseAdmin = {
  get client(): SupabaseClient<Database> {
    return getSupabaseAdmin();
  },
};
