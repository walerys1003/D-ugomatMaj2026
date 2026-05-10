"use client";

/**
 * Tier 5 zad. 203 — Hook do odczytu CSRF tokenu po stronie klienta.
 *
 * Token jest ustawiany przez Server Component (`ensureCsrfToken()`) w cookie
 * `dlugomat-csrf` z `httpOnly: false`, więc klient może go czytać.
 *
 * Wzorzec użycia:
 *
 *   "use client";
 *   const csrf = useCsrfToken();
 *   await myServerAction({ ...payload, csrf });
 *
 * Zwraca pusty string przed pierwszym renderem (SSR) — caller powinien
 * blokować submit do momentu, aż token będzie dostępny (zwykle natychmiast
 * po hydration).
 */
import { useEffect, useState } from "react";

import { CSRF_COOKIE } from "./csrf-constants";

function readCsrfFromCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CSRF_COOKIE}=`));
  if (!match) return "";
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export function useCsrfToken(): string {
  // Inicjalizacja z funkcji (nie eager) — uniknięcie SSR mismatch.
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(readCsrfFromCookie());
  }, []);

  return token;
}

/**
 * Sync helper dla bardzo prostych przypadków (np. `<form action={...}>`
 * z bind() — gdzie nie chcemy odczytu reaktywnego). Zwraca pustą wartość
 * w SSR. Używaj `useCsrfToken()` w komponentach interaktywnych.
 */
export function readCsrfTokenSync(): string {
  return readCsrfFromCookie();
}
