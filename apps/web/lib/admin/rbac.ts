import "server-only";

/**
 * Tier 5.4 — Admin RBAC.
 *
 * Centralna kontrola dostępu do panelu administracyjnego. Rola pochodzi
 * z `profiles.role` (UserRole = 'user' | 'admin' | 'moderator').
 *
 * Defense-in-depth: oprócz RLS w bazie i route guard w middleware,
 * każda admin server-action wywołuje `requireAdmin()` aby zapobiec
 * przeoczeniom przy refaktoringu.
 */

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { UserRole } from "@/lib/db/types";

export class AdminAccessDeniedError extends Error {
  constructor(message = "Brak uprawnień administratora.") {
    super(message);
    this.name = "AdminAccessDeniedError";
  }
}

export interface AdminContext {
  userId: string;
  email: string;
  role: Extract<UserRole, "admin" | "moderator">;
}

/**
 * Zwraca kontekst aktualnego użytkownika jeżeli ma rolę 'admin' lub
 * 'moderator'. W przeciwnym wypadku rzuca `AdminAccessDeniedError`.
 *
 * Użycie w server-actions / route handlerach:
 *   const admin = await requireAdmin();
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    throw new AdminAccessDeniedError("Sesja wygasła — zaloguj się ponownie.");
  }
  const user = userData.user;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr || !profile) {
    throw new AdminAccessDeniedError();
  }
  if (profile.role !== "admin" && profile.role !== "moderator") {
    throw new AdminAccessDeniedError();
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role: profile.role as Extract<UserRole, "admin" | "moderator">,
  };
}

/**
 * Wariant dla server components / page.tsx — przy braku roli redirect
 * na stronę główną panelu zamiast rzucania błędu.
 */
export async function requireAdminOrRedirect(): Promise<AdminContext> {
  try {
    return await requireAdmin();
  } catch {
    redirect("/panel");
  }
}

/**
 * Sprawdza czy aktualny user ma rolę admin/moderator bez rzucania
 * błędu — przydatne w UI (np. pokazanie linku „Admin" w nawigacji).
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Tylko `admin` (nie 'moderator') — np. edycja prompt templates,
 * zmiana ról innych użytkowników.
 */
export async function requireFullAdmin(): Promise<AdminContext> {
  const ctx = await requireAdmin();
  if (ctx.role !== "admin") {
    throw new AdminAccessDeniedError(
      "Wymagana rola pełnego administratora.",
    );
  }
  return ctx;
}
