/**
 * Tier 4 path-alias shim — `@/lib/supabase/server` → `@/lib/db/supabase-server`.
 *
 * Stara konwencja path-aliasów (`@/lib/supabase/*`) wciąż używana w 4 routach
 * (offline-queue, push/send, push/subscribe). Zamiast codemod-ować importy,
 * eksportujemy wszystko z canonical lokalizacji.
 *
 * Docelowo (Sprint A pełny): refactor importów → `@/lib/db/supabase-server`
 * i usunięcie tego shim-a.
 */
export {
  createSupabaseServerClient,
  createSupabaseAdminClient,
  createServerSupabase,
  createServiceSupabase,
  createAdminSupabase,
} from "@/lib/db/supabase-server";
