/**
 * Tier 5 zad. 203 — Stałe CSRF wydzielone do osobnego pliku.
 *
 * `csrf.ts` zawiera kod używający `next/headers` (server-only). Ten plik
 * jest "neutralny" — można go bezpiecznie importować zarówno w Server
 * Components, jak i w Client Components ("use client").
 */
export const CSRF_COOKIE = "dlugomat-csrf";
export const CSRF_HEADER = "X-CSRF-Token";
export const CSRF_FIELD = "csrf";
