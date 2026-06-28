import { expect, test } from "@playwright/test";

import { loginAsTestUser, wizardEntryUrl } from "./_helpers/auth";

/**
 * Tier 5 zad. 225 — E2E happy-path skeleton per moduł D1–D8.
 *
 * Cel: dla każdego modułu zweryfikować że:
 *   1) Strona startowa wizardu (lub landing modułu) renderuje się.
 *   2) Tytuł / nagłówek pasuje do specyfikacji modułu.
 *   3) Pierwszy krok wizardu jest dostępny po zalogowaniu.
 *
 * Pełen flow (od kreatora do wygenerowanego PDF) jest zostawiony jako
 * `test.fixme` — wymaga seed migracji testowych użytkowników, mock LLM
 * i Stripe sandbox. Tier 6 dokończy pełny flow.
 *
 * Każdy test jest niezależny (parallel-safe) — używa `test.describe.configure`
 * z `mode: "parallel"` (default w playwright.config.ts).
 */

// ─── Mapa modułów → (case_type, oczekiwany title fragment) ─────────────────

interface ModuleSpec {
  id: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  caseType: string | null; // null = moduł bez wizardu (np. D1 = skaner)
  // URL startu — D1 to publiczny landing, reszta to wizard
  startUrl: string;
  // Fragment nagłówka który MUSI być na stronie startowej
  headingMatch: RegExp;
  // Czy potrzeba zalogowania
  requiresAuth: boolean;
}

const MODULES: ReadonlyArray<ModuleSpec> = [
  {
    id: "D1",
    caseType: null,
    startUrl: "/skaner-nakazu",
    headingMatch: /skaner|skanuj|nakaz/i,
    requiresAuth: false,
  },
  {
    id: "D2",
    caseType: "sprzeciw_epu",
    startUrl: wizardEntryUrl("sprzeciw_epu"),
    headingMatch: /sprzeciw|nakaz/i,
    requiresAuth: true,
  },
  {
    id: "D3",
    caseType: "komornik_zwolnienie_konta",
    startUrl: wizardEntryUrl("komornik_zwolnienie_konta"),
    headingMatch: /komornik|zwolnieni|rachun/i,
    requiresAuth: true,
  },
  {
    id: "D4",
    caseType: "potracenia_wniosek_pracodawca",
    startUrl: wizardEntryUrl("potracenia_wniosek_pracodawca"),
    headingMatch: /potr[ąa]cen|pracodawc|wynagrodzeni/i,
    requiresAuth: true,
  },
  {
    id: "D5",
    caseType: "bik_reklamacja_bank",
    startUrl: wizardEntryUrl("bik_reklamacja_bank"),
    headingMatch: /bik|reklamac|bank|wpis/i,
    requiresAuth: true,
  },
  {
    id: "D6",
    caseType: "cesja_odpowiedz",
    startUrl: wizardEntryUrl("cesja_odpowiedz"),
    headingMatch: /cesj|odpowiedź|odpowiedz|wierzyteln/i,
    requiresAuth: true,
  },
  {
    id: "D7",
    caseType: "ugoda_propozycja",
    startUrl: wizardEntryUrl("ugoda_propozycja"),
    headingMatch: /ugod|negocjac|propozycj/i,
    requiresAuth: true,
  },
  {
    id: "D8",
    caseType: "upadlosc_wniosek",
    startUrl: wizardEntryUrl("upadlosc_wniosek"),
    headingMatch: /upad[łl]o[śs][ćc]|wniosek/i,
    requiresAuth: true,
  },
];

// ─── Public modules (no auth) — pełna asercja ──────────────────────────────

test.describe("D1 — Skaner Nakazu (publiczny landing)", () => {
  test("renderuje hero z CTA upload", async ({ page }) => {
    await page.goto("/skaner-nakazu");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible();
    // Akceptujemy różne formy CTA: input file, drag-drop, lub button
    const uploadable = page.locator(
      'input[type="file"], [data-testid="upload-zone"], button:has-text("Wgraj"), button:has-text("Wybierz")',
    );
    await expect(uploadable.first()).toBeVisible({ timeout: 8_000 });
  });
});

// ─── Moduły z autoryzacją — happy-path skeleton ────────────────────────────

for (const mod of MODULES.filter((m) => m.requiresAuth)) {
  test.describe(`${mod.id} — ${mod.caseType ?? "n/a"}`, () => {
    test(`wizard entry — ${mod.caseType} renderuje się dla zalogowanego usera`, async ({
      page,
    }) => {
      const auth = await loginAsTestUser(page);
      if (auth.skipped) {
        test.skip(true, `Auth bypass: ${auth.reason}`);
        return;
      }

      await page.goto(mod.startUrl);

      // 1) Wizard powinien się otworzyć (URL nie powinien skoczyć na /auth)
      await expect(page).not.toHaveURL(/\/auth\/sign-in/);

      // 2) Heading powinien zawierać frazy specyficzne dla modułu
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible({ timeout: 8_000 });
      await expect(heading).toHaveText(mod.headingMatch);

      // 3) Powinien być przynajmniej jeden form-field (input/select/textarea)
      const fields = page.locator(
        'form input:not([type="hidden"]), form select, form textarea',
      );
      await expect(fields.first()).toBeVisible({ timeout: 5_000 });
    });

    test.fixme(
      `pełny happy-path: dane → AI → checkout → PDF (${mod.id})`,
      async () => {
        // TODO Tier 6: zaimplementować pełny E2E.
        // Wymaga: seed test usera + Stripe sandbox + mock LLM endpoint.
        // Patrz: docs/HANDOVER.md sekcja 8 (Tier 6 backlog).
      },
    );
  });
}

// ─── Cross-module sanity ──────────────────────────────────────────────────

test.describe("Cross-module — nawigacja /panel", () => {
  test("lista modułów na /moduly pokazuje wszystkie 8 sekcji", async ({
    page,
  }) => {
    await page.goto("/moduly");
    // Każdy moduł ma swój heading lub card; sprawdzamy że jest ich >= 8
    const moduleCards = page.locator(
      'article, [data-testid^="module-card"], section h2',
    );
    const count = await moduleCards.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });
});
