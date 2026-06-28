/**
 * Tier 5 zad. 221 — Accessibility audit (axe-core).
 *
 * Sprawdza kluczowe strony publiczne pod kątem WCAG 2.1 AA:
 *   - Landing (/)
 *   - Cennik
 *   - Baza wiedzy (index + 1 artykuł)
 *   - Skaner Nakazu (public OCR)
 *   - Status page
 *
 * Używamy `@axe-core/playwright` (lazy require — jeśli pakiet nie zainstalowany,
 * test się skipuje gracefully). Każdy run zwraca `violations[]` z impact levels.
 * Failujemy tylko na 'critical' i 'serious' — 'minor' tolerujemy (np. landmark
 * regions w trzeciej-stronowych embedach).
 *
 * Wynik: artefakt `playwright-report/` + JSON do PostHog (Tier 6).
 */
import { test, expect, type Page } from "@playwright/test";

interface AxeViolation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor" | null;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{ html: string; target: string[] }>;
}

interface AxeResults {
  violations: AxeViolation[];
}

async function runAxe(page: Page): Promise<AxeResults | null> {
  try {
    // Lazy require — jeżeli @axe-core/playwright nie jest zainstalowany,
    // skipujemy test zamiast wywalać.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: AxeBuilder } = require("@axe-core/playwright") as {
      default: new (opts: { page: Page }) => {
        withTags: (tags: string[]) => {
          analyze: () => Promise<AxeResults>;
        };
      };
    };
    return new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
  } catch {
    return null;
  }
}

function failOnSerious(results: AxeResults): void {
  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  if (blocking.length > 0) {
    const summary = blocking
      .map(
        (v) =>
          `• [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)\n  ${v.helpUrl}`,
      )
      .join("\n");
    throw new Error(`A11y violations (${blocking.length}):\n${summary}`);
  }
}

const PAGES = [
  { name: "Landing", path: "/" },
  { name: "Cennik", path: "/cennik" },
  { name: "Baza wiedzy", path: "/baza-wiedzy" },
  { name: "Sprzeciw EPU article", path: "/baza-wiedzy/sprzeciw-od-nakazu-zaplaty-epu" },
  { name: "Skaner Nakazu", path: "/skaner-nakazu" },
  { name: "Status page", path: "/status" },
  { name: "Regulamin", path: "/regulamin" },
  { name: "Polityka prywatności", path: "/polityka-prywatnosci" },
] as const;

for (const pg of PAGES) {
  test(`A11y — ${pg.name} (${pg.path})`, async ({ page }) => {
    await page.goto(pg.path);
    // Czekamy aż główny landmark się zrenderuje
    await expect(page.locator("main, [role='main']").first()).toBeVisible({
      timeout: 10_000,
    });
    const results = await runAxe(page);
    if (!results) {
      test.skip(true, "@axe-core/playwright not installed");
      return;
    }
    failOnSerious(results);
  });
}
