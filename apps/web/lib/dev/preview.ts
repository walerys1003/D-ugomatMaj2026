import "server-only";

/**
 * DEV-PREVIEW — tryb podglądu paneli BEZ żywego backendu Supabase.
 *
 * Cel: umożliwić wizualny przegląd paneli `/panel` i `/admin` (layout, nawigacja,
 * komponenty, empty-state) w środowiskach, w których nie ma połączenia z Supabase
 * (np. sandbox preview). To NIE jest mechanizm produkcyjny — aktywuje się WYŁĄCZNIE,
 * gdy:
 *   1) NEXT_PUBLIC_DEV_PREVIEW === "1"  ORAZ
 *   2) NODE_ENV !== "production"
 *
 * Podwójny warunek gwarantuje, że flaga nigdy nie ominie autentykacji na produkcji,
 * nawet gdyby przypadkiem trafiła do env produkcyjnego.
 *
 * Gdy aktywny:
 *   - createSupabaseServerClient() zwraca lekki klient-mock (auth.getUser → mock user,
 *     zapytania `.from(...)` → puste, bezbłędne wyniki),
 *   - guardy w layoutach paneli oraz RBAC przepuszczają mockowego usera/admina,
 *   - middleware traktuje request jako zalogowany (bez redirectu na /sign-in).
 */

export const DEV_PREVIEW_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_PREVIEW === "1";

/** Mockowe konto użytkownika panelu (demo). */
export const DEV_PREVIEW_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "user@demo.dlugomat.pl",
  fullName: "Demo Użytkownik",
} as const;

/** Mockowe konto administratora (demo). */
export const DEV_PREVIEW_ADMIN = {
  id: "00000000-0000-4000-8000-0000000000ad",
  email: "admin@demo.dlugomat.pl",
  fullName: "Demo Admin",
  role: "admin" as const,
};
