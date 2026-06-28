/**
 * Tier 5 zad. 203 — CSRF protection dla cookie-auth POST endpoints.
 *
 * Strategia: **double-submit cookie pattern** ze zmiennym stałym tokenem
 * per-sesja, zsynchronizowanym z `sb-access-token` (Supabase). Token nie
 * jest sekretem — chroni przed CSRF, nie przed XSS (na XSS mamy CSP +
 * sanityzację outputu AI).
 *
 * Dlaczego nie SameSite=strict zamiast tego?
 *   - Supabase auth używa SameSite=lax (wymóg OAuth callbacków)
 *   - Niektóre payment-flows (Stripe Checkout return) wymagają lax
 *   - Webhooki Stripe i tak NIE używają cookies (signature header)
 *
 * Wzorzec użycia:
 *
 *   // 1) W Server Component (np. app/panel/sprawy/page.tsx):
 *   import { ensureCsrfToken } from "@/lib/security/csrf";
 *   const csrf = await ensureCsrfToken();
 *   <form action={...}><input type="hidden" name="csrf" value={csrf} />…</form>
 *
 *   // 2) W route handler / server action:
 *   import { assertCsrf } from "@/lib/security/csrf";
 *   await assertCsrf(request); // throws CsrfError → 403
 *
 * Endpointy zwolnione (bo nie używają cookie-auth):
 *   - /api/stripe/webhook   — autentykuje signature header
 *   - /api/cron/*           — autentykuje X-Cron-Secret
 *   - /api/notifications/dispatch — j.w. (X-Cron-Secret)
 *   - /api/observability/*  — beacon, write-only, brak side-effectów
 *   - /api/health, /api/status — readonly
 *
 * Edge runtime safe (używa SubtleCrypto + cookies()).
 */
import { cookies } from "next/headers";

// Re-eksport stałych z neutralnego pliku — by Client Components mogły
// importować bez wciągania `next/headers` (server-only).
export {
  CSRF_COOKIE,
  CSRF_HEADER,
  CSRF_FIELD,
} from "./csrf-constants";
import { CSRF_COOKIE, CSRF_FIELD, CSRF_HEADER } from "./csrf-constants";

export class CsrfError extends Error {
  public readonly status = 403;
  constructor(public readonly reason: string) {
    super(`CSRF rejected: ${reason}`);
    this.name = "CsrfError";
  }
}

/**
 * Generuje 32-bajtowy losowy token (256 bit entropy) → base64url.
 * Edge-safe — używa `crypto.getRandomValues`.
 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Bezpieczne porównanie stringów (timing-safe) — Edge runtime nie ma
 * `crypto.timingSafeEqual`, więc piszemy ręcznie.
 *
 * Zwraca `true` ⇔ a.length === b.length AND wszystkie znaki równe.
 * Czas wykonania zależy WYŁĄCZNIE od długości, nie od pozycji pierwszej
 * różnicy — to chroni przed atakami typu timing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Ustawia CSRF cookie jeśli go jeszcze nie ma. Zwraca aktualny token.
 * Wywołuj w Server Components, żeby SSR widział już token w `<form>`.
 *
 * Cookie ustawienia:
 *   - httpOnly: false  (klient JS musi czytać → wysłać w X-CSRF-Token)
 *   - sameSite: "lax"  (kompatybilne z Supabase auth flow)
 *   - secure: true     (poza dev)
 *   - path: "/"
 *   - maxAge: 12h      (token rotuje co 12h — wystarczy na typową sesję)
 */
export async function ensureCsrfToken(): Promise<string> {
  const jar = cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;
  if (existing && existing.length >= 40) return existing;

  const token = generateToken();
  // Uwaga: w Server Components Next.js cookies().set() działa tylko
  // wewnątrz Server Action / Route Handler. W RSC wystartuje, ale
  // Next zaloguje warning. Najlepszą praktyką jest wołać
  // `ensureCsrfToken()` z layoutu lub middleware, który ma write access.
  try {
    jar.set(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
  } catch {
    // Read-only context (np. RSC bez `dynamic = 'force-dynamic'`).
    // Token wróci ten sam przy next request.
  }
  return token;
}

interface AssertOptions {
  /** Pominięcie weryfikacji (np. dla webhooków) — domyślnie false. */
  skip?: boolean;
}

/**
 * Sprawdza CSRF token w request.
 *
 * Akceptuje token z (kolejność):
 *   1) header `X-CSRF-Token`
 *   2) form field `csrf` (gdy `Content-Type: application/x-www-form-urlencoded`
 *      lub `multipart/form-data`)
 *   3) JSON body `{ csrf: "..." }`
 *
 * Porównuje z cookie `dlugomat-csrf` timing-safe. Brak/niezgodność → throw.
 */
export async function assertCsrf(
  request: Request,
  opts: AssertOptions = {},
): Promise<void> {
  if (opts.skip) return;

  // Bezpieczne metody — nie wymagają CSRF.
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;

  const jar = cookies();
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  if (!cookieToken) {
    throw new CsrfError("missing_cookie");
  }

  // 1) header
  const headerToken = request.headers.get(CSRF_HEADER);
  if (headerToken && timingSafeEqual(headerToken, cookieToken)) {
    return;
  }

  // 2/3) body — robimy to ostatnie, bo "consume"-uje request body.
  // UWAGA: po wywołaniu `request.formData()` / `.json()` body jest
  // "spożyte" — caller musi to wiedzieć. Zalecany pattern: assertCsrf()
  // PRZED parsowaniem body w handlerze.
  const ctype = request.headers.get("content-type") ?? "";
  try {
    if (
      ctype.includes("application/x-www-form-urlencoded") ||
      ctype.includes("multipart/form-data")
    ) {
      const cloned = request.clone();
      const fd = await cloned.formData();
      const fieldToken = fd.get(CSRF_FIELD);
      if (
        typeof fieldToken === "string" &&
        timingSafeEqual(fieldToken, cookieToken)
      ) {
        return;
      }
    } else if (ctype.includes("application/json")) {
      const cloned = request.clone();
      const body = (await cloned.json()) as Record<string, unknown>;
      const jsonToken = body?.[CSRF_FIELD];
      if (
        typeof jsonToken === "string" &&
        timingSafeEqual(jsonToken, cookieToken)
      ) {
        return;
      }
    }
  } catch {
    // Body unparsable — fall-through do throw poniżej.
  }

  throw new CsrfError("token_mismatch");
}

/**
 * Helper dla server actions — czyta token z `formData` i porównuje z
 * cookie. Throw na niezgodność.
 *
 *   "use server";
 *   export async function myAction(fd: FormData) {
 *     await assertCsrfFromFormData(fd);
 *     // ...
 *   }
 */
export async function assertCsrfFromFormData(
  fd: FormData | Record<string, unknown>,
): Promise<void> {
  const jar = cookies();
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  if (!cookieToken) {
    throw new CsrfError("missing_cookie");
  }

  const raw =
    fd instanceof FormData
      ? fd.get(CSRF_FIELD)
      : (fd[CSRF_FIELD] as unknown);

  if (typeof raw !== "string" || !timingSafeEqual(raw, cookieToken)) {
    throw new CsrfError("token_mismatch");
  }
}

/**
 * Konwencja sprawdzania w route handlerze:
 *
 *   try { await assertCsrf(req); }
 *   catch (e) { if (e instanceof CsrfError) return csrfRejection(e); throw e; }
 */
export function csrfRejection(err: CsrfError): Response {
  return new Response(
    JSON.stringify({ error: "csrf_rejected", reason: err.reason }),
    {
      status: 403,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
}
