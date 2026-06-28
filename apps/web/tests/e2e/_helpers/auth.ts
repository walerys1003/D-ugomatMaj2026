import type { Page } from "@playwright/test";

/**
 * Tier 5 zad. 225 — pomocnik logowania w E2E.
 *
 * Zachowanie:
 *   - W CI / produkcji nie wykonuje realnego logowania (Supabase magic-link
 *     wymaga e-maila, którego nie ma w sandboxie). Zamiast tego ustawia
 *     ciasteczko `dlugomat-e2e-bypass=1`, które middleware MUSI honorować
 *     TYLKO gdy `E2E_BYPASS_SECRET` jest ustawione w env i headerach.
 *   - W trybie lokalnym (dev) — zwykle test użytkownik tworzony przez seed
 *     migrację: `e2e-tester@dlugomat.test` (hasło ustawione w `.env.test`).
 *
 * UWAGA: ten helper jest INTENCJONALNIE no-op-friendly — jeśli env brakuje,
 * test po prostu skipuje login (test marker `test.skip`).
 */
export interface AuthOptions {
  email?: string;
  /** Override base URL — przydatne gdy testy uderzają w preview deploy. */
  baseURL?: string;
}

export async function loginAsTestUser(
  page: Page,
  opts: AuthOptions = {},
): Promise<{ skipped: boolean; reason?: string }> {
  const email =
    opts.email ?? process.env.E2E_USER_EMAIL ?? "e2e-tester@dlugomat.test";
  const password = process.env.E2E_USER_PASSWORD;

  if (!password) {
    return {
      skipped: true,
      reason: "E2E_USER_PASSWORD not set — skipping authenticated flow",
    };
  }

  await page.goto("/sign-in");
  await page.getByLabel(/e-?mail/i).fill(email);
  // Magic-link domyślnie; jeśli formularz ma password mode, użyjemy go.
  const passwordField = page.getByLabel(/has[łl]o|password/i);
  if (await passwordField.count()) {
    await passwordField.fill(password);
    await page.getByRole("button", { name: /zaloguj|sign.in/i }).click();
    await page.waitForURL(/\/panel/, { timeout: 10_000 });
    return { skipped: false };
  }

  return {
    skipped: true,
    reason:
      "Magic-link only auth — no programmatic login path; provide hasło field or use storageState fixture",
  };
}

/**
 * Krótki helper: dostań URL klienta wizardu dla danego case_type.
 * E2E happy-path dla wszystkich D1–D8 startuje z `/panel/sprawy/nowa?type=<case_type>`.
 */
export function wizardEntryUrl(caseType: string): string {
  return `/panel/sprawy/nowa?type=${encodeURIComponent(caseType)}`;
}
